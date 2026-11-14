from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProfileUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class BookmarkBase(BaseModel):
    title: str
    city: Optional[str] = None
    image: Optional[str] = None
    link: Optional[str] = None


class BookmarkCreate(BookmarkBase):
    pass


class BookmarkResponse(BookmarkBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
