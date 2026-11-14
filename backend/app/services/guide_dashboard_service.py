"""Business logic for the guide dashboard (listings, capacity, status, onboarding)."""
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.booking import HostExperience
from app.models.guide_listing import GuideListing, GuideProfile, GuideStatusUpdate
from app.models.host_guide import HostExperienceGuide, HostGuide
from app.models.user import User
from app.schemas.guide_dashboard import (
    GuideListingCapacityUpdate,
    GuideListingCreate,
    GuideListingAvailabilityUpdate,
    GuideListingUpdate,
    GuideOnboardingCreate,
    GuideStatusCreate,
)


def _listing_to_dict(listing: GuideListing) -> dict:
    available = max((listing.max_guests or 0) - (listing.booked_guests or 0), 0)
    occupancy = (
        round((listing.booked_guests or 0) / listing.max_guests * 100)
        if listing.max_guests
        else 0
    )
    return {
        "id": listing.id,
        "title": listing.title,
        "category": listing.category,
        "city": listing.city,
        "area": listing.area,
        "description": listing.description,
        "itinerary": listing.itinerary,
        "meeting_point": listing.meeting_point,
        "duration": listing.duration,
        "difficulty": listing.difficulty,
        "price": listing.price,
        "max_guests": listing.max_guests,
        "is_active": listing.is_active,
        "booked_guests": listing.booked_guests or 0,
        "available_spots": available,
        "occupancy_pct": occupancy,
        "source": "owned",
        "can_edit": True,
        "can_delete": True,
        "public_slug": f"guide-{listing.id}",
    }


def _activity_type(raw: Optional[str]) -> str:
    """Normalise a free-text experience category onto the guide dashboard set."""
    value = (raw or "").strip().lower()
    if value in ("trekking", "tour", "specialized"):
        return value
    if any(word in value for word in ("trek", "hik", "climb", "summit", "expedition")):
        return "trekking"
    if any(word in value for word in ("cook", "food", "workshop", "craft", "class", "pottery")):
        return "specialized"
    return "tour"


def _assigned_to_dict(
    assignment: HostExperienceGuide,
    experience: HostExperience,
) -> dict:
    return {
        "id": 900_000_000 + int(assignment.id),
        "title": experience.title,
        "category": _activity_type(experience.category),
        "city": experience.city,
        "area": None,
        "description": experience.description or "",
        "itinerary": None,
        "meeting_point": None,
        "duration": experience.duration,
        "difficulty": "",
        "price": float(experience.price or 0.0),
        "max_guests": None,
        "is_active": bool(experience.is_active),
        "booked_guests": 0,
        "available_spots": None,
        "occupancy_pct": 0,
        "source": "assigned",
        "can_edit": False,
        "can_delete": False,
        "assignment_id": assignment.id,
        "experience_id": 100_000 + int(experience.id),
        "public_slug": f"host-{experience.slug}" if experience.slug else f"host-{experience.id}",
        "is_primary": bool(assignment.is_primary),
        "assigned_at": assignment.created_at.isoformat() if assignment.created_at else None,
        "managed_by": "Regional Manager",
    }


def _assigned_listing_to_dict(
    assignment: HostExperienceGuide,
    listing: GuideListing,
) -> dict:
    base = _listing_to_dict(listing)
    available = max((listing.max_guests or 0) - (listing.booked_guests or 0), 0)
    return {
        **base,
        "id": 900_000_000 + int(assignment.id),
        "source": "assigned",
        "can_edit": False,
        "can_delete": False,
        "assignment_id": assignment.id,
        "experience_id": 200_000 + int(listing.id),
        "public_slug": f"guide-{listing.id}",
        "is_primary": bool(assignment.is_primary),
        "available_spots": available,
        "assigned_at": assignment.created_at.isoformat() if assignment.created_at else None,
        "managed_by": "Regional Manager",
    }


