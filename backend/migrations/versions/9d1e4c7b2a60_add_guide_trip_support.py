"""add_guide_trip_support

Add a nullable free-text ``trip_support`` column to the catalog ``guides``
table.  A signed-in guide writes this text from their profile settings page
and it renders on their public guide profile page.

Revision ID: 9d1e4c7b2a60
Revises: 7c9b8d0a1e3f
Create Date: 2026-11-22
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "9d1e4c7b2a60"
down_revision: Union[str, Sequence[str], None] = "7c9b8d0a1e3f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("guides", sa.Column("trip_support", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("guides", "trip_support")
