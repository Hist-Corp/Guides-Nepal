from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.roles import ADMIN, GUIDE, TRAVELER
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking_service import BookingService

router = APIRouter()

TRAVELER_OR_GUIDE = require_role(TRAVELER, GUIDE)


@router.get("/availability")
def booking_availability(
    date: str = Query(pattern=r"^\d{4}-\d{2}-\d{2}$"),
    guide_id: int | None = Query(default=None),
    experience_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    """Availability of the currently bookable guide for a calendar date."""
    return BookingService(db).availability_for_date(
        date, guide_id=guide_id, experience_id=experience_id
    )


@router.get("/availability/month")
def booking_availability_month(
    year: int = Query(ge=2020, le=2100),
    month: int = Query(ge=1, le=12),
    guide_id: int | None = Query(default=None),
    experience_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    """Dates the traveller cannot pick in the month.

    Availability is opt-in, so this lists every date the guide has not opened
    (plus any opened date that is now full); traveller calendars disable them.
    """
    return {
        "unavailable": BookingService(db).unavailable_dates(
            year, month, guide_id=guide_id, experience_id=experience_id
        )
    }


@router.get("/availability/daily")
def booking_availability_daily(
    date: str = Query(pattern=r"^\d{4}-\d{2}-\d{2}$"),
    guide_id: int | None = Query(default=None),
    experience_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    """Remaining bookable slots for a guide on a specific calendar date.

    Read from the day's ``guide_daily_capacity`` row — the same row a booking
    is checked against — so the number matches what a booking will accept.
    """
    return BookingService(db).daily_availability(
        date, guide_id=guide_id, experience_id=experience_id
    )


@router.get("/availability/month-detail")
def booking_availability_month_detail(
    year: int = Query(ge=2020, le=2100),
    month: int = Query(ge=1, le=12),
    guide_id: int | None = Query(default=None),
    experience_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    """Per-date spot counts for a month, keyed by ``YYYY-MM-DD``.

    Values come from the same ``guide_daily_capacity`` rows bookings are checked
    against, read in one query for the month. Dates without a row are omitted
    rather than estimated, so the calendar never shows a count a booking would
    not honour.
    """
    return {
        "availability": BookingService(db).month_detail(
            year, month, guide_id=guide_id, experience_id=experience_id
        )
    }


@router.get("/availability/guides")
def booking_availability_guides(
    date: str = Query(pattern=r"^\d{4}-\d{2}-\d{2}$"),
    experience_id: int = Query(ge=1),
    checkout: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    guide_ids: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_OR_GUIDE),
) -> dict:
    """Which of these guides can take this experience on the requested dates.

    Powers the traveller pages: "Who you'll meet" only lists guides whose
    calendar has every night of the stay open for this experience, and the
    booking flow asks again right before writing the reservation.
    """
    catalog_ids = [
        int(part) for part in (guide_ids or "").split(",") if part.strip().isdigit()
    ]
    return {
        "guide_ids": BookingService(db).available_guide_ids(
            experience_id,
            date,
            checkout=checkout,
            catalog_guide_ids=catalog_ids,
            exclude_user_id=current_user.id,
        )
    }


@router.get("/available-guides")
def booking_available_guides(
    date: str = Query(pattern=r"^\d{4}-\d{2}-\d{2}$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_OR_GUIDE),
) -> list[dict]:
    """Step 2 of the date-first booking flow.

    Given a date, list the guides who opened it, still have room, and have a
    bookable experience listed — each with the capacity the booking path will
    enforce.
    """
    return BookingService(db).available_guides(date, exclude_user_id=current_user.id)


@router.post("/capacity/reset")
def reset_daily_capacity(
    guide_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(ADMIN)),
) -> dict:
    """Manually trigger the daily capacity reset for all guides (or one guide).

    Admin only. Normally run automatically once per 24 hours by a scheduler.
    Only today's and older rows are cleared; future rows keep their advance
    bookings.
    """
    service = BookingService(db)
    count = service.reset_daily_capacity(guide_id)
    return {"reset_count": count, "guide_id": guide_id}


@router.get("/", response_model=list[BookingResponse])
def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_OR_GUIDE),
) -> list[BookingResponse]:
    """Bookings authored by the signed-in user. Travelers see the bookings they
    made; guides see their own booking requests (the ones assigned to their
    guide account).  The guide console's ``GET /guide/bookings`` is the
    authoritative place for a guide to act on incoming requests."""
    service = BookingService(db)
    bookings = service.get_user_bookings(current_user.id)

    # Enrich bookings with guide portfolio
    enriched_bookings = []
    for booking in bookings:
        portfolio_data = None
        if booking.guide_user_id:
            portfolio_data = service._get_guide_portfolio(booking.guide_user_id)

        booking_dict = {
            "id": booking.id,
            "user_id": booking.user_id,
            "guide_user_id": booking.guide_user_id,
            "experience_id": booking.experience_id,
            "experience_title": booking.experience_title,
            "city": booking.city,
            "date": booking.date,
            "guests": booking.guests,
            "price": booking.price,
            "image": booking.image,
            "guide_id": None,  # Booking model doesn't have guide_id (frontend catalog ID)
            "status": booking.status,
            "created_at": booking.created_at,
            "guide_portfolio": portfolio_data,
        }
        enriched_bookings.append(BookingResponse(**booking_dict))

    return enriched_bookings


@router.post("/", response_model=BookingResponse)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_OR_GUIDE),
) -> BookingResponse:
    """Create a booking. Travelers and guides can book experiences; a guide
    cannot book an experience they themselves host."""
    service = BookingService(db)
    # Reject self-hosted experiences before any mutation.
    service.prevent_self_hosted_booking(current_user.id, booking_in)
    booking = service.create_booking(current_user.id, booking_in)

    # Enrich with guide portfolio
    portfolio_data = None
    if booking.guide_user_id:
        portfolio_data = service._get_guide_portfolio(booking.guide_user_id)

    return BookingResponse(
        id=booking.id,
        user_id=booking.user_id,
        guide_user_id=booking.guide_user_id,
        experience_id=booking.experience_id,
        experience_title=booking.experience_title,
        city=booking.city,
        date=booking.date,
        guests=booking.guests,
        price=booking.price,
        image=booking.image,
        guide_id=None,  # Booking model doesn't have guide_id (frontend catalog ID)
        status=booking.status,
        created_at=booking.created_at,
        guide_portfolio=portfolio_data,
    )


