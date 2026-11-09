#!/usr/bin/env python3
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class HostExperienceCreate(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    city: str = Field(min_length=2, max_length=80)
    category: str = Field(min_length=2, max_length=80)
    description: str = Field(min_length=30, max_length=5000)
    price: float = Field(gt=0)
    duration: str = Field(min_length=1, max_length=80)
    hero_image: str | None = None


class HostExperienceResponse(HostExperienceCreate):
    id: int
    slug: str
    is_active: bool
    status: Literal["draft", "listed", "archived"] = "draft"


class HostTourCreate(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    city: str = Field(min_length=2, max_length=80)
    description: str = Field(min_length=30, max_length=5000)
    itinerary: str = Field(min_length=10, max_length=5000)
    meeting_point: str = Field(min_length=2, max_length=300)
    duration: str = Field(min_length=1, max_length=80)
    difficulty: str = Field(min_length=2, max_length=40)
    max_guests: int = Field(ge=1, le=100)
    price: float = Field(gt=0)


class HostTourResponse(HostTourCreate):
    id: int
    is_active: bool


class HostBookingCreate(BaseModel):
    experience_id: int
    guest_name: str = Field(min_length=2, max_length=120)
    guest_email: str
    guest_phone: str | None = None
    date: datetime
    guests: int = Field(ge=1, le=50)
    notes: str | None = Field(default=None, max_length=2000)


class HostBookingResponse(BaseModel):
    id: int
    experience_id: int
    experience_title: str
    guest_name: str
    guest_email: str
    guest_phone: str | None
    date: datetime
    guests: int
    total_price: float
    notes: str | None
    status: Literal["upcoming", "accepted", "rejected", "completed", "cancelled"]

    class Config:
        from_attributes = True


class HostEarningsSummary(BaseModel):
    total_earnings: float
    pending_earnings: float
    completed_bookings: int
    upcoming_bookings: int
    revenue_this_month: float


class EarningsSummaryDetail(BaseModel):
    total_earnings: float
    this_period: float
    best_day: dict
    avg_per_booking: float
    by_experience: list


class Payout(BaseModel):
    id: str
    date: str
    amount: float
    status: Literal["completed", "processing", "scheduled", "failed"]
    items: int
    method: str

    class Config:
        from_attributes = True


class PayoutRequest(BaseModel):
    amount: float
