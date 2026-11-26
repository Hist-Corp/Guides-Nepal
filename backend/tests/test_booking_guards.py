"""Booking guards that live outside the per-date calendar.

A guide has two more switches besides opening a date: pausing the listing and a
forced recharge date, and a multi-night stay holds every night it covers.  All
of them have to reach the booking path, and a booking without a resolvable guide
must be refused instead of silently landing on the default guide account.
"""

from datetime import UTC, date, datetime, timedelta

import pytest
from fastapi import HTTPException

from app.models.guide_daily_capacity import GuideDailyCapacity
from app.models.guide_listing import GuideListing
from app.models.user import User
from app.schemas.booking import BookingCreate
from app.services.booking_service import BookingService
from app.services.guide_availability_service import GuideAvailabilityService

DAY = date.today() + timedelta(days=16)
LISTING_OFFSET = 200000


def _user(db, email: str, role: str) -> User:
    user = User(
        email=email,
        firstName=role.title(),
        lastName="Test",
        hashed_password="not-a-real-hash",
        role=role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _listing(db, guide: User, **overrides) -> GuideListing:
    listing = GuideListing(
        guide_user_id=guide.id,
        title=overrides.pop("title", "Guard trek"),
        city="Kathmandu",
        category="trekking",
        description="A listed trek.",
        duration="1 day",
        price=40.0,
        max_guests=overrides.pop("max_guests", 10),
        **overrides,
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


def _booking(experience_id: int, guide_id: int | None, guests: int = 1, **overrides):
    fields = {
        "experience_id": experience_id,
        "experience_title": "Guard trek",
        "city": "Kathmandu",
        "date": DAY,
        "guests": guests,
        "price": 40.0,
        "guide_id": guide_id,
    }
    fields.update(overrides)
    return BookingCreate(**fields)


def test_paused_listing_is_not_bookable(db_session):
    guide = _user(db_session, "guide-paused@example.com", "guide")
    traveller = _user(db_session, "traveller-paused@example.com", "traveler")
    listing = _listing(db_session, guide)
    experience_id = LISTING_OFFSET + int(listing.id)

    GuideAvailabilityService(db_session).set_dates(
        guide.id, [DAY.isoformat()], "available", experience_id, max_slots=4
    )
    listing.availability_status = "paused"
    db_session.commit()

    with pytest.raises(HTTPException) as paused:
        BookingService(db_session).create_booking(
            traveller.id, _booking(experience_id, guide.id)
        )
    assert paused.value.status_code == 409
    assert "paused" in paused.value.detail


def test_listing_recharge_date_blocks_earlier_bookings(db_session):
    guide = _user(db_session, "guide-recharge@example.com", "guide")
    traveller = _user(db_session, "traveller-recharge@example.com", "traveler")
    listing = _listing(db_session, guide)
    experience_id = LISTING_OFFSET + int(listing.id)

    GuideAvailabilityService(db_session).set_dates(
        guide.id, [DAY.isoformat()], "available", experience_id, max_slots=4
    )
    reopen = DAY + timedelta(days=5)
    listing.next_available_date = datetime(
        reopen.year, reopen.month, reopen.day, tzinfo=UTC
    )
    db_session.commit()

    with pytest.raises(HTTPException) as recharging:
        BookingService(db_session).create_booking(
            traveller.id, _booking(experience_id, guide.id)
        )
    assert recharging.value.status_code == 409
    assert reopen.isoformat() in recharging.value.detail

    # Once the recharge date is reached the same booking goes through.
    listing.next_available_date = datetime(DAY.year, DAY.month, DAY.day, tzinfo=UTC)
    db_session.commit()
    assert GuideAvailabilityService(db_session).set_dates(
        guide.id, [reopen.isoformat()], "available", experience_id, max_slots=4
    )["changed"] == 1
    booking = BookingService(db_session).create_booking(
        traveller.id, _booking(experience_id, guide.id, date=reopen)
    )
    assert booking.date == reopen


def test_closing_a_night_inside_a_stay_is_rejected(db_session):
    guide = _user(db_session, "guide-stay@example.com", "guide")
    traveller = _user(db_session, "traveller-stay@example.com", "traveler")
    service = GuideAvailabilityService(db_session)
    nights = [(DAY + timedelta(days=offset)).isoformat() for offset in (0, 1)]
    service.set_dates(guide.id, nights, "available", 200009, max_slots=5)

    booking = BookingService(db_session).create_booking(
        traveller.id,
        _booking(200009, guide.id, checkout=DAY + timedelta(days=2)),
    )
    assert booking.checkout == DAY + timedelta(days=2)

    # The second night belongs to the stay even though the booking's check-in
    # is the day before, so closing it is refused.
    with pytest.raises(HTTPException) as inside_stay:
        service.set_dates(
            guide.id, [(DAY + timedelta(days=1)).isoformat()], "unavailable", 200009
        )
    assert inside_stay.value.status_code == 409
    assert (DAY + timedelta(days=1)).isoformat() in inside_stay.value.detail

    # The check-in day is still guarded too.
    with pytest.raises(HTTPException) as check_in:
        service.set_dates(guide.id, [DAY.isoformat()], "unavailable", 200009)
    assert check_in.value.status_code == 409


def test_closed_listing_drops_out_of_who_you_will_meet(db_session):
    """The picker has to agree with the booking path, not just with the calendar."""
    guide = _user(db_session, "guide-picker@example.com", "guide")
    listing = _listing(db_session, guide)
    experience_id = LISTING_OFFSET + int(listing.id)
    GuideAvailabilityService(db_session).set_dates(
        guide.id, [DAY.isoformat()], "available", experience_id, max_slots=3
    )
    bookings = BookingService(db_session)

    def offered() -> list[int]:
        return bookings.available_guide_ids(
            experience_id, DAY.isoformat(), catalog_guide_ids=[guide.id]
        )

    assert offered() == [guide.id]

    listing.availability_status = "paused"
    db_session.commit()
    assert offered() == []
    assert bookings.available_guides(DAY.isoformat()) == []

    # A forced recharge date closes the same date even while the listing is
    # open again.
    listing.availability_status = "open"
    listing.next_available_date = datetime(
        DAY.year, DAY.month, DAY.day, tzinfo=UTC
    ) + timedelta(days=3)
    db_session.commit()
    assert offered() == []
    assert bookings.available_guides(DAY.isoformat()) == []


def test_booking_without_a_guide_is_rejected(db_session):
    traveller = _user(db_session, "traveller-noguide@example.com", "traveler")

    # A catalogue experience with no listing owner and no guide selected.
    with pytest.raises(HTTPException) as no_guide:
        BookingService(db_session).create_booking(traveller.id, _booking(200009, None))
    assert no_guide.value.status_code == 422
    assert "guide" in no_guide.value.detail.lower()


def test_booking_without_guide_id_uses_the_listing_owner(db_session):
    guide = _user(db_session, "guide-owner@example.com", "guide")
    traveller = _user(db_session, "traveller-owner@example.com", "traveler")
    listing = _listing(db_session, guide)
    experience_id = LISTING_OFFSET + int(listing.id)

    GuideAvailabilityService(db_session).set_dates(
        guide.id, [DAY.isoformat()], "available", experience_id, max_slots=3
    )

    booking = BookingService(db_session).create_booking(
        traveller.id, _booking(experience_id, None)
    )
    assert booking.guide_user_id == guide.id


def test_capacity_row_carries_the_days_offer_not_the_listing_limit(db_session):
    guide = _user(db_session, "guide-offer-row@example.com", "guide")
    traveller = _user(db_session, "traveller-offer-row@example.com", "traveler")
    listing = _listing(db_session, guide, max_guests=10)
    experience_id = LISTING_OFFSET + int(listing.id)

    GuideAvailabilityService(db_session).set_dates(
        guide.id, [DAY.isoformat()], "available", experience_id, max_slots=2
    )
    BookingService(db_session).create_booking(
        traveller.id, _booking(experience_id, guide.id)
    )

    row = (
        db_session.query(GuideDailyCapacity)
        .filter(
            GuideDailyCapacity.guide_user_id == guide.id,
            GuideDailyCapacity.booking_date == datetime(
                DAY.year, DAY.month, DAY.day, tzinfo=UTC
            ),
        )
        .one()
    )
    assert row.max_capacity == 2
    assert row.booked_capacity == 1
    # The date-first search reads this row: one of the two offered slots is
    # left, not the nine the listing's own guest limit would have reported.
    cards = BookingService(db_session).available_guides(DAY.isoformat())
    assert [card["spots_left"] for card in cards] == [1]
