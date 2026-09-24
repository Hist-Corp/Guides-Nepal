"""Seed realistic demo data for the host dashboard.

Safe to run repeatedly: records are matched by their stable demo titles and
updated rather than duplicated. Run from the backend directory:

    python seed_host_dashboard.py
"""

from datetime import datetime, timedelta, timezone

from app.core.database import Base, SessionLocal, engine
from app.core.roles import HOST
from app.models.booking import HostBooking, HostExperience, HostTour
from app.models.user import User

HOST_EMAIL = "host@guides-nepal.com"


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        host = db.query(User).filter(User.email == HOST_EMAIL).first()
        if not host or host.role != HOST:
            raise RuntimeError(f"Seed host account not found: {HOST_EMAIL}")

        experiences = [
            {
                "title": "Pokhara Lakeside Sunrise Walk",
                "city": "Pokhara",
                "category": "Nature",
                "description": "A gentle sunrise walk around Phewa Lake with local stories, tea, and mountain views.",
                "price": 42.0,
                "duration": "3 hours",
                "hero_image": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
            },
            {
                "title": "Traditional Nepali Cooking Session",
                "city": "Lalitpur",
                "category": "Food",
                "description": "Cook dal bhat, momos, and sel roti with a local family in a welcoming home kitchen.",
                "price": 58.0,
                "duration": "4 hours",
                "hero_image": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80",
            },
        ]
        for data in experiences:
            slug = data["title"].lower().replace(" ", "-")
            row = db.query(HostExperience).filter(HostExperience.host_id == host.id, HostExperience.slug == slug).first()
            if row:
                for key, value in data.items():
                    setattr(row, key, value)
            else:
                db.add(HostExperience(host_id=host.id, slug=slug, is_active=True, **data))

        tours = [
            {
                "title": "Annapurna Sunrise Trek",
                "city": "Pokhara",
                "description": "A guided Himalayan trek with acclimatization support and locally sourced meals.",
                "itinerary": "Day 1: Pokhara to Nayapul\nDay 2: Trek to Chhomrong\nDay 3: Sunrise at Bhanu Bhakta",
                "meeting_point": "Pokhara Airport, Terminal 1",
                "duration": "3 days",
                "difficulty": "Moderate",
                "max_guests": 8,
                "price": 240.0,
            },
            {
                "title": "Bhaktapur Heritage Evening",
                "city": "Bhaktapur",
                "description": "Explore historic temples and Newari neighborhoods with an experienced local host.",
                "itinerary": "15:00: Meet at Taumadhi Square\n17:00: Pottery workshop\n19:00: Traditional dinner",
                "meeting_point": "Taumadhi Square, Bhaktapur",
                "duration": "5 hours",
                "difficulty": "Easy",
                "max_guests": 12,
                "price": 95.0,
            },
        ]
        for data in tours:
            row = db.query(HostTour).filter(HostTour.host_id == host.id, HostTour.title == data["title"]).first()
            if row:
                for key, value in data.items():
                    setattr(row, key, value)
            else:
                db.add(HostTour(host_id=host.id, is_active=True, **data))

        db.flush()
        experience = db.query(HostExperience).filter(HostExperience.host_id == host.id, HostExperience.title == "Pokhara Lakeside Sunrise Walk").first()
        if experience and not db.query(HostBooking).filter(HostBooking.host_id == host.id).count():
            now = datetime.now(timezone.utc)
            db.add_all([
                HostBooking(host_id=host.id, experience_id=experience.id, guest_name="Maya Thompson", guest_email="maya@example.com", guest_phone="+1 555 0101", date=now + timedelta(days=5), guests=2, total_price=84.0, notes="We love photography and would like to join the sunrise walk.", status="upcoming"),
                HostBooking(host_id=host.id, experience_id=experience.id, guest_name="Daniel Ortiz", guest_email="daniel@example.com", guest_phone="+1 555 0102", date=now + timedelta(days=9), guests=3, total_price=126.0, notes="Celebrating an anniversary with my partner.", status="accepted"),
            ])
        db.commit()
        print("Host dashboard demo data is ready.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
