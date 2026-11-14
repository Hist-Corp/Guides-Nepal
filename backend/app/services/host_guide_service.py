"""Business logic for Host-managed guides (creation + experience assignment)."""

from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, validate_password_strength
from app.models.booking import HostExperience
from app.models.guide import Guide
from app.models.guide_application import GuideApplication
from app.models.host_guide import HostExperienceGuide, HostGuide
from app.models.user import User
from app.schemas.host_guide import HostExperienceGuideAssign, HostGuideCreate


def _guide_to_payload(guide: Optional[Guide]) -> dict:
    if not guide:
        return {
            "name": None, "role_title": None, "image": None, "bio": None,
            "languages": [], "cities": [], "verified": False,
            "rating": 0.0, "reviews": 0,
        }
    return {
        "name": guide.name, "role_title": guide.role, "image": guide.image,
        "bio": guide.bio, "languages": list(guide.languages or []),
        "cities": list(guide.cities or []), "verified": bool(guide.verified),
        "rating": float(guide.rating or 0.0), "reviews": int(guide.reviews or 0),
    }


def _row_to_response(row: HostGuide, guide: Optional[Guide]) -> dict:
    return {
        "id": row.id, "host_id": row.host_id, "guide_user_id": row.guide_user_id,
        "guide_id": row.guide_id, "full_name": row.full_name, "email": row.email,
        "phone": row.phone, "nin_number": row.nin_number, "city": row.city,
        "region": row.region, "documents": list(row.documents or []),
        "status": row.status, **_guide_to_payload(guide),
    }


