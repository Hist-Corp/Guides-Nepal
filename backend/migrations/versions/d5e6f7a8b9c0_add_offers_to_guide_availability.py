"""add offers to guide_availability_dates

Revision ID: d5e6f7a8b9c0
Revises: c3d4e5f6a7b8
Create Date: 2026-11-25 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d5e6f7a8b9c0"
down_revision: Union[str, Sequence[str], None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # {"<experience id>": {"slots": n, "price": p}, "*": {...}}; "*" is the
    # date's default offer, used for whole-date openings and as the fallback.
    op.add_column(
        "guide_availability_dates",
        sa.Column("offers", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("guide_availability_dates", "offers")
