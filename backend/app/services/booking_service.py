from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.booking import Booking, BookingStatus
from app.models.host_guide import HostGuide, HostExperienceGuide
from app.models.guide_listing import GuideListing, GuideProfile
from app.models.guide_daily_capacity import GuideDailyCapacity
from app.models.guide import Guide
from app.models.user import User
from app.core.roles import GUIDE
from fastapi import HTTPException
from app.schemas.booking import BookingCreate
from typing import List, Optional
from datetime import datetime, timedelta, timezone

from app.api.v1.public import resolve_experience_reference


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

    # ------------------------------------------------------------------
    # Daily recurring capacity management
    # ------------------------------------------------------------------

    def reset_daily_capacity(self, guide_user_id: Optional[int] = None) -> int:
        """Reset booked_capacity to 0 for all active capacity rows at the start
        of a new day.  Optionally scoped to a single guide.

        Called once per 24-hour cycle (cron / APScheduler) so booking slots
        refresh automatically every day.
        """
        now = datetime.now(timezone.utc)
        query = self.db.query(GuideDailyCapacity).filter(GuideDailyCapacity.is_active.is_(True))
        if guide_user_id is not None:
            query = query.filter(GuideDailyCapacity.guide_user_id == guide_user_id)
        rows = query.all()
        reset_count = 0
        for row in rows:
            row.booked_capacity = 0
            row.reset_at = now
            reset_count += 1
        if reset_count:
            self.db.commit()
        return reset_count

    def ensure_daily_capacity_row(
        self, guide_user_id: int, booking_date: datetime, max_capacity: int
    ) -> GuideDailyCapacity:
        """Get-or-create the capacity row for (guide, date).  Used when a
        traveller books in advance for a future day that has no row yet."""
        # Normalize to start of day in UTC
        day_start = booking_date.astimezone(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        row = (
            self.db.query(GuideDailyCapacity)
            .filter(
                GuideDailyCapacity.guide_user_id == guide_user_id,
                GuideDailyCapacity.booking_date == day_start,
            )
            .with_for_update()
            .first()
        )
        if row is None:
            row = GuideDailyCapacity(
                guide_user_id=guide_user_id,
                booking_date=day_start,
                max_capacity=max_capacity,
                booked_capacity=0,
                is_active=True,
                reset_at=None,
            )
            self.db.add(row)
            self.db.flush()
        return row

    def get_daily_availability(self, guide_user_id: int, booking_date: datetime) -> dict:
        """Return remaining slots for a guide on a given date."""
        day_start = booking_date.astimezone(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        row = (
            self.db.query(GuideDailyCapacity)
            .filter(
                GuideDailyCapacity.guide_user_id == guide_user_id,
                GuideDailyCapacity.booking_date == day_start,
                GuideDailyCapacity.is_active.is_(True),
            )
            .first()
        )
        if row is None:
            # No capacity row yet — fall back to the listing's max_guests as full availability
            listing = (
                self.db.query(GuideListing)
                .filter(GuideListing.guide_user_id == guide_user_id, GuideListing.is_active.is_(True))
                .first()
            )
            max_cap = int(listing.max_guests or 10) if listing else 10
            return {"available": True, "remaining": max_cap, "max_capacity": max_cap, "booked_capacity": 0}
        remaining = max(int(row.max_capacity or 0) - int(row.booked_capacity or 0), 0)
        return {
            "available": remaining > 0,
            "remaining": remaining,
            "max_capacity": int(row.max_capacity or 0),
            "booked_capacity": int(row.booked_capacity or 0),
        }

    def _guide_listing_for(self, experience_id: int | None) -> Optional[GuideListing]:
        """Return the published guide listing behind a public experience id.

        Traveller-facing ids are offset (``200000 + listing id``), so they are
        resolved through the same helper the request queue uses.
        """
        from app.api.v1.public import resolve_experience_reference

        resolved = resolve_experience_reference(self.db, experience_id)
        if not resolved or resolved.get("source") != "guide_listing":
            return None
        return self.db.get(GuideListing, resolved["record_id"])
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

    def prevent_self_hosted_booking(self, user_id: int, booking_in: BookingCreate) -> None:
        """Reject a booking when the current user hosts the experience they are
        trying to book.

        Guides are permitted to book experiences led by *other* guides, but an
        experience's host may never book their own experience.  This is enforced
        regardless of which ``guide_id`` the traveler selected on the form.
        """
        experience_id = booking_in.experience_id

        resolved = resolve_experience_reference(self.db, experience_id)
        if not resolved:
            return  # Unknown experience — let other validators handle it.

        source = resolved.get("source")
        record_id = resolved.get("record_id")

        if source == "guide_listing" and record_id is not None:
            listing = self.db.get(GuideListing, record_id)
            if listing and listing.guide_user_id == user_id:
                raise HTTPException(
                    status_code=400,
                    detail="You cannot book an experience that you are hosting.",
                )
        elif source == "host_experience" and record_id is not None:
            experience = self.db.get(HostExperience, record_id)
            if experience and experience.host_id == user_id:
                raise HTTPException(
                    status_code=400,
                    detail="You cannot book an experience that you are hosting.",
                )
        # ``source == "mock"`` has no persistent host record; skip the check.

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

        # Check listing-level status (open/closed/paused) first
        listing = self._guide_listing_for_date(date, guide_user_id)
        if listing is not None:
            status = listing.availability_status
            if status != "open":
                return {"available": False, "status": status}

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

        # Check recharge period
        next_available = self._get_next_available_date(listing, date, guide_user_id)
        if next_available and date < next_available:
            return {"available": False, "status": "recharging"}

        status = "booked" if active.status == BookingStatus.accepted else "reserved"
        return {"available": False, "status": status}

    def _guide_listing_for_date(self, date: str, guide_user_id: int) -> Optional[GuideListing]:
        """Return a listing that covers the given date if the guide has one."""
        from app.api.v1.public import resolve_experience_reference

        # Find bookings for this guide on or near this date
        rows = (
            self.db.query(Booking)
            .filter(
                Booking.guide_user_id == guide_user_id,
                Booking.status.in_([BookingStatus.upcoming, BookingStatus.accepted]),
            )
            .all()
        )
        for booking in rows:
            booking_date = booking.date.date()
            if hasattr(booking_date, "strftime"):
                if booking_date.strftime("%Y-%m-%d") == date[:10]:
                    # This booking is on the requested date; check if there's a listing
                    listing = self._guide_listing_for(booking.experience_id)
                    if listing is not None:
                        return listing
        return None

    def _get_next_available_date(self, listing: Optional[GuideListing], date: str, guide_user_id: int) -> Optional[str]:
        """Get the next available date after recharge period."""
        if listing is None:
            return None

        # First check if there's a booking on the same date (availability_for_date
        # already handles this), then check recharge period
        if int(listing.recharge_days or 0) > 0:
            booking_date = datetime.strptime(date, "%Y-%m-%d").date()
            next_available = booking_date + timedelta(days=int(listing.recharge_days or 0))
            return next_available.isoformat()
        return None

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

    def _guide_listing_for(self, experience_id: int | None) -> Optional[GuideListing]:
        """Return the published guide listing behind a public experience id.

        Traveller-facing ids are offset (``200000 + listing id``), so they are
        resolved through the same helper the request queue uses.
        """
        from app.api.v1.public import resolve_experience_reference

        resolved = resolve_experience_reference(self.db, experience_id)
        if not resolved or resolved.get("source") != "guide_listing":
            return None
        return self.db.get(GuideListing, resolved["record_id"])

    @staticmethod
    def _slots_left(listing: GuideListing) -> int:
        return max(int(listing.max_guests or 0) - int(listing.booked_guests or 0), 0)

    @staticmethod
    def _is_below_stock_threshold(listing: GuideListing) -> bool:
        """Return True when remaining seats are at/below the configured threshold."""
        threshold = int(listing.capacity_threshold or 3)
        remaining = BookingService._slots_left(listing)
        return remaining <= threshold

    def create_booking(self, user_id: int, booking_in: BookingCreate) -> Booking:
        # Honor the guide/host the traveler selected when it maps to an active
        # guide account; otherwise fall back to the default bookable guide.
        guide_id = self._resolve_guide_user_id(booking_in.guide_id)
        # A guide cannot book themselves as the guide for an experience.
        if guide_id is not None and int(guide_id) == int(user_id):
            raise HTTPException(
                status_code=400,
                detail="You cannot book yourself as the guide for an experience.",
            )
        if guide_id is None:
            guide = self.get_booking_guide()
        else:
            guide = self.db.query(User).filter(User.id == guide_id).first()

        # --- Daily recurring capacity: lock the capacity row for the date ---
        booking_date = booking_in.date
        if hasattr(booking_date, "date"):
            booking_date = booking_date.date()
        day_start = datetime(
            booking_date.year, booking_date.month, booking_date.day,
            tzinfo=timezone.utc,
        )

        listing = self._guide_listing_for(booking_in.experience_id)
        max_cap = int(listing.max_guests or 10) if listing else 10

        row = self.ensure_daily_capacity_row(guide.id, day_start, max_cap)

        guests = int(booking_in.guests or 0)
        if int(row.booked_capacity or 0) + guests > int(row.max_capacity or 0):
            remaining = max(int(row.max_capacity or 0) - int(row.booked_capacity or 0), 0)
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Only {remaining} slot{'s' if remaining != 1 else ''} left for this date."
                ),
            )

        # Hold the slots atomically in the same transaction as the booking insert.
        row.booked_capacity = int(row.booked_capacity or 0) + guests

        # Also keep the legacy listing counter in sync for any code paths that
        # still read GuideListing.booked_guests.
        if listing is not None:
            listing.booked_guests = int(listing.booked_guests or 0) + guests
            # Honor recharge period: after the booking date, block availability
            # for the configured number of days so the guide has time to recover.
            if int(listing.recharge_days or 0) > 0:
                next_available = booking_date + timedelta(days=int(listing.recharge_days or 0))
                now_date = datetime.now(timezone.utc).date()
                if next_available > now_date:
                    listing.next_available_date = datetime(
                        next_available.year, next_available.month, next_available.day,
                        tzinfo=timezone.utc,
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
            # Cancelling releases the capacity the booking held on a guide listing.
            if booking.status in (BookingStatus.upcoming, BookingStatus.accepted):
                listing = self._guide_listing_for(booking.experience_id)
                if listing is not None:
                    listing.booked_guests = max(
                        int(listing.booked_guests or 0) - int(booking.guests or 0), 0
                    )
                # Release daily capacity row slots
                booking_date = booking.date
                if hasattr(booking_date, "date"):
                    booking_date = booking_date.date()
                day_start = datetime(
                    booking_date.year, booking_date.month, booking_date.day,
                    tzinfo=timezone.utc,
                )
                row = (
                    self.db.query(GuideDailyCapacity)
                    .filter(
                        GuideDailyCapacity.guide_user_id == booking.guide_user_id,
                        GuideDailyCapacity.booking_date == day_start,
                        GuideDailyCapacity.is_active.is_(True),
                    )
                    .with_for_update()
                    .first()
                )
                if row is not None:
                    row.booked_capacity = max(
                        int(row.booked_capacity or 0) - int(booking.guests or 0), 0
                    )
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
