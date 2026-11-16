"""Message persistence models for the Guide <-> Traveller messaging system.

Tables:
- conversations      1:1 thread between one traveler and one guide.
- messages           Individual messages within a conversation.
- message_statuses   Per-recipient delivery/read receipts (sent/delivered/read).
- user_sessions      Durable presence (WebSocket connection <-> user).
- notifications      Async offline notifications queued when a recipient is offline.

Status lifecycle on a message: sent -> delivered -> read.
"""

from __future__ import annotations

from enum import Enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class MessageStatus(str, Enum):
    sent = "sent"
    delivered = "delivered"
    read = "read"


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    traveler_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    guide_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    booking_id = Column(
        Integer, ForeignKey("bookings.id"), nullable=True, index=True
    )
    subject = Column(String(200), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    last_message_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    traveler = relationship("User", foreign_keys=[traveler_id])
    guide = relationship("User", foreign_keys=[guide_id])
    booking = relationship("Booking", foreign_keys=[booking_id])
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

    __table_args__ = (
        # One active thread per (traveler, guide) pair.
        Index("ix_conversations_traveler_guide_active", "traveler_id", "guide_id", "is_active", unique=True),
        Index("ix_conversations_last_message_at", "last_message_at"),
    )

    def participants(self):
        return {self.traveler_id, self.guide_id}


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(
        Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    body = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default=MessageStatus.sent.value, index=True)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
    recipient = relationship("User", foreign_keys=[recipient_id])
    statuses = relationship("MessageReceipt", back_populates="message", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_messages_conversation_created", "conversation_id", "created_at"),
        Index("ix_messages_recipient_status", "recipient_id", "status"),
    )


class MessageReceipt(Base):
    """Per-recipient delivery/read receipt for a message."""

    __tablename__ = "message_statuses"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(
        Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String(20), nullable=False, default=MessageStatus.sent.value)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    message = relationship("Message", back_populates="statuses")
    user = relationship("User")

    __table_args__ = (UniqueConstraint("message_id", "user_id", name="uq_message_status_message_user"),)


class UserSession(Base):
    """Durable presence record for WebSocket-connected users."""

    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    connection_id = Column(String, nullable=False, index=True)
    connected_at = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_online = Column(Boolean, nullable=False, default=True, index=True)

    user = relationship("User")

    __table_args__ = (Index("ix_user_sessions_user_online", "user_id", "is_online"),)


class Notification(Base):
    """Async offline notification queued when a recipient cannot be reached live."""

    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String(50), nullable=False, default="message_received")
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    data = Column(String, nullable=True)  # JSON string: conversation_id, message_id, sender_id
    is_read = Column(Boolean, nullable=False, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

    __table_args__ = (Index("ix_notifications_user_unread", "user_id", "is_read"),)
