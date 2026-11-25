"""add experience_ids to guide_availability_dates

Revision ID: c3d4e5f6a7b8
Revises: 9d1e4c7b2a60
Create Date: 2026-11-25 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "c3d4e5f6a7b8"
down_revision = "9d1e4c7b2a60"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "guide_availability_dates",
        sa.Column("experience_ids", sa.String(length=255), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("guide_availability_dates", "experience_ids")