@router.post("/{id}/cancel", response_model=BookingResponse)
def cancel_booking(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_OR_GUIDE),
) -> BookingResponse:
    """Cancel a booking. Only the booking owner can cancel it."""
    service = BookingService(db)
    booking = service.cancel_booking(current_user.id, id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    portfolio_data = None
    if booking.guide_user_id:
        portfolio_data = service._get_guide_portfolio(booking.guide_user_id)

    return BookingResponse(
        id=booking.id,
        user_id=booking.user_id,
        guide_user_id=booking.guide_user_id,
        experience_id=booking.experience_id,
        experience_title=booking.experience_title,
        city=booking.city,
        date=booking.date,
        guests=booking.guests,
        price=booking.price,
        image=booking.image,
        guide_id=None,
        status=booking.status,
        created_at=booking.created_at,
        guide_portfolio=portfolio_data,
    )


@router.post("/{id}/archive", response_model=BookingResponse)
def archive_booking(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_OR_GUIDE),
) -> BookingResponse:
    """Archive a booking. Only the booking owner can archive it."""
    service = BookingService(db)
    booking = service.archive_booking(current_user.id, id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    portfolio_data = None
    if booking.guide_user_id:
        portfolio_data = service._get_guide_portfolio(booking.guide_user_id)

    return BookingResponse(
        id=booking.id,
        user_id=booking.user_id,
        guide_user_id=booking.guide_user_id,
        experience_id=booking.experience_id,
        experience_title=booking.experience_title,
        city=booking.city,
        date=booking.date,
        guests=booking.guests,
        price=booking.price,
        image=booking.image,
        guide_id=None,
        status=booking.status,
        created_at=booking.created_at,
        guide_portfolio=portfolio_data,
    )
