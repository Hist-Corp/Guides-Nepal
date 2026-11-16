"""Create messaging tables for Guide <-> Traveller communication.

Revision ID: a7b8c9d0e1f2_messaging_tables
Revises: 8f795c139451
Create Date: 2026-11-16 15:15:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "a7b8c9d0e1f2"
down_revision: Union[str, Sequence[str], None] = "8f795c139451"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "conversations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("traveler_id", sa.Integer(), nullable=False),
        sa.Column("guide_id", sa.Integer(), nullable=False),
        sa.Column("booking_id", sa.Integer(), nullable=True),
        sa.Column("subject", sa.String(length=200), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("last_message_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"]),
        sa.ForeignKeyConstraint(["traveler_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["guide_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_conversations_id"), "conversations", ["id"], unique=False)
    op.create_index(
        op.f("ix_conversations_traveler_id"), "conversations", ["traveler_id"], unique=False
    )
    op.create_index(
        op.f("ix_conversations_guide_id"), "conversations", ["guide_id"], unique=False
    )
    op.create_index(
        op.f("ix_conversations_booking_id"), "conversations", ["booking_id"], unique=False
    )
    op.create_index(
        op.f("ix_conversations_is_active"), "conversations", ["is_active"], unique=False
    )
    op.create_index(
        "ix_conversations_traveler_guide_active",
        "conversations",
        ["traveler_id", "guide_id", "is_active"],
        unique=True,
    )
    op.create_index(
        op.f("ix_conversations_last_message_at"),
        "conversations",
        ["last_message_at"],
        unique=False,
    )

    op.create_table(
        "messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("conversation_id", sa.Integer(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=False),
        sa.Column("recipient_id", sa.Integer(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="sent",
        ),
        sa.Column("sent_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["recipient_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_messages_id"), "messages", ["id"], unique=False)
    op.create_index(
        op.f("ix_messages_conversation_id"),
        "messages",
        ["conversation_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_messages_sender_id"), "messages", ["sender_id"], unique=False
    )
    op.create_index(
        op.f("ix_messages_recipient_id"), "messages", ["recipient_id"], unique=False
    )
    op.create_index(
        "ix_messages_conversation_created",
        "messages",
        ["conversation_id", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_messages_recipient_status",
        "messages",
        ["recipient_id", "status"],
        unique=False,
    )
    op.create_index(op.f("ix_messages_status"), "messages", ["status"], unique=False)

    op.create_table(
        "message_statuses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("message_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="sent",
        ),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["message_id"], ["messages.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("message_id", "user_id", name="uq_message_status_message_user"),
    )
    op.create_index(op.f("ix_message_statuses_id"), "message_statuses", ["id"], unique=False)
    op.create_index(
        op.f("ix_message_statuses_message_id"),
        "message_statuses",
        ["message_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_message_statuses_user_id"),
        "message_statuses",
        ["user_id"],
        unique=False,
    )

    op.create_table(
        "user_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("connection_id", sa.String(), nullable=False),
        sa.Column(
            "connected_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column(
            "last_seen",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("is_online", sa.Boolean(), nullable=False, server_default="true"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_user_sessions_id"), "user_sessions", ["id"], unique=False)
    op.create_index(
        op.f("ix_user_sessions_user_id"), "user_sessions", ["user_id"], unique=False
    )
    op.create_index(
        op.f("ix_user_sessions_connection_id"),
        "user_sessions",
        ["connection_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_user_sessions_is_online"),
        "user_sessions",
        ["is_online"],
        unique=False,
    )
    op.create_index(
        "ix_user_sessions_user_online",
        "user_sessions",
        ["user_id", "is_online"],
        unique=False,
    )

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False, server_default="message_received"),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("data", sa.String(), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_notifications_id"), "notifications", ["id"], unique=False)
    op.create_index(
        op.f("ix_notifications_user_id"), "notifications", ["user_id"], unique=False
    )
    op.create_index(
        op.f("ix_notifications_is_read"), "notifications", ["is_read"], unique=False
    )
    op.create_index(
        "ix_notifications_user_unread",
        "notifications",
        ["user_id", "is_read"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_notifications_user_unread", table_name="notifications")
    op.drop_index(op.f("ix_notifications_is_read"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_user_id"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_id"), table_name="notifications")
    op.drop_table("notifications")

    op.drop_index("ix_user_sessions_user_online", table_name="user_sessions")
    op.drop_index(op.f("ix_user_sessions_is_online"), table_name="user_sessions")
    op.drop_index(op.f("ix_user_sessions_connection_id"), table_name="user_sessions")
    op.drop_index(op.f("ix_user_sessions_user_id"), table_name="user_sessions")
    op.drop_index(op.f("ix_user_sessions_id"), table_name="user_sessions")
    op.drop_table("user_sessions")

    op.drop_index(op.f("ix_message_statuses_user_id"), table_name="message_statuses")
    op.drop_index(op.f("ix_message_statuses_message_id"), table_name="message_statuses")
    op.drop_index(op.f("ix_message_statuses_id"), table_name="message_statuses")
    op.drop_table("message_statuses")

    op.drop_index(op.f("ix_messages_status"), table_name="messages")
    op.drop_index("ix_messages_recipient_status", table_name="messages")
    op.drop_index("ix_messages_conversation_created", table_name="messages")
    op.drop_index(op.f("ix_messages_recipient_id"), table_name="messages")
    op.drop_index(op.f("ix_messages_sender_id"), table_name="messages")
    op.drop_index(op.f("ix_messages_conversation_id"), table_name="messages")
    op.drop_index(op.f("ix_messages_id"), table_name="messages")
    op.drop_table("messages")

    op.drop_index("ix_conversations_traveler_guide_active", table_name="conversations")
    op.drop_index(op.f("ix_conversations_last_message_at"), table_name="conversations")
    op.drop_index(op.f("ix_conversations_is_active"), table_name="conversations")
    op.drop_index(op.f("ix_conversations_booking_id"), table_name="conversations")
    op.drop_index(op.f("ix_conversations_guide_id"), table_name="conversations")
    op.drop_index(op.f("ix_conversations_traveler_id"), table_name="conversations")
    op.drop_index(op.f("ix_conversations_id"), table_name="conversations")
    op.drop_table("conversations")
