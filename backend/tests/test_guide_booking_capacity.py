"""Regression tests for capacity released by a guide's booking decision.

A declined or guide-cancelled request must return its slots to the day, exactly
like a traveller cancellation. Accepting and completing keep the slots because
the trip still stands.
"""

from datetime import date, datetime, timedelta

import pytest

from app.models.booking import BookingStatus
from app.models.guide_availability import GuideAvailabilityDate
from app.models.user import User
from app.schemas.booking import BookingCreate
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
            date=datetime(DAY.year, DAY.month, DAY.day),
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
