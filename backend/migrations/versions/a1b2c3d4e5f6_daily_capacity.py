"""create guide_daily_capacity table

Revision ID: a1b2c3d4e5f6_daily_capacity
Revises: 8f795c139451
Create Date: 2026-11-16 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "a1b2c3d4e5f6_daily_capacity"
down_revision = "8f795c139451"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "guide_daily_capacity",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("guide_user_id", sa.Integer(), nullable=False),
        sa.Column("booking_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("max_capacity", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("booked_capacity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("reset_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.ForeignKeyConstraint(
            ["guide_user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("guide_user_id", "booking_date", name="uq_guide_daily_capacity"),
    )
    op.create_index("ix_guide_capacity_date", "guide_daily_capacity", ["guide_user_id", "booking_date"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_guide_capacity_date", table_name="guide_daily_capacity")
    op.drop_table("guide_daily_capacity")
