from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking_service import BookingService
from app.models.booking import Booking
from app.core.dependencies import get_current_user, require_role
from app.core.roles import TRAVELER
from app.models.user import User


router = APIRouter()

TRAVELER_ONLY = require_role(TRAVELER)


@router.get("/availability")
def booking_availability(
    date: str = Query(pattern=r"^\d{4}-\d{2}-\d{2}$"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    """Availability of the currently bookable guide for a calendar date."""
    return BookingService(db).availability_for_date(date)


@router.get("/", response_model=List[BookingResponse])
def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_ONLY),
) -> List[Booking]:
    """Bookings made by the signed-in traveler only. Other travelers and guides
    cannot see another traveler's bookings."""
    service = BookingService(db)
    return service.get_user_bookings(current_user.id)


@router.post("/", response_model=BookingResponse)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_ONLY),
) -> Booking:
    """Create a booking. Only travelers can create bookings; guides receive
    them via /guide/bookings."""
    service = BookingService(db)
    return service.create_booking(current_user.id, booking_in)


@router.post("/{id}/cancel", response_model=BookingResponse)
def cancel_booking(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_ONLY),
) -> Booking:
    """Cancel a booking. Only the booking owner (traveler) can cancel it."""
    service = BookingService(db)
    booking = service.cancel_booking(current_user.id, id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.post("/{id}/archive", response_model=BookingResponse)
def archive_booking(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(TRAVELER_ONLY),
) -> Booking:
    """Archive a booking. Only the booking owner (traveler) can archive it."""
    service = BookingService(db)
    booking = service.archive_booking(current_user.id, id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
