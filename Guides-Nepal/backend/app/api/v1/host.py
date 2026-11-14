#!/usr/bin/env python3
import re
from collections import defaultdict
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_user_id_from_token
from app.models.booking import HostBooking, HostExperience, HostTour
from app.models.user import User
from app.schemas.host import (
    EarningsSummaryDetail,
    HostBookingCreate,
    HostBookingResponse,
    HostEarningsSummary,
    HostExperienceCreate,
    HostExperienceResponse,
    HostTourCreate,
    HostTourResponse,
    Payout,
    PayoutRequest,
)

router = APIRouter(prefix="/host", tags=["host"])


def current_host(request: Request, db: Session = Depends(get_db)) -> User:
    auth = request.headers.get("Authorization", "")
    if not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = get_user_id_from_token(auth.split(" ", 1)[1])
    user = (
        db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()
        if user_id
        else None
    )
    if not user or user.role != "host":
        raise HTTPException(status_code=403, detail="Host account required")
    return user


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


@router.get("/experiences", response_model=list[HostExperienceResponse])
def list_host_experiences(
    db: Session = Depends(get_db), host: User = Depends(current_host)
):
    return (
        db.query(HostExperience)
        .filter(HostExperience.host_id == host.id)
        .order_by(HostExperience.created_at.desc())
        .all()
    )


@router.post("/experiences", response_model=HostExperienceResponse, status_code=201)
def create_host_experience(
    payload: HostExperienceCreate,
    db: Session = Depends(get_db),
    host: User = Depends(current_host),
):
    slug = slugify(payload.title)
    if (
        db.query(HostExperience)
        .filter(HostExperience.host_id == host.id, HostExperience.slug == slug)
        .first()
    ):
        raise HTTPException(
            status_code=409, detail="You already have an experience with this title"
        )
    experience = HostExperience(host_id=host.id, slug=slug, **payload.model_dump())
    db.add(experience)
    db.commit()
    db.refresh(experience)
    return experience


@router.patch("/experiences/{experience_id}", response_model=HostExperienceResponse)
def update_host_experience(
    experience_id: int,
    payload: HostExperienceCreate,
    db: Session = Depends(get_db),
    host: User = Depends(current_host),
):
    experience = (
        db.query(HostExperience)
        .filter(HostExperience.id == experience_id, HostExperience.host_id == host.id)
        .first()
    )
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    slug = slugify(payload.title)
    duplicate = (
        db.query(HostExperience)
        .filter(
            HostExperience.host_id == host.id,
            HostExperience.slug == slug,
            HostExperience.id != experience_id,
        )
        .first()
    )
    if duplicate:
        raise HTTPException(
            status_code=409, detail="You already have an experience with this title"
        )
    for key, value in payload.model_dump().items():
        setattr(experience, key, value)
    experience.slug = slug
    db.commit()
    db.refresh(experience)
    return experience


@router.delete("/experiences/{experience_id}")
def remove_host_experience(
    experience_id: int,
    db: Session = Depends(get_db),
    host: User = Depends(current_host),
):
    experience = (
        db.query(HostExperience)
        .filter(HostExperience.id == experience_id, HostExperience.host_id == host.id)
        .first()
    )
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(experience)
    db.commit()
    return {"status": "ok"}


@router.get("/tours", response_model=list[HostTourResponse])
def list_host_tours(db: Session = Depends(get_db), host: User = Depends(current_host)):
    return (
        db.query(HostTour)
        .filter(HostTour.host_id == host.id)
        .order_by(HostTour.created_at.desc())
        .all()
    )


@router.post("/tours", response_model=HostTourResponse, status_code=201)
def create_host_tour(
    payload: HostTourCreate,
    db: Session = Depends(get_db),
    host: User = Depends(current_host),
):
    tour = HostTour(host_id=host.id, **payload.model_dump())
    db.add(tour)
    db.commit()
    db.refresh(tour)
    return tour


@router.patch("/tours/{tour_id}", response_model=HostTourResponse)
def update_host_tour(
    tour_id: int,
    payload: HostTourCreate,
    db: Session = Depends(get_db),
    host: User = Depends(current_host),
):
    tour = (
        db.query(HostTour)
        .filter(HostTour.id == tour_id, HostTour.host_id == host.id)
        .first()
    )
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    for key, value in payload.model_dump().items():
        setattr(tour, key, value)
    db.commit()
    db.refresh(tour)
    return tour


@router.delete("/tours/{tour_id}")
def remove_host_tour(
    tour_id: int, db: Session = Depends(get_db), host: User = Depends(current_host)
):
    tour = (
        db.query(HostTour)
        .filter(HostTour.id == tour_id, HostTour.host_id == host.id)
        .first()
    )
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    db.delete(tour)
    db.commit()
    return {"status": "ok"}


