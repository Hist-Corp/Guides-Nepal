"""Regression tests for the self-hosted booking guard.

A traveller may never book an experience they themselves host. The check runs
on both persistent sources a traveller-facing ``experience_id`` can resolve to:
a ``guide_listing`` and a ``host_experience``.  Mock catalogue experiences carry
no persistent host record, so the guard intentionally skips them.
"""

from datetime import UTC, datetime, timedelta

import pytest

from app.models.booking import HostExperience
from app.models.guide_listing import GuideListing
from app.models.user import User
from app.schemas.booking import BookingCreate
from app.services.booking_service import BookingService

PUBLIC_GUIDE_LISTING_ID_OFFSET = 200000
PUBLIC_HOST_EXPERIENCE_ID_OFFSET = 100000
TOMORROW = datetime.now(UTC).date() + timedelta(days=1)


def _user(db, email, role):
    u = User(
        email=email,
        firstName=role.title(),
        lastName="Test",
        hashed_password="not-a-real-hash",
        role=role,
        is_active=True,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def test_self_hosted_guide_listing_is_rejected(db_session):
    host = _user(db_session, "host-listing@example.com", "guide")
    listing = GuideListing(
        guide_user_id=host.id,
        title="Self-led trek",
        city="Kathmandu",
        category="trekking",
        description="A trek the host also tries to book.",
        duration="1 day",
        price=50.0,
        max_guests=10,
    )
    db_session.add(listing)
    db_session.commit()

    service = BookingService(db_session)
    booking_in = BookingCreate(
        experience_id=PUBLIC_GUIDE_LISTING_ID_OFFSET + int(listing.id),
        experience_title=listing.title,
        city=listing.city,
        date=TOMORROW,
        guests=2,
        price=50.0,
        guide_id=None,
    )

    from fastapi import HTTPException

    with pytest.raises(HTTPException) as exc_info:
        service.prevent_self_hosted_booking(host.id, booking_in)
    assert exc_info.value.status_code == 400
    assert "You cannot book an experience that you are hosting" in exc_info.value.detail


def test_self_hosted_host_experience_is_rejected(db_session):
    host = _user(db_session, "host-experience@example.com", "guide")
    experience = HostExperience(
        host_id=host.id,
        title="Self-hosted experience",
        slug="self-hosted-experience",
        city="Pokhara",
        category="tour",
        description="A host experience the host also tries to book.",
        price=60.0,
        duration="half day",
    )
    db_session.add(experience)
    db_session.commit()

    service = BookingService(db_session)
    booking_in = BookingCreate(
        experience_id=PUBLIC_HOST_EXPERIENCE_ID_OFFSET + int(experience.id),
        experience_title=experience.title,
        city=experience.city,
        date=TOMORROW,
        guests=2,
        price=60.0,
        guide_id=None,
    )

    from fastapi import HTTPException

    with pytest.raises(HTTPException) as exc_info:
        service.prevent_self_hosted_booking(host.id, booking_in)
    assert exc_info.value.status_code == 400
    assert "You cannot book an experience that you are hosting" in exc_info.value.detail


def test_mock_experience_is_not_rejected_by_the_self_hosted_guard(db_session):
    """Mock catalogue experiences have no persistent host record, so the guard
    skips them and lets other validators handle the booking."""
    service = BookingService(db_session)
    booking_in = BookingCreate(
        experience_id=1,  # MOCK_EXPERIENCES[0].id
        experience_title="Bhaktapur Heritage Walk",
        city="Bhaktapur",
        date=TOMORROW,
        guests=2,
        price=50.0,
        guide_id=None,
    )
    # No exception — the guard returns None for ``source == "mock"``.
    service.prevent_self_hosted_booking(7, booking_in)
