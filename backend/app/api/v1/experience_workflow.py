"""Experience workflow endpoints (SOP-GN-EXP-001 & SOP-GN-EXP-002).

Approval gates — enforced by :func:`app.core.dependencies.require_role`
(`admin` passes every guard implicitly via ``has_access``):

- **Proposals** (new experience): decided by Regional Manager **or** Content Writer.
- **Change requests** (modification): decided by Regional Manager **only**;
  the Content Writer is consulted on content/SEO impact but cannot authorize.

Guides only ever touch their own rows — every guide-scoped route filters by
the authenticated user id, so ownership cannot be forged from the client.
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.core.roles import CONTENT_MANAGER, GUIDE, REGIONAL_HEAD
from app.models.user import User
from app.schemas.experience_workflow import (
    ChangeRequestCreate,
    ChangeRequestUpdate,
    ExperienceDecision,
    ExperienceProposalCreate,
    ExperienceProposalUpdate,
)
from app.services.experience_workflow_service import ExperienceWorkflowService

router = APIRouter(prefix="/experience-workflow", tags=["experience-workflow"])

GUIDE_ONLY = require_role(GUIDE)
# SOP-GN-EXP-001 gate: Regional Manager OR Content Writer may authorize a proposal.
PROPOSAL_APPROVER = require_role(REGIONAL_HEAD, CONTENT_MANAGER)
# SOP-GN-EXP-002 gate: Regional Manager ONLY for change requests.
CHANGE_REQUEST_APPROVER = require_role(REGIONAL_HEAD)
# Queues: both approver roles read the proposal inbox; the CR queue is RM-only.
PROPOSAL_QUEUE = require_role(REGIONAL_HEAD, CONTENT_MANAGER)
CHANGE_REQUEST_QUEUE = require_role(REGIONAL_HEAD)


# --------------------------------------------------------------------------- #
# Proposals — guide side (SOP-GN-EXP-001)                                     #
# --------------------------------------------------------------------------- #
@router.get("/proposals")
def list_my_proposals(
    status: Optional[str] = Query(default=None, max_length=30),
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> list:
    return ExperienceWorkflowService(db).list_proposals(int(guide.id), status=status)


@router.post("/proposals", status_code=201)
def create_proposal(
    payload: ExperienceProposalCreate,
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> dict:
    return ExperienceWorkflowService(db).create_proposal(guide, payload)


@router.get("/proposals/{proposal_id}")
def get_my_proposal(
    proposal_id: int,
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> dict:
    return ExperienceWorkflowService(db).get_proposal_dict(int(guide.id), proposal_id)


@router.patch("/proposals/{proposal_id}")
def update_my_proposal(
    proposal_id: int,
    payload: ExperienceProposalUpdate,
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> dict:
    return ExperienceWorkflowService(db).update_proposal(int(guide.id), proposal_id, payload)


@router.post("/proposals/{proposal_id}/submit")
def submit_my_proposal(
    proposal_id: int,
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> dict:
    """Formal submission — starts the approval clock (SOP Step 4)."""
    return ExperienceWorkflowService(db).submit_proposal(int(guide.id), proposal_id)


@router.post("/proposals/{proposal_id}/withdraw")
def withdraw_my_proposal(
    proposal_id: int,
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> dict:
    return ExperienceWorkflowService(db).withdraw_proposal(int(guide.id), proposal_id)


@router.post("/proposals/{proposal_id}/publish")
def publish_my_proposal(
    proposal_id: int,
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> dict:
    """Only an approved proposal may become a live listing (SOP Step 7a)."""
    return ExperienceWorkflowService(db).publish_proposal(int(guide.id), proposal_id)


# --------------------------------------------------------------------------- #
# Proposals — approver side (approval gate)                                   #
# --------------------------------------------------------------------------- #
@router.get("/queue/proposals")
def proposal_queue(
    status: str = Query(default="submitted", max_length=30),
    approver: User = Depends(PROPOSAL_QUEUE),
    db: Session = Depends(get_db),
) -> list:
    return ExperienceWorkflowService(db).queue_proposals(status=status)


@router.post("/proposals/{proposal_id}/decision")
def decide_proposal(
    proposal_id: int,
    payload: ExperienceDecision,
    approver: User = Depends(PROPOSAL_APPROVER),
    db: Session = Depends(get_db),
) -> dict:
    """Mandatory approval gate: Regional Manager OR Content Writer."""
    return ExperienceWorkflowService(db).decide_proposal(approver, proposal_id, payload)


# --------------------------------------------------------------------------- #
# Change requests — guide side (SOP-GN-EXP-002)                               #
# --------------------------------------------------------------------------- #
@router.get("/change-requests")
def list_my_change_requests(
    status: Optional[str] = Query(default=None, max_length=30),
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> list:
    return ExperienceWorkflowService(db).list_change_requests(int(guide.id), status=status)


@router.post("/change-requests", status_code=201)
def create_change_request(
    payload: ChangeRequestCreate,
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> dict:
    return ExperienceWorkflowService(db).create_change_request(guide, payload)


@router.get("/change-requests/{cr_id}")
def get_my_change_request(
    cr_id: int,
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> dict:
    return ExperienceWorkflowService(db).get_change_request_dict(int(guide.id), cr_id)


@router.patch("/change-requests/{cr_id}")
def update_my_change_request(
    cr_id: int,
    payload: ChangeRequestUpdate,
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> dict:
    return ExperienceWorkflowService(db).update_change_request(int(guide.id), cr_id, payload)


@router.post("/change-requests/{cr_id}/submit")
def submit_my_change_request(
    cr_id: int,
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> dict:
    """Formal submission to the Regional Manager (SOP-GN-EXP-002 Step 3)."""
    return ExperienceWorkflowService(db).submit_change_request(int(guide.id), cr_id)


@router.post("/change-requests/{cr_id}/withdraw")
def withdraw_my_change_request(
    cr_id: int,
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> dict:
    return ExperienceWorkflowService(db).withdraw_change_request(int(guide.id), cr_id)


@router.post("/change-requests/{cr_id}/apply")
def apply_my_change_request(
    cr_id: int,
    guide: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> dict:
    """Apply the approved diffs to the listing (SOP-GN-EXP-002 Step 6a)."""
    return ExperienceWorkflowService(db).apply_change_request(int(guide.id), cr_id)


# --------------------------------------------------------------------------- #
# Change requests — approver side (approval gate: Regional Manager only)      #
# --------------------------------------------------------------------------- #
@router.get("/queue/change-requests")
def change_request_queue(
    status: str = Query(default="submitted", max_length=30),
    approver: User = Depends(CHANGE_REQUEST_QUEUE),
    db: Session = Depends(get_db),
) -> list:
    return ExperienceWorkflowService(db).queue_change_requests(status=status)


@router.post("/change-requests/{cr_id}/decision")
def decide_change_request(
    cr_id: int,
    payload: ExperienceDecision,
    approver: User = Depends(CHANGE_REQUEST_APPROVER),
    db: Session = Depends(get_db),
) -> dict:
    """Mandatory approval gate: Regional Manager ONLY (Content Writer cannot authorize)."""
    return ExperienceWorkflowService(db).decide_change_request(approver, cr_id, payload)
