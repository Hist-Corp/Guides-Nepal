from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.core.roles import GUIDE
from fastapi import HTTPException
from app.schemas.booking import BookingCreate
from typing import List, Optional


class BookingService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_bookings(self, user_id: int) -> List[Booking]:
        return self.db.query(Booking).filter(Booking.user_id == user_id).all()

    def get_booking_guide(self) -> User:
        guide = (
            self.db.query(User)
            .filter(User.email == "guide@guides-nepal.com", User.role == GUIDE, User.is_active.is_(True))
            .first()
        )
        if not guide:
            raise HTTPException(status_code=503, detail="The booking guide is unavailable")
        return guide

    def availability_for_date(self, date: str) -> dict:
        guide = self.get_booking_guide()
        active = (
            self.db.query(Booking)
            .filter(
                Booking.guide_user_id == guide.id,
                func.date(Booking.date) == date,
                Booking.status.in_([BookingStatus.upcoming, BookingStatus.accepted]),
            )
            .first()
        )
        if not active:
            return {"available": True, "status": "free"}
        status = "booked" if active.status == BookingStatus.accepted else "reserved"
        return {"available": False, "status": status}

    def create_booking(self, user_id: int, booking_in: BookingCreate) -> Booking:
        # The current catalog has one bookable guide account. Do not infer a
        # recipient from display-only guide profiles until those profiles have
        # their own authenticated accounts.
        guide = self.get_booking_guide()
        availability = self.availability_for_date(booking_in.date.date().isoformat())
        if not availability["available"]:
            raise HTTPException(
                status_code=409,
                detail=f"The guide is already {availability['status']} on this date. Please choose another date.",
            )
        db_booking = Booking(
            user_id=user_id,
            guide_user_id=guide.id,
            **booking_in.model_dump(),
        )
        self.db.add(db_booking)
        self.db.commit()
        self.db.refresh(db_booking)
        return db_booking

    def cancel_booking(self, user_id: int, booking_id: int) -> Optional[Booking]:
        booking = (
            self.db.query(Booking)
            .filter(Booking.id == booking_id, Booking.user_id == user_id)
            .first()
        )
        if booking:
            booking.status = BookingStatus.cancelled  # type: ignore
            self.db.commit()
            self.db.refresh(booking)
        return booking

    def archive_booking(self, user_id: int, booking_id: int) -> Optional[Booking]:
        booking = (
            self.db.query(Booking)
            .filter(Booking.id == booking_id, Booking.user_id == user_id)
            .first()
        )
        if booking:
            booking.status = BookingStatus.archived  # type: ignore
            self.db.commit()
            self.db.refresh(booking)
        return booking
