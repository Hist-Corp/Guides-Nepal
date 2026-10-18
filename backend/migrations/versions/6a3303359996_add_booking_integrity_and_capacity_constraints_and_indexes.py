"""Add booking integrity and capacity constraints + indexes

Revision ID: 6a3303359996
Revises: d4e5f6a7b8c9
Create Date: 2026-10-18 20:58:49.960240

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6a3303359996'
down_revision: Union[str, Sequence[str], None] = 'd4e5f6a7b8c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(conn, table_name: str) -> bool:
    inspector = sa.inspect(conn)
    return table_name in inspector.get_table_names()


def _index_exists(conn, table_name: str, index_name: str) -> bool:
    if not _table_exists(conn, table_name):
        return False
    inspector = sa.inspect(conn)
    return index_name in [idx['name'] for idx in inspector.get_indexes(table_name)]


def upgrade() -> None:
    """Upgrade schema."""
    conn = op.get_bind()

    # --- Booking integrity: status check ---
    if _table_exists(conn, 'bookings'):
        try:
            conn.execute(sa.text(
                "ALTER TABLE bookings ADD CONSTRAINT chk_bookings_status "
                "CHECK (status IN ('upcoming','accepted','rejected','completed','cancelled','archived'))"
            ))
        except Exception:
            pass

    # --- Guide listing constraints ---
    if _table_exists(conn, 'guide_listings'):
        try:
            conn.execute(sa.text(
                "ALTER TABLE guide_listings ADD CONSTRAINT chk_guests_1_to_100 "
                "CHECK (max_guests >= 1 AND max_guests <= 100)"
            ))
        except Exception:
            pass
        try:
            conn.execute(sa.text(
                "ALTER TABLE guide_listings ADD CONSTRAINT chk_booked_non_negative "
                "CHECK (booked_guests >= 0)"
            ))
        except Exception:
            pass
        try:
            conn.execute(sa.text(
                "ALTER TABLE guide_listings ADD CONSTRAINT chk_booked_le_max "
                "CHECK (booked_guests <= max_guests)"
            ))
        except Exception:
            pass

    # --- Booking date index ---
    if _table_exists(conn, 'bookings') and not _index_exists(conn, 'bookings', 'ix_bookings_date'):
        op.create_index(op.f('ix_bookings_date'), 'bookings', ['date'], unique=False)

    # --- Guide listing composite indexes ---
    if _table_exists(conn, 'guide_listings'):
        if not _index_exists(conn, 'guide_listings', 'ix_guide_listings_guide_active'):
            op.create_index(op.f('ix_guide_listings_guide_active'), 'guide_listings', ['guide_user_id', 'is_active'], unique=False)
        if not _index_exists(conn, 'guide_listings', 'ix_guide_listings_capacity'):
            op.create_index(op.f('ix_guide_listings_capacity'), 'guide_listings', ['max_guests', 'booked_guests'], unique=False)

    # --- Host experiences composite index ---
    if _table_exists(conn, 'host_experiences'):
        if not _index_exists(conn, 'host_experiences', 'ix_host_experiences_is_active'):
            op.create_index(op.f('ix_host_experiences_is_active'), 'host_experiences', ['is_active'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    conn = op.get_bind()

    if _table_exists(conn, 'guide_listings'):
        try:
            conn.execute(sa.text("ALTER TABLE guide_listings DROP CONSTRAINT chk_guests_1_to_100"))
        except Exception:
            pass
        try:
            conn.execute(sa.text("ALTER TABLE guide_listings DROP CONSTRAINT chk_booked_non_negative"))
        except Exception:
            pass
        try:
            conn.execute(sa.text("ALTER TABLE guide_listings DROP CONSTRAINT chk_booked_le_max"))
        except Exception:
            pass

    # Drop indexes (only those this migration may have created)
    for idx_name, table_name in [
        ('ix_guide_listings_guide_active', 'guide_listings'),
        ('ix_guide_listings_capacity', 'guide_listings'),
        ('ix_host_experiences_is_active', 'host_experiences'),
    ]:
        if _table_exists(conn, table_name) and _index_exists(conn, table_name, idx_name):
            try:
                op.drop_index(idx_name, table_name=table_name)
            except Exception:
                pass
