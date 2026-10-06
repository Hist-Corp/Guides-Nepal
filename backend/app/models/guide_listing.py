from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class GuideListing(Base):
    """Experience listing owned by a guide user account.

    Unlike the public ``guides`` catalog table (display-only profiles), this
    table is keyed by ``guide_user_id`` so each signed-in guide can list and
    manage their own trekking routes, travel tours, or specialized activities
    — including the per-listing ``max_guests`` capacity.
    """

    __tablename__ = "guide_listings"

    id = Column(Integer, primary_key=True, index=True)
    guide_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False, default="tour")  # trekking | tour | specialized
    city = Column(String, nullable=False, default="Kathmandu")  # area of expertise / event location
    area = Column(String, nullable=True)  # finer area, e.g. "Annapurna Circuit"
    description = Column(Text, nullable=False, default="")
    itinerary = Column(Text, nullable=True)
    meeting_point = Column(String, nullable=True)
    duration = Column(String, nullable=False, default="1 day")
    difficulty = Column(String, nullable=False, default="Easy")
    price = Column(Float, nullable=False, default=0.0)
    max_guests = Column(Integer, nullable=False, default=10)
    booked_guests = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class GuideStatusUpdate(Base):
    """Real-time post from a guide about bookings / capacity / schedule.

    ``update_type`` is one of: availability | capacity | booking | schedule | announcement.
    """

    __tablename__ = "guide_status_updates"

    id = Column(Integer, primary_key=True, index=True)
    guide_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    listing_id = Column(Integer, ForeignKey("guide_listings.id"), nullable=True, index=True)
    update_type = Column(String, nullable=False, default="announcement")
    message = Column(Text, nullable=False)
    area = Column(String, nullable=True)
    event_date = Column(DateTime(timezone=True), nullable=True)
    current_capacity = Column(Integer, nullable=True)
    max_capacity = Column(Integer, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class GuideProfile(Base):
    """Onboarding profile for a guide user account (one row per user)."""

    __tablename__ = "guide_profiles"

    id = Column(Integer, primary_key=True, index=True)
    guide_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    display_name = Column(String, nullable=True)
    expertise_areas = Column(JSON, nullable=False, default=list)  # e.g. ["trekking", "tour", "specialized"]
    cities = Column(JSON, nullable=False, default=list)
    languages = Column(JSON, nullable=False, default=list)
    bio = Column(Text, nullable=True)
    years_experience = Column(String, nullable=True)
    default_max_guests = Column(Integer, nullable=False, default=10)
    onboarding_completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
