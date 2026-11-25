"""Request schema for the guide availability calendar.

The calendar read responses are assembled by
:class:`app.services.guide_availability_service.GuideAvailabilityService` and
returned as plain dicts, so only the write payload needs validation here.
"""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field

GuideDayTarget = Literal["available", "unavailable"]


class GuideAvailabilityUpdate(BaseModel):
    """Open or close one or more calendar dates in a single request."""

    dates: List[str] = Field(min_length=1, max_length=366)
    status: GuideDayTarget
    # Open/close the dates for one listing experience; omitted means every one.
    experience_id: Optional[int] = None
    # Guest slots per date, chosen by the guide when opening; omitted keeps
    # whatever each date already has (or the listing's max_guests).
    max_slots: Optional[int] = Field(default=None, ge=1, le=100)
    # Price per person for the opened dates (the guide's offer); bookings on
    # those dates are written with it.
    price_per_person: Optional[float] = Field(default=None, ge=0)
