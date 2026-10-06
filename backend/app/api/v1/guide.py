"""Endpoints scoped to the ``guide`` role.

A guide account owns nothing but its own record, so every route here is guarded
by :func:`app.core.dependencies.require_role` and scoped to the authenticated
user id.  ``guide`` is *not* in ``SELF_REGISTERABLE_ROLES``, so the only ways to
obtain one are ``backend/seed_credentials.py`` or an admin role reassignment.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.core.roles import GUIDE, GUIDE_CAPABILITIES, role_rank
from app.models.user import User
from app.models.booking import Booking

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
