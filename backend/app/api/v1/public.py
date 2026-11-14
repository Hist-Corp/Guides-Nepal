from typing import List, Optional
import json
import os
import re
import unicodedata
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, EmailStr, TypeAdapter
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_password_hash, validate_password_strength
from app.models.guide import Guide
from app.models.guide_application import GuideApplication
from app.models.guide_listing import GuideExperienceRequest, GuideListing
from app.models.host_application import HostApplication
from app.models.host_guide import HostExperienceGuide, HostGuide
from app.models.booking import HostExperience
from app.models.support_ticket import SupportTicket
from app.models.user import User
from app.schemas.public import ExperienceResponse, GuideResponse
from app.services.guide_service import GuideService

router = APIRouter()

# Public experience ids keep their source visible in the number itself: the
# traveller-facing routes address host-owned experiences as ``100000 + id`` and
# approved guide listings as ``200000 + id``.  Requests that target an
# experience must therefore store one of those public ids, not the raw row id.
HOST_EXPERIENCE_ID_OFFSET = 100000
GUIDE_LISTING_ID_OFFSET = 200000

GUIDE_UPLOAD_FIELDS = (
    "citizenshipFront",
    "citizenshipBack",
    "liveSelfie",
    "holdingCitizenship",
    "certificate",
)
MAX_GUIDE_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_GUIDE_UPLOAD_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/webp"}
GUIDE_APPLICATION_UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "private_guide_applications"


# ---------------- Public inquiry / application forms ----------------


class InquiryCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    category: Optional[str] = "general"


