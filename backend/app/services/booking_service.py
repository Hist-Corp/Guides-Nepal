from calendar import monthrange
from datetime import UTC, date, datetime, timedelta

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
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


def _utc_midnight(day: date) -> datetime:
    """Midnight UTC of a calendar day, the form capacity rows are keyed by."""
    return datetime(day.year, day.month, day.day, tzinfo=UTC)


def _nights(first: date, checkout: date | None) -> list[date]:
    """Every night a stay keeps the guide: check-in up to (not including) check-out."""
    if checkout is None or checkout <= first:
        return [first]
    return [first + timedelta(days=offset) for offset in range((checkout - first).days)]


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

        booking_query = self.db.query(Booking.guide_user_id, Booking.date).filter(
            Booking.status.in_(ACTIVE_BOOKING_STATUSES),
            Booking.date <= today_start.date(),
        )
        if guide_user_id is not None:
            booking_query = booking_query.filter(Booking.guide_user_id == guide_user_id)
        booked_days = {(int(uid), day) for uid, day in booking_query.all()}

        reset_count = 0
        for row in rows:
            if (int(row.guide_user_id), row.booking_date.date()) in booked_days:
                continue
            row.booked_capacity = 0
            row.reset_at = now
            reset_count += 1
        if reset_count:
            self.db.commit()
        return reset_count

    def _claim_day(
        self, guide_user_id: int, night: date, fallback_limit: int
    ) -> GuideDailyCapacity:
        """Create, size and lock the guide-day row before deciding a booking.

        The lock is the serialization point that makes the slot check atomic:
        every booking for this guide and night waits here, so the guests read
        for the limit can never be a stale snapshot.  A no-op UPDATE is used
        instead of ``SELECT ... FOR UPDATE`` because SQLite ignores the latter
        and the race would stay open there; on Postgres the UPDATE takes the
        same row lock.

        The row's ``max_capacity`` is the guide's own offer for that day (the
        sum of the slots they opened), not the listing's guest limit, so every
        reader of the row agrees with what a booking will accept.
        """
        day_start = _utc_midnight(night)
        scope = (
            GuideDailyCapacity.guide_user_id == guide_user_id,
            GuideDailyCapacity.booking_date == day_start,
        )

        def lock() -> int:
            # A write is deliberately the first statement of the claim: SQLite
            # then takes its write lock here (a read that upgrades later can
            # fail immediately instead of waiting) and Postgres locks the row.
            return (
                self.db.query(GuideDailyCapacity)
                .filter(*scope)
                .update(
                    {"booked_capacity": GuideDailyCapacity.booked_capacity},
                    synchronize_session=False,
                )
            )

        if not lock():
            # Seed the row with guests already booked that day, so bookings made
            # before this per-day table existed are still counted.
            already_booked = sum(
                int(booking.guests or 0)
                for booking in self.db.query(Booking)
                .filter(
                    Booking.guide_user_id == guide_user_id,
                    Booking.date == night,
                    Booking.status.in_(
                        [BookingStatus.upcoming, BookingStatus.accepted]
                    ),
                )
                .all()
            )
            try:
                with self.db.begin_nested():
                    self.db.add(
                        GuideDailyCapacity(
                            guide_user_id=guide_user_id,
                            booking_date=day_start,
                            max_capacity=max(int(fallback_limit or 1), 1),
                            booked_capacity=already_booked,
                            is_active=True,
                            reset_at=None,
                        )
                    )
                    self.db.flush()
            except IntegrityError:  # a concurrent request created it first
                pass
            lock()

        row = (
            self.db.query(GuideDailyCapacity).filter(*scope).populate_existing().one()
        )
        capacity = GuideAvailabilityService(self.db).day_capacity(
            guide_user_id, night, int(fallback_limit or 1)
        )
        if int(row.max_capacity or 0) != capacity:
            row.max_capacity = capacity
        return row

    def _day_row(self, guide_user_id: int, night: date) -> GuideDailyCapacity:
        """The current guide-day row, re-read after its lock was taken."""
        return (
            self.db.query(GuideDailyCapacity)
            .filter(
                GuideDailyCapacity.guide_user_id == guide_user_id,
                GuideDailyCapacity.booking_date == _utc_midnight(night),
            )
            .populate_existing()
            .one()
        )

    def daily_availability(
        self, date: str, guide_id: int | None = None, experience_id: int | None = None
    ) -> dict:
        """Remaining slots for one date, from that date's capacity row.

        This is the same row ``create_booking`` checks, so the numbers agree.
        Until the day has a row (i.e. before its first booking) ``remaining``
        and ``max_capacity`` are ``None`` rather than an invented estimate.
        """
        guide_user_ids = self._resolve_availability_guides(guide_id)
        if not guide_user_ids:
            return {
                "available": False,
                "remaining": 0,
                "max_capacity": None,
                "booked_capacity": 0,
            }

        entry = GuideAvailabilityService(self.db).day_entry(
            guide_user_ids, as_date(date), experience_id
        )
        return {
            "available": entry["status"] == "available",
            "remaining": 0 if entry["status"] == "unavailable" else entry["remaining"],
            "max_capacity": entry["capacity"],
            "booked_capacity": entry["guests"],
            "price_per_person": entry["price_per_person"],
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
        one at a time.  Only listings the guide opened *that day* are returned,
        so the traveller can never pick an experience whose date is still
        closed.  ``spots_left`` comes from the same capacity row
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

        availability = GuideAvailabilityService(self.db)
        open_scopes = availability.open_guides(
            day_date, exclude_user_id=exclude_user_id
        )
        if not open_scopes:
            return []
        open_ids = list(open_scopes)

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
        # A listing can carry a forced recharge date on top of being open; the
        # date-first search must not offer it before that date either.
        listings = [
            listing
            for listing in listings
            if not self._listing_closed_reason(listing, day_date)
        ]

        cards = []
        for guide_user_id, account in accounts.items():
            # Only experiences the guide opened this day for are bookable, so a
            # guide whose openings are all for other experiences drops out.
            scope = open_scopes[guide_user_id]
            guide_listings = [
                listing
                for listing in listings
                if int(listing.guide_user_id) == guide_user_id
                and availability.opens(
                    scope, GUIDE_LISTING_ID_OFFSET + int(listing.id)
                )
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

    def _guide_user_ids(self, catalog_guide_id: int | None) -> list[int]:
        """Every active guide account behind a catalog guide id, newest link first.

        The frontend sends the catalog profile id from the ``guides`` table, not
        the ``users`` id, and ``host_guides`` links them.  One profile can be
        linked to more than one login account (a host re-creating the account, or
        two hosts managing the same guide), so all of them are returned instead
        of silently taking whichever row happened to come first: the openings a
        guide makes from one account must still reach travellers, and the other
        account's openings must not disappear.
        """
        if catalog_guide_id is None:
            return []
        links = (
            self.db.query(HostGuide.guide_user_id)
            .filter(
                HostGuide.guide_id == catalog_guide_id,
                HostGuide.status == "active",
                HostGuide.guide_user_id.isnot(None),
            )
            .order_by(HostGuide.id.desc())
            .all()
        )
        candidates: list[int] = []
        for (guide_user_id,) in links:
            if guide_user_id and int(guide_user_id) not in candidates:
                candidates.append(int(guide_user_id))
        if candidates:
            active = {
                int(guide.id)
                for guide in self.db.query(User)
                .filter(
                    User.id.in_(candidates),
                    User.role == GUIDE,
                    User.is_active.is_(True),
                )
                .all()
            }
            candidates = [guid for guid in candidates if guid in active]
        if candidates:
            return candidates
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
        return [int(guide.id)] if guide else []

    def available_guide_ids(
        self,
        experience_id: int,
        day: str,
        checkout: str | None = None,
        catalog_guide_ids: list[int] | None = None,
        exclude_user_id: int | None = None,
    ) -> list[int]:
        """Catalog guides whose calendar has every night of the stay open.

        Availability is opt-in and scoped per experience, so a guide is listed
        only when one of their linked accounts opened each night of the range
        for this experience and still has slots on it.  Anything else is what
        :meth:`create_booking` would reject, so "Who you'll meet" never offers a
        guide the reservation cannot use.
        """
        try:
            first = as_date(day)
            checkout_date = as_date(checkout) if checkout else None
        except (TypeError, ValueError):
            raise HTTPException(
                status_code=422, detail="Dates must be ISO dates (YYYY-MM-DD)."
            )
        nights = _nights(first, checkout_date)
        availability = GuideAvailabilityService(self.db)

        # A paused listing, or one inside its forced recharge window, is not
        # available at all: keeping it in "Who you'll meet" would offer a guide
        # the booking path then refuses.
        listing = self._guide_listing_for(int(experience_id))
        if listing is not None and self._listing_closed_reason(listing, first):
            return []

        available: list[int] = []
        for catalog_guide_id in catalog_guide_ids or []:
            accounts = [
                account_id
                for account_id in self._guide_user_ids(catalog_guide_id)
                if exclude_user_id is None
                or int(account_id) != int(exclude_user_id)
            ]
            opened_every_night = any(
                all(
                    availability.day_entry(account_id, night, experience_id)[
                        "status"
                    ]
                    == "available"
                    for night in nights
                )
                for account_id in accounts
            )
            if opened_every_night:
                available.append(int(catalog_guide_id))
        return available

    def _resolve_guide_user_id(self, catalog_guide_id: int | None) -> int | None:
        """The guide account a booking for this catalog profile lands on."""
        accounts = self._guide_user_ids(catalog_guide_id)
        return accounts[0] if accounts else None

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

    def _resolve_availability_guides(self, guide_id: int | None) -> list[int]:
        """Every account whose openings make up this guide's calendar.

        Traveller pages send the *catalog* guide id, and one profile can be
        linked to several login accounts, so the calendar is the union of them.
        When none of them is a usable guide account the booking falls back to the
        default bookable guide, so availability has to fall back too or the
        calendar and the booking would disagree.
        """
        if guide_id is not None:
            # A guide id that does not resolve is a closed calendar, not an
            # invitation to read the default guide's one.
            return self._guide_user_ids(guide_id)
        try:
            return [int(self.get_booking_guide().id)]
        except HTTPException:
            return []

    def month_detail(
        self,
        year: int,
        month: int,
        guide_id: int | None = None,
        experience_id: int | None = None,
    ) -> dict:
        """Per-date spots and date price for a month, read with one calendar pass.

        Only dates with a real capacity are returned (the guide's own slots for
        the date, or a capacity row), so the calendar never shows an invented
        spot count. ``price_per_person`` is the guide's price for the date when
        they set one, which is the amount the booking will be written with.
        """
        guide_user_ids = self._resolve_availability_guides(guide_id)
        if not guide_user_ids:
            return {}

        detail: dict[str, dict] = {}
        for entry in GuideAvailabilityService(self.db).month_days(
            guide_user_ids, year, month, experience_id
        ):
            if entry["capacity"] is None:
                continue
            detail[entry["date"]] = {
                "remaining": entry["remaining"],
                "max_capacity": entry["capacity"],
                "price_per_person": entry["price_per_person"],
            }
        return detail

    def availability_for_date(
        self, date: str, guide_id: int | None = None, experience_id: int | None = None
    ) -> dict:
        """Whether a traveller may book this guide on this date.

        A date is bookable only when the guide opened it from the dashboard
        calendar and capacity remains; every other date is closed by default.
        """
        guide_user_ids = self._resolve_availability_guides(guide_id)
        if not guide_user_ids:
            return {"available": False, "status": "unavailable"}

        entry = GuideAvailabilityService(self.db).day_entry(
            guide_user_ids, as_date(date), experience_id
        )
        if entry["status"] == "available":
            return {
                "available": True,
                "status": "free",
                "remaining": entry["remaining"],
                "price_per_person": entry["price_per_person"],
            }
        return {
            "available": False,
            "status": entry["status"],
            "remaining": 0,
            "price_per_person": entry["price_per_person"],
        }

    def unavailable_dates(
        self,
        year: int,
        month: int,
        guide_id: int | None = None,
        experience_id: int | None = None,
    ) -> list[str]:
        """Dates a traveller must not be able to pick in the given month.

        Availability is opt-in, so this is every date the guide has not opened
        (plus opened dates that are now full), computed from one calendar read.
        """
        guide_user_ids = self._resolve_availability_guides(guide_id)
        if not guide_user_ids:
            _, days_in_month = monthrange(year, month)
            return [
                f"{year:04d}-{month:02d}-{day:02d}"
                for day in range(1, days_in_month + 1)
            ]

        entries = GuideAvailabilityService(self.db).month_days(
            guide_user_ids, year, month, experience_id
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

    @staticmethod
    def _listing_closed_reason(
        listing: GuideListing, booking_date: date
    ) -> str | None:
        """Why the listing itself refuses this date, or ``None`` when open.

        Availability is opt-in per date, but a guide can also pause the whole
        listing or have a forced recharge break after a trip; neither clears
        the calendar, so every surface that offers (or accepts) this experience
        has to honour them too.
        """
        if (listing.availability_status or "open") != "open":
            return "This guide has paused bookings for this experience."
        reopen = listing.next_available_date
        if reopen is not None:
            reopen_day = reopen.date() if isinstance(reopen, datetime) else reopen
            if booking_date < reopen_day:
                return (
                    "This experience is not taking bookings until "
                    f"{reopen_day.isoformat()}."
                )
        return None

    def _ensure_listing_open(self, listing: GuideListing, booking_date: date) -> None:
        """Reject a booking the listing itself has switched off."""
        reason = self._listing_closed_reason(listing, booking_date)
        if reason:
            raise HTTPException(status_code=409, detail=reason)

    @staticmethod
    def _booking_nights(booking_in: BookingCreate) -> list[date]:
        """Every night the booking keeps the guide: check-in up to check-out.

        A one-day booking is a single night; a stay from the 26th to the 1st
        holds the 26th, 27th, 28th, 29th and 30th (the check-out day is not
        stayed in), and each of those nights has to be open.
        """
        return _nights(booking_in.date, booking_in.checkout)

    def create_booking(self, user_id: int, booking_in: BookingCreate) -> Booking:
        # The guide the traveller picked, or the owner of the experience they
        # picked.  There is deliberately no default account to fall back to:
        # silently booking someone else's calendar is how a reservation lands
        # on a guide the traveller never selected (or on a date that guide had
        # closed), so an unresolvable guide is a client error instead.
        if booking_in.guide_id is not None:
            account_ids = self._guide_user_ids(booking_in.guide_id)
            if not account_ids:
                raise HTTPException(
                    status_code=422,
                    detail="That guide is not available for this experience.",
                )
        else:
            owner = self._guide_listing_for(booking_in.experience_id)
            account_ids = (
                [int(owner.guide_user_id)]
                if owner is not None and owner.guide_user_id
                else []
            )
            if not account_ids:
                raise HTTPException(
                    status_code=422,
                    detail="Select a guide for this experience before booking.",
                )
        # A guide cannot book themselves as the guide for an experience.
        if any(int(account_id) == int(user_id) for account_id in account_ids):
            raise HTTPException(
                status_code=400,
                detail="You cannot book yourself as the guide for an experience.",
            )

        booking_date = booking_in.date
        nights = self._booking_nights(booking_in)

        # Availability is opt-in: the guide must have opened this date.
        today = datetime.now(UTC).date()
        if booking_date < today:
            raise HTTPException(status_code=422, detail="Past dates cannot be booked.")
        # Dates are opened per listing experience, so the booked experience
        # decides which of the guide's opened dates this request may use.
        availability_service = GuideAvailabilityService(self.db)

        # The profile may be linked to several login accounts; land the booking
        # on the one that opened the whole stay.
        guide: User | None = None
        calendar_ids: list[int] = account_ids
        for account_id in account_ids:
            days = availability_service.calendar(
                account_id, nights[0], nights[-1], booking_in.experience_id
            )
            if len(days) == len(nights) and all(
                entry["status"] == "available" for entry in days
            ):
                guide = self.db.query(User).filter(User.id == account_id).first()
                calendar_ids = [account_id]
                break
        if guide is None:
            guide = self.db.query(User).filter(User.id == account_ids[0]).first()
            calendar_ids = [int(account_ids[0])]
        if guide is None or not guide.is_active:
            raise HTTPException(
                status_code=409,
                detail="That guide is no longer taking bookings.",
            )

        # Every night of the stay must be open for this experience, not just the
        # check-in date; otherwise a traveller could hold a whole week off one
        # opened day.
        availability = availability_service.day_entry(
            calendar_ids, booking_date, booking_in.experience_id
        )
        closed = [
            night
            for night in nights
            if availability_service.day_entry(
                calendar_ids, night, booking_in.experience_id
            )["status"]
            != "available"
        ]
        if closed:
            first_closed = closed[0]
            extra = len(closed) - 1
            detail = (
                f"{guide.firstName or 'This guide'} is not available on "
                f"{first_closed.isoformat()}"
            )
            if extra:
                detail += f" (and {extra} more night{'s' if extra != 1 else ''})"
            if len(closed) == 1 and first_closed == booking_date:
                if availability["status"] == "booked":
                    raise HTTPException(
                        status_code=409,
                        detail=(
                            "That date is fully booked. Please pick another "
                            "available date."
                        ),
                    )
                detail += ". Please choose one of the dates the guide has marked as available."
            raise HTTPException(status_code=409, detail=detail + ".")

        listing = self._guide_listing_for(booking_in.experience_id)
        guests = int(booking_in.guests or 0)
        # A paused listing, or one the guide scheduled to re-open later, closes
        # its dates even while the calendar still has them open; both switches
        # have to reach the booking path or they disagree.
        if listing is not None:
            self._ensure_listing_open(listing, booking_date)

        default_limit = int(listing.max_guests or 10) if listing else 10
        # Claim (and lock) every night before deciding, in one ascending order
        # so concurrent bookings queue here instead of reading stale guests.
        for night in nights:
            self._claim_day(guide.id, night, default_limit)
        self.db.flush()
        self.db.expire_all()

        # Slots belong to this date *and* this experience: the limit is the
        # guide's offer for the date (or the listing's own guest limit), never
        # the guide-day capacity row, which only aggregates guests and is
        # shared with every other experience.
        for night in nights:
            entry = availability_service.day_entry(
                calendar_ids, night, booking_in.experience_id
            )
            night_limit = int(entry.get("max_slots") or default_limit)
            booked_here = availability_service.booked_guests(
                calendar_ids, night, booking_in.experience_id
            )
            if booked_here + guests > night_limit:
                remaining = max(night_limit - booked_here, 0)
                raise HTTPException(
                    status_code=409,
                    detail=(
                        f"Only {remaining} slot{'s' if remaining != 1 else ''} left "
                        f"for {night.isoformat()}."
                    ),
                )

        # The locks are held until this transaction commits, so no other
        # booking can fit between the check above and these increments.
        for night in nights:
            row = self._day_row(guide.id, night)
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

        # The price the guide set for the date is the price of the booking, so a
        # stale client copy can never under- or over-charge it.
        terms = booking_in.model_dump(exclude={"guide_id"})
        if availability.get("price_per_person") is not None:
            terms["price"] = float(availability["price_per_person"])

        db_booking = Booking(user_id=user_id, guide_user_id=guide.id, **terms)
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
        # The booking held every night of the stay, so every night gets them back.
        nights = _nights(booking_date, booking.checkout)
        for night in nights:
            row = (
                self.db.query(GuideDailyCapacity)
                .filter(
                    GuideDailyCapacity.guide_user_id == booking.guide_user_id,
                    GuideDailyCapacity.booking_date == _utc_midnight(night),
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
        return booking.date.strftime("%d %b %Y")

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
