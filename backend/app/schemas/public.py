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
    gallery: List[str] = []
    is_active: bool = True

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


class ExperienceResponse(ExperienceBase):
    id: int
    host: GuideResponse
    guides: List[GuideResponse] = []

    class Config:
        from_attributes = True
