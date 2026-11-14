"""Add capacity management fields to guide_listings

Revision ID: 2f156aa554ba
Revises: 8f795c139451
Create Date: 2026-11-14 11:35:52.301765

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2f156aa554ba'
down_revision: Union[str, Sequence[str], None] = '8f795c139451'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    conn = op.get_bind()

    # --- guide_listings: add capacity management fields ---
    if conn.execute(sa.text("SELECT 1 FROM information_schema.tables "
        "WHERE table_name = 'guide_listings'").fetchone()):
        # Check if capacity_threshold column exists
        result = conn.execute(sa.text("SELECT 1 FROM information_schema.columns "
            "WHERE table_name = 'guide_listings' AND column_name = 'capacity_threshold'").fetchone())
        if result is None:
            conn.execute(sa.text("ALTER TABLE guide_listings ADD COLUMN capacity_threshold INTEGER NOT NULL DEFAULT 3"))

        result = conn.execute(sa.text("SELECT 1 FROM information_schema.columns "
            "WHERE table_name = 'guide_listings' AND column_name = 'recharge_days'").fetchone())
        if result is None:
            conn.execute(sa.text("ALTER TABLE guide_listings ADD COLUMN recharge_days INTEGER NOT NULL DEFAULT 0"))

        result = conn.execute(sa.text("SELECT 1 FROM information_schema.columns "
            "WHERE table_name = 'guide_listings' AND column_name = 'availability_status'").fetchone())
        if result is None:
            conn.execute(sa.text("ALTER TABLE guide_listings ADD COLUMN availability_status VARCHAR NOT NULL DEFAULT 'open'"))

        result = conn.execute(sa.text("SELECT 1 FROM information_schema.columns "
            "WHERE table_name = 'guide_listings' AND column_name = 'next_available_date'").fetchone())
        if result is None:
            conn.execute(sa.text("ALTER TABLE guide_listings ADD COLUMN next_available_date TIMESTAMP WITHOUT TIME ZONE"))


def downgrade() -> None:
    """Downgrade schema."""
    conn = op.get_bind()
    if conn.execute(sa.text("SELECT 1 FROM information_schema.tables "
        "WHERE table_name = 'guide_listings'").fetchone()):
        conn.execute(sa.text("ALTER TABLE guide_listings DROP COLUMN IF EXISTS next_available_date"))
        conn.execute(sa.text("ALTER TABLE guide_listings DROP COLUMN IF EXISTS availability_status"))
        conn.execute(sa.text("ALTER TABLE guide_listings DROP COLUMN IF EXISTS recharge_days"))
        conn.execute(sa.text("ALTER TABLE guide_listings DROP COLUMN IF EXISTS capacity_threshold"))
