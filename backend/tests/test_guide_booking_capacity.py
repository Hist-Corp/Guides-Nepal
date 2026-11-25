"""Regression tests for capacity released by a guide's booking decision.

A declined or guide-cancelled request must return its slots to the day, exactly
like a traveller cancellation. Accepting and completing keep the slots because
the trip still stands.
"""

from datetime import date, timedelta

import pytest

from app.models.booking import BookingStatus
from app.models.guide_availability import GuideAvailabilityDate
from app.models.user import User
from app.schemas.booking import BookingCreate
from fastapi import HTTPException

from app.services.booking_service import BookingService

DAY = date.today() + timedelta(days=14)
GUESTS = 2
MAX_CAPACITY = 10


def _make_user(db, email: str, role: str) -> User:
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


@pytest.fixture
def booked_day(db_session):
    """A traveller already holds ``GUESTS`` slots on an open guide day."""
    guide = _make_user(db_session, "guide-capacity@example.com", "guide")
    traveller = _make_user(db_session, "traveller-capacity@example.com", "traveler")
    db_session.add(
        GuideAvailabilityDate(guide_user_id=guide.id, date=DAY, status="available")
    )
    db_session.commit()

    service = BookingService(db_session)
    booking = service.create_booking(
        traveller.id,
        BookingCreate(
            experience_id=200009,
            experience_title="Test Trek",
            city="Kathmandu",
            date=DAY,
            guests=GUESTS,
            price=75.0,
            guide_id=guide.id,
        ),
    )
    return db_session, service, guide, booking


def _remaining(service: BookingService, guide: User) -> int:
    return service.daily_availability(DAY.isoformat(), guide_id=guide.id)["remaining"]


def test_declining_booking_frees_the_days_slots(booked_day):
    _, service, guide, booking = booked_day
    assert _remaining(service, guide) == MAX_CAPACITY - GUESTS

    service.decide_booking(guide.id, booking.id, "rejected")

    assert booking.status == BookingStatus.rejected
    assert _remaining(service, guide) == MAX_CAPACITY


def test_guide_cancelling_booking_frees_the_days_slots(booked_day):
    _, service, guide, booking = booked_day
    assert _remaining(service, guide) == MAX_CAPACITY - GUESTS

    service.decide_booking(guide.id, booking.id, "cancelled")

    assert booking.status == BookingStatus.cancelled
    assert _remaining(service, guide) == MAX_CAPACITY


def test_accepting_and_completing_keep_the_days_slots(booked_day):
    _, service, guide, booking = booked_day

    service.decide_booking(guide.id, booking.id, "accepted")
    assert _remaining(service, guide) == MAX_CAPACITY - GUESTS

    service.decide_booking(guide.id, booking.id, "completed")
    assert booking.status == BookingStatus.completed
    assert _remaining(service, guide) == MAX_CAPACITY - GUESTS


def test_opening_a_date_for_one_experience_leaves_the_others_closed(db_session):
    from app.services.guide_availability_service import GuideAvailabilityService

    guide = _make_user(db_session, "guide-scope@example.com", "guide")
    service = GuideAvailabilityService(db_session)
    day = DAY.isoformat()

    service.set_dates(guide.id, [day], "available", 200001)
    assert service.day_entry(guide.id, DAY, 200001)["status"] == "available"
    assert service.day_entry(guide.id, DAY, 200002)["status"] == "unavailable"
    # The traveller-facing guide calendar still sees any opened date.
    assert service.day_entry(guide.id, DAY)["status"] == "available"

    service.set_dates(guide.id, [day], "available", 200002)
    assert service.day_entry(guide.id, DAY, 200002)["status"] == "available"

    service.set_dates(guide.id, [day], "unavailable", 200001)
    assert service.day_entry(guide.id, DAY, 200001)["status"] == "unavailable"
    assert service.day_entry(guide.id, DAY, 200002)["status"] == "available"


def test_closing_a_shared_date_for_one_experience_keeps_the_others_open(db_session):
    from app.services.guide_availability_service import GuideAvailabilityService

    guide = _make_user(db_session, "guide-shared-close@example.com", "guide")
    service = GuideAvailabilityService(db_session)
    day = DAY.isoformat()

    service.set_dates(guide.id, [day], "available")  # shared by every experience
    service.set_dates(guide.id, [day], "unavailable", 200001)

    assert service.day_entry(guide.id, DAY, 200001)["status"] == "unavailable"
    assert service.day_entry(guide.id, DAY, 200002)["status"] == "available"

    # Re-opening it for the closed experience restores the shared date.
    service.set_dates(guide.id, [day], "available", 200001)
    assert service.day_entry(guide.id, DAY, 200001)["status"] == "available"
    assert service.day_entry(guide.id, DAY, 200002)["status"] == "available"


