"""Pydantic schemas for the Guide <-> Traveller messaging system.

Field names use camelCase (via aliases) to match the frontend contract, while
SQLAlchemy attributes remain snake_case.
"""

from __future__ import annotations

from typing import Optional, List
from datetime import datetime
from uuid import uuid4
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


def _conv_id() -> str:
    return f"conv_{uuid4().hex[:12]}"


def _msg_id() -> str:
    return f"msg_{uuid4().hex[:12]}"


# ---------------------------------------------------------------------------
# Conversation
# ---------------------------------------------------------------------------


class ConversationBase(BaseModel):
    guide_id: Optional[int] = None  # traveler starts a conversation with a guide
    traveler_id: Optional[int] = None  # guide starts a conversation with a traveler
    booking_id: Optional[int] = None
    subject: Optional[str] = Field(default=None, max_length=200)


class ConversationCreate(ConversationBase):
    pass


class ConversationOut(BaseModel):
    id: int
    traveler_id: int
    guide_id: int
    booking_id: Optional[int] = None
    subject: Optional[str] = None
    is_active: bool
    last_message_at: Optional[datetime] = None
    unread_count: int = 0
    last_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Message
# ---------------------------------------------------------------------------


class MessageStatus(str, Enum):
    sent = "sent"
    delivered = "delivered"
    read = "read"


class MessageBase(BaseModel):
    conversation_id: str
    body: str = Field(min_length=1, max_length=4000)
    # recipient is resolved server-side from conversation membership; accepted
    # explicitly for REST clarity but ignored/overridden by authorization.
    recipient_id: Optional[int] = None


class MessageCreate(MessageBase):
    pass


class MessageOut(BaseModel):
    id: int
    conversation_id: str
    sender_id: int
    sender_name: str
    sender_role: str
    recipient_id: int
    body: str
    status: MessageStatus
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationWithMessages(BaseModel):
    conversation: ConversationOut
    messages: List[MessageOut]

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Mark-read / notifications
# ---------------------------------------------------------------------------


class MarkReadRequest(BaseModel):
    conversation_id: str


class NotificationOut(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    body: str
    data: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# WebSocket client/server frames
# ---------------------------------------------------------------------------


class WSMessageIn(BaseModel):
    type: str = "message"
    body: str
    conversation_id: str


class WSMessageOut(BaseModel):
    type: str = "message"
    id: int
    conversation_id: str
    sender_id: int
    sender_name: str
    sender_role: str
    body: str
    status: MessageStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WSAckOut(BaseModel):
    type: str = "ack"
    message_id: int
    status: MessageStatus
    conversation_id: str
