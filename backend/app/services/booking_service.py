from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.booking import Booking, BookingStatus
from app.models.host_guide import HostGuide
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

    def _resolve_guide_user_id(self, catalog_guide_id: int | None) -> int | None:
        """Map a catalog guide id (frontend ``guideId``) to a backend user id.

        The frontend sends the catalog profile id from the ``guides`` table, not
        the ``users`` id.  ``host_guides`` links them, so resolve through that
        table and verify the linked account is an active guide.
        """
        if catalog_guide_id is None:
            return None
        link = (
            self.db.query(HostGuide)
            .filter(HostGuide.guide_id == catalog_guide_id, HostGuide.status == "active")
            .first()
        )
        if link and link.guide_user_id:
            guide = self.db.query(User).filter(User.id == link.guide_user_id, User.role == GUIDE, User.is_active.is_(True)).first()
            if guide:
                return guide.id
        # Fallback: direct user id lookup (legacy / direct account id).
        guide = (
            self.db.query(User)
            .filter(User.id == catalog_guide_id, User.role == GUIDE, User.is_active.is_(True))
            .first()
        )
        if guide:
            return guide.id
        return None

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
        # Honor the guide/host the traveler selected when it maps to an active
        # guide account; otherwise fall back to the default bookable guide.
        guide_id = self._resolve_guide_user_id(booking_in.guide_id)
        if guide_id is None:
            guide = self.get_booking_guide()
        else:
            guide = self.db.query(User).filter(User.id == guide_id).first()
        availability = self.availability_for_date(booking_in.date.date().isoformat())
        if not availability["available"]:
            raise HTTPException(
                status_code=409,
                detail=f"The guide is already {availability['status']} on this date. Please choose another date.",
            )
        db_booking = Booking(
            user_id=user_id,
            guide_user_id=guide.id,
            **booking_in.model_dump(exclude={"guide_id"}),
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
