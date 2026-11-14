"""create bookings table

Revision ID: ff8b527a0b00
Revises: 5da9b06e2e4f
Create Date: 2026-01-24 08:25:54.208651

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "ff8b527a0b00"
down_revision: Union[str, Sequence[str], None] = "5da9b06e2e4f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("guide_user_id", sa.Integer(), nullable=True),
        sa.Column("experience_id", sa.Integer(), nullable=False),
        sa.Column("experience_title", sa.String(), nullable=False),
        sa.Column("city", sa.String(), nullable=False),
        sa.Column("date", sa.DateTime(), nullable=False),
        sa.Column("guests", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("image", sa.String(), nullable=True),
        sa.Column(
            "status",
            sa.String(),
            nullable=False,
            server_default="upcoming",
        ),
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
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["guide_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_bookings_id"), "bookings", ["id"], unique=False)
    op.create_index(op.f("ix_bookings_user_id"), "bookings", ["user_id"], unique=False)
    op.create_index(
        op.f("ix_bookings_guide_user_id"), "bookings", ["guide_user_id"], unique=False
    )
    op.create_index(op.f("ix_bookings_date"), "bookings", ["date"], unique=False)
    op.create_index(
        op.f("ix_bookings_status"), "bookings", ["status"], unique=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_bookings_status"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_date"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_guide_user_id"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_user_id"), table_name="bookings")
    op.drop_index(op.f("ix_bookings_id"), table_name="bookings")
    op.drop_table("bookings")