@router.post("/inquiries", status_code=status.HTTP_201_CREATED)
def create_inquiry(payload: InquiryCreate, db: Session = Depends(get_db)):
    """Public contact / guide-request form. Stored as a support ticket so
    the support team can triage it from the dashboard."""
    ticket = SupportTicket(
        subject=f"[{payload.category}] {payload.subject}",
        description=payload.message,
        customer_name=payload.name,
        customer_email=payload.email,
        priority="medium",
        status="open",
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return {"status": "ok", "id": ticket.id, "message": "Inquiry received"}


class PublicHostApplicationCreate(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    city: Optional[str] = None
    documents: Optional[str] = None  # names of uploaded documents


@router.post("/host-applications", status_code=status.HTTP_201_CREATED)
def submit_host_application(
    payload: PublicHostApplicationCreate, db: Session = Depends(get_db)
):
    """Public host registration form from the marketing website.

    Host-only: experience providers that list and manage experiences.
    Guide signups use ``POST /guide-applications`` and land in the
    ``guide_applications`` table, never here.
    """
    application = HostApplication(
        host_name=payload.full_name,
        email=payload.email,
        city=payload.city,
        region=payload.city,
        phone=payload.phone,
        experience=payload.documents or "Host registration via website",
        status="pending",
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return {"status": "ok", "id": application.id, "message": "Application received"}


class PublicGuideApplicationCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    nin_number: Optional[str] = None
    documents: Optional[str] = None  # names of uploaded documents


@router.post("/guide-applications", status_code=status.HTTP_201_CREATED)
async def submit_guide_application(
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    region: str = Form(...),
    phone: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    nin_number: Optional[str] = Form(None),
    citizenshipFront: UploadFile = File(...),
    citizenshipBack: UploadFile = File(...),
    liveSelfie: UploadFile = File(...),
    holdingCitizenship: UploadFile = File(...),
    certificate: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Public guide registration form from the marketing website.

    Guide-only: individuals who lead tours. Stored in the dedicated
    ``guide_applications`` table so guides are never mixed into the host
    funnel (``host_applications``).
    """
    valid_password, password_error = validate_password_strength(password)
    if not valid_password:
        raise HTTPException(status_code=422, detail=password_error)
    try:
        normalized_email = str(TypeAdapter(EmailStr).validate_python(email)).strip().lower()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Enter a valid email address.") from exc

    uploads = {
        "citizenshipFront": citizenshipFront,
        "citizenshipBack": citizenshipBack,
        "liveSelfie": liveSelfie,
        "holdingCitizenship": holdingCitizenship,
        "certificate": certificate,
    }
    upload_root = GUIDE_APPLICATION_UPLOAD_ROOT
    saved_paths: list[Path] = []
    files_metadata: dict[str, dict[str, str]] = {}
    try:
        for field_name in GUIDE_UPLOAD_FIELDS:
            upload = uploads[field_name]
            content_type = upload.content_type or ""
            if content_type not in ALLOWED_GUIDE_UPLOAD_TYPES:
                raise HTTPException(
                    status_code=422,
                    detail=f"{field_name}: upload a JPG, PNG, WebP, or PDF file.",
                )
            if field_name in {"liveSelfie", "holdingCitizenship"} and not content_type.startswith("image/"):
                raise HTTPException(
                    status_code=422,
                    detail=f"{field_name}: upload an image.",
                )
            content = await upload.read(MAX_GUIDE_UPLOAD_BYTES + 1)
            if not content or len(content) > MAX_GUIDE_UPLOAD_BYTES:
                raise HTTPException(
                    status_code=422,
                    detail=f"{field_name}: file must be non-empty and no larger than 10 MB.",
                )
            stored_name = f"{uuid.uuid4().hex}"
            if content_type == "application/pdf":
                stored_name += ".pdf"
            elif content_type == "image/jpeg":
                stored_name += ".jpg"
            elif content_type == "image/png":
                stored_name += ".png"
            else:
                stored_name += ".webp"
            stored_path = upload_root / stored_name
            upload_root.mkdir(parents=True, exist_ok=True)
            stored_path.write_bytes(content)
            saved_paths.append(stored_path)
            files_metadata[field_name] = {
                "filename": os.path.basename(upload.filename or field_name),
                "content_type": content_type,
                "stored_name": stored_name,
            }

        application = GuideApplication(
            full_name=full_name.strip(),
            email=normalized_email,
            credential_password_hash=get_password_hash(password),
            phone=phone,
            city=city,
            region=region,
            nin_number=nin_number,
            documents=", ".join(
                f"{field_name}: {metadata['filename']}"
                for field_name, metadata in files_metadata.items()
            ),
            details_json=json.dumps({"files": files_metadata}),
            status="pending",
        )
        db.add(application)
        db.commit()
        db.refresh(application)
    except Exception:
        db.rollback()
        for stored_path in saved_paths:
            stored_path.unlink(missing_ok=True)
        raise
    return {"status": "ok", "id": application.id, "message": "Application received"}


@router.post("/host-applications/submit", status_code=status.HTTP_201_CREATED)
async def submit_host_application_wizard(
    first_name: str = Form(...), last_name: str = Form(...), date_of_birth: str = Form(...),
    nationality: str = Form(...), email: str = Form(...), phone: str = Form(...), address: str = Form(...),
    city: str = Form(...), district: str = Form(...), languages: str = Form(...), host_type: str = Form(...),
    business_name: str = Form(""), registration_number: str = Form(""), primary_city: str = Form(...),
    years_experience: str = Form(...), expertise: str = Form(...), experience: str = Form(...),
    proposedTitle: str = Form(...), proposedDescription: str = Form(...), proposedCategory: str = Form(...),
    proposedDuration: str = Form(...), maxGuests: str = Form("8"), price: str = Form(...), availability: str = Form(...),
    password: str = Form(...),
    terms: bool = Form(False), privacy: bool = Form(False), accuracy: bool = Form(False),
    identity: UploadFile = File(None), photo: UploadFile = File(None), license: UploadFile = File(None), certificate: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    if not all([first_name.strip(), last_name.strip(), date_of_birth, nationality.strip(), email.strip(), phone.strip(), address.strip(), city.strip(), district.strip(), primary_city.strip(), proposedTitle.strip(), proposedDescription.strip()]):
        raise HTTPException(status_code=422, detail="Please complete all required fields")
    if not (terms and privacy and accuracy):
        raise HTTPException(status_code=422, detail="All declarations must be accepted")
    if len(experience.strip()) < 50 or len(proposedDescription.strip()) < 30:
        raise HTTPException(status_code=422, detail="Please provide more detail in the experience sections")
    # Capture the applicant's chosen password now, but only as a hash on the
    # application row. The real login account is minted when a regional head
    # or admin approves (operations.review_host_application).
    valid_pw, pw_msg = validate_password_strength(password)
    if not valid_pw:
        raise HTTPException(status_code=422, detail=pw_msg)
    password_hash = get_password_hash(password)
    documents = {}
    upload_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../private_host_applications"))
    os.makedirs(upload_root, exist_ok=True)
    for key, upload in {"identity": identity, "photo": photo, "license": license, "certificate": certificate}.items():
        if not upload: continue
        content = await upload.read()
        if len(content) > 10 * 1024 * 1024 or upload.content_type not in {"application/pdf", "image/jpeg", "image/png"}:
            raise HTTPException(status_code=422, detail=f"{key}: use PDF, JPG, or PNG files under 10 MB")
        filename = f"{uuid.uuid4().hex}_{os.path.basename(upload.filename or 'document')}"
        with open(os.path.join(upload_root, filename), "wb") as target: target.write(content)
        documents[key] = filename
    application = HostApplication(host_name=f"{first_name} {last_name}", email=email, phone=phone, city=city, region=district, experience=json.dumps({"host_type":host_type,"business_name":business_name,"registration_number":registration_number,"primary_city":primary_city,"years_experience":years_experience,"expertise":expertise,"languages":languages,"proposed_experience":{"title":proposedTitle,"description":proposedDescription,"category":proposedCategory,"duration":proposedDuration,"max_guests":maxGuests,"price":price,"availability":availability},"documents":documents}, ensure_ascii=False), credential_password_hash=password_hash, status="pending")
    db.add(application); db.commit(); db.refresh(application)
    return {"id": application.id, "status": application.status, "message": "Application received"}


# Mock Data to match frontend types exactly
MOCK_GUIDES = [
    {
        "id": 1,
        "name": "Ram Bahadur",
        "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
        "role": "Cultural Expert",
        "rating": 4.9,
        "reviews": 120,
        "bio": "Expert in Kathmandu Valley history.",
        "languages": ["English", "Nepali", "Newari"],
        "verified": True,
        "livesIn": "Kathmandu",
        "cities": ["Kathmandu", "Bhaktapur"],
        "gallery": [],
    },
    {
        "id": 2,
        "name": "Sujal Thapa",
        "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
        "role": "Adventure Specialist",
        "rating": 4.92,
        "reviews": 89,
        "bio": "Mountain guide with 8+ years of experience.",
        "languages": ["English", "Nepali", "Hindi"],
        "verified": True,
        "livesIn": "Pokhara",
        "cities": ["Pokhara", "Kathmandu"],
        "gallery": [],
    },
    {
        "id": 3,
        "name": "Priya Sharma",
        "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
        "role": "Food & Culture Guide",
        "rating": 4.95,
        "reviews": 156,
        "bio": "Culinary expert specializing in traditional Nepali cuisine.",
        "languages": ["English", "Nepali", "Newari"],
        "verified": True,
        "livesIn": "Kathmandu",
        "cities": ["Kathmandu", "Pokhara", "Lalitpur"],
        "gallery": [],
    },
    {
        "id": 4,
        "name": "Rohan KC",
        "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
        "role": "Nature Guide",
        "rating": 4.88,
        "reviews": 67,
        "bio": "Passionate about wildlife and nature experiences.",
        "languages": ["English", "Nepali"],
        "verified": True,
        "livesIn": "Bharatpur",
        "cities": ["Bharatpur", "Kathmandu"],
        "gallery": [],
    },
]

MOCK_EXPERIENCES = [
    {
        "id": 1,
        "slug": "bhaktapur-heritage-walk",
        "title": "Bhaktapur Heritage Walk",
        "heroImage": "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "description": "Walk through the living museum of Bhaktapur. Explore ancient temples, traditional Newari architecture, and local pottery workshops.",
        "price": 50.0,
        "duration": "4 hours",
        "rating": 4.8,
        "reviews": 45,
        "city": "Bhaktapur",
        "category": "Cultural",
        "host": MOCK_GUIDES[0],
    },
    {
        "id": 2,
        "slug": "kathmandu-hidden-gems",
        "title": "Hidden Gems of Kathmandu",
        "heroImage": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "description": "Discover secret temples, hidden courtyards, and local eateries that most tourists never see.",
        "price": 35.0,
        "duration": "3 hours",
        "rating": 4.9,
        "reviews": 78,
        "city": "Kathmandu",
        "category": "Cultural",
        "host": MOCK_GUIDES[0],
    },
    {
        "id": 3,
        "slug": "pokhara-lakeside-tour",
        "title": "Pokhara Lakeside & Mountain Views",
        "heroImage": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "description": "Enjoy the serene beauty of Phewa Lake with stunning views of the Annapurna range.",
        "price": 45.0,
        "duration": "5 hours",
        "rating": 4.9,
        "reviews": 92,
        "city": "Pokhara",
        "category": "Nature",
        "host": MOCK_GUIDES[1],
    },
    {
        "id": 4,
        "slug": "pokhara-sunrise-trek",
        "title": "Sarangkot Sunrise Trek",
        "heroImage": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "description": "Early morning trek to Sarangkot for breathtaking sunrise views over the Himalayas.",
        "price": 40.0,
        "duration": "6 hours",
        "rating": 4.95,
        "reviews": 134,
        "city": "Pokhara",
        "category": "Adventure",
        "host": MOCK_GUIDES[1],
    },
    {
        "id": 5,
        "slug": "newari-food-tour",
        "title": "Authentic Newari Food Tour",
        "heroImage": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "description": "Taste your way through traditional Newari cuisine with local experts.",
        "price": 40.0,
        "duration": "4 hours",
        "rating": 4.95,
        "reviews": 156,
        "city": "Kathmandu",
        "category": "Food",
        "host": MOCK_GUIDES[2],
    },
    {
        "id": 6,
        "slug": "lalitpur-art-walk",
        "title": "Patan Art & Architecture Walk",
        "heroImage": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "description": "Explore the ancient city of Patan, known for its exquisite wood carvings and stone temples.",
        "price": 35.0,
        "duration": "3 hours",
        "rating": 4.7,
        "reviews": 58,
        "city": "Lalitpur",
        "category": "Cultural",
        "host": MOCK_GUIDES[2],
    },
    {
        "id": 7,
        "slug": "chitwan-wildlife-safari",
        "title": "Chitwan Wildlife Safari",
        "heroImage": "https://images.unsplash.com/photo-1549366021-9f761d450615?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "description": "Experience the thrill of spotting rhinos, elephants, and exotic birds in Chitwan National Park.",
        "price": 75.0,
        "duration": "8 hours",
        "rating": 4.85,
        "reviews": 89,
        "city": "Bharatpur",
        "category": "Nature",
        "host": MOCK_GUIDES[3],
    },
    {
        "id": 8,
        "slug": "tharu-cultural-experience",
        "title": "Tharu Cultural Experience",
        "heroImage": "https://images.unsplash.com/photo-1531572753322-ad063cecc140?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "description": "Immerse yourself in the unique culture of the Tharu people and their traditional way of life.",
        "price": 30.0,
        "duration": "3 hours",
        "rating": 4.6,
        "reviews": 42,
        "city": "Bharatpur",
        "category": "Cultural",
        "host": MOCK_GUIDES[3],
    },
    {
        "id": 9,
        "slug": "kathmandu-street-food",
        "title": "Kathmandu Street Food Adventure",
        "heroImage": "https://images.unsplash.com/photo-1556909114-f6e7a7a97c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "description": "Explore the vibrant street food scene of Kathmandu. From momos to chatpate, taste the best local flavors.",
        "price": 25.0,
        "duration": "2 hours",
        "rating": 4.8,
        "reviews": 112,
        "city": "Kathmandu",
        "category": "Food",
        "host": MOCK_GUIDES[2],
    },
    {
        "id": 10,
        "slug": "pokhara-paragliding",
        "title": "Pokhara Paragliding Experience",
        "heroImage": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "description": "Soar above Phewa Lake and enjoy panoramic views of the Himalayas with experienced pilots.",
        "price": 120.0,
        "duration": "2 hours",
        "rating": 4.98,
        "reviews": 201,
        "city": "Pokhara",
        "category": "Adventure",
        "host": MOCK_GUIDES[1],
    },
    {
        "id": 11,
        "slug": "bhaktapur-pottery-workshop",
        "title": "Bhaktapur Pottery Workshop",
        "heroImage": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "description": "Learn the ancient art of pottery from master craftsmen and create your own souvenir.",
        "price": 30.0,
        "duration": "3 hours",
        "rating": 4.75,
        "reviews": 36,
        "city": "Bhaktapur",
        "category": "Workshop",
        "host": MOCK_GUIDES[0],
    },
    {
        "id": 12,
        "slug": "lalitpur-cooking-class",
        "title": "Traditional Nepali Cooking Class",
        "heroImage": "https://images.unsplash.com/photo-1556909114-f6e7a7a97c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "description": "Learn to cook authentic Nepali dishes including dal bhat, momos, and sel roti.",
        "price": 35.0,
        "duration": "4 hours",
        "rating": 4.88,
        "reviews": 67,
        "city": "Lalitpur",
        "category": "Food",
        "host": MOCK_GUIDES[2],
    },
]


def resolve_experience_reference(db: Session, experience_id: Optional[int]) -> Optional[dict]:
    """Resolve a public experience id to the database record behind it.

    Returns ``id`` (public id), ``title``, ``city``, ``price`` and ``source``
    (``host_experience`` | ``guide_listing`` | ``mock``) plus ``record_id``, the
    raw primary key that ``host_experience_guides`` rows are keyed by.  The
    mock catalogue lives in memory only, so it is matched last: older requests
    were filed against it and their titles must keep resolving.
    """
    if experience_id is None:
        return None
    try:
        value = int(experience_id)
    except (TypeError, ValueError):
        return None

    if value >= GUIDE_LISTING_ID_OFFSET:
        listing = db.get(GuideListing, value - GUIDE_LISTING_ID_OFFSET)
        if listing is not None:
            return {
                "id": value,
                "title": listing.title,
                "city": listing.city,
                "price": float(listing.price or 0.0),
                "source": "guide_listing",
                "record_id": int(listing.id),
                "is_active": bool(listing.is_active),
            }
    elif value >= HOST_EXPERIENCE_ID_OFFSET:
        experience = db.get(HostExperience, value - HOST_EXPERIENCE_ID_OFFSET)
        if experience is not None:
            return {
                "id": value,
                "title": experience.title,
                "city": experience.city,
                "price": float(experience.price or 0.0),
                "source": "host_experience",
                "record_id": int(experience.id),
                "is_active": bool(experience.is_active),
            }

    mock = next((item for item in MOCK_EXPERIENCES if item["id"] == value), None)
    if mock is not None:
        return {
            "id": value,
            "title": mock["title"],
            "city": mock["city"],
            "price": float(mock["price"] or 0.0),
            "source": "mock",
            "record_id": value,
            "is_active": True,
        }
    return None


def _slugify_guide_name(name: Optional[str]) -> str:
    """URL slug for a guide's public profile (``/guidesprofile/:slug``)."""
    normalized = unicodedata.normalize("NFKD", str(name or ""))
    ascii_name = normalized.encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"[^a-z0-9]+", "-", ascii_name).strip("-") or "guide"


def _guide_to_host_payload(guide: Guide, user_id: Optional[int] = None) -> dict:
    """Public guide payload.

    ``userId`` is the guide's login account id so the frontend can tell a
    signed-in guide apart from other guides (a guide must not see or book
    themselves).  It is resolved from ``host_guides``, which links the catalog
    profile to the account.
    """
    return {
        "id": guide.id,
        "slug": _slugify_guide_name(guide.name),
        "userId": user_id,
        "name": guide.name,
        "image": guide.image,
        "role": guide.role,
        "rating": float(guide.rating or 0.0),
        "reviews": int(guide.reviews or 0),
        "bio": guide.bio,
        "languages": list(guide.languages or []),
        "verified": bool(guide.verified),
        "livesIn": guide.lives_in,
        "cities": list(guide.cities or []),
        "gallery": list(guide.gallery or []),
    }


def _guide_account_ids(db: Session, guide_ids: list[int]) -> dict[int, int]:
    """Map catalog guide ids to the id of the login account that owns them."""
    ids = [int(guide_id) for guide_id in guide_ids if guide_id is not None]
    if not ids:
        return {}
    rows = (
        db.query(HostGuide.guide_id, HostGuide.guide_user_id)
        .filter(HostGuide.guide_id.in_(ids), HostGuide.guide_user_id.isnot(None))
        .all()
    )
    return {int(gid): int(uid) for gid, uid in rows if gid is not None and uid is not None}


def _approved_guide_terms(db: Session, experience_id: int) -> dict[int, dict]:
    """Latest approved assignment terms per guide account for an experience.

    A guide who was approved for an experience quoted their own per-person
    price when they filed the request, so the traveller-facing "Who you'll
    meet" list can show a different price per guide.
    """
    rows = (
        db.query(GuideExperienceRequest)
        .filter(
            GuideExperienceRequest.experience_id == int(experience_id),
            GuideExperienceRequest.status == "approved",
        )
        .order_by(
            GuideExperienceRequest.reviewed_at.desc(), GuideExperienceRequest.id.desc()
        )
        .all()
    )
    terms: dict[int, dict] = {}
    for row in rows:
        if row.guide_user_id is None:
            continue
        account_id = int(row.guide_user_id)
        if account_id in terms:
            continue
        terms[account_id] = {
            "price": float(row.price_per_person) if row.price_per_person is not None else None,
            "slots": row.slots,
        }
    return terms


def _with_guide_terms(
    db: Session, experience_id: int, guides: list[dict]
) -> list[dict]:
    """Attach each guide's approved per-person price and slots to the payload."""
    terms = _approved_guide_terms(db, experience_id)
    for payload in guides:
        account_id = payload.get("userId")
        term = terms.get(int(account_id)) if account_id is not None else None
        payload["price"] = term["price"] if term else None
        payload["slots"] = term["slots"] if term else None
    return guides


def _experience_guides(db: Session, experience_id: int) -> list[dict]:
    """Return approved guide payloads assigned to an experience (mock or live)."""
    rows = (
        db.query(HostExperienceGuide, Guide)
        .join(Guide, HostExperienceGuide.guide_id == Guide.id)
        .filter(
            HostExperienceGuide.experience_id == experience_id,
            Guide.is_active.is_(True),
        )
        .order_by(HostExperienceGuide.is_primary.desc(), HostExperienceGuide.created_at.desc())
        .all()
    )
    account_ids = _guide_account_ids(db, [g.id for _, g in rows])
    guides = [_guide_to_host_payload(g, account_ids.get(g.id)) for _, g in rows]
    return _with_guide_terms(db, experience_id, guides)


def _enrich_experience_with_guides(db: Session, experience: dict) -> dict:
    """Return a copy of the experience with its approved guides attached.

    The mock catalog is module-level state, so the copy matters: mutating it in
    place made the guides appear on every later response (including the single
    experience endpoint) whether or not the database had been read.
    """
    enriched = dict(experience)
    exp_id = enriched.get("id")
    if exp_id is not None:
        guides = _experience_guides(db, int(exp_id))
        if guides:
            enriched["guides"] = guides
    return enriched


def _host_experience_to_public(db: Session, experience: HostExperience) -> Optional[dict]:
    """Host-owned experience enriched with its assigned guide for travelers."""
    rows = (
        db.query(HostExperienceGuide, Guide)
        .join(Guide, HostExperienceGuide.guide_id == Guide.id)
        .filter(
            HostExperienceGuide.experience_id == experience.id,
            Guide.is_active.is_(True),
        )
        .order_by(HostExperienceGuide.is_primary.desc(), HostExperienceGuide.created_at.desc())
        .all()
    )
    if not rows:
        return None
    _assignment, guide = rows[0]
    account_ids = _guide_account_ids(db, [g.id for _, g in rows])
    return {
        "id": HOST_EXPERIENCE_ID_OFFSET + int(experience.id),
        "slug": f"host-{experience.slug}",
        "title": experience.title,
        "heroImage": experience.hero_image or MOCK_GUIDES[0]["image"],
        "description": experience.description,
        "price": float(experience.price or 0.0),
        "duration": experience.duration,
        "rating": float(guide.rating or 4.8),
        "reviews": int(guide.reviews or 0),
        "city": experience.city,
        "category": experience.category,
        "host": _guide_to_host_payload(guide, account_ids.get(guide.id)),
        "guides": _with_guide_terms(
            db,
            HOST_EXPERIENCE_ID_OFFSET + int(experience.id),
            [_guide_to_host_payload(g, account_ids.get(g.id)) for _, g in rows],
        ),
    }


_GUIDE_LISTING_CATEGORY_MAP = {
    "trekking": "Adventure",
    "tour": "Cultural",
    "specialized": "Workshop",
}


def _user_to_host_payload(user: Optional[User]) -> dict:
    """Derive a public host payload from the guide's user account."""
    name = f"{(user.firstName or '')} {(user.lastName or '')}".strip() if user else ""
    return {
        "id": int(user.id) if user else 0,
        "userId": int(user.id) if user else None,
        "name": name or (user.email if user else "Guide"),
        "image": user.avatar_url if (user and user.avatar_url) else MOCK_GUIDES[0]["image"],
        "role": "Experience Guide",
        "rating": 4.8,
        "reviews": 0,
        "bio": user.bio if (user and user.bio) else "",
        "languages": ["English", "Nepali"],
        "verified": False,
        "livesIn": None,
        "cities": [],
        "gallery": [],
        "is_active": True,
    }


def _guide_listing_to_public(db: Session, listing: GuideListing) -> Optional[dict]:
    """Map a published GuideListing (approved proposal) to the public experience shape."""
    user = db.get(User, listing.guide_user_id)
    host = _user_to_host_payload(user)
    if listing.city:
        host["livesIn"] = listing.city
        host["cities"] = [listing.city]
    max_guests = int(listing.max_guests or 0)
    booked_guests = int(listing.booked_guests or 0)
    payload = {
        "id": GUIDE_LISTING_ID_OFFSET + int(listing.id),
        "slug": f"guide-{listing.id}",
        "title": listing.title,
        "heroImage": MOCK_GUIDES[0]["image"],
        "description": listing.description,
        "price": float(listing.price or 0.0),
        "duration": listing.duration,
        # Live capacity, so the booking card can show slots left and stop
        # bookings once the listing is full.
        "maxGuests": max_guests,
        "bookedGuests": booked_guests,
        "availableSlots": max(max_guests - booked_guests, 0),
        "rating": 4.8,
        "reviews": 0,
        "city": listing.city,
        "category": _GUIDE_LISTING_CATEGORY_MAP.get(listing.category, listing.category),
        "host": host,
    }
    # Guides approved for this listing are added next to its owner, so the
    # "Who you'll meet" section stays in step with the assignment requests.
    guides = _experience_guides(db, payload["id"])
    if guides:
        payload["guides"] = guides
    return payload


@router.get("/experiences", response_model=List[ExperienceResponse])
def list_experiences(
    city: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = None,
    db: Session = Depends(get_db),
) -> List[dict]:
    results = MOCK_EXPERIENCES.copy()

    # Attach approved guides to mock experiences from HostExperienceGuide links.
    try:
        for i, exp in enumerate(results):
            results[i] = _enrich_experience_with_guides(db, exp)
    except Exception:
        pass

    # Live host experiences with an assigned guide surface alongside mocks.
    try:
        host_rows = db.query(HostExperience).filter(HostExperience.is_active.is_(True)).all()
        for experience in host_rows:
            public_row = _host_experience_to_public(db, experience)
            if public_row:
                results.append(public_row)
    except Exception:
        pass

    # Live approved guide proposals (published via Content Manager approval)
    # surface on the public Traveller pages.
    try:
        guide_rows = db.query(GuideListing).filter(GuideListing.is_active.is_(True)).all()
        for listing in guide_rows:
            public_row = _guide_listing_to_public(db, listing)
            if public_row:
                results.append(public_row)
    except Exception:
        pass

    # Filter by city
    if city:
        results = [e for e in results if e.get("city", "").lower() == city.lower()]

    # Filter by category
    if category:
        results = [
            e for e in results if e.get("category", "").lower() == category.lower()
        ]

    # Filter by search term
    if search:
        search_lower = search.lower()
        results = [
            e
            for e in results
            if search_lower in e.get("title", "").lower()
            or search_lower in e.get("description", "").lower()
            or search_lower in e.get("city", "").lower()
        ]

    # Filter by price range
    if min_price is not None:
        results = [e for e in results if e.get("price", 0) >= min_price]
    if max_price is not None:
        results = [e for e in results if e.get("price", 0) <= max_price]

    # Sort results
    if sort == "price_low":
        results.sort(key=lambda x: x.get("price", 0))
    elif sort == "price_high":
        results.sort(key=lambda x: x.get("price", 0), reverse=True)
    elif sort == "rating":
        results.sort(key=lambda x: x.get("rating", 0), reverse=True)
    elif sort == "popular":
        results.sort(key=lambda x: x.get("reviews", 0), reverse=True)

    return results


@router.get("/experiences/{slug}", response_model=ExperienceResponse)
def get_experience(slug: str, db: Session = Depends(get_db)) -> dict:
    for exp in MOCK_EXPERIENCES:
        if exp["slug"] == slug:
            return _enrich_experience_with_guides(db, exp)
    # Live host experiences are addressed as host-{slug} on the frontend.
    if slug.startswith("host-"):
        try:
            experience = (
                db.query(HostExperience)
                .filter(HostExperience.slug == slug.removeprefix("host-"), HostExperience.is_active.is_(True))
                .first()
            )
            if experience:
                public_row = _host_experience_to_public(db, experience)
                if public_row:
                    return public_row
        except Exception:
            pass

    # Published guide proposals are addressed as guide-{id}.
    if slug.startswith("guide-"):
        try:
            listing_id = int(slug.removeprefix("guide-"))
            listing = (
                db.query(GuideListing)
                .filter(GuideListing.id == listing_id, GuideListing.is_active.is_(True))
                .first()
            )
            if listing:
                return _guide_listing_to_public(db, listing)
        except Exception:
            pass

    raise HTTPException(status_code=404, detail="Experience not found")


@router.get("/guides", response_model=List[GuideResponse])
def list_guides(
    city: Optional[str] = None, db: Session = Depends(get_db)
) -> List[Guide]:
    service = GuideService(db)
    return service.get_all_guides(city)


@router.get("/guides/{id}", response_model=GuideResponse)
def get_guide(id: int, db: Session = Depends(get_db)) -> dict:
    service = GuideService(db)
    guide = service.get_guide(id)
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    return guide


def _guide_profile_experiences(
    db: Session, guide: Guide, account_id: Optional[int]
) -> list[dict]:
    """Every published experience this guide leads, as card summaries.

    A guide can be assigned to catalogue experiences, to host-created ones, or
    have published listings of their own; the profile page lists all three so it
    never sends a traveller to a dead end.
    """
    entries: list[dict] = []
    seen_slugs: set[str] = set()

    def add(entry: dict) -> None:
        slug = str(entry.get("slug") or "")
        if not slug or slug in seen_slugs:
            return
        seen_slugs.add(slug)
        entries.append(
            {
                "slug": slug,
                "title": entry.get("title") or "",
                "city": entry.get("city"),
                "category": entry.get("category"),
                "heroImage": entry.get("heroImage") or guide.image,
                "price": float(entry.get("price") or 0.0),
                "duration": entry.get("duration"),
                "rating": float(entry.get("rating") or 0.0),
                "reviews": int(entry.get("reviews") or 0),
                "availableSlots": entry.get("availableSlots"),
                # Capacity management fields
                "maxGuests": entry.get("maxGuests"),
                "bookedGuests": entry.get("bookedGuests"),
                "capacityThreshold": entry.get("capacityThreshold"),
                "rechargeDays": entry.get("rechargeDays"),
                "availabilityStatus": entry.get("availabilityStatus"),
                "nextAvailableDate": entry.get("nextAvailableDate"),
            }
        )

    assignment_ids = {
        int(experience_id)
        for (experience_id,) in db.query(HostExperienceGuide.experience_id)
        .filter(HostExperienceGuide.guide_id == guide.id)
        .all()
        if experience_id is not None
    }

    # Catalogue experiences the guide is assigned to (ids below the host offset).
    for experience in MOCK_EXPERIENCES:
        experience_id = int(experience.get("id") or 0)
        if experience_id in assignment_ids and experience_id < HOST_EXPERIENCE_ID_OFFSET:
            add(dict(experience))

    # Host-created experiences, addressed publicly as 100000 + row id.
    host_ids = [
        experience_id - HOST_EXPERIENCE_ID_OFFSET
        for experience_id in assignment_ids
        if HOST_EXPERIENCE_ID_OFFSET <= experience_id < GUIDE_LISTING_ID_OFFSET
    ]
    if host_ids:
        host_rows = (
            db.query(HostExperience)
            .filter(HostExperience.id.in_(host_ids), HostExperience.is_active.is_(True))
            .all()
        )
        for experience in host_rows:
            add(
                {
                    "slug": f"host-{experience.slug}",
                    "title": experience.title,
                    "city": experience.city,
                    "category": experience.category,
                    "heroImage": experience.hero_image,
                    "price": experience.price,
                    "duration": experience.duration,
                    "rating": guide.rating,
                    "reviews": guide.reviews,
                }
            )

    # The guide's own published listings, addressed as guide-{id}.
    if account_id:
        listings = (
            db.query(GuideListing)
            .filter(
                GuideListing.guide_user_id == account_id,
                GuideListing.is_active.is_(True),
            )
            .order_by(GuideListing.created_at.desc())
            .all()
        )
        for listing in listings:
            max_guests = int(listing.max_guests or 0)
            booked = int(listing.booked_guests or 0)
            remaining = max_guests - booked
            add(
                {
                    "slug": f"guide-{listing.id}",
                    "title": listing.title,
                    "city": listing.city,
                    "category": _GUIDE_LISTING_CATEGORY_MAP.get(
                        listing.category, listing.category
                    ),
                    "heroImage": guide.image,
                    "price": listing.price,
                    "duration": listing.duration,
                    "rating": guide.rating,
                    "reviews": guide.reviews,
                    "availableSlots": max(remaining, 0),
                    # Capacity management fields
                    "maxGuests": max_guests,
                    "bookedGuests": booked,
                    "capacityThreshold": listing.capacity_threshold,
                    "rechargeDays": listing.recharge_days,
                    "availabilityStatus": listing.availability_status,
                    "nextAvailableDate": listing.next_available_date.isoformat()
                    if listing.next_available_date
                    else None,
                }
            )

    return entries


def _guide_profile_payload(db: Session, guide: Guide) -> dict:
    """Everything the traveller-facing guide profile page shows in one payload."""
    account_id = _guide_account_ids(db, [guide.id]).get(guide.id)
    payload = _guide_to_host_payload(guide, account_id)
    payload["is_active"] = bool(guide.is_active)

    # The host link carries where the guide works and when they joined.
    link = (
        db.query(HostGuide)
        .filter(HostGuide.guide_id == guide.id)
        .order_by(HostGuide.id)
        .first()
    )
    joined_at = (link.created_at if link else None) or guide.created_at
    payload["memberSince"] = joined_at.isoformat() if joined_at else None
    payload["region"] = link.region if link else None

    experiences = _guide_profile_experiences(db, guide, account_id)
    payload["experiences"] = experiences
    payload["stats"] = {
        "experiences": len(experiences),
        "cities": len(
            {str(entry["city"]).strip() for entry in experiences if entry.get("city")}
            or {str(city).strip() for city in (guide.cities or []) if city}
        ),
        "languages": len(list(guide.languages or [])),
        "rating": float(guide.rating or 0.0),
        "reviews": int(guide.reviews or 0),
    }
    return payload


@router.get("/guides/{id}/profile")
def get_guide_profile(id: int, db: Session = Depends(get_db)) -> dict:
    """Profile page payload for a catalog guide id."""
    guide = db.get(Guide, id)
    if guide is None or not guide.is_active:
        raise HTTPException(status_code=404, detail="Guide not found")
    return _guide_profile_payload(db, guide)


@router.get("/guides/by-slug/{slug}")
def get_guide_profile_by_slug(slug: str, db: Session = Depends(get_db)) -> dict:
    """Profile page payload for a ``/guidesprofile/:slug`` URL.

    Slugs are derived from the guide's name.  When two guides share a name the
    second URL gets the id appended, so ``-<id>`` is honoured as well.
    """
    target = slug.strip().lower()
    guides = (
        db.query(Guide)
        .filter(Guide.is_active.is_(True))
        .order_by(Guide.id)
        .all()
    )

    for guide in guides:
        if _slugify_guide_name(guide.name) == target:
            return _guide_profile_payload(db, guide)

    suffix = re.search(r"-(\d+)$", target)
    if suffix:
        guide = next(
            (g for g in guides if str(g.id) == suffix.group(1)),
            None,
        )
        base = target[: suffix.start()]
        if guide is not None and _slugify_guide_name(guide.name) == base:
            return _guide_profile_payload(db, guide)

    raise HTTPException(status_code=404, detail="Guide not found")
