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

from calendar import monthrange
from datetime import date, datetime, timedelta, timezone
from typing import List, Sequence

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.booking import Booking, BookingStatus
from app.models.guide_availability import GuideAvailabilityDate
from app.models.guide_daily_capacity import GuideDailyCapacity

ACTIVE_BOOKING_STATUSES = (BookingStatus.upcoming, BookingStatus.accepted)
MAX_RANGE_DAYS = 366


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

    def _active_bookings(self, guide_user_id: int, start: date, end: date) -> List[Booking]:
        return (
            self.db.query(Booking)
            .filter(
                Booking.guide_user_id == guide_user_id,
                func.date(Booking.date) >= start.isoformat(),
                func.date(Booking.date) <= end.isoformat(),
                Booking.status.in_(ACTIVE_BOOKING_STATUSES),
            )
            .all()
        )

    def _opened_dates(self, guide_user_id: int, start: date, end: date) -> set[date]:
        rows = (
            self.db.query(GuideAvailabilityDate.date)
            .filter(
                GuideAvailabilityDate.guide_user_id == guide_user_id,
                GuideAvailabilityDate.date >= start,
                GuideAvailabilityDate.date <= end,
                GuideAvailabilityDate.status == "available",
            )
            .all()
        )
        return {as_date(row[0]) for row in rows}

    def open_guide_ids(self, day: date, exclude_user_id: int | None = None) -> set[int]:
        """Guide accounts that opened ``day``, in one query.

        The date-first booking flow picks the date before the guide, so there
        is no single guide to read a calendar for; this answers "who is open
        that day" for every guide at once.
        """
        query = self.db.query(GuideAvailabilityDate.guide_user_id).filter(
            GuideAvailabilityDate.date == day,
            GuideAvailabilityDate.status == "available",
        )
        if exclude_user_id is not None:
            query = query.filter(GuideAvailabilityDate.guide_user_id != exclude_user_id)
        return {int(row[0]) for row in query.all()}

    def _capacity_rows(self, guide_user_id: int, start: date, end: date) -> dict[date, GuideDailyCapacity]:
        start_dt = datetime(start.year, start.month, start.day, tzinfo=timezone.utc)
        end_dt = datetime(end.year, end.month, end.day, tzinfo=timezone.utc)
        rows = (
            self.db.query(GuideDailyCapacity)
            .filter(
                GuideDailyCapacity.guide_user_id == guide_user_id,
                GuideDailyCapacity.booking_date >= start_dt,
                GuideDailyCapacity.booking_date <= end_dt,
                GuideDailyCapacity.is_active.is_(True),
            )
            .all()
        )
        return {as_date(row.booking_date): row for row in rows}

    def calendar(self, guide_user_id: int, start: date, end: date) -> List[dict]:
        """Every day in the range with its derived availability state.

        ``remaining`` and ``capacity`` come from the same ``guide_daily_capacity``
        row :meth:`BookingService.create_booking` checks, so a spot count shown
        in the dashboard can never promise more (or less) than a booking will
        accept.  A day with no capacity row yet has not been booked at all, so
        both values are ``None`` and the UI shows the day as open without
        inventing a number.
        """
        opened = self._opened_dates(guide_user_id, start, end)
        capacity_rows = self._capacity_rows(guide_user_id, start, end)

        by_day: dict[date, List[Booking]] = {}
        for booking in self._active_bookings(guide_user_id, start, end):
            by_day.setdefault(as_date(booking.date), []).append(booking)

        days: List[dict] = []
        day = start
        while day <= end:
            day_bookings = by_day.get(day, [])
            guests = sum(int(booking.guests or 0) for booking in day_bookings)
            capacity_row = capacity_rows.get(day)
            if capacity_row is None:
                capacity = None
                remaining = None
            else:
                capacity = int(capacity_row.max_capacity or 0)
                remaining = max(capacity - int(capacity_row.booked_capacity or 0), 0)

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
                }
            )
            day += timedelta(days=1)
        return days

    def day_entry(self, guide_user_id: int, day: date) -> dict:
        return self.calendar(guide_user_id, day, day)[0]

    def month_days(self, guide_user_id: int, year: int, month: int) -> List[dict]:
        first = date(year, month, 1)
        last = date(year, month, monthrange(year, month)[1])
        return self.calendar(guide_user_id, first, last)

    def summary(self, guide_user_id: int, window_days: int = 30) -> dict:
        """Counts of open and fully-booked days over the next window."""
        today = datetime.now(timezone.utc).date()
        entries = self.calendar(guide_user_id, today, today + timedelta(days=max(window_days, 1) - 1))
        return {
            "available_days": sum(1 for entry in entries if entry["status"] == "available"),
            "booked_days": sum(1 for entry in entries if entry["status"] == "booked"),
        }

    # ---------------------------------------------------------------- writes

    def set_dates(self, guide_user_id: int, dates: Sequence[str], status: str) -> dict:
        """Open or close calendar dates for the signed-in guide.

        Overlap handling:
        - dates in the past are rejected (422) — history is immutable;
        - closing a date that still holds an active booking is rejected (409)
          so a traveller's confirmed trip can never be silently dropped.
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

        if status == "unavailable":
            blocked: dict[str, int] = {}
            for booking in self._active_bookings(guide_user_id, days[0], days[-1]):
                booking_day = as_date(booking.date)
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

            deleted = (
                self.db.query(GuideAvailabilityDate)
                .filter(
                    GuideAvailabilityDate.guide_user_id == guide_user_id,
                    GuideAvailabilityDate.date.in_(days),
                )
                .delete(synchronize_session=False)
            )
            self.db.commit()
            return {"status": status, "dates": [day.isoformat() for day in days], "changed": deleted}

        # Rows only ever exist as "available" entries, so opening a date is
        # just inserting the ones that are not there yet.
        opened = self._opened_dates(guide_user_id, days[0], days[-1])
        changed = 0
        for day in days:
            if day in opened:
                continue
            self.db.add(
                GuideAvailabilityDate(
                    guide_user_id=guide_user_id,
                    date=day,
                    status="available",
                )
            )
            changed += 1
        try:
            self.db.commit()
        except IntegrityError:  # pragma: no cover - concurrent double submit
            self.db.rollback()
        return {"status": status, "dates": [day.isoformat() for day in days], "changed": changed}