class HostGuideService:
    def __init__(self, db: Session):
        self.db = db

    def list_guides(self, host_id: int) -> List[dict]:
        rows = (
            self.db.query(HostGuide)
            .filter(HostGuide.host_id == host_id)
            .order_by(HostGuide.created_at.desc())
            .all()
        )
        ids = [r.guide_id for r in rows if r.guide_id]
        guides = {g.id: g for g in self.db.query(Guide).filter(Guide.id.in_(ids)).all()} if ids else {}
        return [_row_to_response(r, guides.get(r.guide_id) if r.guide_id else None) for r in rows]

    def create_guide(self, host: User, payload: HostGuideCreate) -> dict:
        email = str(payload.email).strip().lower()
        if self.db.query(User).filter(User.email == email).first():
            raise HTTPException(status_code=409, detail="Email already registered")
        if self.db.query(HostGuide).filter(HostGuide.host_id == host.id, HostGuide.email == email).first():
            raise HTTPException(status_code=409, detail="You already added a guide with this email")
        valid, message = validate_password_strength(payload.password)
        if not valid:
            raise HTTPException(status_code=422, detail=message)

        first, _, last = payload.full_name.strip().partition(" ")
        guide_user = User(
            email=email, hashed_password=get_password_hash(payload.password),
            firstName=first.strip() or payload.full_name.strip(),
            lastName=last.strip() or None, phone=payload.phone,
            role="guide", bio=payload.bio, is_active=True,
        )
        self.db.add(guide_user)
        self.db.flush()

        guide = Guide(
            name=payload.full_name.strip(),
            image=payload.image or "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80",
            role=payload.role_title.strip(), rating=0.0, reviews=0,
            bio=payload.bio.strip(), languages=list(payload.languages),
            verified=False, lives_in=payload.lives_in or payload.city,
            cities=list(payload.cities), gallery=list(payload.gallery or []),
            is_active=True,
        )
        self.db.add(guide)
        self.db.flush()

        documents = [f"{d.kind}: {d.name}" for d in (payload.documents or [])]
        application = GuideApplication(
            full_name=payload.full_name.strip(), email=email, phone=payload.phone,
            city=payload.city or (payload.cities[0] if payload.cities else None),
            region=payload.region or payload.city, nin_number=payload.nin_number,
            documents=", ".join(documents) if documents else "Host-created guide via dashboard",
            status="pending",
        )
        self.db.add(application)
        self.db.flush()

        link = HostGuide(
            host_id=host.id, guide_user_id=guide_user.id, guide_id=guide.id,
            full_name=payload.full_name.strip(), email=email, phone=payload.phone,
            nin_number=payload.nin_number, city=payload.city, region=payload.region,
            documents=[d.model_dump() for d in (payload.documents or [])],
            status="active",
        )
        self.db.add(link)
        self.db.commit()
        self.db.refresh(link)
        return _row_to_response(link, guide)
    def suspend_guide(self, host_id: int, host_guide_id: int) -> dict:
        link = self.db.query(HostGuide).filter(HostGuide.id == host_guide_id, HostGuide.host_id == host_id).first()
        if not link:
            raise HTTPException(status_code=404, detail="Guide not found")
        link.status = "suspended"
        if link.guide_user_id:
            user = self.db.query(User).filter(User.id == link.guide_user_id).first()
            if user:
                user.is_active = False
        if link.guide_id:
            guide = self.db.query(Guide).filter(Guide.id == link.guide_id).first()
            if guide:
                guide.is_active = False
        self.db.commit()
        self.db.refresh(link)
        g = self.db.query(Guide).filter(Guide.id == link.guide_id).first() if link.guide_id else None
        return _row_to_response(link, g)

    def reactivate_guide(self, host_id: int, host_guide_id: int) -> dict:
        link = self.db.query(HostGuide).filter(HostGuide.id == host_guide_id, HostGuide.host_id == host_id).first()
        if not link:
            raise HTTPException(status_code=404, detail="Guide not found")
        link.status = "active"
        if link.guide_user_id:
            user = self.db.query(User).filter(User.id == link.guide_user_id).first()
            if user:
                user.is_active = True
        if link.guide_id:
            guide = self.db.query(Guide).filter(Guide.id == link.guide_id).first()
            if guide:
                guide.is_active = True
        self.db.commit()
        self.db.refresh(link)
        g2 = self.db.query(Guide).filter(Guide.id == link.guide_id).first() if link.guide_id else None
        return _row_to_response(link, g2)

    def _owned_experience(self, host_id: int, experience_id: int) -> HostExperience:
        exp = self.db.query(HostExperience).filter(HostExperience.id == experience_id, HostExperience.host_id == host_id).first()
        if not exp:
            raise HTTPException(status_code=404, detail="Experience not found")
        return exp

    def _owned_guide_profile(self, host_id: int, guide_id: int) -> Guide:
        link = self.db.query(HostGuide).filter(HostGuide.host_id == host_id, HostGuide.guide_id == guide_id, HostGuide.status == "active").first()
        if not link:
            raise HTTPException(status_code=404, detail="Guide not found for this host")
        guide = self.db.query(Guide).filter(Guide.id == guide_id, Guide.is_active.is_(True)).first()
        if not guide:
            raise HTTPException(status_code=404, detail="Guide profile is not active")
        return guide

    def list_experience_guides(self, host_id: int, experience_id: int) -> list:
        self._owned_experience(host_id, experience_id)
        rows = (
            self.db.query(HostExperienceGuide, Guide)
            .join(Guide, HostExperienceGuide.guide_id == Guide.id)
            .filter(HostExperienceGuide.host_id == host_id, HostExperienceGuide.experience_id == experience_id)
            .order_by(HostExperienceGuide.created_at.desc())
            .all()
        )
        out = []
        for assignment, guide in rows:
            out.append({
                "id": assignment.id, "host_id": assignment.host_id,
                "experience_id": assignment.experience_id, "guide_id": assignment.guide_id,
                "is_primary": bool(assignment.is_primary),
                "created_at": assignment.created_at.isoformat() if assignment.created_at else None,
                "guide": {
                    "id": guide.id, "name": guide.name, "image": guide.image, "role": guide.role,
                    "rating": float(guide.rating or 0.0), "reviews": int(guide.reviews or 0),
                    "bio": guide.bio, "languages": list(guide.languages or []),
                    "verified": bool(guide.verified), "livesIn": guide.lives_in,
                    "cities": list(guide.cities or []), "gallery": list(guide.gallery or []),
                    "is_active": bool(guide.is_active),
                },
            })
        return out

    def assign_guide(self, host_id: int, experience_id: int, payload: HostExperienceGuideAssign) -> dict:
        self._owned_experience(host_id, experience_id)
        self._owned_guide_profile(host_id, payload.guide_id)
        existing = self.db.query(HostExperienceGuide).filter(
            HostExperienceGuide.host_id == host_id,
            HostExperienceGuide.experience_id == experience_id,
            HostExperienceGuide.guide_id == payload.guide_id,
        ).first()
        if existing:
            existing.is_primary = bool(payload.is_primary)
            self.db.commit()
            self.db.refresh(existing)
            return {"id": existing.id, "host_id": existing.host_id, "experience_id": existing.experience_id, "guide_id": existing.guide_id, "is_primary": bool(existing.is_primary), "created_at": existing.created_at.isoformat() if existing.created_at else None}
        if payload.is_primary:
            self.db.query(HostExperienceGuide).filter(
                HostExperienceGuide.host_id == host_id,
                HostExperienceGuide.experience_id == experience_id,
                HostExperienceGuide.is_primary.is_(True),
            ).update({"is_primary": False})
        row = HostExperienceGuide(host_id=host_id, experience_id=experience_id, guide_id=payload.guide_id, is_primary=bool(payload.is_primary))
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return {"id": row.id, "host_id": row.host_id, "experience_id": row.experience_id, "guide_id": row.guide_id, "is_primary": bool(row.is_primary), "created_at": row.created_at.isoformat() if row.created_at else None}

    def unassign_guide(self, host_id: int, experience_id: int, guide_id: int) -> dict:
        self._owned_experience(host_id, experience_id)
        row = self.db.query(HostExperienceGuide).filter(
            HostExperienceGuide.host_id == host_id,
            HostExperienceGuide.experience_id == experience_id,
            HostExperienceGuide.guide_id == guide_id,
        ).first()
        if not row:
            raise HTTPException(status_code=404, detail="Guide is not assigned to this experience")
        self.db.delete(row)
        self.db.commit()
        return {"status": "ok"}

        self.db.refresh(link)
        g = self.db.query(Guide).filter(Guide.id == link.guide_id).first() if link.guide_id else None
        return _row_to_response(link, g)

