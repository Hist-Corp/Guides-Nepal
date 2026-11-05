"""Operations endpoints: host/guide applications and support tickets.

Role guards (via ``has_access``):
- Host applications: admin / regional-head
  (regional heads manage applications for their region).
- Guide applications: admin / regional-head — stored in the dedicated
  ``guide_applications`` table, separate from ``host_applications``.
- Support tickets: admin / customer-support.
Admin is the highest role and is authorized on both guard groups.

Host credential lifecycle (unified login): the applicant's password is
captured as a bcrypt hash on the *application* row; the ``users`` login
row (role=host) is minted only when regional-head/admin approves. One
row then works on the Host Dashboard and the Host Frontend.
"""

import hashlib
import json
import secrets
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.roles import ADMIN, CUSTOMER_SUPPORT, GUIDE, HOST, REGIONAL_HEAD
from app.core.security import get_password_hash, validate_password_strength
from app.models.booking import Booking, HostExperience
from app.models.guide_application import GuideApplication
from app.models.guide_listing import GuideExperienceRequest
from app.models.host_application import HostApplication
from app.models.host_guide import HostExperienceGuide, HostGuide
from app.models.support_ticket import SupportTicket
from app.models.user import User
from app.schemas.guide_dashboard import (
    GuideExperienceRequestReview,
    GuideExperienceRequestResponse,
)

router = APIRouter()

APPLICATION_STAFF = [ADMIN, REGIONAL_HEAD]
TICKET_STAFF = [ADMIN, CUSTOMER_SUPPORT]
GUIDE_APPLICATION_UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "private_guide_applications"


class HostApplicationCreate(BaseModel):
    host_name: str
    email: EmailStr
    city: Optional[str] = None
    region: Optional[str] = None
    phone: Optional[str] = None
    experience: Optional[str] = None
    # Chosen by the applicant at registration. Stored only as a bcrypt hash
    # on the application row; the real login account is minted at approval.
    # Optional so staff can also create applications by hand (those need a
    # password invite before login can be issued).
    password: Optional[str] = None


class HostApplicationReview(BaseModel):
    status: str  # approved / rejected / pending
    review_note: Optional[str] = None


class HostCredentialSetup(BaseModel):
    """Password captured with the application (plain, hashed server-side)."""

    password: str


def _ensure_host_application_columns(db: Session) -> None:
    """Add credential-lifecycle columns to pre-existing SQLite tables."""
    try:
        inspector = inspect(db.bind)
        if "host_applications" not in inspector.get_table_names():
            return
        existing = {c["name"] for c in inspector.get_columns("host_applications")}
        for name, ddl in {
            "credential_token_hash": "VARCHAR",
            "credential_password_hash": "VARCHAR",
            "details_json": "TEXT",
            "user_id": "INTEGER",
            "reviewed_by": "VARCHAR",
            "review_note": "VARCHAR",
            "reviewed_at": "DATETIME",
        }.items():
            if name not in existing:
                db.execute(text(f"ALTER TABLE host_applications ADD COLUMN {name} {ddl}"))
        db.commit()
    except Exception:
        db.rollback()


def _hash_setup_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _provision_host_user(db: Session, app: HostApplication) -> User:
    """Mint (or re-link) the login account for an approved application.

    Idempotent: re-approving returns the linked user. Raises 409 when the
    email belongs to a *different* user, so approval can never hijack
    another account.
    """
    if app.user_id is not None:
        user = db.get(User, app.user_id)
        if user is not None:
            if user.role != HOST:
                user.role = HOST
            user.is_active = True
            db.commit()
            db.refresh(user)
            return user
    email = (app.email or "").strip().lower()
    if not email:
        raise HTTPException(status_code=422, detail="Application has no email address")
    if db.query(User).filter(User.email == email).first() is not None:
        raise HTTPException(
            status_code=409,
            detail="This email is already registered to another account.",
        )
    if not app.credential_password_hash:
        raise HTTPException(
            status_code=422,
            detail="No password was captured with this application.",
        )
    parts = (app.host_name or "").strip().split(" ", 1)
    user = User(
        email=email,
        firstName=parts[0] if parts[0] else "Host",
        lastName=parts[1] if len(parts) > 1 else "",
        hashed_password=app.credential_password_hash,
        phone=app.phone,
        role=HOST,
        region=app.region,
        is_active=True,
    )
    db.add(user)
    db.flush()
    app.user_id = user.id
    db.commit()
    db.refresh(user)
    return user


    db.commit()
    db.refresh(user)
    return user


