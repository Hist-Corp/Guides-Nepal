from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class HostExperience(Base):
    __tablename__ = "host_experiences"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, nullable=False, index=True)
    city = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    duration = Column(String, nullable=False)
    hero_image = Column(String, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class HostTour(Base):
    __tablename__ = "host_tours"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    city = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    itinerary = Column(Text, nullable=False)
    meeting_point = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    max_guests = Column(Integer, nullable=False, default=10)
    price = Column(Float, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class HostBooking(Base):
    __tablename__ = "host_bookings"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    experience_id = Column(Integer, ForeignKey("host_experiences.id"), nullable=False, index=True)
    guest_name = Column(String, nullable=False)
    guest_email = Column(String, nullable=False)
    guest_phone = Column(String, nullable=True)
    date = Column(DateTime(timezone=True), nullable=False)
    guests = Column(Integer, nullable=False, default=1)
    total_price = Column(Float, nullable=False, default=0)
    notes = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="upcoming", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class BookingStatus(str, enum.Enum):
    upcoming = "upcoming"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"
    cancelled = "cancelled"
    archived = "archived"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    experience_id = Column(Integer, nullable=False)
    experience_title = Column(String, nullable=False)
    city = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    guests = Column(Integer, default=1)
    price = Column(Float, nullable=False)
    image = Column(String, nullable=True)
    status: Column[BookingStatus] = Column(
        Enum(BookingStatus), default=BookingStatus.upcoming
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="bookings")