def test_traveller_calendar_respects_experience_scope(db_session):
    from app.services.guide_availability_service import GuideAvailabilityService

    # The default bookable guide the traveller calendar reads.
    guide = _make_user(db_session, "guide@guides-nepal.com", "guide")
    GuideAvailabilityService(db_session).set_dates(guide.id, [DAY.isoformat()], "available", 201)
    bookings = BookingService(db_session)

    assert bookings.availability_for_date(DAY.isoformat(), experience_id=201)["available"]
    assert not bookings.availability_for_date(DAY.isoformat(), experience_id=202)["available"]
    assert DAY.isoformat() not in bookings.unavailable_dates(
        DAY.year, DAY.month, experience_id=201
    )
    assert DAY.isoformat() in bookings.unavailable_dates(
        DAY.year, DAY.month, experience_id=202
    )


def test_opening_a_date_takes_the_guides_slots_and_price(db_session):
    from app.services.guide_availability_service import GuideAvailabilityService

    guide = _make_user(db_session, "guide-slots@example.com", "guide")
    service = GuideAvailabilityService(db_session)
    day = DAY.isoformat()

    service.set_dates(
        guide.id, [day], "available", 200001, max_slots=4, price_per_person=37.5
    )
    entry = service.day_entry(guide.id, DAY, 200001)
    assert entry["max_slots"] == 4
    assert entry["capacity"] == 4
    assert entry["remaining"] == 4
    assert entry["price_per_person"] == 37.5

    # Opening another experience on the same date is its own offer.
    service.set_dates(
        guide.id, [day], "available", 200002, max_slots=6, price_per_person=42
    )
    reopened = service.day_entry(guide.id, DAY, 200002)
    assert reopened["max_slots"] == 6
    assert reopened["price_per_person"] == 42
    assert entry == service.day_entry(guide.id, DAY, 200001)


def test_slots_and_price_are_per_experience_on_the_same_day(db_session):
    from app.services.guide_availability_service import GuideAvailabilityService

    guide = _make_user(db_session, "guide-per-exp@example.com", "guide")
    service = GuideAvailabilityService(db_session)
    day = DAY.isoformat()

    service.set_dates(guide.id, [day], "available", 200001, max_slots=3, price_per_person=100)
    service.set_dates(guide.id, [day], "available", 200002, max_slots=8, price_per_person=120)

    # Opening the second experience must not rewrite the first one's offer.
    first = service.day_entry(guide.id, DAY, 200001)
    second = service.day_entry(guide.id, DAY, 200002)
    assert (first["max_slots"], first["price_per_person"], first["capacity"]) == (3, 100, 3)
    assert (second["max_slots"], second["price_per_person"], second["capacity"]) == (8, 120, 8)

    # The traveller calendar receives the date price with the spots.
    detail = BookingService(db_session).month_detail(
        DAY.year, DAY.month, guide_id=guide.id, experience_id=200001
    )
    assert detail[day]["price_per_person"] == 100
    assert detail[day]["max_capacity"] == 3


def test_slots_limit_how_many_guests_can_book(db_session):
    from app.models.guide_listing import GuideListing
    from app.services.guide_availability_service import GuideAvailabilityService

    guide = _make_user(db_session, "guide-slots-cap@example.com", "guide")
    traveller = _make_user(db_session, "traveller-slots-cap@example.com", "traveler")
    listing = GuideListing(
        guide_user_id=guide.id,
        title="Slots trek",
        city="Kathmandu",
        category="trekking",
        description="A trek with two slots.",
        duration="1 day",
        price=40.0,
        max_guests=10,
    )
    db_session.add(listing)
    db_session.commit()
    experience_id = 200000 + listing.id

    GuideAvailabilityService(db_session).set_dates(
        guide.id,
        [DAY.isoformat()],
        "available",
        experience_id,
        max_slots=2,
        price_per_person=37.5,
    )

    def book(guests: int):
        return BookingService(db_session).create_booking(
            traveller.id,
            BookingCreate(
                experience_id=experience_id,
                experience_title=listing.title,
                city=listing.city,
                date=DAY,
                guests=guests,
                price=40.0,
                guide_id=guide.id,
            ),
        )

    with pytest.raises(HTTPException) as too_many:
        book(3)
    assert too_many.value.status_code == 409

    # The guide's date price is what the booking is written with, even though
    # the request still carried the listing price.
    booking = book(2)
    assert float(booking.price) == 37.5

    entry = GuideAvailabilityService(db_session).day_entry(guide.id, DAY, experience_id)
    assert entry["max_slots"] == 2
    assert entry["remaining"] == 0
    assert entry["status"] == "booked"

    offer = BookingService(db_session).availability_for_date(
        DAY.isoformat(), guide_id=guide.id, experience_id=experience_id
    )
    assert offer["price_per_person"] == 37.5


