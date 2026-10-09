"""Business logic for the experience workflow (SOP-GN-EXP-001 / SOP-GN-EXP-002).

Two workflows share one lifecycle vocabulary (draft → submitted → approved /
changes_requested / rejected) but have **different approval gates**:

- Proposals (new experiences): approver = Regional Manager **or** Content Writer.
- Change requests (modifications): approver = Regional Manager **only**.

The gate itself is enforced in the API layer via
:func:`app.core.dependencies.require_role`; the service enforces state
transitions, ownership, and data validation so a mis-sequenced call can never
bypass the SOP.
"""
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.experience_workflow import (
    CHANGE_CLASS_MATERIAL,
    CHANGE_CLASS_MINOR,
    EDITABLE_STATUSES,
    STATUS_APPROVED,
    STATUS_APPLIED,
    STATUS_CANCELLED,
    STATUS_CHANGES_REQUESTED,
    STATUS_PUBLISHED,
    STATUS_REJECTED,
    STATUS_SUBMITTED,
    ExperienceChangeRequest,
    ExperienceProposal,
)
from app.models.guide_listing import GuideListing
from app.models.user import User
from app.schemas.experience_workflow import (
    ChangeRequestCreate,
    ChangeRequestUpdate,
    ExperienceDecision,
    ExperienceProposalCreate,
    ExperienceProposalUpdate,
)

# Fields a change request may touch, mapped to (min, max) length rules.
TEXT_RULES = {
    "title": (3, 160),
    "city": (2, 80),
    "area": (0, 160),
    "description": (10, 5000),
    "itinerary": (0, 5000),
    "meeting_point": (0, 300),
    "duration": (1, 80),
    "difficulty": (2, 40),
}
VALID_CATEGORIES = {"trekking", "tour", "specialized"}
CHANGEABLE_FIELDS = frozenset(TEXT_RULES) | {"category", "price", "max_guests", "is_active"}

