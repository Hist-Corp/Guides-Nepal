"""Request schema for the guide availability calendar.

The calendar read responses are assembled by
:class:`app.services.guide_availability_service.GuideAvailabilityService` and
returned as plain dicts, so only the write payload needs validation here.
"""

from typing import List, Literal

from pydantic import BaseModel, Field

GuideDayTarget = Literal["available", "unavailable"]


class GuideAvailabilityUpdate(BaseModel):
    """Open or close one or more calendar dates in a single request."""

    dates: List[str] = Field(min_length=1, max_length=366)
    status: GuideDayTarget
