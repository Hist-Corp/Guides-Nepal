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