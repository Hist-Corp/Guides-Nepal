"""Opt-in guide availability calendar.

Booking used to be "free unless a booking already exists".  The marketplace now
uses the opposite default: every date is **Unavailable** until the guide opens
it from the dashboard calendar.  This service is the single source of truth for
that calendar and is shared by:

- the guide dashboard (month calendar, bulk opens, closing dates),
- the traveller-facing availability endpoints that drive the booking calendar,
- booking creation, which refuses any date the guide has not opened.

Derived states
--------------
``available``    opened by the guide and still has capacity left.
``booked``       has active bookings and no capacity left, or carries a booking
                 from before the calendar existed (never opened).
``unavailable``  no row for the date — the default for every new date.
"""

from __future__ import annotations

import json
from calendar import monthrange
from datetime import date, datetime, timedelta, timezone
from typing import List, Sequence

from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.booking import Booking, BookingStatus
from app.models.guide_availability import GuideAvailabilityDate
from app.models.guide_daily_capacity import GuideDailyCapacity

# Statuses that still hold their slots: completed trips happened and keep the
# bookings they used, cancel/decline release them.
ACTIVE_BOOKING_STATUSES = (BookingStatus.upcoming, BookingStatus.accepted)
HOLDING_BOOKING_STATUSES = (*ACTIVE_BOOKING_STATUSES, BookingStatus.completed)
MAX_RANGE_DAYS = 366


EXCLUDE_MARK = "!"


def _scope(raw: str | None) -> tuple[bool, set[str]]:
    """Experience scope of a date row as ``(excluded, ids)``.

    No marker means ``ids`` are the experiences the date is open for, and no
    ids means every experience.  A leading ``!`` flips it: the date is open for
    every experience except ``ids``, which is how one experience is closed
    without closing the date for the rest.
    """
    raw = (raw or "").strip()
    if raw.startswith(EXCLUDE_MARK):
        return True, {token for token in raw[1:].split(",") if token}
    return False, {token for token in raw.split(",") if token}


def _encode(excluded: bool, ids: set[str]) -> str | None:
    """Store form of a scope; ``None`` when the date is open for everyone."""
    if not ids:
        return None
    joined = ",".join(sorted(ids, key=int))
    return f"{EXCLUDE_MARK}{joined}" if excluded else joined


def _is_open_for(raw: str | None, key: str) -> bool:
    """Whether a stored date row is open for one experience id."""
    excluded, ids = _scope(raw)
    if not ids:
        return True
    return key not in ids if excluded else key in ids


def _scoped(raw: str | None, key: str, opening: bool) -> str | None:
    """Stored scope after flipping one experience's membership on a date row.

    Callers only pass a real change, so one flip of the id's membership is all
    it takes: an include list gains or drops it, an exclusion list loses or
    gains it, and a shared date becomes an exclusion of that one experience.
    """
    excluded, ids = _scope(raw)
    if not ids:
        return None if opening else _encode(True, {key})
    return _encode(excluded, ids ^ {key})


DEFAULT_OFFER_KEY = "*"


def _account_ids(guide_user_id: int | Sequence[int]) -> list[int]:
    """One guide account, or every account linked to the same catalog profile.

    A catalog guide profile can be linked to more than one login account (a host
    re-creates the account, or two hosts manage the same profile).  Their
    calendars are the same guide's calendar, so reads take all of them.
    """
    if isinstance(guide_user_id, int):
        return [int(guide_user_id)]
    return [int(value) for value in guide_user_id]


def _offers(raw: str | None) -> dict[str, dict]:
    """Offers stored on a date row, keyed by experience id (``*`` = the date's
    default offer, used for whole-date openings and as the fallback)."""
    if not raw:
        return {}
    try:
        data = json.loads(raw)
    except ValueError:
        return {}
    return data if isinstance(data, dict) else {}


def _offer(raw: str | None, key: str | None) -> tuple[int | None, float | None]:
    """``(slots, price)`` for one experience, merged over the date default."""
    offers = _offers(raw)
    entry = {**offers.get(DEFAULT_OFFER_KEY, {})}
    if key is not None:
        entry.update(offers.get(key) or {})
    return entry.get("slots"), entry.get("price")