def _ensure_guide_application_columns(db: Session) -> None:
    """Add credential-lifecycle columns to pre-existing SQLite tables."""
    try:
        inspector = inspect(db.bind)
        if "guide_applications" not in inspector.get_table_names():
            return
        existing = {c["name"] for c in inspector.get_columns("guide_applications")}
        for name, ddl in {
            "credential_token_hash": "VARCHAR",
            "credential_password_hash": "VARCHAR",
            "details_json": "TEXT",
            "user_id": "INTEGER",
            "reviewed_by": "VARCHAR",
            "review_note": "VARCHAR",
            "reviewed_at": "DATETIME",
        }.items():
            if name not in existing:
                db.execute(text(f"ALTER TABLE guide_applications ADD COLUMN {name} {ddl}"))
        db.commit()
    except Exception:
        db.rollback()


def _provision_guide_user(db: Session, app: GuideApplication) -> User:
    """Mint (or re-link) the login account for an approved guide application.

    Idempotent: re-approving returns the linked user. Raises 409 when the
    email belongs to a *different* user, so approval can never hijack
    another account.
    """
    if app.user_id is not None:
        user = db.get(User, app.user_id)
        if user is not None:
            if user.role != GUIDE:
                user.role = GUIDE
            user.is_active = True
            db.commit()
            db.refresh(user)
            return user
    email = (app.email or "").strip().lower()
    if not email:
        raise HTTPException(status_code=422, detail="Application has no email address")
    if db.query(User).filter(User.email == email).first() is not None:
        raise HTTPException(
            status_code=409,
            detail="This email is already registered to another account.",
        )
    if not app.credential_password_hash:
        raise HTTPException(
            status_code=422,
            detail="No password was captured with this application.",
        )
    parts = (app.full_name or "").strip().split(" ", 1)
    user = User(
        email=email,
        firstName=parts[0] if parts[0] else "Guide",
        lastName=parts[1] if len(parts) > 1 else "",
        hashed_password=app.credential_password_hash,
        phone=app.phone,
        role=GUIDE,
        region=app.region,
        is_active=True,
    )
    db.add(user)
    db.flush()
    app.user_id = user.id
    db.commit()
    db.refresh(user)
    return user


class GuideApplicationCreate(BaseModel):
    full_name: str
    email: str
    city: Optional[str] = None
    region: Optional[str] = None
    phone: Optional[str] = None
    nin_number: Optional[str] = None
    documents: Optional[str] = None
    # Chosen by the applicant at registration. Stored only as a bcrypt hash
    # on the application row; the real login account is minted at approval.
    password: Optional[str] = None


class GuideApplicationReview(BaseModel):
    status: str  # approved / rejected / pending
    review_note: Optional[str] = None


class SupportTicketCreate(BaseModel):
    subject: str
    description: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    priority: Optional[str] = "medium"


class SupportTicketUpdate(BaseModel):
    status: Optional[str] = None  # open / in_progress / resolved / closed
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None  # support staff resolution note


# ---------------- Host applications ----------------


