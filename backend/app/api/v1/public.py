from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.guide import Guide
from app.models.host_application import HostApplication
from app.models.support_ticket import SupportTicket
from app.schemas.public import ExperienceResponse, GuideResponse
from app.services.guide_service import GuideService

router = APIRouter()


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
def submit_host_application(payload: PublicHostApplicationCreate, db: Session = Depends(get_db)):
    """Public guide/host registration form from the marketing website."""
    application = HostApplication(
        host_name=payload.full_name,
        email=payload.email,
        city=payload.city,
        region=payload.city,
        phone=payload.phone,
        experience=payload.documents or "Guide registration via website",
        status="pending",
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return {"status": "ok", "id": application.id, "message": "Application received"}


# Mock Data to match frontend types exactly
MOCK_GUIDES = [
    {
        "id": 1,
        "name": "Ram Bahadur",
        "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
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
        "image": "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
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
    }
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
        "heroImage": "https://images.unsplash.com/photo-1589923188900-85688317b96e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
        "heroImage": "https://images.unsplash.com/photo-1604542052539-b8c13b852152?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
        "heroImage": "https://images.unsplash.com/photo-1547292283-7c664a092534?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
        "heroImage": "https://images.unsplash.com/photo-1589952283733-8383b3939522?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
    }
]


@router.get("/experiences", response_model=List[ExperienceResponse])
def list_experiences(
    city: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = None,
) -> List[dict]:
    results = MOCK_EXPERIENCES.copy()
    
    # Filter by city
    if city:
        results = [e for e in results if e.get("city", "").lower() == city.lower()]
    
    # Filter by category
    if category:
        results = [e for e in results if e.get("category", "").lower() == category.lower()]
    
    # Filter by search term
    if search:
        search_lower = search.lower()
        results = [e for e in results if 
                   search_lower in e.get("title", "").lower() or 
                   search_lower in e.get("description", "").lower() or
                   search_lower in e.get("city", "").lower()]
    
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
def get_experience(slug: str) -> dict:
    for exp in MOCK_EXPERIENCES:
        if exp["slug"] == slug:
            return exp
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