@router.get("/bookings", response_model=list[HostBookingResponse])
def list_host_bookings(
    db: Session = Depends(get_db), host: User = Depends(current_host)
):
    rows = (
        db.query(HostBooking, HostExperience)
        .join(HostExperience, HostBooking.experience_id == HostExperience.id)
        .filter(HostBooking.host_id == host.id)
        .order_by(HostBooking.date)
        .all()
    )
    return [
        {**booking.__dict__, "experience_title": experience.title}
        for booking, experience in rows
    ]


@router.post("/bookings", response_model=HostBookingResponse, status_code=201)
def create_host_booking(
    payload: HostBookingCreate,
    db: Session = Depends(get_db),
    host: User = Depends(current_host),
):
    experience = (
        db.query(HostExperience)
        .filter(
            HostExperience.id == payload.experience_id,
            HostExperience.host_id == host.id,
            HostExperience.is_active.is_(True),
        )
        .first()
    )
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    booking = HostBooking(
        host_id=host.id,
        total_price=round(experience.price * payload.guests, 2),
        **payload.model_dump(),
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return {**booking.__dict__, "experience_title": experience.title}


@router.patch("/bookings/{booking_id}")
def decide_host_booking(
    booking_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    host: User = Depends(current_host),
):
    status = payload.get("status")
    if status not in {"accepted", "rejected"}:
        raise HTTPException(
            status_code=422, detail="Status must be accepted or rejected"
        )
    booking = (
        db.query(HostBooking)
        .filter(HostBooking.id == booking_id, HostBooking.host_id == host.id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = status
    db.commit()
    return {"status": status}


@router.get("/earnings", response_model=HostEarningsSummary)
def get_host_earnings(
    db: Session = Depends(get_db), host: User = Depends(current_host)
):
    bookings = db.query(HostBooking).filter(HostBooking.host_id == host.id).all()
    now = datetime.now(UTC)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    completed = [b for b in bookings if b.status == "completed"]
    upcoming = [b for b in bookings if b.status in ("upcoming", "accepted")]
    pending = [b for b in bookings if b.status == "pending"]

    total_earnings = round(sum(b.total_price for b in completed), 2)
    pending_earnings = round(sum(b.total_price for b in pending), 2)
    revenue_this_month = round(
        sum(b.total_price for b in completed if b.created_at >= month_start), 2
    )

    return {
        "total_earnings": total_earnings,
        "pending_earnings": pending_earnings,
        "completed_bookings": len(completed),
        "upcoming_bookings": len(upcoming),
        "revenue_this_month": revenue_this_month,
    }


@router.get("/earnings/summary", response_model=EarningsSummaryDetail)
def get_host_earnings_summary(
    db: Session = Depends(get_db), host: User = Depends(current_host)
):
    bookings = db.query(HostBooking).filter(HostBooking.host_id == host.id).all()
    completed = [b for b in bookings if b.status == "completed"]
    total_earnings = round(sum(b.total_price for b in completed), 2)

    by_experience = defaultdict(float)
    for b in completed:
        by_experience[b.experience_title] += b.total_price

    best_day = max(by_experience.items(), key=lambda x: x[1], default=("", 0))

    return {
        "total_earnings": total_earnings,
        "this_period": total_earnings,
        "best_day": {"date": best_day[0] or "—", "amount": round(best_day[1], 2)},
        "avg_per_booking": (
            round(total_earnings / len(completed), 2) if completed else 0
        ),
        "by_experience": [
            {"label": k, "value": round(v, 2), "display": f"${round(v, 2)}"}
            for k, v in by_experience.items()
        ],
    }


@router.get("/payouts", response_model=list[Payout])
def list_host_payouts(
    db: Session = Depends(get_db), host: User = Depends(current_host)
):
    # No persistent payout table yet; return an empty list so the frontend
    # renders the payouts section gracefully until a payout model is added.
    return []


@router.post("/payouts", response_model=Payout, status_code=201)
def request_host_payout(
    payload: PayoutRequest,
    db: Session = Depends(get_db),
    host: User = Depends(current_host),
):
    # No persistent payout table yet; echo back a pending payout record.
    return {
        "id": f"PO-{host.id}-{int(datetime.now(UTC).timestamp())}",
        "date": datetime.now(UTC).strftime("%Y-%m-%d"),
        "amount": payload.amount,
        "status": "pending",
        "items": 0,
        "method": "bank_transfer",
    }
