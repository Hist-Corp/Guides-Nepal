from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking_service import BookingService
from app.models.booking import Booking
from app.core.dependencies import get_current_user
from app.models.user import User


router = APIRouter()


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
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> List[Booking]:
    service = BookingService(db)
    return service.get_user_bookings(current_user.id)


@router.post("/", response_model=BookingResponse)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Booking:
    service = BookingService(db)
    return service.create_booking(current_user.id, booking_in)


@router.post("/{id}/cancel", response_model=BookingResponse)
def cancel_booking(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Booking:
    service = BookingService(db)
    booking = service.cancel_booking(current_user.id, id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.post("/{id}/archive", response_model=BookingResponse)
def archive_booking(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Booking:
    service = BookingService(db)
    booking = service.archive_booking(current_user.id, id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
