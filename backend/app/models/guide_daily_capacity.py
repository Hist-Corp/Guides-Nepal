from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.sql import func
from app.core.database import Base


class GuideDailyCapacity(Base):
    """Per-guide, per-calendar-date capacity tracker.

    One row per (guide_user_id, booking_date).  Slots refresh to zero every
    24 hours via the daily reset job, so bookings for a given day can never
    exceed ``max_capacity``.  Advance bookings for future days pre-allocate
    capacity ahead of time.
    """

    __tablename__ = "guide_daily_capacity"

    id = Column(Integer, primary_key=True, index=True)
    guide_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    booking_date = Column(DateTime(timezone=True), nullable=False, index=True)  # date at 00:00
    max_capacity = Column(Integer, nullable=False, default=10)
    booked_capacity = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    reset_at = Column(DateTime(timezone=True), nullable=True)  # last daily reset timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("guide_user_id", "booking_date", name="uq_guide_daily_capacity"),
        Index("ix_guide_capacity_date", "guide_user_id", "booking_date"),
    )