def as_date(value: str | date | datetime) -> date:
    """Coerce an ISO string / datetime / date onto a calendar date."""
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    try:
        return datetime.strptime(str(value)[:10], "%Y-%m-%d").date()
    except (TypeError, ValueError) as exc:  # pragma: no cover - guarded by callers
        raise ValueError("Dates must be ISO dates (YYYY-MM-DD).") from exc


class GuideAvailabilityService:
    def __init__(self, db: Session):
        self.db = db

    # ----------------------------------------------------------------- reads

    def parse_range(self, start: str, end: str) -> tuple[date, date]:
        try:
            start_date = as_date(start)
            end_date = as_date(end)
        except (TypeError, ValueError):
            raise ValueError("Dates must be ISO dates (YYYY-MM-DD).")
        if end_date < start_date:
            raise ValueError("The end date must be on or after the start date.")
        if (end_date - start_date).days + 1 > MAX_RANGE_DAYS:
            raise ValueError(f"A single range cannot exceed {MAX_RANGE_DAYS} days.")
        return start_date, end_date

    def _active_bookings(
        self,
        guide_user_id: int | Sequence[int],
        start: date,
        end: date,
        experience_id: int | None = None,
        statuses: Sequence[BookingStatus] = ACTIVE_BOOKING_STATUSES,
    ) -> List[Booking]:
        query = self.db.query(Booking).filter(
            Booking.guide_user_id.in_(_account_ids(guide_user_id)),
            Booking.date >= start,
            Booking.date <= end,
            Booking.status.in_(statuses),
        )
        if experience_id is not None:
            query = query.filter(Booking.experience_id == int(experience_id))
        return query.all()

    def _opened_days(
        self,
        guide_user_id: int | Sequence[int],
        start: date,
        end: date,
        experience_id: int | None = None,
    ) -> dict[date, tuple[int | None, float | None]]:
        """Opened days in the range, each mapped to ``(slots, price)``.

        Rows from every linked account of the guide are merged: a date counts as
        opened when *any* of the guide's accounts opened it for this experience,
        and its slots and price come from the first account that set them.
        """
        ids = _account_ids(guide_user_id)
        rows = (
            self.db.query(
                GuideAvailabilityDate.guide_user_id,
                GuideAvailabilityDate.date,
                GuideAvailabilityDate.experience_ids,
                GuideAvailabilityDate.offers,
            )
            .filter(
                GuideAvailabilityDate.guide_user_id.in_(ids),
                GuideAvailabilityDate.date >= start,
                GuideAvailabilityDate.date <= end,
                GuideAvailabilityDate.status == "available",
            )
            .all()
        )
        order = {account_id: index for index, account_id in enumerate(ids)}
        rows.sort(key=lambda row: order.get(int(row[0]), len(order)))

        key = None if experience_id is None else str(int(experience_id))
        by_day: dict[date, list[tuple[str | None, str | None]]] = {}
        for _, day, raw, raw_offers in rows:
            by_day.setdefault(as_date(day), []).append((raw, raw_offers))

        opened: dict[date, tuple[int | None, float | None]] = {}
        for day, entries in by_day.items():
            # No key means the caller wants the whole calendar.
            if key is not None and not any(
                _is_open_for(raw, key) for raw, _ in entries
            ):
                continue
            slots: int | None = None
            price: float | None = None
            for _, raw_offers in entries:
                entry_slots, entry_price = _offer(raw_offers, key)
                if slots is None:
                    slots = entry_slots
                if price is None:
                    price = entry_price
            opened[day] = (slots, price)
        return opened

    def _held_by_day(
        self,
        guide_user_id: int | Sequence[int],
        start: date,
        end: date,
        experience_id: int | None = None,
        statuses: Sequence[BookingStatus] = HOLDING_BOOKING_STATUSES,
    ) -> dict[date, int]:
        """Guests held on each day of the range, counting multi-night stays.

        A booking holds every night from its check-in up to (not including) its
        check-out, so a stay in progress still occupies the days it is in and a
        booking that started before ``start`` still counts on ``start``.
        """
        ids = _account_ids(guide_user_id)
        query = self.db.query(Booking).filter(
            Booking.guide_user_id.in_(ids),
            Booking.date <= end,
            or_(Booking.checkout.is_(None), Booking.checkout > start),
            Booking.status.in_(statuses),
        )
        if experience_id is not None:
            query = query.filter(Booking.experience_id == int(experience_id))

        held: dict[date, int] = {}
        for booking in query.all():
            first = booking.date
            checkout = booking.checkout
            if checkout and checkout > first:
                nights = [
                    first + timedelta(days=offset)
                    for offset in range((checkout - first).days)
                ]
            else:
                nights = [first]
            for night in nights:
                if start <= night <= end:
                    held[night] = held.get(night, 0) + int(booking.guests or 0)
        return held

    def booked_guests(
        self,
        guide_user_id: int | Sequence[int],
        day: date,
        experience_id: int | None = None,
    ) -> int:
        """Guests already held on a date, for one experience when given."""
        return self._held_by_day(guide_user_id, day, day, experience_id).get(day, 0)

    @staticmethod
    def _write_offer(
        row: GuideAvailabilityDate,
        key: str | None,
        slots: int | None,
        price: float | None,
    ) -> None:
        """Record an offer without touching any other experience's."""
        if slots is None and price is None:
            return
        offers = _offers(row.offers)
        offer_key = key or DEFAULT_OFFER_KEY
        entry = dict(offers.get(offer_key) or {})
        if slots is not None:
            entry["slots"] = slots
        if price is not None:
            entry["price"] = price
        offers[offer_key] = entry
        row.offers = json.dumps(offers)

    def open_guides(
        self, day: date, exclude_user_id: int | None = None
    ) -> dict[int, str | None]:
        """Guide accounts that opened ``day``, each with the experiences they did.

        The date-first booking flow picks the date before the guide, so there
        is no single guide to read a calendar for; this answers "who is open
        that day, and for what" for every guide at once.
        """
        query = self.db.query(
            GuideAvailabilityDate.guide_user_id, GuideAvailabilityDate.experience_ids
        ).filter(
            GuideAvailabilityDate.date == day,
            GuideAvailabilityDate.status == "available",
        )
        if exclude_user_id is not None:
            query = query.filter(GuideAvailabilityDate.guide_user_id != exclude_user_id)
        return {int(guide_user_id): raw for guide_user_id, raw in query.all()}

    @staticmethod
    def opens(raw: str | None, experience_id: int) -> bool:
        """Whether a stored scope (from :meth:`open_guides`) is open for one experience."""
        return _is_open_for(raw, str(int(experience_id)))

    def _capacity_rows(
        self, guide_user_id: int | Sequence[int], start: date, end: date
    ) -> dict[date, GuideDailyCapacity]:
        ids = _account_ids(guide_user_id)
        start_dt = datetime(start.year, start.month, start.day, tzinfo=timezone.utc)
        end_dt = datetime(end.year, end.month, end.day, tzinfo=timezone.utc)
        rows = (
            self.db.query(GuideDailyCapacity)
            .filter(
                GuideDailyCapacity.guide_user_id.in_(ids),
                GuideDailyCapacity.booking_date >= start_dt,
                GuideDailyCapacity.booking_date <= end_dt,
                GuideDailyCapacity.is_active.is_(True),
            )
            .all()
        )
        order = {account_id: index for index, account_id in enumerate(ids)}
        rows.sort(key=lambda row: order.get(int(row.guide_user_id), len(order)))
        by_day: dict[date, GuideDailyCapacity] = {}
        for row in rows:
            by_day.setdefault(as_date(row.booking_date), row)
        return by_day

    def calendar(
        self,
        guide_user_id: int | Sequence[int],
        start: date,
        end: date,
        experience_id: int | None = None,
    ) -> List[dict]:
        """Every day in the range with its derived availability state.

        ``remaining`` and ``capacity`` come from the same ``guide_daily_capacity``
        row :meth:`BookingService.create_booking` checks, so a spot count shown
        in the dashboard can never promise more (or less) than a booking will
        accept.  A day with no capacity row yet has not been booked at all, so
        both values are ``None`` and the UI shows the day as open without
        inventing a number.
        """
        opened = self._opened_days(guide_user_id, start, end, experience_id)
        capacity_rows = self._capacity_rows(guide_user_id, start, end)

        by_day: dict[date, List[Booking]] = {}
        for booking in self._active_bookings(guide_user_id, start, end, experience_id):
            by_day.setdefault(booking.date, []).append(booking)

        # Spots left count the guests a date still holds (completed trips too),
        # scoped to this experience when one is asked for. Multi-night stays
        # hold every night they cover, not just their check-in day.
        held_by_day = self._held_by_day(
            guide_user_id, start, end, experience_id, HOLDING_BOOKING_STATUSES
        )

        days: List[dict] = []
        day = start
        while day <= end:
            day_bookings = by_day.get(day, [])
            guests = sum(int(booking.guests or 0) for booking in day_bookings)
            capacity_row = capacity_rows.get(day)
            # The offer chosen when the date was opened wins over the stored
            # capacity row, so the calendar always shows what the guide set.
            slots, price_per_person = opened.get(day, (None, None))
            if slots is not None:
                capacity = slots
            elif capacity_row is not None:
                capacity = int(capacity_row.max_capacity or 0)
            else:
                capacity = None
            # Spots left come from the bookings themselves (scoped to this
            # experience when one is asked for), so one experience's slots and
            # bookings never squeeze another's.
            remaining = (
                None
                if capacity is None
                else max(capacity - held_by_day.get(day, 0), 0)
            )

            if day in opened and (remaining is None or remaining > 0):
                status = "available"
            elif day_bookings:
                status = "booked"
            else:
                status = "unavailable"

            days.append(
                {
                    "date": day.isoformat(),
                    "status": status,
                    "bookings": len(day_bookings),
                    "guests": guests,
                    # A closed date has no bookable spots, so it reports no count.
                    "remaining": None if status == "unavailable" else remaining,
                    "capacity": capacity,
                    "max_slots": slots,
                    "price_per_person": price_per_person,
                }
            )
            day += timedelta(days=1)
        return days

    def day_entry(
        self,
        guide_user_id: int | Sequence[int],
        day: date,
        experience_id: int | None = None,
    ) -> dict:
        return self.calendar(guide_user_id, day, day, experience_id)[0]

    def month_days(
        self,
        guide_user_id: int | Sequence[int],
        year: int,
        month: int,
        experience_id: int | None = None,
    ) -> List[dict]:
        first = date(year, month, 1)
        last = date(year, month, monthrange(year, month)[1])
        return self.calendar(guide_user_id, first, last, experience_id)

    def summary(self, guide_user_id: int, window_days: int = 30) -> dict:
        """Counts of open and fully-booked days over the next window."""
        today = datetime.now(timezone.utc).date()
        entries = self.calendar(guide_user_id, today, today + timedelta(days=max(window_days, 1) - 1))
        return {
            "available_days": sum(1 for entry in entries if entry["status"] == "available"),
            "booked_days": sum(1 for entry in entries if entry["status"] == "booked"),
        }

    # ---------------------------------------------------------------- writes

    def set_dates(
        self,
        guide_user_id: int,
        dates: Sequence[str],
        status: str,
        experience_id: int | None = None,
        max_slots: int | None = None,
        price_per_person: float | None = None,
    ) -> dict:
        """Open or close calendar dates for the signed-in guide.

        ``experience_id`` scopes the change to one listing experience; omitted,
        the dates are shared by every experience on the guide's calendar.
        ``max_slots`` sets how many guests the opened dates can take and is
        mirrored onto each day's capacity row so bookings honour it;
        ``price_per_person`` is the per-person price bookings on those dates
        will be written with.

        Overlap handling:
        - dates in the past are rejected (422) — history is immutable;
        - closing a date that still holds an active booking is rejected (409)
          so a traveller's confirmed trip can never be silently dropped;
          with ``experience_id`` only that experience's bookings block it.
        """
        if status not in ("available", "unavailable"):
            raise HTTPException(status_code=422, detail="status must be available or unavailable")

        try:
            days = sorted({as_date(value) for value in dates})
        except (TypeError, ValueError):
            raise HTTPException(status_code=422, detail="Dates must be ISO dates (YYYY-MM-DD).")
        if not days:
            raise HTTPException(status_code=422, detail="Select at least one date.")
        if len(days) > MAX_RANGE_DAYS:
            raise HTTPException(status_code=422, detail=f"At most {MAX_RANGE_DAYS} dates can be changed at once.")

        today = datetime.now(timezone.utc).date()
        if days[0] < today:
            raise HTTPException(
                status_code=422,
                detail=f"{days[0].isoformat()} is in the past. Only today and future dates can be changed.",
            )

        key = None if experience_id is None else str(int(experience_id))
        by_day = {
            as_date(row.date): row
            for row in self.db.query(GuideAvailabilityDate)
            .filter(
                GuideAvailabilityDate.guide_user_id == guide_user_id,
                GuideAvailabilityDate.date >= days[0],
                GuideAvailabilityDate.date <= days[-1],
            )
            .all()
        }

        opening = status == "available"
        slots = None if max_slots is None else int(max_slots)
        price = None if price_per_person is None else float(price_per_person)
        if price is not None and price < 0:
            raise HTTPException(status_code=422, detail="The price cannot be negative.")
        if opening and slots is not None:
            # Reject before touching anything when the date already holds more
            # guests than the new limit would allow.
            for day in days:
                booked = self.booked_guests(guide_user_id, day, experience_id)
                if booked > slots:
                    raise HTTPException(
                        status_code=409,
                        detail=(
                            f"{day.isoformat()} already has {booked} guest"
                            f"{'s' if booked != 1 else ''} booked. "
                            "Slots cannot be lower than that."
                        ),
                    )

        if not opening:
            blocked: dict[str, int] = {}
            for booking in self._active_bookings(
                guide_user_id, days[0], days[-1], experience_id
            ):
                booking_day = booking.date
                if booking_day in days:
                    blocked[booking_day.isoformat()] = blocked.get(booking_day.isoformat(), 0) + 1
            if blocked:
                first = min(blocked)
                raise HTTPException(
                    status_code=409,
                    detail=(
                        f"{first} still has {blocked[first]} active booking"
                        f"{'s' if blocked[first] != 1 else ''}. "
                        "Cancel or move those bookings before closing the date."
                    ),
                )

        # Rows only ever exist as "available" entries, so opening inserts one and
        # closing either rewrites its scope or drops it.
        changed = 0
        for day in days:
            row = by_day.get(day)
            if row is None:
                if opening:
                    row = GuideAvailabilityDate(
                        guide_user_id=guide_user_id,
                        date=day,
                        status="available",
                        experience_ids=key,
                    )
                    self._write_offer(row, key, slots, price)
                    self.db.add(row)
                    changed += 1
                continue
            if key is None:
                # Whole-date change: open for every experience, or drop the row.
                if opening:
                    if not row.experience_ids:
                        continue
                    row.experience_ids = None
                else:
                    self.db.delete(row)
            elif _is_open_for(row.experience_ids, key) != opening:
                row.experience_ids = _scoped(row.experience_ids, key, opening)
                if not opening and row.experience_ids is None:
                    # Its last opened experience is gone, so the date closes.
                    self.db.delete(row)
            else:
                continue
            if opening:
                self._write_offer(row, key, slots, price)
            changed += 1

        try:
            self.db.commit()
        except IntegrityError:  # pragma: no cover - concurrent double submit
            self.db.rollback()
        return {"status": status, "dates": [day.isoformat() for day in days], "changed": changed}
