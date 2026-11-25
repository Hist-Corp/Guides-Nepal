"""make bookings.date a date-only field

Revision ID: f8a9b0c1d2e3
Revises: e6f7a8b9c0d1
Create Date: 2026-11-25 00:00:00.000000

A booking day is a calendar day everywhere else in the app (guide openings,
availability, the traveller's YYYY-MM-DD picker), so the row stores the day
itself instead of a timestamp whose time-of-day was always midnight.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f8a9b0c1d2e3"
down_revision: Union[str, Sequence[str], None] = "e6f7a8b9c0d1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    if op.get_bind().dialect.name == "sqlite":
        # SQLite stores a DATE as an ISO string and has no real column types,
        # and its table rebuild would CAST the old timestamps to a number
        # ("2026-11-26" -> 2026). So only the data needs changing here; the
        # ORM's Date type already reads the trimmed strings back as dates.
        op.execute("UPDATE bookings SET date = substr(date, 1, 10)")
        return
    op.alter_column(
        "bookings",
        "date",
        existing_type=sa.DateTime(),
        type_=sa.Date(),
        existing_nullable=False,
        postgresql_using="date::date",
    )


def downgrade() -> None:
    if op.get_bind().dialect.name == "sqlite":
        # Still an ISO day string; SQLite has no type to revert.
        return
    op.alter_column(
        "bookings",
        "date",
        existing_type=sa.Date(),
        type_=sa.DateTime(),
        existing_nullable=False,
    )
