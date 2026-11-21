from calendar import monthrange
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.v1.public import GUIDE_LISTING_ID_OFFSET, resolve_experience_reference
from app.core.roles import GUIDE
from app.models.booking import Booking, BookingStatus, HostExperience
from app.models.guide import Guide
from app.models.guide_daily_capacity import GuideDailyCapacity
from app.models.guide_listing import GuideListing, GuideProfile
from app.models.host_guide import HostGuide
from app.models.user import User
from app.schemas.booking import BookingCreate
from app.services.guide_availability_service import (
    ACTIVE_BOOKING_STATUSES,
    GuideAvailabilityService,
    as_date,
)


class BookingService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_bookings(self, user_id: int) -> list[Booking]:
        return self.db.query(Booking).filter(Booking.user_id == user_id).all()

    def get_booking_guide(self) -> User:
        guide = (
            self.db.query(User)
            .filter(
                User.email == "guide@guides-nepal.com",
                User.role == GUIDE,
                User.is_active.is_(True),
            )
            .first()
        )
        if not guide:
            raise HTTPException(
                status_code=503, detail="The booking guide is unavailable"
            )
        return guide

    # ------------------------------------------------------------------
    # Daily recurring capacity management
    # ------------------------------------------------------------------

    def reset_daily_capacity(self, guide_user_id: int | None = None) -> int:
        """Refresh the rolling day counter without ever reopening a booked day.

        Only rows for today or earlier are considered, and a row is skipped
        when its day still holds an active booking — zeroing it would let more
        guests book a day that is already taken. Future rows always keep their
        advance bookings. Optionally scoped to one guide.
        """
        now = datetime.now(UTC)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        query = self.db.query(GuideDailyCapacity).filter(
            GuideDailyCapacity.is_active.is_(True),
            GuideDailyCapacity.booking_date <= today_start,
        )
        if guide_user_id is not None:
            query = query.filter(GuideDailyCapacity.guide_user_id == guide_user_id)
        rows = query.all()
        if not rows:
            return 0

        booking_query = self.db.query(
            Booking.guide_user_id, func.date(Booking.date)
        ).filter(
            Booking.status.in_(ACTIVE_BOOKING_STATUSES),
            func.date(Booking.date) <= today_start.date().isoformat(),
        )
        if guide_user_id is not None:
            booking_query = booking_query.filter(Booking.guide_user_id == guide_user_id)
        booked_days = {(int(uid), str(day)) for uid, day in booking_query.all()}

        reset_count = 0
        for row in rows:
            if (
                int(row.guide_user_id),
                row.booking_date.date().isoformat(),
            ) in booked_days:
                continue
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
        day_start = booking_date.astimezone(UTC).replace(
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
            # Seed the row with guests already booked that day.  Bookings made
            # before this per-day table existed never held a row, and without
            # this the first new booking would ignore them.
            already_booked = (
                self.db.query(func.coalesce(func.sum(Booking.guests), 0))
                .filter(
                    Booking.guide_user_id == guide_user_id,
                    func.date(Booking.date) == day_start.date().isoformat(),
                    Booking.status.in_(
                        [BookingStatus.upcoming, BookingStatus.accepted]
                    ),
                )
                .scalar()
            )
            row = GuideDailyCapacity(
                guide_user_id=guide_user_id,
                booking_date=day_start,
                max_capacity=max_capacity,
                booked_capacity=int(already_booked or 0),
                is_active=True,
                reset_at=None,
            )
            self.db.add(row)
            self.db.flush()
        return row

    def daily_availability(self, date: str, guide_id: int | None = None) -> dict:
        """Remaining slots for one date, from that date's capacity row.

        This is the same row ``create_booking`` checks, so the numbers agree.
        Until the day has a row (i.e. before its first booking) ``remaining``
        and ``max_capacity`` are ``None`` rather than an invented estimate.
        """
        guide_user_id = self._resolve_availability_guide(guide_id)
        if guide_user_id is None:
            return {
                "available": False,
                "remaining": 0,
                "max_capacity": None,
                "booked_capacity": 0,
            }

        entry = GuideAvailabilityService(self.db).day_entry(
            guide_user_id, as_date(date)
        )
        return {
            "available": entry["status"] == "available",
            "remaining": 0 if entry["status"] == "unavailable" else entry["remaining"],
            "max_capacity": entry["capacity"],
            "booked_capacity": entry["guests"],
        }

    # ------------------------------------------------------------------
    # Date-first booking search
    # ------------------------------------------------------------------

    def available_guides(
        self, day: str, exclude_user_id: int | None = None
    ) -> list[dict]:
        """Guides who opened ``day``, still have room, and list a bookable experience.

        This is step 2 of the date-first flow: the date is chosen before the
        guide, so availability is read once for every guide instead of probing
        one at a time.  ``spots_left`` comes from the same capacity row
        :meth:`create_booking` checks; a guide without a row that day has room
        but no number yet, so ``spots_left`` is ``None`` rather than invented.
        """
        try:
            day_date = as_date(day)
        except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, detail="Dates must be ISO dates (YYYY-MM-DD)."
            )
        if day_date < datetime.now(UTC).date():
            raise HTTPException(
                status_code=422, detail="Past dates cannot be searched."
            )

        open_ids = GuideAvailabilityService(self.db).open_guide_ids(
            day_date, exclude_user_id=exclude_user_id
        )
        if not open_ids:
            return []

        day_start = datetime(day_date.year, day_date.month, day_date.day, tzinfo=UTC)
        capacity = {
            int(row.guide_user_id): row
            for row in self.db.query(GuideDailyCapacity)
            .filter(
                GuideDailyCapacity.guide_user_id.in_(open_ids),
                GuideDailyCapacity.booking_date == day_start,
                GuideDailyCapacity.is_active.is_(True),
            )
            .all()
        }

        # A guide is only available while the day's row still has room; a guide
        # whose row is full drops out of the list entirely.
        room: dict[int, int | None] = {}
        for guide_user_id in open_ids:
            row = capacity.get(guide_user_id)
            if row is None:
                room[guide_user_id] = None
                continue
            remaining = max(
                int(row.max_capacity or 0) - int(row.booked_capacity or 0), 0
            )
            if remaining > 0:
                room[guide_user_id] = remaining
        if not room:
            return []

        accounts = {
            int(account.id): account
            for account in self.db.query(User)
            .filter(User.id.in_(room), User.role == GUIDE, User.is_active.is_(True))
            .all()
        }
        if not accounts:
            return []

        links = {
            int(link.guide_user_id): int(link.guide_id)
            for link in self.db.query(HostGuide)
            .filter(
                HostGuide.guide_user_id.in_(accounts),
                HostGuide.guide_id.isnot(None),
                HostGuide.status == "active",
            )
            .all()
        }
        profiles = {
            int(profile.id): profile
            for profile in self.db.query(Guide)
            .filter(Guide.id.in_(links.values()), Guide.is_active.is_(True))
            .all()
        }

        listings = (
            self.db.query(GuideListing)
            .filter(
                GuideListing.guide_user_id.in_(accounts),
                GuideListing.is_active.is_(True),
                GuideListing.availability_status == "open",
            )
            .order_by(GuideListing.price.asc())
            .all()
        )

        cards = []
        for guide_user_id, account in accounts.items():
            guide_listings = [
                listing
                for listing in listings
                if int(listing.guide_user_id) == guide_user_id
            ]
            if not guide_listings:
                continue

            profile = profiles.get(links.get(guide_user_id))
            account_name = f"{account.firstName or ''} {account.lastName or ''}".strip()
            cities = list(profile.cities or []) if profile else []
            cards.append(
                {
                    # Catalog id is what the booking form sends; without a
                    # catalog profile the guide's account id is used instead.
                    "guide_id": int(profile.id) if profile else guide_user_id,
                    "name": (profile.name if profile and profile.name else account_name)
                    or account.email,
                    "image": (
                        profile.image
                        if profile and profile.image
                        else account.avatar_url
                    )
                    or "/images/placeholder.svg",
                    "role": profile.role if profile else "Experience Guide",
                    "rating": float(profile.rating or 0) if profile else 0.0,
                    "reviews": int(profile.reviews or 0) if profile else 0,
                    "verified": bool(profile.verified) if profile else False,
                    "cities": cities
                    or sorted(
                        {listing.city for listing in guide_listings if listing.city}
                    ),
                    "languages": list(profile.languages or []) if profile else [],
                    "spots_left": room[guide_user_id],
                    "listings": [
                        self._listing_card(listing) for listing in guide_listings
                    ],
                }
            )

        cards.sort(key=lambda card: (-card["rating"], -card["reviews"], card["name"]))
        return cards

    @staticmethod
    def _listing_card(listing: GuideListing) -> dict:
        """The bookable parts of one guide listing, as the search list shows them."""
        return {
            "id": GUIDE_LISTING_ID_OFFSET + int(listing.id),
            "title": listing.title,
            "city": listing.city,
            "category": listing.category,
            "price": float(listing.price or 0.0),
            "duration": listing.duration,
            "max_guests": int(listing.max_guests or 0),
        }

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
            .filter(
                HostGuide.guide_id == catalog_guide_id, HostGuide.status == "active"
            )
            .first()
        )
        if link and link.guide_user_id:
            guide = (
                self.db.query(User)
                .filter(
                    User.id == link.guide_user_id,
                    User.role == GUIDE,
                    User.is_active.is_(True),
                )
                .first()
            )
            if guide:
                return guide.id
        # Fallback: direct user id lookup (legacy / direct account id).
        guide = (
            self.db.query(User)
            .filter(
                User.id == catalog_guide_id,
                User.role == GUIDE,
                User.is_active.is_(True),
            )
            .first()
        )
        if guide:
            return guide.id
        return None

    def prevent_self_hosted_booking(
        self, user_id: int, booking_in: BookingCreate
    ) -> None:
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

    def _get_guide_portfolio(self, guide_user_id: int) -> dict | None:
        """Build guide portfolio from guide catalog profile and listings."""
        # Get the guide catalog profile (guides table)
        link = (
            self.db.query(HostGuide)
            .filter(
                HostGuide.guide_user_id == guide_user_id, HostGuide.status == "active"
            )
            .first()
        )
        if not link or not link.guide_id:
            return None

        catalog_guide = (
            self.db.query(Guide)
            .filter(Guide.id == link.guide_id, Guide.is_active.is_(True))
            .first()
        )
        if not catalog_guide:
            return None

        # Get guide profile
        profile = (
            self.db.query(GuideProfile)
            .filter(GuideProfile.guide_user_id == guide_user_id)
            .first()
        )

        # Count listings
        listings_count = (
            self.db.query(GuideListing)
            .filter(
                GuideListing.guide_user_id == guide_user_id,
                GuideListing.is_active.is_(True),
            )
            .count()
        )

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

    def _resolve_availability_guide(self, guide_id: int | None) -> int | None:
        """Resolve the guide account a booking for this guide would land on.

        Traveller pages send the *catalog* guide id.  When it does not map to an
        active guide account the booking falls back to the default bookable
        guide, so availability has to fall back to that same account or the
        calendar and the booking would disagree.
        """
        if guide_id is not None:
            resolved = self._resolve_guide_user_id(guide_id)
            if resolved is not None:
                return resolved
        try:
            return self.get_booking_guide().id
        except HTTPException:
            return None

    def month_detail(self, year: int, month: int, guide_id: int | None = None) -> dict:
        """Per-date capacity for a month, read with a single query.

        Only dates that already have a ``guide_daily_capacity`` row are
        returned: those rows are exactly what bookings are checked against. A
        date with no row has no bookings yet, so it is omitted instead of
        showing an estimated spot count.
        """
        guide_user_id = self._resolve_availability_guide(guide_id)
        if guide_user_id is None:
            return {}

        last_day = monthrange(year, month)[1]
        rows = (
            self.db.query(GuideDailyCapacity)
            .filter(
                GuideDailyCapacity.guide_user_id == guide_user_id,
                GuideDailyCapacity.booking_date >= datetime(year, month, 1, tzinfo=UTC),
                GuideDailyCapacity.booking_date
                <= datetime(year, month, last_day, tzinfo=UTC),
                GuideDailyCapacity.is_active.is_(True),
            )
            .all()
        )

        detail: dict[str, dict] = {}
        for row in rows:
            capacity = int(row.max_capacity or 0)
            booked = int(row.booked_capacity or 0)
            detail[row.booking_date.strftime("%Y-%m-%d")] = {
                "remaining": max(capacity - booked, 0),
                "max_capacity": capacity,
            }
        return detail

    def availability_for_date(self, date: str, guide_id: int | None = None) -> dict:
        """Whether a traveller may book this guide on this date.

        A date is bookable only when the guide opened it from the dashboard
        calendar and capacity remains; every other date is closed by default.
        """
        guide_user_id = self._resolve_availability_guide(guide_id)
        if guide_user_id is None:
            return {"available": False, "status": "unavailable"}

        entry = GuideAvailabilityService(self.db).day_entry(
            guide_user_id, as_date(date)
        )
        if entry["status"] == "available":
            return {
                "available": True,
                "status": "free",
                "remaining": entry["remaining"],
            }
        return {"available": False, "status": entry["status"], "remaining": 0}

    def unavailable_dates(
        self, year: int, month: int, guide_id: int | None = None
    ) -> list[str]:
        """Dates a traveller must not be able to pick in the given month.

        Availability is opt-in, so this is every date the guide has not opened
        (plus opened dates that are now full), computed from one calendar read.
        """
        guide_user_id = self._resolve_availability_guide(guide_id)
        if guide_user_id is None:
            _, days_in_month = monthrange(year, month)
            return [
                f"{year:04d}-{month:02d}-{day:02d}"
                for day in range(1, days_in_month + 1)
            ]

        entries = GuideAvailabilityService(self.db).month_days(
            guide_user_id, year, month
        )
        return [entry["date"] for entry in entries if entry["status"] != "available"]

    def _guide_listing_for(self, experience_id: int | None) -> GuideListing | None:
        """Return the published guide listing behind a public experience id.

        Traveller-facing ids are offset (``200000 + listing id``), so they are
        resolved through the same helper the request queue uses.
        """
        resolved = resolve_experience_reference(self.db, experience_id)
        if not resolved or resolved.get("source") != "guide_listing":
            return None
        return self.db.get(GuideListing, resolved["record_id"])

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
            booking_date.year,
            booking_date.month,
            booking_date.day,
            tzinfo=UTC,
        )

        # Availability is opt-in: the guide must have opened this date.
        today = datetime.now(UTC).date()
        if booking_date < today:
            raise HTTPException(status_code=422, detail="Past dates cannot be booked.")
        availability = GuideAvailabilityService(self.db).day_entry(
            guide.id, booking_date
        )
        if availability["status"] != "available":
            if availability["status"] == "booked":
                raise HTTPException(
                    status_code=409,
                    detail="That date is fully booked. Please pick another available date.",
                )
            raise HTTPException(
                status_code=409,
                detail=(
                    f"{guide.firstName or 'This guide'} is not available on "
                    f"{booking_date.isoformat()}. Please choose one of the dates "
                    "the guide has marked as available."
                ),
            )

        listing = self._guide_listing_for(booking_in.experience_id)
        max_cap = int(listing.max_guests or 10) if listing else 10

        row = self.ensure_daily_capacity_row(guide.id, day_start, max_cap)

        guests = int(booking_in.guests or 0)
        if int(row.booked_capacity or 0) + guests > int(row.max_capacity or 0):
            remaining = max(
                int(row.max_capacity or 0) - int(row.booked_capacity or 0), 0
            )
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
                next_available = booking_date + timedelta(
                    days=int(listing.recharge_days or 0)
                )
                now_date = datetime.now(UTC).date()
                if next_available > now_date:
                    listing.next_available_date = datetime(
                        next_available.year,
                        next_available.month,
                        next_available.day,
                        tzinfo=UTC,
                    )

        db_booking = Booking(
            user_id=user_id,
            guide_user_id=guide.id,
            **booking_in.model_dump(exclude={"guide_id"}),
        )
        self.db.add(db_booking)
        self.db.commit()
        self.db.refresh(db_booking)
        self.notify_booking_created(db_booking, guide)
        return db_booking

    def release_capacity(self, booking: Booking) -> None:
        """Return the slots a cancelled or declined booking held.

        Called only when a booking stops being active, so a trip the guide
        accepts and later completes keeps its slots.
        """
        listing = self._guide_listing_for(booking.experience_id)
        if listing is not None:
            listing.booked_guests = max(
                int(listing.booked_guests or 0) - int(booking.guests or 0), 0
            )

        booking_date = booking.date
        if hasattr(booking_date, "date"):
            booking_date = booking_date.date()
        day_start = datetime(
            booking_date.year,
            booking_date.month,
            booking_date.day,
            tzinfo=UTC,
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

    def cancel_booking(self, user_id: int, booking_id: int) -> Booking | None:
        booking = (
            self.db.query(Booking)
            .filter(Booking.id == booking_id, Booking.user_id == user_id)
            .first()
        )
        if booking:
            if booking.status in (BookingStatus.upcoming, BookingStatus.accepted):
                self.release_capacity(booking)
            booking.status = BookingStatus.cancelled  # type: ignore
            self.db.commit()
            self.db.refresh(booking)
            self.notify_booking_cancelled(booking)
        return booking

    def decide_booking(
        self, guide_user_id: int, booking_id: int, status: str
    ) -> Booking:
        """Accept, decline or complete a booking assigned to this guide.

        Declining and cancelling release the day's slots, exactly like a
        traveller cancellation; accepting and completing keep them.
        """
        if status not in {"accepted", "rejected", "completed", "cancelled"}:
            raise HTTPException(
                status_code=422,
                detail="Status must be accepted, rejected, completed or cancelled",
            )
        booking = (
            self.db.query(Booking)
            .filter(Booking.id == booking_id, Booking.guide_user_id == guide_user_id)
            .first()
        )
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        if status in {"rejected", "cancelled"} and booking.status in (
            BookingStatus.upcoming,
            BookingStatus.accepted,
        ):
            self.release_capacity(booking)

        booking.status = BookingStatus(status)  # type: ignore[assignment]
        self.db.commit()
        self.db.refresh(booking)
        # Notify the traveller so their bookings page reflects the decision.
        self.notify_booking_decision(booking, status)
        return booking

    def archive_booking(self, user_id: int, booking_id: int) -> Booking | None:
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

    # ------------------------------------------------------------------
    # Booking notifications
    # ------------------------------------------------------------------

    @staticmethod
    def _display_name(user: User | None) -> str:
        if user is None:
            return "A traveller"
        name = f"{user.firstName or ''} {user.lastName or ''}".strip()
        return name or user.email

    @staticmethod
    def _booking_day(booking: Booking) -> str:
        return (
            booking.date.strftime("%d %b %Y")
            if hasattr(booking.date, "strftime")
            else str(booking.date)[:10]
        )

    def _queue_notification(
        self, user_id: int, notification_type: str, title: str, body: str, data: dict
    ) -> None:
        """Persist one notification; failures never break the booking itself."""
        import json

        from app.models.message import Notification

        self.db.add(
            Notification(
                user_id=user_id,
                type=notification_type,
                title=title,
                body=body,
                data=json.dumps(data),
                is_read=False,
            )
        )

    def notify_booking_created(
        self, booking: Booking, guide: User | None = None
    ) -> None:
        """Tell the guide a request arrived and confirm the request to the traveller."""
        try:
            traveler = self.db.get(User, booking.user_id)
            guide = guide or (
                self.db.get(User, booking.guide_user_id)
                if booking.guide_user_id
                else None
            )
            when = self._booking_day(booking)
            if guide is not None:
                self._queue_notification(
                    guide.id,
                    "booking_created",
                    "New booking request",
                    f"{self._display_name(traveler)} booked {booking.experience_title} "
                    f"on {when} for {booking.guests} guest(s).",
                    {
                        "booking_id": booking.id,
                        "date": when,
                        "experience_id": booking.experience_id,
                        "date_iso": str(booking.date)[:10],
                    },
                )
            self._queue_notification(
                booking.user_id,
                "booking_created",
                "Booking requested",
                f"Your booking for {booking.experience_title} on {when} is awaiting guide confirmation.",
                {"booking_id": booking.id, "guide_user_id": booking.guide_user_id},
            )
            self.db.commit()
        except Exception:  # noqa: BLE001 - best-effort notifications
            self.db.rollback()

    def notify_booking_decision(self, booking: Booking, status: str) -> None:
        """Tell the traveller when their guide accepts, declines or completes a trip."""
        try:
            verb = {
                "accepted": "accepted",
                "rejected": "declined",
                "completed": "marked as completed",
                "cancelled": "cancelled",
            }.get(status, "updated")
            self._queue_notification(
                booking.user_id,
                "booking_decision",
                f"Booking {verb}",
                f"Your guide {verb} the booking for {booking.experience_title} "
                f"on {self._booking_day(booking)}.",
                {"booking_id": booking.id, "status": status},
            )
            self.db.commit()
        except Exception:  # noqa: BLE001 - best-effort notifications
            self.db.rollback()

    def notify_booking_cancelled(self, booking: Booking) -> None:
        """Tell the guide a traveller released the date so they can re-open it."""
        try:
            if booking.guide_user_id:
                traveler = self.db.get(User, booking.user_id)
                self._queue_notification(
                    booking.guide_user_id,
                    "booking_cancelled",
                    "Booking cancelled",
                    f"{self._display_name(traveler)} cancelled {booking.experience_title} "
                    f"on {self._booking_day(booking)}. The date now has free capacity.",
                    {"booking_id": booking.id, "date_iso": str(booking.date)[:10]},
                )
                self.db.commit()
        except Exception:  # noqa: BLE001 - best-effort notifications
            self.db.rollback()
