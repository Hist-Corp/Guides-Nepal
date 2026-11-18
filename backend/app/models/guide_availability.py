"""Per-day availability calendar for guides.

A row exists only for a date the guide has explicitly opened for booking.  The
absence of a row is what makes a date "Unavailable", so a fresh guide account
is fully closed until it opens dates from the dashboard calendar.  The third
state, "Booked", is derived from active bookings and their remaining capacity
rather than stored here, so it can never drift out of sync with the bookings
table.
"""

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from app.core.database import Base


class GuideAvailabilityDate(Base):
    __tablename__ = "guide_availability_dates"

    id = Column(Integer, primary_key=True, index=True)
    guide_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    # Kept explicit so the table can later hold guide-authored blocks
    # ("unavailable" rows) without a schema change; today only "available"
    # rows are written.
    status = Column(String(16), nullable=False, default="available")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("guide_user_id", "date", name="uq_guide_availability_date"),
        Index("ix_guide_availability_guide_date", "guide_user_id", "date"),
    )
