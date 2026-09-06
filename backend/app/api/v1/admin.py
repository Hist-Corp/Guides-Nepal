from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.user import User
from app.models.guide import Guide
from app.models.booking import Booking

router = APIRouter()


# --- User Management ---
@router.get("/users")
def list_users(role: Optional[str] = None, db: Session = Depends(get_db)) -> List[dict]:
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.all()
    return [{
        "id": u.id,
        "email": u.email,
        "firstName": u.firstName,
        "lastName": u.lastName,
        "role": u.role,
        "is_active": u.is_active,
        "phone": u.phone,
    } for u in users]


@router.patch("/users/{user_id}")
def update_user(user_id: int, payload: dict, db: Session = Depends(get_db)) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in payload.items():
        if hasattr(user, key):
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return {"status": "ok", "user_id": user.id}


@router.post("/users/{user_id}/suspend")
def suspend_user(user_id: int, db: Session = Depends(get_db)) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"status": "ok", "message": "User suspended"}


@router.post("/users/{user_id}/activate")
def activate_user(user_id: int, db: Session = Depends(get_db)) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    return {"status": "ok", "message": "User activated"}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"status": "ok", "message": "User deleted"}


# --- Guide Management ---
@router.get("/guides")
def list_guides_admin(city: Optional[str] = None, db: Session = Depends(get_db)) -> List[dict]:
    query = db.query(Guide)
    if city:
        query = query.filter(Guide.cities.contains([city]))
    guides = query.all()
    return [{
        "id": g.id,
        "name": g.name,
        "role": g.role,
        "rating": g.rating,
        "reviews": g.reviews,
        "verified": g.verified,
        "is_active": g.is_active,
        "cities": g.cities,
        "languages": g.languages,
    } for g in guides]


@router.patch("/guides/{guide_id}")
def update_guide(guide_id: int, payload: dict, db: Session = Depends(get_db)) -> dict:
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    for key, value in payload.items():
        if hasattr(guide, key):
            setattr(guide, key, value)
    db.commit()
    db.refresh(guide)
    return {"status": "ok", "guide_id": guide.id}


@router.post("/guides/{guide_id}/verify")
def verify_guide(guide_id: int, db: Session = Depends(get_db)) -> dict:
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    guide.verified = True
    db.commit()
    return {"status": "ok", "message": "Guide verified"}


@router.post("/guides/{guide_id}/suspend")
def suspend_guide(guide_id: int, db: Session = Depends(get_db)) -> dict:
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    guide.is_active = False
    db.commit()
    return {"status": "ok", "message": "Guide suspended"}


@router.delete("/guides/{guide_id}")
def delete_guide(guide_id: int, db: Session = Depends(get_db)) -> dict:
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    db.delete(guide)
    db.commit()
    return {"status": "ok", "message": "Guide deleted"}


# --- Experience Management ---
@router.get("/experiences")
def list_experiences_admin(city: Optional[str] = None, db: Session = Depends(get_db)) -> List[dict]:
    from app.api.v1.public import MOCK_EXPERIENCES
    results = MOCK_EXPERIENCES.copy()
    if city:
        results = [e for e in results if e.get("city", "").lower() == city.lower()]
    return results


@router.post("/experiences")
def create_experience(payload: dict, db: Session = Depends(get_db)) -> dict:
    from app.api.v1.public import MOCK_EXPERIENCES
    new_id = max(e["id"] for e in MOCK_EXPERIENCES) + 1 if MOCK_EXPERIENCES else 1
    new_exp = {"id": new_id, **payload}
    MOCK_EXPERIENCES.append(new_exp)
    return {"status": "ok", "experience": new_exp}


@router.patch("/experiences/{exp_id}")
def update_experience(exp_id: int, payload: dict, db: Session = Depends(get_db)) -> dict:
    from app.api.v1.public import MOCK_EXPERIENCES
    for i, exp in enumerate(MOCK_EXPERIENCES):
        if exp["id"] == exp_id:
            MOCK_EXPERIENCES[i] = {**exp, **payload}
            return {"status": "ok", "experience": MOCK_EXPERIENCES[i]}
    raise HTTPException(status_code=404, detail="Experience not found")


@router.delete("/experiences/{exp_id}")
def delete_experience(exp_id: int, db: Session = Depends(get_db)) -> dict:
    from app.api.v1.public import MOCK_EXPERIENCES
    for i, exp in enumerate(MOCK_EXPERIENCES):
        if exp["id"] == exp_id:
            MOCK_EXPERIENCES.pop(i)
            return {"status": "ok", "message": "Experience deleted"}
    raise HTTPException(status_code=404, detail="Experience not found")


# --- Booking Management ---
@router.get("/bookings")
def list_bookings(status: Optional[str] = None, db: Session = Depends(get_db)) -> List[dict]:
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.status == status)
    bookings = query.all()
    return [{
        "id": b.id,
        "user_id": b.user_id,
        "experience_id": b.experience_id,
        "date": str(b.date) if b.date else None,
        "guests": b.guests,
        "status": b.status,
        "total_price": b.total_price,
    } for b in bookings]


@router.patch("/bookings/{booking_id}")
def update_booking(booking_id: int, payload: dict, db: Session = Depends(get_db)) -> dict:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    for key, value in payload.items():
        if hasattr(booking, key):
            setattr(booking, key, value)
    db.commit()
    db.refresh(booking)
    return {"status": "ok", "booking_id": booking.id}


@router.post("/bookings/{booking_id}/cancel")
def cancel_booking(booking_id: int, db: Session = Depends(get_db)) -> dict:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "cancelled"
    db.commit()
    return {"status": "ok", "message": "Booking cancelled"}


# --- Dashboard Stats ---
@router.get("/stats")
def get_stats(db: Session = Depends(get_db)) -> dict:
    total_users = db.query(User).count()
    total_guides = db.query(Guide).count()
    total_bookings = db.query(Booking).count()
    active_guides = db.query(Guide).filter(Guide.is_active == True).count()
    verified_guides = db.query(Guide).filter(Guide.verified == True).count()
    
    return {
        "total_users": total_users,
        "total_guides": total_guides,
        "total_bookings": total_bookings,
        "active_guides": active_guides,
        "verified_guides": verified_guides,
    }