# SOP-GN-EXP-002 §4: "Minor" = editorial only. Everything else is Material.
MINOR_FIELDS = frozenset({"description"})


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _proposal_to_dict(row: ExperienceProposal, guide: Optional[User] = None) -> dict:
    return {
        "id": row.id,
        "guide_user_id": row.guide_user_id,
        "guide_name": (
            f"{(guide.firstName or '')} {(guide.lastName or '')}".strip() or guide.email
            if guide
            else None
        ),
        "guide_email": guide.email if guide else None,
        "title": row.title,
        "category": row.category,
        "city": row.city,
        "area": row.area,
        "description": row.description,
        "itinerary": row.itinerary,
        "meeting_point": row.meeting_point,
        "duration": row.duration,
        "difficulty": row.difficulty,
        "price": row.price,
        "max_guests": row.max_guests,
        "documents": row.documents or [],
        "status": row.status,
        "submitted_at": row.submitted_at.isoformat() if row.submitted_at else None,
        "decided_at": row.decided_at.isoformat() if row.decided_at else None,
        "decided_by_user_id": row.decided_by_user_id,
        "decided_by_role": row.decided_by_role,
        "decision_notes": row.decision_notes,
        "published_at": row.published_at.isoformat() if row.published_at else None,
        "listing_id": row.listing_id,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


def _change_request_to_dict(
    row: ExperienceChangeRequest,
    guide: Optional[User] = None,
    listing: Optional[GuideListing] = None,
) -> dict:
    return {
        "id": row.id,
        "guide_user_id": row.guide_user_id,
        "guide_name": (
            f"{(guide.firstName or '')} {(guide.lastName or '')}".strip() or guide.email
            if guide
            else None
        ),
        "guide_email": guide.email if guide else None,
        "listing_id": row.listing_id,
        "listing_title": listing.title if listing else None,
        "listing_active": listing.is_active if listing else None,
        "change_class": row.change_class,
        "reason": row.reason,
        "changes": row.changes or [],
        "documents": row.documents or [],
        "status": row.status,
        "submitted_at": row.submitted_at.isoformat() if row.submitted_at else None,
        "decided_at": row.decided_at.isoformat() if row.decided_at else None,
        "decided_by_user_id": row.decided_by_user_id,
        "decided_by_role": row.decided_by_role,
        "decision_notes": row.decision_notes,
        "applied_at": row.applied_at.isoformat() if row.applied_at else None,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


def _validate_change(listing: GuideListing, field: str, proposed) -> object:
    """Coerce and validate one proposed value against the platform rules."""
    field = (field or "").strip().lower()
    if field not in CHANGEABLE_FIELDS:
        raise HTTPException(
            status_code=422,
            detail=f"Field '{field}' cannot be changed through a change request",
        )
    if field in TEXT_RULES:
        if not isinstance(proposed, str) or not proposed.strip():
            raise HTTPException(status_code=422, detail=f"Field '{field}' must be a non-empty string")
        value = proposed.strip()
        low, high = TEXT_RULES[field]
        if len(value) < low or len(value) > high:
            raise HTTPException(
                status_code=422,
                detail=f"Field '{field}' must be between {low} and {high} characters",
            )
        return value
    if field == "category":
        if proposed not in VALID_CATEGORIES:
            raise HTTPException(
                status_code=422, detail=f"category must be one of {sorted(VALID_CATEGORIES)}"
            )
        return proposed
    if field == "price":
        try:
            value = float(proposed)
        except (TypeError, ValueError):
            raise HTTPException(status_code=422, detail="price must be a number")
        if value < 0:
            raise HTTPException(status_code=422, detail="price cannot be negative")
        return value
    if field == "max_guests":
        try:
            value = int(proposed)
        except (TypeError, ValueError):
            raise HTTPException(status_code=422, detail="max_guests must be a whole number")
        if value < 1 or value > 100:
            raise HTTPException(status_code=422, detail="max_guests must be between 1 and 100")
        if value < (listing.booked_guests or 0):
            raise HTTPException(status_code=422, detail="max_guests cannot be below booked guests")
        return value
    if field == "is_active":
        if not isinstance(proposed, bool):
            raise HTTPException(status_code=422, detail="is_active must be true or false")
        return proposed
    raise HTTPException(status_code=422, detail=f"Field '{field}' cannot be changed")  # pragma: no cover


class ExperienceWorkflowService:
    def __init__(self, db: Session):
        self.db = db

    # ------------------------------------------------------------------ #
    # Proposals (SOP-GN-EXP-001)                                         #
    # ------------------------------------------------------------------ #
    def list_proposals(self, guide_id: int, status: Optional[str] = None) -> List[dict]:
        query = self.db.query(ExperienceProposal).filter(
            ExperienceProposal.guide_user_id == guide_id
        )
        if status:
            query = query.filter(ExperienceProposal.status == status)
        rows = query.order_by(ExperienceProposal.created_at.desc()).all()
        return [_proposal_to_dict(row) for row in rows]

    def get_proposal(self, guide_id: int, proposal_id: int) -> ExperienceProposal:
        row = (
            self.db.query(ExperienceProposal)
            .filter(
                ExperienceProposal.id == proposal_id,
                ExperienceProposal.guide_user_id == guide_id,
            )
            .first()
        )
        if not row:
            raise HTTPException(status_code=404, detail="Proposal not found")
        return row

    def get_proposal_dict(self, guide_id: int, proposal_id: int) -> dict:
        return _proposal_to_dict(self.get_proposal(guide_id, proposal_id))

    def create_proposal(self, guide: User, payload: ExperienceProposalCreate) -> dict:
        row = ExperienceProposal(guide_user_id=guide.id, **payload.model_dump())
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return _proposal_to_dict(row)

    def update_proposal(
        self, guide_id: int, proposal_id: int, payload: ExperienceProposalUpdate
    ) -> dict:
        row = self.get_proposal(guide_id, proposal_id)
        if row.status not in EDITABLE_STATUSES:
            raise HTTPException(
                status_code=422,
                detail=f"A {row.status} proposal cannot be edited (only draft or changes_requested)",
            )
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(row, key, value)
        self.db.commit()
        self.db.refresh(row)
        return _proposal_to_dict(row)

    def submit_proposal(self, guide_id: int, proposal_id: int) -> dict:
        row = self.get_proposal(guide_id, proposal_id)
        if row.status not in EDITABLE_STATUSES:
            raise HTTPException(
                status_code=422,
                detail=f"A {row.status} proposal cannot be submitted",
            )
        row.status = STATUS_SUBMITTED
        row.submitted_at = _now()
        # A resubmission starts the approval clock fresh (SOP: clock resets).
        row.decided_at = None
        row.decided_by_user_id = None
        row.decided_by_role = None
        row.decision_notes = None
        self.db.commit()
        self.db.refresh(row)
        return _proposal_to_dict(row)

    def withdraw_proposal(self, guide_id: int, proposal_id: int) -> dict:
        row = self.get_proposal(guide_id, proposal_id)
        if row.status != STATUS_SUBMITTED:
            raise HTTPException(status_code=422, detail="Only a submitted proposal can be withdrawn")
        row.status = STATUS_CANCELLED
        self.db.commit()
        self.db.refresh(row)
        return _proposal_to_dict(row)



    def publish_proposal(self, guide_id: int, proposal_id: int) -> dict:
        """SOP-GN-EXP-001 Step 7a: approved → live listing (within 2 business days)."""
        row = self.get_proposal(guide_id, proposal_id)
        if row.status != STATUS_APPROVED:
            raise HTTPException(
                status_code=422, detail="Only an approved proposal can be published"
            )
        if row.listing_id:
            raise HTTPException(status_code=422, detail="Proposal was already published")
        listing = GuideListing(
            guide_user_id=guide_id,
            title=row.title,
            category=row.category,
            city=row.city,
            area=row.area,
            description=row.description,
            itinerary=row.itinerary,
            meeting_point=row.meeting_point,
            duration=row.duration,
            difficulty=row.difficulty,
            price=row.price,
            max_guests=row.max_guests,
            is_active=True,  # publish live — approval gate already passed
        )
        self.db.add(listing)
        self.db.flush()
        row.listing_id = listing.id
        row.status = STATUS_PUBLISHED
        row.published_at = _now()
        self.db.commit()
        self.db.refresh(row)
        return _proposal_to_dict(row)

    def decide_proposal(
        self, user: User, proposal_id: int, payload: ExperienceDecision
    ) -> dict:
        """Record the approval-gate verdict (SOP-GN-EXP-001 Step 6)."""
        row = self.db.get(ExperienceProposal, proposal_id)
        if not row:
            raise HTTPException(status_code=404, detail="Proposal not found")
        if row.status != STATUS_SUBMITTED:
            raise HTTPException(
                status_code=422,
                detail=f"Only a submitted proposal can be decided (current: {row.status})",
            )
        notes = (payload.notes or "").strip()
        if payload.action in {"request_changes", "reject"} and not notes:
            raise HTTPException(
                status_code=422, detail="Notes are required for 'request_changes' and 'reject'"
            )
        if payload.action == "approve":
            row.status = STATUS_APPROVED
        elif payload.action == "request_changes":
            row.status = STATUS_CHANGES_REQUESTED
        else:
            row.status = STATUS_REJECTED
        row.decided_at = _now()
        row.decided_by_user_id = user.id
        row.decided_by_role = user.role  # audit: role held at decision time
        row.decision_notes = notes or "Approved"
        self.db.commit()
        self.db.refresh(row)
        return _proposal_to_dict(row)

    def queue_proposals(self, status: str = STATUS_SUBMITTED) -> List[dict]:
        """Approver inbox: proposals with guide identity attached."""
        query = self.db.query(ExperienceProposal, User).join(
            User, ExperienceProposal.guide_user_id == User.id
        )
        if status and status != "all":
            query = query.filter(ExperienceProposal.status == status)
        rows = query.order_by(ExperienceProposal.submitted_at.asc()).all()
        return [_proposal_to_dict(row, guide) for row, guide in rows]

    # ------------------------------------------------------------------ #
    # Change requests (SOP-GN-EXP-002)                                   #
    # ------------------------------------------------------------------ #
    def list_change_requests(self, guide_id: int, status: Optional[str] = None) -> List[dict]:
        query = self.db.query(ExperienceChangeRequest, GuideListing).join(
            GuideListing,
            ExperienceChangeRequest.listing_id == GuideListing.id,
            isouter=True,
        ).filter(ExperienceChangeRequest.guide_user_id == guide_id)
        if status:
            query = query.filter(ExperienceChangeRequest.status == status)
        rows = query.order_by(ExperienceChangeRequest.created_at.desc()).all()
        return [_change_request_to_dict(row, listing=listing) for row, listing in rows]


    def get_change_request(self, guide_id: int, cr_id: int) -> ExperienceChangeRequest:
        row = (
            self.db.query(ExperienceChangeRequest)
            .filter(
                ExperienceChangeRequest.id == cr_id,
                ExperienceChangeRequest.guide_user_id == guide_id,
            )
            .first()
        )
        if not row:
            raise HTTPException(status_code=404, detail="Change request not found")
        return row

    def get_change_request_dict(self, guide_id: int, cr_id: int) -> dict:
        row = self.get_change_request(guide_id, cr_id)
        listing = self._get_owned_listing(guide_id, row.listing_id)
        return _change_request_to_dict(row, listing=listing)

    def _get_owned_listing(self, guide_id: int, listing_id: int) -> GuideListing:
        listing = (
            self.db.query(GuideListing)
            .filter(
                GuideListing.id == listing_id,
                GuideListing.guide_user_id == guide_id,
            )
            .first()
        )
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        return listing

    def _build_changes(self, listing: GuideListing, changes) -> list:
        """Snapshot current values server-side and validate every proposed value.

        ``changes`` items may be ``FieldChange`` models or plain dicts.
        """
        seen = set()
        built = []
        for change in changes:
            if isinstance(change, dict):
                field, proposed = change.get("field"), change.get("proposed")
            else:
                field, proposed = change.field, change.proposed
            field = (field or "").strip().lower()
            if field in seen:
                raise HTTPException(status_code=422, detail=f"Field '{field}' listed more than once")
            seen.add(field)
            proposed = _validate_change(listing, field, proposed)
            current = getattr(listing, field)
            if current == proposed:
                raise HTTPException(
                    status_code=422,
                    detail=f"Field '{field}' proposed value equals the current value",
                )
            built.append({"field": field, "current": current, "proposed": proposed})
        if not built:
            raise HTTPException(status_code=422, detail="At least one real change is required")
        return built

    def create_change_request(self, guide: User, payload: ChangeRequestCreate) -> dict:
        listing = self._get_owned_listing(int(guide.id), payload.listing_id)
        built = self._build_changes(listing, payload.changes)
        # SOP-GN-EXP-002 §4: minor = editorial only (description); else material.
        change_class = (
            CHANGE_CLASS_MINOR
            if all(c["field"] in MINOR_FIELDS for c in built)
            else CHANGE_CLASS_MATERIAL
        )
        row = ExperienceChangeRequest(
            guide_user_id=guide.id,
            listing_id=listing.id,
            change_class=change_class,
            reason=payload.reason.strip(),
            changes=built,
            documents=[d.model_dump() for d in payload.documents],
        )
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return _change_request_to_dict(row, listing=listing)

    def update_change_request(
        self, guide_id: int, cr_id: int, payload: ChangeRequestUpdate
    ) -> dict:
        row = self.get_change_request(guide_id, cr_id)
        if row.status not in EDITABLE_STATUSES:
            raise HTTPException(
                status_code=422,
                detail=f"A {row.status} change request cannot be edited",
            )
        data = payload.model_dump(exclude_unset=True)
        listing = self._get_owned_listing(guide_id, row.listing_id)
        if "changes" in data:
            rebuilt = self._build_changes(listing, data.pop("changes"))
            row.changes = rebuilt
            row.change_class = (
                CHANGE_CLASS_MINOR
                if all(c["field"] in MINOR_FIELDS for c in rebuilt)
                else CHANGE_CLASS_MATERIAL
            )
        if "reason" in data:
            row.reason = data["reason"].strip()
        if "documents" in data:
            row.documents = data["documents"]
        self.db.commit()
        self.db.refresh(row)
        return _change_request_to_dict(row, listing=listing)


    def submit_change_request(self, guide_id: int, cr_id: int) -> dict:
        row = self.get_change_request(guide_id, cr_id)
        if row.status not in EDITABLE_STATUSES:
            raise HTTPException(
                status_code=422, detail=f"A {row.status} change request cannot be submitted"
            )
        listing = self._get_owned_listing(guide_id, row.listing_id)
        row.status = STATUS_SUBMITTED
        row.submitted_at = _now()
        # Resubmission restarts the Regional Manager's approval clock (SOP).
        row.decided_at = None
        row.decided_by_user_id = None
        row.decided_by_role = None
        row.decision_notes = None
        self.db.commit()
        self.db.refresh(row)
        return _change_request_to_dict(row, listing=listing)

    def withdraw_change_request(self, guide_id: int, cr_id: int) -> dict:
        row = self.get_change_request(guide_id, cr_id)
        if row.status != STATUS_SUBMITTED:
            raise HTTPException(
                status_code=422, detail="Only a submitted change request can be withdrawn"
            )
        listing = self._get_owned_listing(guide_id, row.listing_id)
        row.status = STATUS_CANCELLED
        self.db.commit()
        self.db.refresh(row)
        return _change_request_to_dict(row, listing=listing)

    def apply_change_request(self, guide_id: int, cr_id: int) -> dict:
        """SOP-GN-EXP-002 Step 6a: write the *approved* diffs onto the listing.

        Applying only happens after the Regional Manager's approval and never
        applies more (or less) than the reviewed ``changes`` snapshot.
        """
        row = self.get_change_request(guide_id, cr_id)
        if row.status != STATUS_APPROVED:
            raise HTTPException(
                status_code=422, detail="Only an approved change request can be applied"
            )
        listing = self._get_owned_listing(guide_id, row.listing_id)
        for change in row.changes or []:
            field, proposed = change["field"], change["proposed"]
            # Bookings may have grown since submission — re-check the capacity guard.
            if field == "max_guests" and int(proposed) < (listing.booked_guests or 0):
                raise HTTPException(status_code=422, detail="max_guests cannot be below booked guests")
            setattr(listing, field, proposed)
        row.status = STATUS_APPLIED
        row.applied_at = _now()
        self.db.commit()
        self.db.refresh(row)
        self.db.refresh(listing)
        return _change_request_to_dict(row, listing=listing)

    def decide_change_request(
        self, user: User, cr_id: int, payload: ExperienceDecision
    ) -> dict:
        """Record the Regional Manager's verdict (SOP-GN-EXP-002 Step 4)."""
        row = self.db.get(ExperienceChangeRequest, cr_id)
        if not row:
            raise HTTPException(status_code=404, detail="Change request not found")
        if row.status != STATUS_SUBMITTED:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Only a submitted change request can be decided (current: {row.status})"
                ),
            )
        notes = (payload.notes or "").strip()
        if payload.action in {"request_changes", "reject"} and not notes:
            raise HTTPException(
                status_code=422, detail="Notes are required for 'request_changes' and 'reject'"
            )
        if payload.action == "approve":
            row.status = STATUS_APPROVED
        elif payload.action == "request_changes":
            row.status = STATUS_CHANGES_REQUESTED
        else:
            row.status = STATUS_REJECTED
        row.decided_at = _now()
        row.decided_by_user_id = user.id
        row.decided_by_role = user.role  # audit: role held at decision time
        row.decision_notes = notes or "Approved"
        self.db.commit()
        self.db.refresh(row)
        listing = self.db.get(GuideListing, row.listing_id)
        return _change_request_to_dict(row, listing=listing)

    def queue_change_requests(self, status: str = STATUS_SUBMITTED) -> List[dict]:
        """Regional Manager inbox: change requests with guide + listing attached."""
        query = (
            self.db.query(ExperienceChangeRequest, User, GuideListing)
            .join(User, ExperienceChangeRequest.guide_user_id == User.id)
            .join(
                GuideListing,
                ExperienceChangeRequest.listing_id == GuideListing.id,
                isouter=True,
            )
        )
        if status and status != "all":
            query = query.filter(ExperienceChangeRequest.status == status)
        rows = query.order_by(ExperienceChangeRequest.submitted_at.asc()).all()
        return [
            _change_request_to_dict(row, guide=guide, listing=listing)
            for row, guide, listing in rows
        ]

