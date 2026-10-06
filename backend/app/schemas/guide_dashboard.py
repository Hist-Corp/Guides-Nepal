from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


GuideCategory = Literal["trekking", "tour", "specialized"]
GuideUpdateType = Literal["availability", "capacity", "booking", "schedule", "announcement"]


class GuideListingCreate(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    category: GuideCategory = "tour"
    city: str = Field(min_length=2, max_length=80)
    area: Optional[str] = Field(default=None, max_length=160)
    description: str = Field(min_length=10, max_length=5000)
    itinerary: Optional[str] = Field(default=None, max_length=5000)
    meeting_point: Optional[str] = Field(default=None, max_length=300)
    duration: str = Field(min_length=1, max_length=80)
    difficulty: str = Field(min_length=2, max_length=40)
    price: float = Field(ge=0)
    max_guests: int = Field(ge=1, le=100)
    is_active: bool = True


class GuideListingUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=160)
    category: Optional[GuideCategory] = None
    city: Optional[str] = Field(default=None, min_length=2, max_length=80)
    area: Optional[str] = Field(default=None, max_length=160)
    description: Optional[str] = Field(default=None, min_length=10, max_length=5000)
    itinerary: Optional[str] = Field(default=None, max_length=5000)
    meeting_point: Optional[str] = Field(default=None, max_length=300)
    duration: Optional[str] = Field(default=None, min_length=1, max_length=80)
    difficulty: Optional[str] = Field(default=None, min_length=2, max_length=40)
    price: Optional[float] = Field(default=None, ge=0)
    max_guests: Optional[int] = Field(default=None, ge=1, le=100)
    is_active: Optional[bool] = None


class GuideListingResponse(GuideListingCreate):
    id: int
    booked_guests: int
    available_spots: int
    occupancy_pct: int


class GuideListingCapacityUpdate(BaseModel):
    """Adjust the guest capacity of one listing.

    Either set an absolute ``max_guests`` or apply a ``booked_delta``
    (positive when travelers join, negative on cancellation).
    """

    max_guests: Optional[int] = Field(default=None, ge=1, le=100)
    booked_delta: Optional[int] = Field(default=None, ge=-100, le=100)


class GuideStatusCreate(BaseModel):
    update_type: GuideUpdateType = "announcement"
    message: str = Field(min_length=3, max_length=2000)
    listing_id: Optional[int] = None
    area: Optional[str] = Field(default=None, max_length=160)
    event_date: Optional[datetime] = None
    current_capacity: Optional[int] = Field(default=None, ge=0, le=1000)
    max_capacity: Optional[int] = Field(default=None, ge=1, le=1000)
    is_active: bool = True


class GuideStatusResponse(GuideStatusCreate):
    id: int
    created_at: Optional[datetime] = None


class GuideOnboardingCreate(BaseModel):
    display_name: Optional[str] = Field(default=None, max_length=160)
    expertise_areas: List[str] = Field(default_factory=list)
    cities: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    bio: Optional[str] = Field(default=None, max_length=5000)
    years_experience: Optional[str] = Field(default=None, max_length=40)
    default_max_guests: int = Field(default=10, ge=1, le=100)
    onboarding_completed: bool = False


class GuideOnboardingResponse(GuideOnboardingCreate):
    guide_user_id: int
