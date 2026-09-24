from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class BookingStatus(str, Enum):
    upcoming = "upcoming"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"
    cancelled = "cancelled"
    archived = "archived"


class BookingBase(BaseModel):
    experience_id: int
    experience_title: str
    city: str
    date: datetime
    guests: int
    price: float
    image: Optional[str] = None


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None


class BookingResponse(BookingBase):
    id: int
    user_id: int
    status: BookingStatus
    created_at: datetime

    class Config:
        from_attributes = True
