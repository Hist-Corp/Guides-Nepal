"""Business logic for the Guide <-> Traveller messaging system.

Responsibilities:
- Conversation get-or-create with role-based participant authorization.
- Message persistence and the sent -> delivered -> read status machine.
- Presence tracking (online/offline) used to decide live vs. queued delivery.
- Async notifications queued when a recipient is offline.
"""

from __future__ import annotations

from typing import Optional, Dict, Set
from datetime import datetime, timezone

from fastapi import WebSocket, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_

from app.core.security import sanitize_input
from app.core.roles import TRAVELER, ADMIN, CUSTOMER_SUPPORT, has_access
from app.models.user import User
from app.models.booking import Booking
from app.models.message import (
    Conversation,
    Message,
    MessageReceipt as MessageStatusModel,
    UserSession,
    Notification,
    MessageStatus,
)


# ---------------------------------------------------------------------------
# WebSocket connection manager (singleton)
# ---------------------------------------------------------------------------


class ConnectionManager:
    """Tracks active WebSocket connections keyed by user_id.

    One instance per backend worker. Behind multiple workers this must be
    replaced with Redis pub/sub (see architecture document, open question #3).
    """

    def __init__(self) -> None:
        # user_id -> set of active WebSockets
        self._connections: Dict[int, Set[WebSocket]] = {}
        # websocket -> user_id
        self._user_by_ws: Dict[WebSocket, int] = {}

    def is_online(self, user_id: int) -> bool:
        return user_id in self._connections and len(self._connections[user_id]) > 0

    def connect(self, websocket: WebSocket, user_id: int) -> None:
        self._connections.setdefault(user_id, set()).add(websocket)
        self._user_by_ws[websocket] = user_id

    def disconnect(self, websocket: WebSocket) -> Optional[int]:
        user_id = self._user_by_ws.pop(websocket, None)
        if user_id is not None:
            conns = self._connections.get(user_id)
            if conns:
                conns.discard(websocket)
                if not conns:
                    self._connections.pop(user_id, None)
        return user_id

    def user_connections(self, user_id: int) -> Set[WebSocket]:
        return set(self._connections.get(user_id, set()))

    async def send_personal(self, user_id: int, message: dict) -> int:
        """Send a JSON message to all open connections of a user. Returns count sent."""
        sent = 0
        dead: list[WebSocket] = []
        for ws in list(self.user_connections(user_id)):
            try:
                await ws.send_json(message)
                sent += 1
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)
        return sent

    async def broadcast_conversation(
        self, conversation_id: str, message: dict, exclude: Optional[WebSocket] = None
    ) -> None:
        # Conversations are 1:1; deliver to both participants' open connections.
        # Participant ids are resolved by the caller (service) and passed in
        # `message["_participants"]` when present, otherwise we broadcast to all
        # tracked users (safe because callers filter by conversation membership).
        participants = message.pop("_participants", None) or []
        targets = set(participants)
        for user_id in targets:
            await self.send_personal(user_id, message)


manager = ConnectionManager()


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


