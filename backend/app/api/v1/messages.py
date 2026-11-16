"""REST + WebSocket endpoints for the Guide <-> Traveller messaging system.

Routes live under ``/api/v1/messages``.  Participant routes require a valid JWT
and membership in the conversation; oversight routes require admin / support.
"""

from __future__ import annotations

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.core.roles import TRAVELER, GUIDE, ADMIN, CUSTOMER_SUPPORT, has_access
from app.core.security import get_user_id_from_token
from app.models.user import User
from app.models.message import Conversation, Message, MessageStatus
from app.schemas.message import (
    ConversationCreate,
    ConversationOut,
    MessageCreate,
    MessageOut,
    MarkReadRequest,
    NotificationOut,
    WSMessageIn,
    WSMessageOut,
    WSAckOut,
)
from app.services.message_service import MessageService, manager

router = APIRouter(prefix="/messages", tags=["messages"])

TRAVELER_OR_GUIDE = require_role(TRAVELER, GUIDE)
STAFF = require_role(ADMIN, CUSTOMER_SUPPORT)


def _message_out(message: MessageOut) -> dict:
    return message.model_dump()


# ---------------------------------------------------------------------------
# Conversations
# ---------------------------------------------------------------------------


@router.post("/conversations", response_model=ConversationOut, status_code=201)
def create_conversation(
    payload: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_OR_GUIDE),
) -> ConversationOut:
    """Get or create the 1:1 conversation with the given counterpart."""
    counterpart_id = payload.guide_id or payload.traveler_id
    if counterpart_id is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="guide_id or traveler_id is required.",
        )
    conversation = MessageService(db).get_or_create_conversation(
        current_user, counterpart_id, booking_id=payload.booking_id
    )
    return ConversationOut.model_validate(conversation)


@router.get("/conversations", response_model=list[ConversationOut])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_OR_GUIDE),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[ConversationOut]:
    rows, _ = MessageService(db).list_conversations(current_user, limit=limit, offset=offset)
    return [ConversationOut.model_validate(r) for r in rows]


@router.get("/conversations/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_OR_GUIDE),
) -> dict:
    count = MessageService(db).unread_count(current_user)
    return {"unread_count": count}


# ---------------------------------------------------------------------------
# Messages within a conversation
# ---------------------------------------------------------------------------


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageOut])
def list_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_OR_GUIDE),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[MessageOut]:
    rows, _ = MessageService(db).list_messages(current_user, str(conversation_id), limit=limit, offset=offset)
    return [MessageOut.model_validate(r) for r in rows]


@router.post("/conversations/{conversation_id}/messages", response_model=MessageOut, status_code=201)
def send_message(
    conversation_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_OR_GUIDE),
) -> MessageOut:
    message = MessageService(db).send_message(current_user, str(conversation_id), payload.body)
    return MessageOut.model_validate(message)


@router.post("/conversations/{conversation_id}/read")
def mark_conversation_read(
    conversation_id: int,
    payload: MarkReadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_OR_GUIDE),
) -> dict:
    if payload.conversation_id != str(conversation_id):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="conversation_id mismatch.",
        )
    count = MessageService(db).mark_conversation_read(current_user, str(conversation_id))
    return {"marked_read": count}


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------


@router.get("/notifications", response_model=list[NotificationOut])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_OR_GUIDE),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[NotificationOut]:
    rows, _ = MessageService(db).list_notifications(current_user, limit=limit, offset=offset)
    return [NotificationOut.model_validate(r) for r in rows]


