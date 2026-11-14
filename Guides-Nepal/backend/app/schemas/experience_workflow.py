"""Schemas for the experience workflow (SOP-GN-EXP-001 / SOP-GN-EXP-002)."""
from typing import Any, List, Literal, Optional
from pydantic import BaseModel, Field

from app.schemas.guide_dashboard import GuideCategory


class DocumentLink(BaseModel):
    """A supporting-document reference (EXP-F-001 D2–D6 / EXP-F-002 C2)."""

    name: str = Field(min_length=1, max_length=200)
    url: str = Field(min_length=1, max_length=500)


class ExperienceProposalCreate(BaseModel):
    """A brand-new experience proposal (SOP-GN-EXP-001 form EXP-F-001)."""

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
    documents: List[DocumentLink] = Field(default_factory=list)


class ExperienceProposalUpdate(BaseModel):
    """Partial edit — only allowed while the proposal is draft/changes_requested."""

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
    documents: Optional[List[DocumentLink]] = None


class ExperienceDecision(BaseModel):
    """Approver verdict — SOP approval-gate record (D8 / C5)."""

    action: Literal["approve", "request_changes", "reject"]
    notes: Optional[str] = Field(default=None, max_length=5000)


class FieldChange(BaseModel):
    """One field of an experience change request: current → proposed.

    ``current`` is ignored from the client and snapshotted server-side so the
    approval record cannot be tampered with.
    """

    field: str = Field(min_length=1, max_length=40)
    proposed: Any


class ChangeRequestCreate(BaseModel):
    """A proposed modification to an existing listing (SOP-GN-EXP-002 form EXP-F-002)."""

    listing_id: int
    reason: str = Field(min_length=5, max_length=2000)
    changes: List[FieldChange] = Field(min_length=1, max_length=30)
    documents: List[DocumentLink] = Field(default_factory=list)


class ChangeRequestUpdate(BaseModel):
    """Partial edit — only allowed while the change request is draft/changes_requested."""

    reason: Optional[str] = Field(default=None, min_length=5, max_length=2000)
    changes: Optional[List[FieldChange]] = Field(default=None, min_length=1, max_length=30)
    documents: Optional[List[DocumentLink]] = None
