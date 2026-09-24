import re

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_user_id_from_token
from app.models.booking import HostBooking, HostExperience, HostTour
from app.models.user import User
from app.schemas.host import HostBookingCreate, HostBookingResponse, HostExperienceCreate, HostExperienceResponse, HostTourCreate, HostTourResponse

router = APIRouter(prefix="/host", tags=["host"])


def current_host(request: Request, db: Session = Depends(get_db)) -> User:
    auth = request.headers.get("Authorization", "")
    if not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = get_user_id_from_token(auth.split(" ", 1)[1])
    user = db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first() if user_id else None
    if not user or user.role != "host":
        raise HTTPException(status_code=403, detail="Host account required")
    return user


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


@router.get("/experiences", response_model=list[HostExperienceResponse])
def list_host_experiences(db: Session = Depends(get_db), host: User = Depends(current_host)):
    return db.query(HostExperience).filter(HostExperience.host_id == host.id).order_by(HostExperience.created_at.desc()).all()


@router.post("/experiences", response_model=HostExperienceResponse, status_code=201)
def create_host_experience(payload: HostExperienceCreate, db: Session = Depends(get_db), host: User = Depends(current_host)):
    slug = slugify(payload.title)
    if db.query(HostExperience).filter(HostExperience.host_id == host.id, HostExperience.slug == slug).first():
        raise HTTPException(status_code=409, detail="You already have an experience with this title")
    experience = HostExperience(host_id=host.id, slug=slug, **payload.model_dump())
    db.add(experience)
    db.commit()
    db.refresh(experience)
    return experience


@router.patch("/experiences/{experience_id}", response_model=HostExperienceResponse)
def update_host_experience(experience_id: int, payload: HostExperienceCreate, db: Session = Depends(get_db), host: User = Depends(current_host)):
    experience = db.query(HostExperience).filter(HostExperience.id == experience_id, HostExperience.host_id == host.id).first()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    slug = slugify(payload.title)
    duplicate = db.query(HostExperience).filter(HostExperience.host_id == host.id, HostExperience.slug == slug, HostExperience.id != experience_id).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="You already have an experience with this title")
    for key, value in payload.model_dump().items():
        setattr(experience, key, value)
    experience.slug = slug
    db.commit()
    db.refresh(experience)
    return experience


@router.delete("/experiences/{experience_id}")
def remove_host_experience(experience_id: int, db: Session = Depends(get_db), host: User = Depends(current_host)):
    experience = db.query(HostExperience).filter(HostExperience.id == experience_id, HostExperience.host_id == host.id).first()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(experience)
    db.commit()
    return {"status": "ok"}


@router.get("/tours", response_model=list[HostTourResponse])
def list_host_tours(db: Session = Depends(get_db), host: User = Depends(current_host)):
    return db.query(HostTour).filter(HostTour.host_id == host.id).order_by(HostTour.created_at.desc()).all()


@router.post("/tours", response_model=HostTourResponse, status_code=201)
def create_host_tour(payload: HostTourCreate, db: Session = Depends(get_db), host: User = Depends(current_host)):
    tour = HostTour(host_id=host.id, **payload.model_dump())
    db.add(tour)
    db.commit()
    db.refresh(tour)
    return tour


@router.patch("/tours/{tour_id}", response_model=HostTourResponse)
def update_host_tour(tour_id: int, payload: HostTourCreate, db: Session = Depends(get_db), host: User = Depends(current_host)):
    tour = db.query(HostTour).filter(HostTour.id == tour_id, HostTour.host_id == host.id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    for key, value in payload.model_dump().items():
        setattr(tour, key, value)
    db.commit()
    db.refresh(tour)
    return tour


@router.delete("/tours/{tour_id}")
def remove_host_tour(tour_id: int, db: Session = Depends(get_db), host: User = Depends(current_host)):
    tour = db.query(HostTour).filter(HostTour.id == tour_id, HostTour.host_id == host.id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    db.delete(tour)
    db.commit()
    return {"status": "ok"}


@router.get("/bookings", response_model=list[HostBookingResponse])
def list_host_bookings(db: Session = Depends(get_db), host: User = Depends(current_host)):
    rows = db.query(HostBooking, HostExperience).join(HostExperience, HostBooking.experience_id == HostExperience.id).filter(HostBooking.host_id == host.id).order_by(HostBooking.date).all()
    return [{**booking.__dict__, "experience_title": experience.title} for booking, experience in rows]


@router.post("/bookings", response_model=HostBookingResponse, status_code=201)
def create_host_booking(payload: HostBookingCreate, db: Session = Depends(get_db), host: User = Depends(current_host)):
    experience = db.query(HostExperience).filter(HostExperience.id == payload.experience_id, HostExperience.host_id == host.id, HostExperience.is_active.is_(True)).first()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    booking = HostBooking(host_id=host.id, total_price=round(experience.price * payload.guests, 2), **payload.model_dump())
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return {**booking.__dict__, "experience_title": experience.title}


@router.patch("/bookings/{booking_id}")
def decide_host_booking(booking_id: int, payload: dict, db: Session = Depends(get_db), host: User = Depends(current_host)):
    status = payload.get("status")
    if status not in {"accepted", "rejected"}:
        raise HTTPException(status_code=422, detail="Status must be accepted or rejected")
    booking = db.query(HostBooking).filter(HostBooking.id == booking_id, HostBooking.host_id == host.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = status
    db.commit()
    return {"status": status}
