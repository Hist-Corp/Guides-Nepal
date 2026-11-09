"""Endpoints scoped to the ``guide`` role.

A guide account owns nothing but its own record, so every route here is guarded
by :func:`app.core.dependencies.require_role` and scoped to the authenticated
user id.  ``guide`` is *not* in ``SELF_REGISTERABLE_ROLES``, so the only ways to
obtain one are ``backend/seed_credentials.py`` or an admin role reassignment.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.core.roles import GUIDE, GUIDE_CAPABILITIES, role_rank
from app.models.user import User
from app.models.booking import Booking, HostExperience
from app.models.guide_listing import GuideExperienceRequest, GuideListing
from app.schemas.guide_dashboard import (
    GuideListingCapacityUpdate,
    GuideListingCreate,
    GuideListingUpdate,
    GuideOnboardingCreate,
    GuideStatusCreate,
    GuideExperienceRequestCreate,
    GuideExperienceRequestResponse,
)
from app.services.guide_dashboard_service import GuideDashboardService
from app.api.v1.public import (
    GUIDE_LISTING_ID_OFFSET,
    HOST_EXPERIENCE_ID_OFFSET,
    resolve_experience_reference,
)

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


# The activity types the new-listing form offers on its first page.  Listings
# already use these three values; host experiences carry free text, so their
# category is normalised onto the same set ("Trekking & Hiking" -> trekking).
ACTIVITY_TYPES = ("trekking", "tour", "specialized")

_ACTIVITY_KEYWORDS = (
    ("trekking", ("trek", "hik", "climb", "summit", "expedition", "trail")),
    ("specialized", ("cook", "food", "workshop", "craft", "class", "pottery")),
    ("tour", ("tour", "walk", "heritage", "cultur", "sightsee", "city", "museum")),
)


def activity_type(raw: Optional[str]) -> str:
    """Bucket a stored category onto one of :data:`ACTIVITY_TYPES`."""
    value = (raw or "").strip().lower()
    if value in ACTIVITY_TYPES:
        return value
    for category, keywords in _ACTIVITY_KEYWORDS:
        if any(word in value for word in keywords):
            return category
    return "tour"


@router.get("/experience-options")
def guide_experience_options(guide: User = Depends(GUIDE_ONLY), db: Session = Depends(get_db)) -> list[dict]:
    """Experiences a guide can request to be assigned to, read from the database.

    Ids are the public ones the traveller routes use — host-owned experiences
    are ``100000 + id`` and approved guide listings ``200000 + id`` — so a
    request always points at a record that exists and has a page to land on.
    Each option carries the ``category`` the new-listing form filters on.  The
    guide's own listings are left out: assignment to your own experience is
    what the listing itself already is.
    """
    options = []
    host_rows = (
        db.query(HostExperience)
        .filter(HostExperience.is_active.is_(True))
        .order_by(HostExperience.title)
        .all()
    )
    for row in host_rows:
        options.append(
            {
                "id": HOST_EXPERIENCE_ID_OFFSET + int(row.id),
                "title": row.title,
                "city": row.city,
                "price": float(row.price or 0.0),
                "category": activity_type(row.category),
            }
        )
    listing_rows = (
        db.query(GuideListing)
        .filter(GuideListing.is_active.is_(True), GuideListing.guide_user_id != guide.id)
        .order_by(GuideListing.title)
        .all()
    )
    for listing in listing_rows:
        options.append(
            {
                "id": GUIDE_LISTING_ID_OFFSET + int(listing.id),
                "title": listing.title,
                "city": listing.city,
                "price": float(listing.price or 0.0),
                "category": activity_type(listing.category),
            }
        )
    options.sort(key=lambda item: ((item["title"] or "").lower(), item["id"]))
    return options


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
    listings = service.list_all_listings(int(guide.id))
    owned_listings = [item for item in listings if item.get("source") == "owned"]
    assigned_listings = [item for item in listings if item.get("source") == "assigned"]
    rows = db.query(Booking).filter(Booking.guide_user_id == guide.id).all()
    upcoming = sum(1 for b in rows if str(getattr(b.status, "value", b.status)) in {"upcoming", "accepted"})
    total_guests = sum(int(b.guests or 0) for b in rows)
    total_capacity = sum(int(item["max_guests"] or 0) for item in owned_listings)
    booked_capacity = sum(int(item["booked_guests"] or 0) for item in owned_listings)
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
            "owned_listings": len(owned_listings),
            "assigned_listings": len(assigned_listings),
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
    """The guide's own listings plus Regional-Manager assignments (read-only)."""
    return GuideDashboardService(db).list_all_listings(int(guide.id))


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
):
    GuideDashboardService(db).delete_status(int(guide.id), status_id)
    return {"status": "ok"}


