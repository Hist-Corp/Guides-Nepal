from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.booking import BookingCreate, BookingResponse, GuidePortfolio
from app.services.booking_service import BookingService
from app.models.booking import Booking
from app.core.dependencies import get_current_user, require_role
from app.core.roles import ADMIN, GUIDE, TRAVELER
from app.models.user import User
from app.models.host_guide import HostGuide
from app.models.guide import Guide
from app.models.guide_listing import GuideProfile, GuideListing
from app.models.guide_daily_capacity import GuideDailyCapacity
from datetime import datetime, timezone


router = APIRouter()

TRAVELER_OR_GUIDE = require_role(TRAVELER, GUIDE)


@router.get("/availability")
def booking_availability(
    date: str = Query(pattern=r"^\d{4}-\d{2}-\d{2}$"),
    guide_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    """Availability of the currently bookable guide for a calendar date."""
    return BookingService(db).availability_for_date(date, guide_id=guide_id)


@router.get("/availability/month")
def booking_availability_month(
    year: int = Query(ge=2020, le=2100),
    month: int = Query(ge=1, le=12),
    guide_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    """Unavailable dates for the currently bookable guide in a given month."""
    unavailable = BookingService(db).availability_for_month(year, month, guide_id=guide_id)
    return {"unavailable": unavailable}


@router.get("/availability/daily")
def booking_availability_daily(
    date: str = Query(pattern=r"^\d{4}-\d{2}-\d{2}$"),
    guide_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    """Remaining bookable slots for a guide on a specific calendar date.

    Uses the per-day ``guide_daily_capacity`` table so the total number of
    bookings per day never exceeds ``max_capacity``.
    """
    target_date = datetime.strptime(date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    if guide_id is not None:
        guide_user_id = BookingService(db)._resolve_guide_user_id(guide_id)
        if guide_user_id is None:
            return {"available": True, "remaining": 0, "max_capacity": 0, "booked_capacity": 0}
    else:
        guide_user_id = BookingService(db).get_booking_guide().id
    return BookingService(db).get_daily_availability(guide_user_id, target_date)


@router.post("/capacity/reset")
def reset_daily_capacity(
    guide_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(ADMIN)),
) -> dict:
    """Manually trigger the daily capacity reset for all guides (or one guide).

    Admin only.  Normally run automatically once per 24 hours by a scheduler.
    """
    service = BookingService(db)
    count = service.reset_daily_capacity(guide_id)
    return {"reset_count": count, "guide_id": guide_id}


@router.get("/", response_model=List[BookingResponse])
def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_OR_GUIDE),
) -> List[BookingResponse]:
    """Bookings made by the signed-in user. Travelers see their own bookings;
    guides see bookings made under their guide account."""
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