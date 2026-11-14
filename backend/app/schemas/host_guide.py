from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class HostGuideDocument(BaseModel):
    kind: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=255)


class HostGuideCreate(BaseModel):
    """Mirrors the frontend BecomeGuidePage registration payload exactly.

    Personal: full_name, email, password, phone.
    Professional/metadata: role_title, bio, languages, cities, lives_in,
    image, gallery, nin_number, city, region, documents.
    """

    full_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: str = Field(min_length=5, max_length=40)
    nin_number: str = Field(min_length=3, max_length=80)
    # Catalog profile fields (guides table)
    role_title: str = Field(min_length=2, max_length=120)
    bio: str = Field(min_length=30, max_length=5000)
    languages: List[str] = Field(min_length=1)
    cities: List[str] = Field(min_length=1)
    lives_in: Optional[str] = Field(default=None, max_length=120)
    image: Optional[str] = Field(default=None, max_length=2000)
    gallery: List[str] = Field(default_factory=list)
    # Verification metadata (guide_applications table)
    city: Optional[str] = Field(default=None, max_length=120)
    region: Optional[str] = Field(default=None, max_length=120)
    documents: List[HostGuideDocument] = Field(default_factory=list)


class HostGuideResponse(BaseModel):
    id: int
    host_id: int
    guide_user_id: Optional[int] = None
    guide_id: Optional[int] = None
    full_name: str
    email: str
    phone: Optional[str] = None
    nin_number: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    documents: list = Field(default_factory=list)
    status: str
    # Joined catalog profile (for assignment pickers + previews)
    name: Optional[str] = None
    role_title: Optional[str] = None
    image: Optional[str] = None
    bio: Optional[str] = None
    languages: list = Field(default_factory=list)
    cities: list = Field(default_factory=list)
    verified: bool = False
    rating: float = 0.0
    reviews: int = 0

    class Config:
        from_attributes = True


class HostExperienceGuideAssign(BaseModel):
    guide_id: int
    is_primary: bool = True


class HostExperienceGuideResponse(BaseModel):
    id: int
    host_id: int
    experience_id: int
    guide_id: int
    is_primary: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
