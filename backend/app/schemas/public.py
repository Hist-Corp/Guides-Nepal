from pydantic import BaseModel
from typing import List, Optional


class GuideBase(BaseModel):
    name: str
    image: str
    role: str
    rating: float
    reviews: int
    bio: str
    languages: List[str]
    verified: bool = False
    livesIn: Optional[str] = None
    cities: List[str]


class GuideCreate(GuideBase):
    gallery: List[str] = []


class GuideUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
    role: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    bio: Optional[str] = None
    languages: Optional[List[str]] = None
    verified: Optional[bool] = None
    livesIn: Optional[str] = None
    cities: Optional[List[str]] = None
    gallery: Optional[List[str]] = None
    is_active: Optional[bool] = None


class GuideResponse(GuideBase):
    id: int
    # Public profile URL slug (``/guidesprofile/:slug``).
    slug: Optional[str] = None
    # Login account id of the guide, so the frontend can hide a signed-in
    # guide from their own "Who you'll meet" list.
    userId: Optional[int] = None
    gallery: List[str] = []
    is_active: bool = True
    # Commercial terms of the guide's approved assignment for this experience,
    # so "Who you'll meet" can show a price per guide.
    price: Optional[float] = None
    slots: Optional[int] = None

    class Config:
        from_attributes = True


class ExperienceBase(BaseModel):
    slug: str
    title: str
    heroImage: str
    description: str
    price: Optional[float] = None
    duration: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    # Live capacity of a published guide listing, so the traveller booking card
    # can show the remaining slots. None for rows without capacity tracking.
    maxGuests: Optional[int] = None
    bookedGuests: Optional[int] = None
    availableSlots: Optional[int] = None


class ExperienceResponse(ExperienceBase):
    id: int
    host: GuideResponse
    guides: List[GuideResponse] = []

    class Config:
        from_attributes = True
