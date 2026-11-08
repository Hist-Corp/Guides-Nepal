from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.booking import Booking, BookingStatus
from app.models.host_guide import HostGuide, HostExperienceGuide
from app.models.guide_listing import GuideListing, GuideProfile
from app.models.guide import Guide
from app.models.user import User
from app.core.roles import GUIDE
from fastapi import HTTPException
from app.schemas.booking import BookingCreate
from typing import List, Optional
from datetime import datetime


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

    def _get_guide_portfolio(self, guide_user_id: int) -> Optional[dict]:
        """Build guide portfolio from guide catalog profile and listings."""
        # Get the guide catalog profile (guides table)
        link = self.db.query(HostGuide).filter(HostGuide.guide_user_id == guide_user_id, HostGuide.status == "active").first()
        if not link or not link.guide_id:
            return None
        
        catalog_guide = self.db.query(Guide).filter(Guide.id == link.guide_id, Guide.is_active.is_(True)).first()
        if not catalog_guide:
            return None
        
        # Get guide profile
        profile = self.db.query(GuideProfile).filter(GuideProfile.guide_user_id == guide_user_id).first()
        
        # Count listings
        listings_count = self.db.query(GuideListing).filter(GuideListing.guide_user_id == guide_user_id, GuideListing.is_active.is_(True)).count()
        
        return {
            "id": catalog_guide.id,
            "name": catalog_guide.name,
            "image": catalog_guide.image,
            "role": catalog_guide.role,
            "rating": catalog_guide.rating,
            "reviews": catalog_guide.reviews,
            "bio": catalog_guide.bio,
            "languages": catalog_guide.languages,
            "verified": catalog_guide.verified,
            "lives_in": catalog_guide.lives_in,
            "cities": catalog_guide.cities,
            "gallery": catalog_guide.gallery,
            "years_experience": profile.years_experience if profile else None,
            "expertise_areas": profile.expertise_areas if profile else [],
            "listings_count": listings_count,
        }

    def availability_for_date(self, date: str, guide_id: Optional[int] = None) -> dict:
        if guide_id is not None:
            guide_user_id = self._resolve_guide_user_id(guide_id)
            if guide_user_id is None:
                return {"available": True, "status": "free"}
        else:
            guide_user_id = self.get_booking_guide().id
        active = (
            self.db.query(Booking)
            .filter(
                Booking.guide_user_id == guide_user_id,
                func.date(Booking.date) == date,
                Booking.status.in_([BookingStatus.upcoming, BookingStatus.accepted]),
            )
            .first()
        )
        if not active:
            return {"available": True, "status": "free"}
        status = "booked" if active.status == BookingStatus.accepted else "reserved"
        return {"available": False, "status": status}

    def availability_for_month(self, year: int, month: int, guide_id: Optional[int] = None) -> list[str]:
        """Return list of unavailable date strings (YYYY-MM-DD) for the given month."""
        import calendar
        if guide_id is not None:
            guide_user_id = self._resolve_guide_user_id(guide_id)
            if guide_user_id is None:
                return []
        else:
            guide_user_id = self.get_booking_guide().id
        _, days_in_month = calendar.monthrange(year, month)
        start = f"{year:04d}-{month:02d}-01"
        end = f"{year:04d}-{month:02d}-{days_in_month:02d}"
        rows = (
            self.db.query(Booking)
            .filter(
                Booking.guide_user_id == guide_user_id,
                func.date(Booking.date) >= start,
                func.date(Booking.date) <= end,
                Booking.status.in_([BookingStatus.upcoming, BookingStatus.accepted]),
            )
            .all()
        )
        return [b.date.strftime("%Y-%m-%d") if hasattr(b.date, "strftime") else str(b.date)[:10] for b in rows]

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