def test_date_first_search_only_offers_listings_opened_that_day(db_session):
    from app.models.guide_listing import GuideListing
    from app.services.guide_availability_service import GuideAvailabilityService

    guide = _make_user(db_session, "guide-search@example.com", "guide")
    listings = [
        GuideListing(
            guide_user_id=guide.id,
            title=f"{city} trek",
            city=city,
            category="trekking",
            description=f"A trek in {city}.",
            duration="1 day",
            price=50.0,
            max_guests=10,
        )
        for city in ("Kathmandu", "Pokhara")
    ]
    db_session.add_all(listings)
    db_session.commit()
    opened, other = listings

    GuideAvailabilityService(db_session).set_dates(
        guide.id, [DAY.isoformat()], "available", 200000 + opened.id
    )

    cards = BookingService(db_session).available_guides(DAY.isoformat())
    assert len(cards) == 1
    assert [listing["id"] for listing in cards[0]["listings"]] == [200000 + opened.id]
    assert cards[0]["listings"][0]["title"] == opened.title
    assert other.title != opened.title


def test_closing_only_checks_that_experiences_bookings(booked_day):
    from app.services.guide_availability_service import GuideAvailabilityService

    db_session, _, guide, _ = booked_day  # booking is for experience 200009
    service = GuideAvailabilityService(db_session)
    day = DAY.isoformat()

    # A booking on another experience does not block closing this one.
    service.set_dates(guide.id, [day], "unavailable", 200010)
    assert service.day_entry(guide.id, DAY, 200010)["status"] == "unavailable"
    # Two closed experiences stack into one exclusion list.
    service.set_dates(guide.id, [day], "unavailable", 200011)
    assert service.day_entry(guide.id, DAY, 200011)["status"] == "unavailable"
    assert service.day_entry(guide.id, DAY, 200012)["status"] == "available"

    # The booked experience, and the shared date, still refuse to close.
    with pytest.raises(HTTPException) as scoped:
        service.set_dates(guide.id, [day], "unavailable", 200009)
    assert scoped.value.status_code == 409
    with pytest.raises(HTTPException) as shared:
        service.set_dates(guide.id, [day], "unavailable")
    assert shared.value.status_code == 409


def _link_profile(db, profile_id, *accounts):
    """Link a catalog guide profile to one or more login accounts."""
    from app.models.guide import Guide
    from app.models.host_guide import HostGuide

    host = _make_user(db, f"host-{profile_id}-{accounts[0].id}@example.com", "host")
    if db.get(Guide, profile_id) is None:
        db.add(Guide(id=profile_id, name="Linked Guide", image="/x.png", role="Guide", bio="bio"))
        db.commit()
    for account in accounts:
        db.add(
            HostGuide(
                host_id=host.id,
                guide_user_id=account.id,
                guide_id=profile_id,
                full_name="Linked Guide",
                email=account.email,
                status="active",
            )
        )
    db.commit()
    return host


