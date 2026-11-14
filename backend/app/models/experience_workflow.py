"""Experience workflow models: new-experience proposals and change requests.

These tables back the two SOPs that govern how Guides add or modify
experiences on Guides Nepal:

- ``ExperienceProposal``  → SOP-GN-EXP-001 (propose a brand-new experience;
  approval gate: Regional Manager **or** Content Writer).
- ``ExperienceChangeRequest`` → SOP-GN-EXP-002 (modify an existing listing;
  approval gate: Regional Manager only).

Both follow the same lifecycle: ``draft`` → ``submitted`` →
``approved`` / ``changes_requested`` / ``rejected``.  Nothing reaches a
live ``GuideListing`` without an approval decision recorded on the row
(`decided_at` / `decided_by_user_id` / `decided_by_role`).
"""
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.sql import func
from app.core.database import Base


# Status lifecycles (shared vocabulary for both workflows).
STATUS_DRAFT = "draft"
STATUS_SUBMITTED = "submitted"
STATUS_APPROVED = "approved"
STATUS_CHANGES_REQUESTED = "changes_requested"
STATUS_REJECTED = "rejected"
STATUS_PUBLISHED = "published"  # proposals only: approved + listing created
STATUS_APPLIED = "applied"      # change requests only: approved + listing updated
STATUS_CANCELLED = "cancelled"

PROPOSAL_STATUSES = frozenset(
    {
        STATUS_DRAFT,
        STATUS_SUBMITTED,
        STATUS_APPROVED,
        STATUS_CHANGES_REQUESTED,
        STATUS_REJECTED,
        STATUS_PUBLISHED,
        STATUS_CANCELLED,
    }
)
CHANGE_REQUEST_STATUSES = frozenset(
    {
        STATUS_DRAFT,
        STATUS_SUBMITTED,
        STATUS_APPROVED,
        STATUS_CHANGES_REQUESTED,
        STATUS_REJECTED,
        STATUS_APPLIED,
        STATUS_CANCELLED,
    }
)

# Statuses a guide may still edit / submit / withdraw from.
EDITABLE_STATUSES = frozenset({STATUS_DRAFT, STATUS_CHANGES_REQUESTED})

CHANGE_CLASS_MATERIAL = "material"
CHANGE_CLASS_MINOR = "minor"


class ExperienceProposal(Base):
    """A guide's proposal for a brand-new experience listing (SOP-GN-EXP-001).

    Field set mirrors :class:`app.models.guide_listing.GuideListing` so an
    approved proposal can be published as a real listing without losing data.
    """

    __tablename__ = "experience_proposals"

    id = Column(Integer, primary_key=True, index=True)
    guide_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Proposed listing content.
    title = Column(String, nullable=False)
    category = Column(String, nullable=False, default="tour")  # trekking | tour | specialized
    city = Column(String, nullable=False, default="Kathmandu")
    area = Column(String, nullable=True)
    description = Column(Text, nullable=False, default="")
    itinerary = Column(Text, nullable=True)
    meeting_point = Column(String, nullable=True)
    duration = Column(String, nullable=False, default="1 day")
    difficulty = Column(String, nullable=False, default="Easy")
    price = Column(Float, nullable=False, default=0.0)
    max_guests = Column(Integer, nullable=False, default=10)

    # Supporting documentation links (EXP-F-001 attachments D2–D6).
    documents = Column(JSON, nullable=False, default=list)

    # Workflow state.
    status = Column(String, nullable=False, default=STATUS_DRAFT, index=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    decided_at = Column(DateTime(timezone=True), nullable=True)
    decided_by_user_id = Column(Integer, nullable=True)
    decided_by_role = Column(String, nullable=True)  # role held at decision time (audit)
    decision_notes = Column(Text, nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    listing_id = Column(Integer, nullable=True)  # GuideListing created on publish

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ExperienceChangeRequest(Base):
    """A guide's proposed modification to an existing listing (SOP-GN-EXP-002).

    ``changes`` stores a JSON list of field diffs:
    ``[{"field": "price", "current": 100.0, "proposed": 120.0}]``.
    The ``current`` snapshot is taken server-side at creation time so the
    approval record shows exactly what was reviewed.  ``apply`` writes the
    approved ``proposed`` values onto the ``GuideListing`` row.
    """

    __tablename__ = "experience_change_requests"

    id = Column(Integer, primary_key=True, index=True)
    guide_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    listing_id = Column(Integer, ForeignKey("guide_listings.id"), nullable=False, index=True)

    change_class = Column(String, nullable=False, default=CHANGE_CLASS_MATERIAL)  # material | minor
    reason = Column(Text, nullable=False, default="")
    changes = Column(JSON, nullable=False, default=list)
    documents = Column(JSON, nullable=False, default=list)

    # Workflow state.
    status = Column(String, nullable=False, default=STATUS_DRAFT, index=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    decided_at = Column(DateTime(timezone=True), nullable=True)
    decided_by_user_id = Column(Integer, nullable=True)
    decided_by_role = Column(String, nullable=True)  # role held at decision time (audit)
    decision_notes = Column(Text, nullable=True)
    applied_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
