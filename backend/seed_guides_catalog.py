"""Seed guide catalog profiles, guide onboarding profiles, host-guide links,
and guide-owned experience listings so the backend guide accounts are connected
to real Guides in adventures / hikes / treks / experiences.

Idempotent — safe to re-run. Matches existing rows by stable keys (email for
users, title+city for listings/experiences, name for catalog guides) and
updates rather than duplicating.

Run from the backend directory::

    python seed_guides_catalog.py
"""
from datetime import datetime, timezone

from app.core.database import Base, SessionLocal, engine
from app.core.roles import GUIDE, HOST, TRAVELER
from app.models.booking import HostExperience, HostTour
from app.models.guide import Guide
from app.models.host_guide import HostGuide, HostExperienceGuide
from app.models.guide_listing import GuideListing, GuideProfile
from app.models.user import User

HOST_EMAIL = "host@guides-nepal.com"


def _upsert_user(db, email, first_name, last_name, role):
    u = db.query(User).filter(User.email == email).first()
    now = datetime.now(timezone.utc)
    if u:
        u.role = role
        u.is_active = True
        u.created_at = u.created_at or now
        u.updated_at = now
        if not u.firstName:
            u.firstName = first_name
        if not u.lastName:
            u.lastName = last_name
        db.commit()
        db.refresh(u)
        return u, False
    u = User(
        email=email,
        firstName=first_name,
        lastName=last_name,
        hashed_password="",
        role=role,
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u, True


def _upsert_guide_catalog(db, name, role_text, rating, reviews, bio, languages, city, image=None):
    now = datetime.now(timezone.utc)
    img = image or f"https://images.unsplash.com/photo-1500000000000-{abs(hash(name)) % 10000}?auto=format&fit=crop&w=128&q=80"
    row = db.query(Guide).filter(Guide.name == name).first()
    if row:
        row.role = role_text
        row.rating = rating
        row.reviews = reviews
        row.bio = bio
        row.languages = languages
        row.lives_in = city
        row.cities = [city]
        row.image = img
        row.gallery = [img]
        row.verified = True
        row.is_active = True
        row.created_at = row.created_at or now
        row.updated_at = now
        db.commit()
        db.refresh(row)
        return row, False
    row = Guide(
        name=name,
        image=img,
        role=role_text,
        rating=rating,
        reviews=reviews,
        bio=bio,
        languages=languages,
        verified=True,
        lives_in=city,
        cities=[city],
        gallery=[img],
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row, True


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # --- Ensure the host account exists (owns the guide links) ---
        host, _ = _upsert_user(db, HOST_EMAIL, "Host", "User", HOST)

        # --- Guide user accounts (auth) ---
        guide_users = [
            ("guide@guides-nepal.com", "Test", "Guide", GUIDE),
            ("guide2@guides-nepal.com", "Anita", "Sherpa", GUIDE),
            ("guide3@guides-nepal.com", "Kiran", "Thapa", GUIDE),
            ("guide4@guides-nepal.com", "Sujal", "Lama", GUIDE),
            ("guide5@guides-nepal.com", "Priya", "Sharma", GUIDE),
            ("guide6@guides-nepal.com", "Rohan", "Rai", GUIDE),
            ("guide7@guides-nepal.com", "Mingma", "Tamang", GUIDE),
            ("guide8@guides-nepal.com", "Sarita", "Gurung", GUIDE),
        ]
        for email, first, last, role in guide_users:
            _upsert_user(db, email, first, last, role)

        # --- Guide catalog profiles (adventures / hikes / treks / experiences) ---
        catalog_guides = [
            {
                "name": "Apicha",
                "role": "Foodie & Local Expert",
                "rating": 4.98,
                "reviews": 124,
                "bio": "Born and raised in Kathmandu. I take guests through hidden alleys and street-food stalls where my grandmother used to take me.",
                "languages": ["English", "Nepali", "Hindi"],
                "city": "Kathmandu",
            },
            {
                "name": "Sujal",
                "role": "History & Culture Buff",
                "rating": 4.95,
                "reviews": 89,
                "bio": "I tell the stories of Kathmandu's kings and commoners — the living museum that is my city.",
                "languages": ["English", "Nepali", "Newari"],
                "city": "Patan",
            },
            {
                "name": "Priya",
                "role": "Art & Lifestyle Host",
                "rating": 5.0,
                "reviews": 42,
                "bio": "I see Kathmandu through colors and patterns — from ancient Thangkas to modern street art.",
                "languages": ["English", "Nepali", "French"],
                "city": "Kathmandu",
            },
            {
                "name": "Rohan",
                "role": "Adventure Enthusiast",
                "rating": 4.92,
                "reviews": 156,
                "bio": "Hiking the hills and navigating the busiest markets — I make sure you have a safe and thrilling time.",
                "languages": ["English", "Nepali", "German"],
                "city": "Kathmandu",
            },
            {
                "name": "Lhakpa",
                "role": "High-Altitude Trek Guide",
                "rating": 4.96,
                "reviews": 210,
                "bio": "Annapurna and Everest base camp specialist with years of high-altitude trekking experience.",
                "languages": ["English", "Nepali", "Sherpa"],
                "city": "Pokhara",
            },
            {
                "name": "Dawa",
                "role": "Mountain Hike Specialist",
                "rating": 4.9,
                "reviews": 143,
                "bio": "Poon Hill, Mardi Himal and short Himalayan hikes for travelers of all fitness levels.",
                "languages": ["English", "Nepali"],
                "city": "Pokhara",
            },
            {
                "name": "Mingma",
                "role": "Everest Region Trek Lead",
                "rating": 4.94,
                "reviews": 187,
                "bio": "Everest Base Camp, Gokyo Lakes and Three Passes treks — summit dreams made safe.",
                "languages": ["English", "Nepali", "Sherpa"],
                "city": "Lukla",
            },
            {
                "name": "Sarita",
                "role": "Cultural Experience Host",
                "rating": 4.88,
                "reviews": 67,
                "bio": "Newari festivals, heritage walks and homestay cooking in Bhaktapur and Lalitpur.",
                "languages": ["English", "Nepali", "Newari"],
                "city": "Bhaktapur",
            },
        ]

        guide_catalog = {}
        for g in catalog_guides:
            row, _ = _upsert_guide_catalog(
                db,
                name=g["name"],
                role_text=g["role"],
                rating=g["rating"],
                reviews=g["reviews"],
                bio=g["bio"],
                languages=g["languages"],
                city=g["city"],
            )
            guide_catalog[g["name"]] = row
        # --- Link each guide user to a catalog profile (host_guides) ---
        # One-to-one mapping so every guide account has a catalog profile.
        user_to_catalog = {
            "guide@guides-nepal.com": "Apicha",
            "guide2@guides-nepal.com": "Lhakpa",
            "guide3@guides-nepal.com": "Dawa",
            "guide4@guides-nepal.com": "Sujal",
            "guide5@guides-nepal.com": "Priya",
            "guide6@guides-nepal.com": "Rohan",
            "guide7@guides-nepal.com": "Mingma",
            "guide8@guides-nepal.com": "Sarita",
        }

        for email, catalog_name in user_to_catalog.items():
            u = db.query(User).filter(User.email == email).first()
            g = guide_catalog[catalog_name]
            link = (
                db.query(HostGuide)
                .filter(HostGuide.guide_user_id == u.id, HostGuide.guide_id == g.id)
                .first()
            )
            if not link:
                db.add(
                    HostGuide(
                        host_id=host.id,
                        guide_user_id=u.id,
                        guide_id=g.id,
                        full_name=f"{u.firstName or ''} {u.lastName or ''}".strip(),
                        email=u.email,
                        city=g.lives_in,
                        region="Nepal",
                        documents=[],
                        status="active",
                        created_at=datetime.now(timezone.utc),
                        updated_at=datetime.now(timezone.utc),
                    )
                )
        db.commit()

        # --- Guide onboarding profiles (guide_profiles) ---
        profile_map = {
            "guide@guides-nepal.com": {
                "expertise_areas": ["tour", "specialized"],
                "cities": ["Kathmandu", "Lalitpur"],
                "languages": ["English", "Nepali"],
                "default_max_guests": 6,
            },
            "guide2@guides-nepal.com": {
                "expertise_areas": ["trekking"],
                "cities": ["Pokhara", "Lukla"],
                "languages": ["English", "Nepali", "Sherpa"],
                "default_max_guests": 8,
            },
            "guide3@guides-nepal.com": {
                "expertise_areas": ["trekking", "tour"],
                "cities": ["Pokhara", "Kathmandu"],
                "languages": ["English", "Nepali"],
                "default_max_guests": 10,
            },
            "guide4@guides-nepal.com": {
                "expertise_areas": ["tour"],
                "cities": ["Patan", "Lalitpur"],
                "languages": ["English", "Nepali", "Newari"],
                "default_max_guests": 6,
            },
            "guide5@guides-nepal.com": {
                "expertise_areas": ["tour", "specialized"],
                "cities": ["Kathmandu"],
                "languages": ["English", "Nepali", "French"],
                "default_max_guests": 6,
            },
            "guide6@guides-nepal.com": {
                "expertise_areas": ["trekking"],
                "cities": ["Kathmandu", "Pokhara"],
                "languages": ["English", "Nepali", "German"],
                "default_max_guests": 8,
            },
            "guide7@guides-nepal.com": {
                "expertise_areas": ["trekking"],
                "cities": ["Lukla", "Pokhara"],
                "languages": ["English", "Nepali", "Sherpa"],
                "default_max_guests": 10,
            },
            "guide8@guides-nepal.com": {
                "expertise_areas": ["specialized"],
                "cities": ["Bhaktapur", "Lalitpur"],
                "languages": ["English", "Nepali", "Newari"],
                "default_max_guests": 6,
            },
        }

        for email, data in profile_map.items():
            u = db.query(User).filter(User.email == email).first()
            prof = db.query(GuideProfile).filter(GuideProfile.guide_user_id == u.id).first()
            if not prof:
                db.add(
                    GuideProfile(
                        guide_user_id=u.id,
                        display_name=f"{u.firstName or ''} {u.lastName or ''}".strip(),
                        expertise_areas=data["expertise_areas"],
                        cities=data["cities"],
                        languages=data["languages"],
                        years_experience="5+",
                        default_max_guests=data["default_max_guests"],
                        onboarding_completed=True,
                        created_at=datetime.now(timezone.utc),
                        updated_at=datetime.now(timezone.utc),
                    )
                )
        db.commit()

        # --- Guide-owned experience listings (guide_listings) ---
        listings = [
            {
                "guide_email": "guide@guides-nepal.com",
                "title": "Kathmandu Street Food Walk",
                "category": "tour",
                "city": "Kathmandu",
                "area": "Thamel & Asan",
                "description": "10 tastings of Nepali street food through hidden alleys with a local foodie guide.",
                "duration": "3 hours",
                "difficulty": "Easy",
                "price": 45.0,
                "max_guests": 8,
            },
            {
                "guide_email": "guide2@guides-nepal.com",
                "title": "Annapurna Sunrise Trek",
                "category": "trekking",
                "city": "Pokhara",
                "area": "Ghorepani Poon Hill",
                "description": "Guided Himalayan sunrise trek with acclimatization support and local meals.",
                "duration": "3 days",
                "difficulty": "Moderate",
                "price": 240.0,
                "max_guests": 6,
            },
            {
                "guide_email": "guide3@guides-nepal.com",
                "title": "Mardi Himal Short Trek",
                "category": "trekking",
                "city": "Pokhara",
                "area": "Mardi Himal Base Camp",
                "description": "A short, scenic Himalayan hike perfect for travelers of all fitness levels.",
                "duration": "4 days",
                "difficulty": "Easy",
                "price": 320.0,
                "max_guests": 8,
            },
            {
                "guide_email": "guide4@guides-nepal.com",
                "title": "Patan Heritage Walk",
                "category": "tour",
                "city": "Patan",
                "area": "Durbar Square",
                "description": "Explore Patan's ancient temples, bronze workshops, and Newari courtyards with a culture buff.",
                "duration": "4 hours",
                "difficulty": "Easy",
                "price": 55.0,
                "max_guests": 8,
            },
            {
                "guide_email": "guide5@guides-nepal.com",
                "title": "Kathmandu Art Gallery Tour",
                "category": "tour",
                "city": "Kathmandu",
                "area": "Thamel",
                "description": "Discover Kathmandu's vibrant art scene, from ancient Thangkas to contemporary galleries.",
                "duration": "3 hours",
                "difficulty": "Easy",
                "price": 60.0,
                "max_guests": 6,
            },
            {
                "guide_email": "guide6@guides-nepal.com",
                "title": "Kathmandu Adventure Day Hike",
                "category": "trekking",
                "city": "Kathmandu",
                "area": "Nagarjuna Forest",
                "description": "A day hike through Nagarjuna forest with city views and local wildlife spotting.",
                "duration": "1 day",
                "difficulty": "Moderate",
                "price": 75.0,
                "max_guests": 8,
            },
            {
                "guide_email": "guide7@guides-nepal.com",
                "title": "Everest Base Camp Expedition",
                "category": "trekking",
                "city": "Lukla",
                "area": "Khumbu Region",
                "description": "The classic trek to Everest Base Camp with experienced Sherpa lead.",
                "duration": "12 days",
                "difficulty": "Hard",
                "price": 1200.0,
                "max_guests": 10,
            },
            {
                "guide_email": "guide8@guides-nepal.com",
                "title": "Bhaktapur Newari Cooking",
                "category": "specialized",
                "city": "Bhaktapur",
                "area": "Taumadhi Square",
                "description": "Cook authentic Newari dishes with a local family in a traditional home kitchen.",
                "duration": "4 hours",
                "difficulty": "Easy",
                "price": 65.0,
                "max_guests": 6,
            },
        ]

        listing_rows = {}
        for data in listings:
            u = db.query(User).filter(User.email == data["guide_email"]).first()
            row = (
                db.query(GuideListing)
                .filter(GuideListing.guide_user_id == u.id, GuideListing.title == data["title"])
                .first()
            )
            if not row:
                row = GuideListing(
                    guide_user_id=u.id,
                    title=data["title"],
                    category=data["category"],
                    city=data["city"],
                    area=data["area"],
                    description=data["description"],
                    duration=data["duration"],
                    difficulty=data["difficulty"],
                    price=data["price"],
                    max_guests=data["max_guests"],
                    is_active=True,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc),
                )
                db.add(row)
                db.flush()
            else:
                row.category = data["category"]
                row.city = data["city"]
                row.area = data["area"]
                row.description = data["description"]
                row.duration = data["duration"]
                row.difficulty = data["difficulty"]
                row.price = data["price"]
                row.max_guests = data["max_guests"]
                row.is_active = True
                row.updated_at = datetime.now(timezone.utc)
            listing_rows[data["title"]] = row
        db.commit()

        # --- Link guide catalog profiles to experiences (host_experience_guides) ---
        experience_to_guide = {
            "Kathmandu Street Food Walk": "Apicha",
            "Patan Heritage Walk": "Sujal",
            "Kathmandu Art Gallery Tour": "Priya",
            "Kathmandu Adventure Day Hike": "Rohan",
            "Annapurna Sunrise Trek": "Lhakpa",
            "Mardi Himal Short Trek": "Dawa",
            "Everest Base Camp Expedition": "Mingma",
            "Bhaktapur Newari Cooking": "Sarita",
        }

        for title, catalog_name in experience_to_guide.items():
            listing = listing_rows[title]
            g = guide_catalog[catalog_name]
            link = (
                db.query(HostExperienceGuide)
                .filter(
                    HostExperienceGuide.experience_id == listing.id,
                    HostExperienceGuide.guide_id == g.id,
                )
                .first()
            )
            if not link:
                db.add(
                    HostExperienceGuide(
                        host_id=host.id,
                        experience_id=listing.id,
                        guide_id=g.id,
                        is_primary=True,
                        created_at=datetime.now(timezone.utc),
                    )
                )
        db.commit()

        print("Guide catalog + experience seed complete.")
        print(f"Users: {db.query(User).filter(User.role == GUIDE).count()} guide accounts")
        print(f"Catalog guides: {db.query(Guide).count()}")
        print(f"Guide profiles: {db.query(GuideProfile).count()}")
        print(f"Host-guide links: {db.query(HostGuide).count()}")
        print(f"Guide listings: {db.query(GuideListing).count()}")
        print(f"Experience-guide links: {db.query(HostExperienceGuide).count()}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
