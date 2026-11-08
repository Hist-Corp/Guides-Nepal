from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum


class BookingStatus(str, Enum):
    upcoming = "upcoming"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"
    cancelled = "cancelled"
    archived = "archived"


class GuidePortfolio(BaseModel):
    """Professional portfolio of a guide for traveler booking view."""
    id: int
    name: str
    image: str
    role: str
    rating: float
    reviews: int
    bio: str
    languages: List[str]
    verified: bool
    lives_in: Optional[str] = None
    cities: List[str]
    gallery: List[str]
    years_experience: Optional[str] = None
    expertise_areas: List[str]
    listings_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class BookingBase(BaseModel):
    experience_id: int
    experience_title: str
    city: str
    date: datetime
    guests: int
    price: float
    image: Optional[str] = None
    # Backend user id of the guide/host the traveler selected. When omitted the
    # booking falls back to the default bookable guide account.
    guide_id: Optional[int] = None


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None


class BookingResponse(BookingBase):
    id: int
    user_id: int
    guide_user_id: Optional[int] = None
    status: BookingStatus
    created_at: datetime
    # Guide portfolio for the traveler to view
    guide_portfolio: Optional[GuidePortfolio] = None

    model_config = ConfigDict(from_attributes=True, exclude_none=False)