@router.get("/host-applications")
def list_host_applications(
    region: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(*APPLICATION_STAFF)),
):
    query = db.query(HostApplication)
    # Regional heads only see applications for their assigned region.
    if current_user.role == REGIONAL_HEAD and current_user.region:
        query = query.filter(HostApplication.region == current_user.region)
    elif region:
        query = query.filter(HostApplication.region == region)
    if status_filter:
        query = query.filter(HostApplication.status == status_filter)
    apps = query.order_by(HostApplication.created_at.desc()).all()
    return [
        {
            "id": application.id,
            "host_name": a.host_name,
            "email": a.email,
            "city": a.city,
            "region": a.region,
            "phone": a.phone,
            "experience": a.experience,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in apps
    ]


@router.post("/host-applications", status_code=status.HTTP_201_CREATED)
def create_host_application(payload: HostApplicationCreate, db: Session = Depends(get_db)):
    _ensure_host_application_columns(db)
    data = payload.model_dump()
    plaintext_password = data.pop("password", None)
    app = HostApplication(**data, status="pending")
    if plaintext_password:
        valid, msg = validate_password_strength(plaintext_password)
        if not valid:
            raise HTTPException(status_code=422, detail=msg)
        app.credential_password_hash = get_password_hash(plaintext_password)
    db.add(app)
    db.commit()
    db.refresh(app)
    return {"id": app.id, "status": app.status}


@router.patch("/host-applications/{application_id}")
def review_host_application(
    application_id: int,
    payload: HostApplicationReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(*APPLICATION_STAFF)),
):
    if payload.status not in ("approved", "rejected", "pending"):
        raise HTTPException(status_code=422, detail="Invalid status")
    _ensure_host_application_columns(db)
    app = db.get(HostApplication, application_id)
    if app is None:
        raise HTTPException(status_code=404, detail="Host application not found")
    # Regional heads may only act within their own region.
    if current_user.role == REGIONAL_HEAD and current_user.region and app.region != current_user.region:
        raise HTTPException(status_code=403, detail="Application outside your region")

    # Record the reviewer's decision on the application row itself.
    app.status = payload.status
    app.reviewed_by = current_user.email
    app.review_note = payload.review_note
    from datetime import datetime, timezone

    app.reviewed_at = datetime.now(timezone.utc)

    user = None
    if payload.status == "approved":
        # Approval is the single moment the login account is minted and
        # activated. Before this, the applicant has no usable credentials.
        user = _provision_host_user(db, app)
    db.commit()
    return {
        "id": app.id,
        "status": app.status,
        "login_email": user.email if user else None,
        "user_id": user.id if user else app.user_id,
    }


