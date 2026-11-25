"""add checkout to bookings

Revision ID: e6f7a8b9c0d1
Revises: d5e6f7a8b9c0
Create Date: 2026-11-25 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e6f7a8b9c0d1"
down_revision: Union[str, Sequence[str], None] = "d5e6f7a8b9c0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check-out day of a multi-night stay; every night from ``date`` up to it is
    # held, and every one of them must have been opened by the guide.
    op.add_column("bookings", sa.Column("checkout", sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column("bookings", "checkout")