# --------------------------------------------------------------------------- #
# Guide experience requests (SOP-GN-GEA-001)                                  #
# --------------------------------------------------------------------------- #


@router.post("/experience-requests", status_code=201, response_model=GuideExperienceRequestResponse)
def guide_create_experience_request(
    payload: GuideExperienceRequestCreate,
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> GuideExperienceRequestResponse:
    """A guide requests to be assigned as the 'Who you'll meet' guide on an
    existing host experience or booking.  Routes to Regional Head for review."""
    req_type = payload.request_type
    if req_type == "experience" and not payload.experience_id:
        raise HTTPException(status_code=422, detail="experience_id is required for experience requests")
    if req_type == "booking" and not payload.booking_id:
        raise HTTPException(status_code=422, detail="booking_id is required for booking requests")
    if req_type == "experience":
        reference = resolve_experience_reference(db, payload.experience_id)
        # Only experiences that live in the database can carry an assignment:
        # approving one creates a ``host_experience_guides`` row for it.
        if reference is None or reference["source"] == "mock" or not reference["is_active"]:
            raise HTTPException(status_code=404, detail="Active experience not found")
        if (
            reference["source"] == "guide_listing"
            and db.get(GuideListing, reference["record_id"]).guide_user_id == guide.id
        ):
            raise HTTPException(
                status_code=422, detail="You already own this experience listing."
            )
        # The guide sets the commercial terms the Regional Head reviews.
        if payload.price_per_person is None or payload.price_per_person <= 0:
            raise HTTPException(
                status_code=422, detail="price_per_person is required for experience requests"
            )
        if payload.slots is None:
            raise HTTPException(status_code=422, detail="slots is required for experience requests")
        if not (payload.meeting_point or "").strip():
            raise HTTPException(
                status_code=422, detail="meeting_point is required for experience requests"
            )

    # Prevent duplicate pending requests for the same target.
    existing = (
        db.query(GuideExperienceRequest)
        .filter(
            GuideExperienceRequest.guide_user_id == guide.id,
            GuideExperienceRequest.request_type == req_type,
            GuideExperienceRequest.status == "pending",
        )
    )
    if req_type == "experience":
        existing = existing.filter(GuideExperienceRequest.experience_id == payload.experience_id)
    else:
        existing = existing.filter(GuideExperienceRequest.booking_id == payload.booking_id)
    if existing.first():
        raise HTTPException(
            status_code=422,
            detail=f"A pending {req_type} request already exists for this target.",
        )

    row = GuideExperienceRequest(
        guide_user_id=guide.id,
        request_type=req_type,
        experience_id=payload.experience_id,
        booking_id=payload.booking_id,
        price_per_person=payload.price_per_person,
        slots=payload.slots,
        meeting_point=(payload.meeting_point or "").strip() or None,
        status="pending",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return GuideExperienceRequestResponse.model_validate(row)


@router.get("/experience-requests", response_model=list[GuideExperienceRequestResponse])
def guide_list_experience_requests(
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> list:
    """List the signed-in guide's own experience/booking assignment requests."""
    rows = (
        db.query(GuideExperienceRequest)
        .filter(GuideExperienceRequest.guide_user_id == guide.id)
        .order_by(GuideExperienceRequest.created_at.desc())
        .all()
    )
    return [
        {
            **GuideExperienceRequestResponse.model_validate(r).model_dump(),
            "experience_title": (
                resolve_experience_reference(db, r.experience_id) or {}
            ).get("title"),
        }
        for r in rows
    ]