@router.post("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_OR_GUIDE),
) -> dict:
    ok = MessageService(db).mark_notification_read(current_user, notification_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Staff oversight (read-only)
# ---------------------------------------------------------------------------


@router.get("/admin/conversations", response_model=list[ConversationOut])
def admin_list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(STAFF),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[ConversationOut]:
    rows, _ = MessageService(db).list_conversations(current_user, limit=limit, offset=offset)
    return [ConversationOut.model_validate(r) for r in rows]


# ---------------------------------------------------------------------------
# WebSocket: real-time messaging
# ---------------------------------------------------------------------------


async def _authenticate_websocket(websocket: WebSocket, db: Session) -> User:
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    user_id = get_user_id_from_token(token)
    if user_id is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


@router.websocket("/ws/{conversation_id}")
async def websocket_conversation(
    websocket: WebSocket,
    conversation_id: int,
    db: Session = Depends(get_db),
):
    """WebSocket for real-time messaging within a conversation.

    Client authenticates via ``?token=<jwt>``.  After the handshake the server:
    1. registers the connection (presence),
    2. replays any undelivered messages to the sender as delivered,
    3. relays incoming messages to the other participant (live if online,
       otherwise persisted as `sent` with a queued notification).
    """
    await websocket.accept()

    # Authenticate before joining the room.
    try:
        current_user = await _authenticate_websocket(websocket, db)
    except HTTPException:
        return

    service = MessageService(db)
    conversation = (
        db.query(Conversation).filter(Conversation.id == conversation_id).first()
    )
    if conversation is None or not conversation.is_active:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    if current_user.id not in {conversation.traveler_id, conversation.guide_id} and not has_access(
        current_user.role, ADMIN, CUSTOMER_SUPPORT
    ):
        await websocket.close(code=status.WS_4003_FORBIDDEN if hasattr(status, "WS_4003_FORBIDDEN") else status.WS_1008_POLICY_VIOLATION)
        return

    recipient_id = conversation.guide_id if current_user.id == conversation.traveler_id else conversation.traveler_id

    manager.connect(websocket, current_user.id)
    service.record_session(current_user.id, str(id(websocket)), is_online=True)

    # Replay undelivered messages addressed to this user as delivered.
    now = None
    from datetime import datetime, timezone

    undelivered = (
        db.query(Message)
        .filter(
            Message.conversation_id == conversation_id,
            Message.recipient_id == current_user.id,
            Message.status.in_([MessageStatus.sent.value, MessageStatus.delivered.value]),
        )
        .all()
    )
    now = datetime.now(timezone.utc)
    for m in undelivered:
        m.status = MessageStatus.delivered.value
        m.delivered_at = now
        m.updated_at = now
        service._mark_receipt(m, current_user.id, MessageStatus.delivered.value, now)
        sender = db.get(User, m.sender_id)
        await websocket.send_json(
            {
                "type": "message",
                "id": m.id,
                "conversation_id": str(conversation_id),
                "sender_id": m.sender_id,
                "sender_name": f"{sender.firstName or ''} {sender.lastName or ''}".strip() or sender.email,
                "sender_role": sender.role,
                "body": m.body,
                "status": m.status,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
        )
    if undelivered:
        db.commit()

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                frame = WSMessageIn.model_validate_json(raw)
            except Exception:
                await websocket.send_json({"type": "error", "detail": "Invalid frame"})
                continue

            if frame.type == "message":
                if not frame.body or not frame.body.strip():
                    await websocket.send_json({"type": "error", "detail": "Empty message body"})
                    continue
                message = service.send_message(current_user, str(conversation_id), frame.body.strip())
                sender = current_user
                out = WSMessageOut(
                    type="message",
                    id=message.id,
                    conversation_id=str(conversation_id),
                    sender_id=message.sender_id,
                    sender_name=f"{sender.firstName or ''} {sender.lastName or ''}".strip() or sender.email,
                    sender_role=sender.role,
                    body=message.body,
                    status=MessageStatus(message.status),
                    created_at=message.created_at,
                )
                # Echo to sender (confirmation) + deliver to recipient if online.
                payload = out.model_dump()
                payload["_participants"] = [current_user.id, recipient_id]
                await manager.broadcast_conversation(str(conversation_id), payload, exclude=None)
                # Sender ack.
                await websocket.send_json(
                    WSAckOut(type="ack", message_id=message.id, status=MessageStatus(message.status), conversation_id=str(conversation_id)).model_dump()
                )

            elif frame.type == "read":
                count = service.mark_conversation_read(current_user, str(conversation_id))
                await websocket.send_json({"type": "read_ack", "marked_read": count, "conversation_id": str(conversation_id)})

            elif frame.type == "ping":
                await websocket.send_json({"type": "pong"})
            else:
                await websocket.send_json({"type": "error", "detail": f"Unknown frame type: {frame.type}"})

    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket)
        service.set_offline(str(id(websocket)))