class GuideDashboardService:
    def __init__(self, db: Session):
        self.db = db

    def list_listings(self, guide_id: int) -> List[dict]:
        rows = (
            self.db.query(GuideListing)
            .filter(GuideListing.guide_user_id == guide_id)
            .order_by(GuideListing.created_at.desc())
            .all()
        )
        return [_listing_to_dict(row) for row in rows]

    def list_assigned_experiences(self, guide_id: int) -> List[dict]:
        """Experiences a Regional Manager assigned to this guide's catalog profile.

        Assignments live in ``host_experience_guides``.  The target can be a
        host-owned experience or another guide's published listing, so both are
        resolved.  The guide dashboard is read-only for these rows: the Regional
        Manager owns the assignment, and the list recomputes on every request so
        approvals and withdrawals appear without a second sync job.
        """
        link = (
            self.db.query(HostGuide)
            .filter(HostGuide.guide_user_id == guide_id, HostGuide.guide_id.isnot(None))
            .order_by(HostGuide.id.asc())
            .first()
        )
        if link is None:
            return []

        assignments = (
            self.db.query(HostExperienceGuide)
            .filter(HostExperienceGuide.guide_id == link.guide_id)
            .order_by(HostExperienceGuide.created_at.desc())
            .all()
        )
        out: List[dict] = []
        for assignment in assignments:
            experience = self.db.get(HostExperience, assignment.experience_id)
            if experience is not None:
                out.append(_assigned_to_dict(assignment, experience))
                continue

            # Guide-listing approvals store ``200000 + guide_listings.id`` in
            # the shared assignment column (host experiences use their raw id).
            raw_experience_id = int(assignment.experience_id)
            listing_id = (
                raw_experience_id - 200_000
                if raw_experience_id >= 200_000
                else raw_experience_id
            )
            listing = self.db.get(GuideListing, listing_id)
            if listing is not None and listing.guide_user_id != guide_id:
                out.append(_assigned_listing_to_dict(assignment, listing))
        return out

    def list_all_listings(self, guide_id: int) -> List[dict]:
        """Owned + assigned experiences, used by My Listings and the dashboard."""
        return [*self.list_listings(guide_id), *self.list_assigned_experiences(guide_id)]

    def create_listing(self, guide: User, payload: GuideListingCreate) -> dict:
        listing = GuideListing(guide_user_id=guide.id, **payload.model_dump())
        self.db.add(listing)
        self.db.commit()
        self.db.refresh(listing)
        return _listing_to_dict(listing)

    def update_listing(self, guide_id: int, listing_id: int, payload: GuideListingUpdate) -> dict:
        listing = self._get_owned_listing(guide_id, listing_id)
        data = payload.model_dump(exclude_unset=True)
        new_max = data.get("max_guests")
        if new_max is not None and new_max < (listing.booked_guests or 0):
            raise HTTPException(status_code=422, detail="max_guests cannot be below booked guests")
        for key, value in data.items():
            setattr(listing, key, value)
        self.db.commit()
        self.db.refresh(listing)
        return _listing_to_dict(listing)

    def delete_listing(self, guide_id: int, listing_id: int) -> None:
        listing = self._get_owned_listing(guide_id, listing_id)
        self.db.delete(listing)
        self.db.commit()

    def update_capacity(self, guide_id: int, listing_id: int, payload: GuideListingCapacityUpdate) -> dict:
        listing = self._get_owned_listing(guide_id, listing_id)
        if payload.max_guests is not None:
            if payload.max_guests < (listing.booked_guests or 0):
                raise HTTPException(status_code=422, detail="max_guests cannot be below booked guests")
            listing.max_guests = payload.max_guests
        if payload.booked_delta:
            new_booked = (listing.booked_guests or 0) + payload.booked_delta
            if new_booked < 0 or new_booked > (listing.max_guests or 0):
                raise HTTPException(status_code=422, detail="booked guests out of capacity bounds")
            listing.booked_guests = new_booked
        self.db.commit()
        self.db.refresh(listing)
        return _listing_to_dict(listing)

    def update_availability(self, guide_id: int, listing_id: int, payload: GuideListingAvailabilityUpdate) -> dict:
        """Set manual availability status, recharge period, and pre-scheduling.

        availability_status is one of: "open", "closed", "paused".
        recharge_days is the forced cooldown in days after a booking.
        next_available_date is the pre-scheduled date the guide re-opens.
        capacity_threshold is the low-stock alert threshold.
        """
        listing = self._get_owned_listing(guide_id, listing_id)
        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            attr_name = key
            # Map next_available_date string to datetime if provided
            if key == "next_available_date" and value:
                from datetime import datetime

                try:
                    value = datetime.fromisoformat(value)
                except ValueError:
                    raise HTTPException(status_code=422, detail="Invalid next_available_date format")
            setattr(listing, attr_name, value)
        self.db.commit()
        self.db.refresh(listing)
        return _listing_to_dict(listing)

    def _get_owned_listing(self, guide_id: int, listing_id: int) -> GuideListing:
        listing = (
            self.db.query(GuideListing)
            .filter(GuideListing.id == listing_id, GuideListing.guide_user_id == guide_id)
            .first()
        )
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        return listing

    def list_status(self, guide_id: int, limit: int = 20) -> List[dict]:
        rows = (
            self.db.query(GuideStatusUpdate)
            .filter(GuideStatusUpdate.guide_user_id == guide_id)
            .order_by(GuideStatusUpdate.created_at.desc())
            .limit(limit)
            .all()
        )
        out = []
        for row in rows:
            out.append({
                "id": row.id,
                "update_type": row.update_type,
                "message": row.message,
                "listing_id": row.listing_id,
                "area": row.area,
                "event_date": row.event_date.isoformat() if row.event_date else None,
                "current_capacity": row.current_capacity,
                "max_capacity": row.max_capacity,
                "is_active": row.is_active,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            })
        return out

    def post_status(self, guide: User, payload: GuideStatusCreate) -> dict:
        if payload.listing_id is not None:
            self._get_owned_listing(int(guide.id), payload.listing_id)
        row = GuideStatusUpdate(guide_user_id=guide.id, **payload.model_dump())
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return self.list_status(int(guide.id), limit=50)[0]

    def delete_status(self, guide_id: int, status_id: int) -> None:
        row = (
            self.db.query(GuideStatusUpdate)
            .filter(GuideStatusUpdate.id == status_id, GuideStatusUpdate.guide_user_id == guide_id)
            .first()
        )
        if not row:
            raise HTTPException(status_code=404, detail="Status update not found")
        self.db.delete(row)
        self.db.commit()

    def get_onboarding(self, guide_id: int) -> Optional[dict]:
        profile = (
            self.db.query(GuideProfile)
            .filter(GuideProfile.guide_user_id == guide_id)
            .first()
        )
        return self._profile_to_dict(profile) if profile else None

    def save_onboarding(self, guide: User, payload: GuideOnboardingCreate) -> dict:
        profile = (
            self.db.query(GuideProfile)
            .filter(GuideProfile.guide_user_id == guide.id)
            .first()
        )
        data = payload.model_dump()
        if profile:
            for key, value in data.items():
                setattr(profile, key, value)
        else:
            profile = GuideProfile(guide_user_id=guide.id, **data)
            self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return self._profile_to_dict(profile)

    @staticmethod
    def _profile_to_dict(profile: GuideProfile) -> dict:
        return {
            "guide_user_id": profile.guide_user_id,
            "display_name": profile.display_name,
            "expertise_areas": profile.expertise_areas or [],
            "cities": profile.cities or [],
            "languages": profile.languages or [],
            "bio": profile.bio,
            "years_experience": profile.years_experience,
            "default_max_guests": profile.default_max_guests,
            "onboarding_completed": profile.onboarding_completed,
        }