def test_openings_on_any_linked_account_reach_the_traveller_calendar(db_session):
    from app.services.guide_availability_service import GuideAvailabilityService

    # One catalog profile, two login accounts: a host re-created the account.
    older = _make_user(db_session, "guide-twin-old@example.com", "guide")
    newer = _make_user(db_session, "guide-twin-new@example.com", "guide")
    profile_id = 9001
    _link_profile(db_session, profile_id, older, newer)

    # The guide opens the date from the newer dashboard account only.
    GuideAvailabilityService(db_session).set_dates(
        newer.id, [DAY.isoformat()], "available", 200001, max_slots=4, price_per_person=50
    )

    bookings = BookingService(db_session)
    offer = bookings.availability_for_date(
        DAY.isoformat(), guide_id=profile_id, experience_id=200001
    )
    assert offer["available"] is True
    assert offer["price_per_person"] == 50
    assert DAY.isoformat() not in bookings.unavailable_dates(
        DAY.year, DAY.month, guide_id=profile_id, experience_id=200001
    )

    traveller = _make_user(db_session, "traveller-twin@example.com", "traveler")
    booking = bookings.create_booking(
        traveller.id,
        BookingCreate(
            experience_id=200001,
            experience_title="Twin account walk",
            city="Kathmandu",
            date=DAY,
            guests=1,
            price=40.0,
            guide_id=profile_id,
        ),
    )
    # The booking lands on the account that opened the date, not the older link.
    assert booking.guide_user_id == newer.id
    assert float(booking.price) == 50


def test_multi_night_booking_needs_every_night_open(db_session):
    from app.services.guide_availability_service import GuideAvailabilityService

    guide = _make_user(db_session, "guide-nights@example.com", "guide")
    traveller = _make_user(db_session, "traveller-nights@example.com", "traveler")
    service = GuideAvailabilityService(db_session)
    service.set_dates(
        guide.id, [DAY.isoformat()], "available", 200003, max_slots=5, price_per_person=60
    )

    def book(nights: int):
        return BookingService(db_session).create_booking(
            traveller.id,
            BookingCreate(
                experience_id=200003,
                experience_title="Three night trek",
                city="Pokhara",
                date=DAY,
                checkout=DAY + timedelta(days=nights),
                guests=1,
                price=60.0,
                guide_id=guide.id,
            ),
        )

    # Only the check-in night is open, so the stay is refused.
    with pytest.raises(HTTPException) as closed:
        book(3)
    assert closed.value.status_code == 409
    assert (DAY + timedelta(days=1)).isoformat() in closed.value.detail

    service.set_dates(
        guide.id,
        [(DAY + timedelta(days=offset)).isoformat() for offset in (1, 2)],
        "available",
        200003,
        max_slots=5,
    )

    booking = book(3)
    assert booking.checkout == DAY + timedelta(days=3)
    for offset in (0, 1, 2):
        entry = service.day_entry(guide.id, DAY + timedelta(days=offset), 200003)
        assert entry["remaining"] == 4

    # Cancelling gives every night's slot back, not just the check-in day.
    BookingService(db_session).cancel_booking(traveller.id, booking.id)
    for offset in (0, 1, 2):
        entry = service.day_entry(guide.id, DAY + timedelta(days=offset), 200003)
        assert entry["remaining"] == 5

def test_available_guide_ids_only_lists_guides_open_for_the_whole_stay(db_session):
    from app.services.guide_availability_service import GuideAvailabilityService

    full_stay = _make_user(db_session, "guide-picker-full@example.com", "guide")
    check_in_only = _make_user(db_session, "guide-picker-short@example.com", "guide")
    service = GuideAvailabilityService(db_session)
    service.set_dates(
        full_stay.id,
        [(DAY + timedelta(days=offset)).isoformat() for offset in (0, 1)],
        "available",
        200004,
        max_slots=3,
    )
    service.set_dates(
        check_in_only.id, [DAY.isoformat()], "available", 200004, max_slots=3
    )

    bookings = BookingService(db_session)
    candidates = [full_stay.id, check_in_only.id]

    # A two-night stay is only offered by the guide who opened both nights.
    assert bookings.available_guide_ids(
        200004,
        DAY.isoformat(),
        checkout=(DAY + timedelta(days=2)).isoformat(),
        catalog_guide_ids=candidates,
    ) == [full_stay.id]
    # One night fits both, and the watching guide is never offered to itself.
    assert sorted(
        bookings.available_guide_ids(
            200004, DAY.isoformat(), catalog_guide_ids=candidates
        )
    ) == sorted(candidates)
    assert bookings.available_guide_ids(
        200004,
        DAY.isoformat(),
        catalog_guide_ids=candidates,
        exclude_user_id=check_in_only.id,
    ) == [full_stay.id]
    # Openings are scoped per experience, so another experience lists nobody.
    assert (
        bookings.available_guide_ids(
            200005, DAY.isoformat(), catalog_guide_ids=candidates
        )
        == []
    )
