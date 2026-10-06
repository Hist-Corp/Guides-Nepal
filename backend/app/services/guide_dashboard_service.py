"""Business logic for the guide dashboard (listings, capacity, status, onboarding)."""
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.guide_listing import GuideListing, GuideProfile, GuideStatusUpdate
from app.models.user import User
from app.schemas.guide_dashboard import (
    GuideListingCapacityUpdate,
    GuideListingCreate,
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

