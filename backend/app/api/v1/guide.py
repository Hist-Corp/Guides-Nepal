"""Endpoints scoped to the ``guide`` role.

A guide account owns nothing but its own record, so every route here is guarded
by :func:`app.core.dependencies.require_role` and scoped to the authenticated
user id.  ``guide`` is *not* in ``SELF_REGISTERABLE_ROLES``, so the only ways to
obtain one are ``backend/seed_credentials.py`` or an admin role reassignment.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.core.roles import GUIDE, GUIDE_CAPABILITIES, role_rank
from app.models.user import User
from app.models.booking import Booking
from app.schemas.guide_dashboard import (
    GuideListingCapacityUpdate,
    GuideListingCreate,
    GuideListingUpdate,
    GuideOnboardingCreate,
    GuideStatusCreate,
)
from app.services.guide_dashboard_service import GuideDashboardService

router = APIRouter(prefix="/guide", tags=["guide"])

GUIDE_ONLY = require_role(GUIDE)


@router.get("/me")
def guide_profile(guide: User = Depends(GUIDE_ONLY), db: Session = Depends(get_db)) -> dict:
    """The signed-in guide's own record plus the capabilities its role grants."""
    return {
        "id": guide.id,
        "email": guide.email,
        "firstName": guide.firstName,
        "lastName": guide.lastName,
        "phone": guide.phone,
        "bio": guide.bio,
        "region": guide.region,
        "avatar_url": guide.avatar_url,
        "role": guide.role,
        "is_active": guide.is_active,
        "rank": role_rank(guide.role),
        "capabilities": sorted(GUIDE_CAPABILITIES),
    }


@router.get("/bookings")
def guide_bookings(guide: User = Depends(GUIDE_ONLY), db: Session = Depends(get_db)) -> list[dict]:
    """Booking requests assigned to the signed-in guide only."""
    rows = (
        db.query(Booking, User)
        .join(User, Booking.user_id == User.id)
        .filter(Booking.guide_user_id == guide.id)
        .order_by(Booking.date)
        .all()
    )
    return [
        {
            "id": booking.id,
            "experience_title": booking.experience_title,
            "city": booking.city,
            "date": booking.date,
            "guests": booking.guests,
            "price": booking.price,
            "image": booking.image,
            "status": booking.status.value if hasattr(booking.status, "value") else booking.status,
            "traveler_name": f"{traveler.firstName or ''} {traveler.lastName or ''}".strip(),
            "traveler_email": traveler.email,
        }
        for booking, traveler in rows
    ]


@router.patch("/bookings/{booking_id}")
def guide_decide_booking(
    booking_id: int, payload: dict, guide: User = Depends(GUIDE_ONLY), db: Session = Depends(get_db)
) -> dict:
    """Accept / reject / complete a booking assigned to the signed-in guide."""
    from fastapi import HTTPException
    from app.models.booking import BookingStatus

    status = (payload or {}).get("status")
    if status not in {"accepted", "rejected", "completed", "cancelled"}:
        raise HTTPException(status_code=422, detail="Status must be accepted, rejected, completed or cancelled")
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id, Booking.guide_user_id == guide.id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = BookingStatus(status)  # type: ignore[assignment]
    db.commit()
    db.refresh(booking)
    value = booking.status.value if hasattr(booking.status, "value") else booking.status
    return {"id": booking.id, "status": value}


@router.get("/dashboard")
def guide_dashboard(guide: User = Depends(GUIDE_ONLY), db: Session = Depends(get_db)) -> dict:
    """Aggregated dashboard payload: profile + listings + bookings + capacity."""
    service = GuideDashboardService(db)
    listings = service.list_listings(int(guide.id))
    rows = db.query(Booking).filter(Booking.guide_user_id == guide.id).all()
    upcoming = sum(1 for b in rows if str(getattr(b.status, "value", b.status)) in {"upcoming", "accepted"})
    total_guests = sum(int(b.guests or 0) for b in rows)
    total_capacity = sum(int(item["max_guests"] or 0) for item in listings)
    booked_capacity = sum(int(item["booked_guests"] or 0) for item in listings)
    return {
        "guide": {
            "id": guide.id,
            "email": guide.email,
            "firstName": guide.firstName,
            "lastName": guide.lastName,
            "role": guide.role,
        },
        "stats": {
            "listings": len(listings),
            "upcoming_bookings": upcoming,
            "total_guests": total_guests,
            "total_capacity": total_capacity,
            "booked_capacity": booked_capacity,
            "available_spots": max(total_capacity - booked_capacity, 0),
        },
        "listings": listings,
        "recent_status": service.list_status(int(guide.id), limit=5),
    }


@router.get("/onboarding")
def guide_get_onboarding(guide: User = Depends(GUIDE_ONLY), db: Session = Depends(get_db)) -> dict:
    profile = GuideDashboardService(db).get_onboarding(int(guide.id))
    return {"onboarding": profile, "completed": bool(profile and profile.get("onboarding_completed"))}


@router.put("/onboarding")
def guide_save_onboarding(
    payload: GuideOnboardingCreate, guide: User = Depends(GUIDE_ONLY), db: Session = Depends(get_db)
) -> dict:
    return {"onboarding": GuideDashboardService(db).save_onboarding(guide, payload)}


@router.get("/listings")
def guide_list_listings(guide: User = Depends(GUIDE_ONLY), db: Session = Depends(get_db)) -> list:
    return GuideDashboardService(db).list_listings(int(guide.id))


@router.post("/listings", status_code=201)
def guide_create_listing(
    payload: GuideListingCreate, guide: User = Depends(GUIDE_ONLY), db: Session = Depends(get_db)
) -> dict:
    return GuideDashboardService(db).create_listing(guide, payload)


@router.patch("/listings/{listing_id}")
def guide_update_listing(
    listing_id: int, payload: GuideListingUpdate, guide: User = Depends(GUIDE_ONLY), db: Session = Depends(get_db)
) -> dict:
    return GuideDashboardService(db).update_listing(int(guide.id), listing_id, payload)


@router.delete("/listings/{listing_id}")
def guide_delete_listing(
    listing_id: int, guide: User = Depends(GUIDE_ONLY), db: Session = Depends(get_db)
) -> dict:
    GuideDashboardService(db).delete_listing(int(guide.id), listing_id)
    return {"status": "ok"}


@router.patch("/listings/{listing_id}/capacity")
def guide_update_capacity(
    listing_id: int,
    payload: GuideListingCapacityUpdate,
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> dict:
    return GuideDashboardService(db).update_capacity(int(guide.id), listing_id, payload)


@router.get("/status")
def guide_list_status(
    limit: int = Query(default=20, ge=1, le=100),
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> list:
    return GuideDashboardService(db).list_status(int(guide.id), limit=limit)


@router.post("/status", status_code=201)
def guide_post_status(
    payload: GuideStatusCreate, guide: User = Depends(GUIDE_ONLY), db: Session = Depends(get_db)
) -> dict:
    return GuideDashboardService(db).post_status(guide, payload)


@router.delete("/status/{status_id}")
def guide_delete_status(
    status_id: int, guide: User = Depends(GUIDE_ONLY), db: Session = Depends(get_db)
) -> dict:
    GuideDashboardService(db).delete_status(int(guide.id), status_id)
    return {"status": "ok"}

