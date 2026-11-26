"""Regression test for the overbooking race.

The bug only appears with real concurrent transactions, so this test uses a
file-backed SQLite database (one connection per thread) instead of the shared
in-memory fixture.  Before the capacity claim was made atomic, eight
simultaneous one-guest bookings against a two-slot day produced six bookings.
"""

from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, date, datetime, timedelta
from threading import Barrier

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import models  # noqa: F401 - registers every table on Base.metadata
from app.core.database import Base
from app.models.booking import Booking
from app.models.guide_daily_capacity import GuideDailyCapacity
from app.models.user import User
from app.schemas.booking import BookingCreate
from app.services.booking_service import BookingService
from app.services.guide_availability_service import GuideAvailabilityService

DAY = date.today() + timedelta(days=21)
EXPERIENCE_ID = 200009
SLOTS = 2
ATTEMPTS = 8


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


def test_concurrent_bookings_cannot_overbook_a_day(tmp_path):
    engine = create_engine(
        f"sqlite:///{tmp_path / 'concurrent-bookings.db'}",
        connect_args={"check_same_thread": False, "timeout": 30},
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)

    setup = Session()
    guide = _user(setup, "guide-race@example.com", "guide")
    traveller = _user(setup, "traveller-race@example.com", "traveler")
    GuideAvailabilityService(setup).set_dates(
        guide.id, [DAY.isoformat()], "available", EXPERIENCE_ID, max_slots=SLOTS
    )
    guide_id, traveller_id = int(guide.id), int(traveller.id)
    setup.close()

    barrier = Barrier(ATTEMPTS)

    def attempt(_: int):
        session = Session()
        try:
            barrier.wait()
            booking = BookingService(session).create_booking(
                traveller_id,
                BookingCreate(
                    experience_id=EXPERIENCE_ID,
                    experience_title="Race trek",
                    city="Kathmandu",
                    date=DAY,
                    guests=1,
                    price=40.0,
                    guide_id=guide_id,
                ),
            )
            return "booked" if booking.id else "booked"
        except HTTPException as exc:
            session.rollback()
            return exc.status_code
        finally:
            session.close()

    try:
        with ThreadPoolExecutor(max_workers=ATTEMPTS) as pool:
            outcomes = list(pool.map(attempt, range(ATTEMPTS)))

        assert outcomes.count("booked") == SLOTS, outcomes
        assert all(
            outcome == "booked" or outcome == 409 for outcome in outcomes
        ), outcomes

        check = Session()
        try:
            guests = sum(
                int(booking.guests or 0)
                for booking in check.query(Booking).filter(Booking.date == DAY).all()
            )
            row = (
                check.query(GuideDailyCapacity)
                .filter(
                    GuideDailyCapacity.guide_user_id == guide_id,
                    GuideDailyCapacity.booking_date == datetime(
                        DAY.year, DAY.month, DAY.day, tzinfo=UTC
                    ),
                )
                .one()
            )
            # The bookings and the guide-day row must agree with the offer.
            assert guests == SLOTS
            assert row.booked_capacity == SLOTS
            assert row.max_capacity == SLOTS
        finally:
            check.close()
    finally:
        engine.dispose()