class MessageService:
    def __init__(self, db: Session):
        self.db = db

    # -- conversation -------------------------------------------------------

    def _participant_ids(self, conversation: Conversation) -> set[int]:
        return {conversation.traveler_id, conversation.guide_id}

    def _can_access(self, current_user: User, conversation: Conversation) -> bool:
        if current_user.id in self._participant_ids(conversation):
            return True
        return has_access(current_user.role, ADMIN, CUSTOMER_SUPPORT)

    def _resolve_counterpart(self, current_user: User, conversation: Conversation) -> int:
        """Return the id of the other participant in a 1:1 conversation."""
        if current_user.id == conversation.traveler_id:
            return conversation.guide_id
        return conversation.traveler_id

    def get_or_create_conversation(
        self, current_user: User, counterpart_id: int, booking_id: Optional[int] = None
    ) -> Conversation:
        """Get the active 1:1 conversation between current_user and counterpart,
        creating it if missing. Rejects self-messaging and unauthorized role pairs."""
        if current_user.id == counterpart_id:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Cannot start a conversation with yourself.",
            )

        counterpart = self.db.get(User, counterpart_id)
        if counterpart is None or not counterpart.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # Allowed pairs: traveller<->guide (existing) and guide<->guide (new).
        # traveller<->traveller remains blocked for privacy/security.
        if current_user.role == TRAVELER and counterpart.role == TRAVELER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Conversations between travellers are not supported.",
            )

        # Booking, if provided, must involve both parties.
        if booking_id is not None:
            booking = self.db.get(Booking, booking_id)
            if booking is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
            involved = {booking.user_id, booking.guide_user_id}
            if current_user.id not in involved or counterpart_id not in involved:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Booking does not involve both conversation parties.",
                )

        # Determine conversation orientation. For traveller<->guide the traveller
        # goes in traveler_id and the guide in guide_id. For guide<->guide the
        # initiator occupies traveler_id and the counterpart guide_id; lookups and
        # counterpart resolution are role-agnostic (keyed on user id), so either
        # orientation is functionally equivalent.
        if current_user.role == TRAVELER:
            traveler_id, guide_id = current_user.id, counterpart_id
        elif counterpart.role == TRAVELER:
            traveler_id, guide_id = counterpart_id, current_user.id
        else:
            traveler_id, guide_id = current_user.id, counterpart_id

        # Look up by the unordered participant pair so a guide<->guide thread is
        # found regardless of who initiates (avoids duplicate threads).
        a, b = current_user.id, counterpart_id
        conversation = (
            self.db.query(Conversation)
            .filter(
                Conversation.is_active.is_(True),
                or_(
                    and_(Conversation.traveler_id == a, Conversation.guide_id == b),
                    and_(Conversation.traveler_id == b, Conversation.guide_id == a),
                ),
            )
            .first()
        )
        if conversation is None:
            conversation = Conversation(
                traveler_id=traveler_id,
                guide_id=guide_id,
                booking_id=booking_id,
                subject=None,
            )
            self.db.add(conversation)
            self.db.commit()
            self.db.refresh(conversation)
        elif booking_id is not None and conversation.booking_id is None:
            conversation.booking_id = booking_id
            self.db.add(conversation)
            self.db.commit()
            self.db.refresh(conversation)
        return conversation

    def list_conversations(self, current_user: User, limit: int = 50, offset: int = 0):
        """List conversations the current user participates in, ordered by last activity."""
        q = (
            self.db.query(Conversation)
            .options(joinedload(Conversation.traveler), joinedload(Conversation.guide))
            .filter(
                or_(
                    Conversation.traveler_id == current_user.id,
                    Conversation.guide_id == current_user.id,
                ),
                Conversation.is_active.is_(True),
            )
            .order_by(Conversation.last_message_at.desc().nullslast(), Conversation.created_at.desc())
        )
        total = q.count()
        rows = q.offset(offset).limit(limit).all()
        results = []
        for c in rows:
            unread = (
                self.db.query(Message)
                .filter(
                    Message.conversation_id == str(c.id),
                    Message.recipient_id == current_user.id,
                    Message.status.in_([MessageStatus.sent.value, MessageStatus.delivered.value]),
                )
                .count()
            )
            last = (
                self.db.query(Message)
                .filter(Message.conversation_id == str(c.id))
                .order_by(Message.created_at.desc())
                .first()
            )
            counterpart_id = c.guide_id if current_user.id == c.traveler_id else c.traveler_id
            counterpart = self.db.get(User, counterpart_id)
            results.append(
                {
                    "id": str(c.id),
                    "traveler_id": c.traveler_id,
                    "guide_id": c.guide_id,
                    "booking_id": c.booking_id,
                    "subject": c.subject,
                    "is_active": c.is_active,
                    "last_message_at": c.last_message_at,
                    "unread_count": unread,
                    "last_message": last.body if last else None,
                    "created_at": c.created_at,
                    "updated_at": c.updated_at,
                    "counterpart": {
                        "id": counterpart.id,
                        "name": f"{counterpart.firstName or ''} {counterpart.lastName or ''}".strip() or counterpart.email,
                        "role": counterpart.role,
                        "avatar_url": counterpart.avatar_url,
                    },
                }
            )
        return results, total

    # -- message ------------------------------------------------------------

    def _mark_receipt(
        self, message: Message, user_id: int, status_value: str, now: datetime
    ) -> None:
        receipt = (
            self.db.query(MessageStatusModel)
            .filter(MessageStatusModel.message_id == message.id, MessageStatusModel.user_id == user_id)
            .first()
        )
        if receipt is None:
            receipt = MessageStatusModel(message_id=message.id, user_id=user_id, status=status_value)
            self.db.add(receipt)
        if status_value == MessageStatus.delivered.value:
            receipt.delivered_at = now
        elif status_value == MessageStatus.read.value:
            receipt.read_at = now
        receipt.status = status_value
        receipt.updated_at = now

    def send_message(
        self,
        current_user: User,
        conversation_id: str,
        body: str,
    ) -> Message:
        """Persist a message, apply the status machine, and queue offline notification."""
        body = sanitize_input(body)
        if not body:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Message body is required.",
            )

        conversation = (
            self.db.query(Conversation)
            .filter(Conversation.id == int(conversation_id))
            .first()
        )
        if conversation is None or not conversation.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        if not self._can_access(current_user, conversation):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a participant of this conversation")

        recipient_id = self._resolve_counterpart(current_user, conversation)
        now = datetime.now(timezone.utc)

        message = Message(
            conversation_id=int(conversation_id),
            sender_id=current_user.id,
            recipient_id=recipient_id,
            body=body,
            status=MessageStatus.sent.value,
            sent_at=now,
        )
        self.db.add(message)
        self.db.flush()

        # Sender's own receipt is immediately "sent"/"delivered" (they authored it).
        self._mark_receipt(message, current_user.id, MessageStatus.sent.value, now)

        # Recipient receipt: always created as "sent"; promoted to "delivered"
        # immediately when the recipient is online, otherwise queued for later.
        self._mark_receipt(message, recipient_id, MessageStatus.sent.value, now)
        recipient_online = manager.is_online(recipient_id)
        if recipient_online:
            self._mark_receipt(message, recipient_id, MessageStatus.delivered.value, now)
            message.delivered_at = now

        conversation.last_message_at = now
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(message)

        # Fire async notification if the recipient was offline.
        if not recipient_online:
            self._queue_notification(
                recipient_id,
                "message_received",
                "New message",
                f"You have a new message from {current_user.firstName or ''} {current_user.lastName or ''}".strip()
                or current_user.email,
                {"conversation_id": str(conversation_id), "message_id": message.id, "sender_id": current_user.id},
            )

        return message

    def list_messages(
        self, current_user: User, conversation_id: str, limit: int = 50, offset: int = 0
    ):
        conversation = (
            self.db.query(Conversation)
            .filter(Conversation.id == int(conversation_id))
            .first()
        )
        if conversation is None or not conversation.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        if not self._can_access(current_user, conversation):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a participant of this conversation")

        q = (
            self.db.query(Message)
            .filter(Message.conversation_id == int(conversation_id))
            .order_by(Message.created_at.asc())
        )
        total = q.count()
        rows = q.offset(offset).limit(limit).all()
        messages = []
        for m in rows:
            sender = self.db.get(User, m.sender_id)
            messages.append(
                {
                    "id": m.id,
                    "conversation_id": str(conversation_id),
                    "sender_id": m.sender_id,
                    "sender_name": f"{sender.firstName or ''} {sender.lastName or ''}".strip() or sender.email,
                    "sender_role": sender.role,
                    "recipient_id": m.recipient_id,
                    "body": m.body,
                    "status": m.status,
                    "sent_at": m.sent_at,
                    "delivered_at": m.delivered_at,
                    "read_at": m.read_at,
                    "created_at": m.created_at,
                }
            )
        return messages, total

    def mark_conversation_read(self, current_user: User, conversation_id: str) -> int:
        """Mark all unread messages addressed to current_user in the conversation as read."""
        conversation = (
            self.db.query(Conversation)
            .filter(Conversation.id == int(conversation_id))
            .first()
        )
        if conversation is None or not conversation.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        if not self._can_access(current_user, conversation):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a participant of this conversation")

        now = datetime.now(timezone.utc)
        unread = (
            self.db.query(Message)
            .filter(
                Message.conversation_id == int(conversation_id),
                Message.recipient_id == current_user.id,
                Message.status.in_([MessageStatus.sent.value, MessageStatus.delivered.value]),
            )
            .all()
        )
        count = 0
        for m in unread:
            m.status = MessageStatus.read.value
            m.read_at = now
            m.updated_at = now
            self._mark_receipt(m, current_user.id, MessageStatus.read.value, now)
            count += 1
        if count:
            self.db.commit()
        return count

    def unread_count(self, current_user: User) -> int:
        return (
            self.db.query(Message)
            .filter(
                Message.recipient_id == current_user.id,
                Message.status.in_([MessageStatus.sent.value, MessageStatus.delivered.value]),
            )
            .join(Conversation, Message.conversation_id == Conversation.id)
            .filter(
                or_(
                    Conversation.traveler_id == current_user.id,
                    Conversation.guide_id == current_user.id,
                ),
                Conversation.is_active.is_(True),
            )
            .count()
        )

    # -- presence -----------------------------------------------------------

    def record_session(self, user_id: int, connection_id: str, is_online: bool = True) -> None:
        row = (
            self.db.query(UserSession)
            .filter(UserSession.connection_id == connection_id)
            .first()
        )
        now = datetime.now(timezone.utc)
        if row is None:
            row = UserSession(
                user_id=user_id,
                connection_id=connection_id,
                connected_at=now,
                last_seen=now,
                is_online=is_online,
            )
            self.db.add(row)
        else:
            row.user_id = user_id
            row.last_seen = now
            row.is_online = is_online
        self.db.commit()

    def set_offline(self, connection_id: str) -> Optional[int]:
        row = (
            self.db.query(UserSession)
            .filter(UserSession.connection_id == connection_id)
            .first()
        )
        if row is None:
            return None
        user_id = row.user_id
        row.is_online = False
        row.last_seen = datetime.now(timezone.utc)
        self.db.commit()
        return user_id

    # -- notifications ------------------------------------------------------

    def _queue_notification(
        self,
        user_id: int,
        type_: str,
        title: str,
        body: str,
        data: dict,
    ) -> None:
        import json

        notification = Notification(
            user_id=user_id,
            type=type_,
            title=title,
            body=body,
            data=json.dumps(data),
            is_read=False,
        )
        self.db.add(notification)
        self.db.commit()

    def list_notifications(self, current_user: User, limit: int = 50, offset: int = 0):
        q = (
            self.db.query(Notification)
            .filter(Notification.user_id == current_user.id)
            .order_by(Notification.created_at.desc())
        )
        total = q.count()
        rows = q.offset(offset).limit(limit).all()
        payload = [
            {
                "id": n.id,
                "user_id": n.user_id,
                "type": n.type,
                "title": n.title,
                "body": n.body,
                "data": n.data,
                "is_read": n.is_read,
                "created_at": n.created_at,
            }
            for n in rows
        ]
        return payload, total

    def mark_notification_read(self, current_user: User, notification_id: int) -> bool:
        n = (
            self.db.query(Notification)
            .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
            .first()
        )
        if n is None:
            return False
        n.is_read = True
        self.db.commit()
        return True