@router.get("/host/me/application")
def get_my_host_application(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the current user's host application status for the dashboard.

    A host can only reach this endpoint once they have a login account
    (minted at approval), so the linked application is guaranteed to exist
    and be approved.
    """
    _ensure_host_application_columns(db)
    app = (
        db.query(HostApplication)
        .filter(HostApplication.email == current_user.email)
        .order_by(HostApplication.created_at.desc())
        .first()
    )
    if app is None:
        raise HTTPException(status_code=404, detail="No host application found")
    return {
        "status": app.status,
        "reviewed_by": app.reviewed_by,
        "reviewed_at": app.reviewed_at.isoformat() if app.reviewed_at else None,
    }


# ---------------- Guide applications (separate from Hosts) ----------------


@router.get("/guide-applications")
def list_guide_applications(
    region: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(*APPLICATION_STAFF)),
):
    query = db.query(GuideApplication)
    # Regional heads only see applications for their assigned region.
    if current_user.role == REGIONAL_HEAD:
        if not current_user.region:
            raise HTTPException(status_code=403, detail="Regional head has no assigned region")
        query = query.filter(GuideApplication.region == current_user.region)
    elif region:
        query = query.filter(GuideApplication.region == region)
    if status_filter:
        query = query.filter(GuideApplication.status == status_filter)
    apps = query.order_by(GuideApplication.created_at.desc()).all()
    results = []
    for application in apps:
        try:
            details = json.loads(application.details_json or "{}")
        except (TypeError, json.JSONDecodeError):
            details = {}
        files = details.get("files", {}) if isinstance(details, dict) else {}
        results.append({
            "id": application.id,
            "full_name": application.full_name,
            "email": application.email,
            "city": application.city,
            "region": application.region,
            "phone": application.phone,
            "nin_number": application.nin_number,
            "documents": application.documents,
            "uploaded_files": [
                {"key": key, "filename": item.get("filename"), "content_type": item.get("content_type")}
                for key, item in files.items()
                if isinstance(item, dict)
            ],
            "status": application.status,
            "created_at": application.created_at.isoformat() if application.created_at else None,
        })
    return results


@router.get("/guide-applications/{application_id}/documents/{document_key}")
def get_guide_application_document(
    application_id: int,
    document_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(*APPLICATION_STAFF)),
):
    application = db.get(GuideApplication, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Guide application not found")
    if current_user.role == REGIONAL_HEAD:
        if not current_user.region:
            raise HTTPException(status_code=403, detail="Regional head has no assigned region")
        if application.region != current_user.region:
            raise HTTPException(status_code=403, detail="Application outside your region")

    try:
        details = json.loads(application.details_json or "{}")
        metadata = details.get("files", {}).get(document_key)
    except (TypeError, json.JSONDecodeError, AttributeError):
        metadata = None
    if not isinstance(metadata, dict):
        raise HTTPException(status_code=404, detail="Application document not found")
    stored_name = metadata.get("stored_name")
    if not isinstance(stored_name, str) or Path(stored_name).name != stored_name:
        raise HTTPException(status_code=404, detail="Application document not found")
    document_path = GUIDE_APPLICATION_UPLOAD_ROOT / stored_name
    if not document_path.is_file():
        raise HTTPException(status_code=404, detail="Application document not found")
    return FileResponse(
        document_path,
        media_type=metadata.get("content_type", "application/octet-stream"),
        filename=metadata.get("filename", document_key),
        content_disposition_type="inline",
    )


@router.delete("/guide-applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_guide_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(*APPLICATION_STAFF)),
):
    application = db.get(GuideApplication, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Guide application not found")
    if current_user.role == REGIONAL_HEAD:
        if not current_user.region:
            raise HTTPException(status_code=403, detail="Regional head has no assigned region")
        if application.region != current_user.region:
            raise HTTPException(status_code=403, detail="Application outside your region")
    try:
        details = json.loads(application.details_json or "{}")
        files = details.get("files", {})
    except (TypeError, json.JSONDecodeError, AttributeError):
        files = {}
    stored_paths = [
        GUIDE_APPLICATION_UPLOAD_ROOT / item["stored_name"]
        for item in files.values()
        if isinstance(item, dict)
        and isinstance(item.get("stored_name"), str)
        and Path(item["stored_name"]).name == item["stored_name"]
    ] if isinstance(files, dict) else []
    db.delete(application)
    if application.user_id is not None:
        guide_user = db.get(User, application.user_id)
        if guide_user is not None:
            guide_user.is_active = False
    db.commit()
    for stored_path in stored_paths:
        stored_path.unlink(missing_ok=True)
    return None


@router.post("/guide-applications", status_code=status.HTTP_201_CREATED)
def create_guide_application(payload: GuideApplicationCreate, db: Session = Depends(get_db)):
    _ensure_guide_application_columns(db)
    data = payload.model_dump()
    plaintext_password = data.pop("password", None)
    app = GuideApplication(**data, status="pending")
    if plaintext_password:
        valid, msg = validate_password_strength(plaintext_password)
        if not valid:
            raise HTTPException(status_code=422, detail=msg)
        app.credential_password_hash = get_password_hash(plaintext_password)
    db.add(app)
    db.commit()
    db.refresh(app)
    return {"id": app.id, "status": app.status}


@router.patch("/guide-applications/{application_id}")
def review_guide_application(
    application_id: int,
    payload: GuideApplicationReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(*APPLICATION_STAFF)),
):
    if payload.status not in ("approved", "rejected", "pending"):
        raise HTTPException(status_code=422, detail="Invalid status")
    _ensure_guide_application_columns(db)
    app = db.get(GuideApplication, application_id)
    if app is None:
        raise HTTPException(status_code=404, detail="Guide application not found")
    # Regional heads may only act within their own region.
    if current_user.role == REGIONAL_HEAD:
        if not current_user.region:
            raise HTTPException(status_code=403, detail="Regional head has no assigned region")
        if app.region != current_user.region:
            raise HTTPException(status_code=403, detail="Application outside your region")

    # Record the reviewer's decision on the application row itself.
    app.status = payload.status
    app.reviewed_by = current_user.email
    app.review_note = payload.review_note
    from datetime import datetime, timezone

    app.reviewed_at = datetime.now(timezone.utc)

    user = None
    if payload.status == "approved":
        # Approval is the single moment the login account is minted and
        # activated. Before this, the applicant has no usable credentials.
        user = _provision_guide_user(db, app)
    db.commit()
    return {
        "id": app.id,
        "status": app.status,
        "login_email": user.email if user else None,
        "user_id": user.id if user else app.user_id,
    }


# ---------------- Guide experience requests (Regional Head review queue) ----------------


@router.get("/guide-experience-requests")
def list_guide_experience_requests(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(*APPLICATION_STAFF)),
):
    """Regional Head (or admin) queue of guide experience assignment requests.

    Regional heads only see requests for guides in their assigned region.
    """
    query = db.query(GuideExperienceRequest)
    # Regional heads only see requests for guides in their region.
    if current_user.role == REGIONAL_HEAD:
        if not current_user.region:
            raise HTTPException(status_code=403, detail="Regional head has no assigned region")
        # Join users to filter by region.
        query = query.join(User, GuideExperienceRequest.guide_user_id == User.id).filter(
            User.region == current_user.region
        )
    if status_filter:
        query = query.filter(GuideExperienceRequest.status == status_filter)
    rows = query.order_by(GuideExperienceRequest.created_at.desc()).all()
    results = []
    for row in rows:
        guide = db.get(User, row.guide_user_id)
        experience = None
        booking = None
        if row.experience_id:
            experience = db.query(HostExperience).filter(HostExperience.id == row.experience_id).first()
        if row.booking_id:
            booking = db.get(Booking, row.booking_id)
        results.append({
            "id": row.id,
            "guide_user_id": row.guide_user_id,
            "guide_name": f"{(guide.firstName or '')} {(guide.lastName or '')}".strip() or guide.email if guide else None,
            "guide_email": guide.email if guide else None,
            "guide_region": guide.region if guide else None,
            "experience_id": row.experience_id,
            "experience_title": experience.title if experience else None,
            "booking_id": row.booking_id,
            "booking_title": booking.experience_title if booking else None,
            "booking_date": booking.date.isoformat() if booking and booking.date else None,
            "request_type": row.request_type,
            "status": row.status,
            "reviewed_by": row.reviewed_by,
            "reviewed_at": row.reviewed_at.isoformat() if row.reviewed_at else None,
            "review_notes": row.review_notes,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        })
    return results


@router.patch("/guide-experience-requests/{request_id}/review")
def review_guide_experience_request(
    request_id: int,
    payload: GuideExperienceRequestReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(*APPLICATION_STAFF)),
):
    """Regional Head (or admin) approves or rejects a guide experience request.

    On approval, a HostExperienceGuide link is created so the guide appears
    in the Traveller-facing 'Who you'll meet' section of the experience page.
    """
    if payload.status not in ("approved", "rejected"):
        raise HTTPException(status_code=422, detail="Invalid status")

    row = db.get(GuideExperienceRequest, request_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Guide experience request not found")

    # Regional heads may only act on guides in their region.
    if current_user.role == REGIONAL_HEAD:
        if not current_user.region:
            raise HTTPException(status_code=403, detail="Regional head has no assigned region")
        guide = db.get(User, row.guide_user_id)
        if not guide or guide.region != current_user.region:
            raise HTTPException(status_code=403, detail="Request outside your region")

    row.status = payload.status
    row.reviewed_by = current_user.id
    row.reviewed_at = func.now()
    row.review_notes = payload.review_notes

    # On approval, create the HostExperienceGuide link so the guide shows on
    # the Traveller-facing experience page.
    if payload.status == "approved":

        if row.request_type == "experience" and row.experience_id:
            existing_link = (
                db.query(HostExperienceGuide)
                .filter(
                    HostExperienceGuide.experience_id == row.experience_id,
                    HostExperienceGuide.guide_id.isnot(None),
                )
                .first()
            )
            if not existing_link:
                # Resolve the guide's catalog profile id via host_guides.
                hg = (
                    db.query(HostGuide)
                    .filter(HostGuide.guide_user_id == row.guide_user_id)
                    .first()
                )
                if hg and hg.guide_id:
                    link = HostExperienceGuide(
                        host_id=current_user.id if current_user.role == REGIONAL_HEAD else 0,
                        experience_id=row.experience_id,
                        guide_id=hg.guide_id,
                        is_primary=True,
                    )
                    db.add(link)
        elif row.request_type == "booking" and row.booking_id:
            booking = db.get(Booking, row.booking_id)
            if booking:
                hg = (
                    db.query(HostGuide)
                    .filter(HostGuide.guide_user_id == row.guide_user_id)
                    .first()
                )
                if hg and hg.guide_id:
                    existing_link = (
                        db.query(HostExperienceGuide)
                        .filter(
                            HostExperienceGuide.experience_id == booking.experience_id,
                            HostExperienceGuide.guide_id.isnot(None),
                        )
                        .first()
                    )
                    if not existing_link:
                        link = HostExperienceGuide(
                            host_id=current_user.id if current_user.role == REGIONAL_HEAD else 0,
                            experience_id=booking.experience_id,
                            guide_id=hg.guide_id,
                            is_primary=False,
                        )
                        db.add(link)

    db.commit()
    db.refresh(row)
    return {
        "id": row.id,
        "status": row.status,
        "reviewed_by": row.reviewed_by,
        "reviewed_at": row.reviewed_at.isoformat() if row.reviewed_at else None,
        "review_notes": row.review_notes,
    }


# ---------------- Support tickets ----------------


@router.get("/support-tickets")
def list_support_tickets(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(*TICKET_STAFF)),
):
    query = db.query(SupportTicket)
    if status_filter:
        query = query.filter(SupportTicket.status == status_filter)
    tickets = query.order_by(SupportTicket.created_at.desc()).all()
    return [
        {
            "id": t.id,
            "subject": t.subject,
            "description": t.description,
            "customer_name": t.customer_name,
            "customer_email": t.customer_email,
            "status": t.status,
            "priority": t.priority,
            "assigned_to": t.assigned_to,
            "resolution": t.resolution,
            "resolved_at": t.resolved_at.isoformat() if t.resolved_at else None,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in tickets
    ]


@router.post("/support-tickets", status_code=status.HTTP_201_CREATED)
def create_support_ticket(payload: SupportTicketCreate, db: Session = Depends(get_db)):
    ticket = SupportTicket(**payload.model_dump(), status="open")
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return {"id": ticket.id, "status": ticket.status}


@router.patch("/support-tickets/{ticket_id}")
def update_support_ticket(
    ticket_id: int,
    payload: SupportTicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(*TICKET_STAFF)),
):
    ticket = db.get(SupportTicket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    if payload.status is not None:
        if payload.status not in ("open", "in_progress", "resolved", "closed"):
            raise HTTPException(status_code=422, detail="Invalid status")
        ticket.status = payload.status
    if payload.priority is not None:
        if payload.priority not in ("low", "medium", "high", "urgent"):
            raise HTTPException(status_code=422, detail="Invalid priority")
        ticket.priority = payload.priority
    if payload.assigned_to is not None:
        ticket.assigned_to = payload.assigned_to
    if payload.resolution is not None:
        ticket.resolution = payload.resolution
        if payload.resolution.strip():
            ticket.resolved_at = func.now()
    db.commit()
    db.refresh(ticket)
    return {
        "id": ticket.id,
        "status": ticket.status,
        "priority": ticket.priority,
        "assigned_to": ticket.assigned_to,
        "resolution": ticket.resolution,
        "resolved_at": ticket.resolved_at.isoformat() if ticket.resolved_at else None,
    }


@router.get("/support-tickets/{ticket_id}")
def get_support_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(*TICKET_STAFF)),
):
    ticket = db.get(SupportTicket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    return {
        "id": ticket.id,
        "subject": ticket.subject,
        "description": ticket.description,
        "customer_name": ticket.customer_name,
        "customer_email": ticket.customer_email,
        "status": ticket.status,
        "priority": ticket.priority,
        "assigned_to": ticket.assigned_to,
        "resolution": ticket.resolution,
        "resolved_at": ticket.resolved_at.isoformat() if ticket.resolved_at else None,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None,
    }