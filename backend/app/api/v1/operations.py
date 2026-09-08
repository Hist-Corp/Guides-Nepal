"""Operations endpoints: host applications and support tickets.

Role guards (via ``has_access``):
- Host applications: super-admin / admin / regional-head
  (regional heads manage applications for their region).
- Support tickets: super-admin / admin / customer-support.
Super-admin is universally authorized by ``has_access``.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.core.roles import ADMIN, CUSTOMER_SUPPORT, REGIONAL_HEAD, SUPER_ADMIN
from app.models.host_application import HostApplication
from app.models.support_ticket import SupportTicket
from app.models.user import User

router = APIRouter()

APPLICATION_STAFF = [SUPER_ADMIN, ADMIN, REGIONAL_HEAD]
TICKET_STAFF = [SUPER_ADMIN, ADMIN, CUSTOMER_SUPPORT]


class HostApplicationCreate(BaseModel):
    host_name: str
    email: str
    city: Optional[str] = None
    region: Optional[str] = None
    phone: Optional[str] = None
    experience: Optional[str] = None


class HostApplicationReview(BaseModel):
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
            "id": a.id,
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
    app = HostApplication(**payload.model_dump(), status="pending")
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
    app = db.get(HostApplication, application_id)
    if app is None:
        raise HTTPException(status_code=404, detail="Host application not found")
    # Regional heads may only act within their own region.
    if current_user.role == REGIONAL_HEAD and current_user.region and app.region != current_user.region:
        raise HTTPException(status_code=403, detail="Application outside your region")
    app.status = payload.status
    db.commit()
    return {"id": app.id, "status": app.status}


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