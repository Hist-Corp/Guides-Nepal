"""Seed realistic demo data for the host dashboard with guide assignments."""

from datetime import datetime, timedelta, timezone

from app.core.database import Base, SessionLocal, engine
from app.core.roles import HOST, GUIDE
from app.models.booking import HostBooking, HostExperience, HostTour
from app.models.host_guide import HostExperienceGuide
from app.models.user import User


HOST_EMAIL = "host@guides-nepal.com"


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        host = db.query(User).filter(User.email == HOST_EMAIL).first()
        if not host or host.role != HOST:
            raise RuntimeError("Seed host account not found: {}".format(HOST_EMAIL))

        # Get all guide users
        guide_users = db.query(User).filter(User.role == GUIDE).all()
        if len(guide_users) < 2:
            raise RuntimeError("Need at least 2 guide users to assign to experiences")

        # Create experiences
        experiences_data = [
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
            {
                "title": "Kathmandu Heritage Temple Tour",
                "city": "Kathmandu",
                "category": "Culture",
                "description": "Explore ancient temples and UNESCO heritage sites with a knowledgeable local guide.",
                "price": 65.0,
                "duration": "5 hours",
                "hero_image": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1000&q=80",
            },
            {
                "title": "Chitwan Jungle Safari Experience",
                "city": "Bharatpur",
                "category": "Adventure",
                "description": "Wildlife safari in Chitwan National Park with expert naturalist guides.",
                "price": 120.0,
                "duration": "2 days",
                "hero_image": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1000&q=80",
            },
            {
                "title": "Bhaktapur Pottery & Culture Workshop",
                "city": "Bhaktapur",
                "category": "Culture",
                "description": "Hands-on pottery making and cultural immersion in the ancient city of Bhaktapur.",
                "price": 55.0,
                "duration": "4 hours",
                "hero_image": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1000&q=80",
            },
        ]

        created_experiences = []
        for data in experiences_data:
            slug = data["title"].lower().replace(" ", "-")
            row = db.query(HostExperience).filter(HostExperience.host_id == host.id, HostExperience.slug == slug).first()
            if row:
                print("Updating existing experience: {}".format(row.title))
                for key, value in data.items():
                    setattr(row, key, value)
            else:
                print("Creating new experience: {}".format(data["title"]))
                row = HostExperience(host_id=host.id, slug=slug, is_active=True, **data)
                db.add(row)
            db.flush()
            print("  Experience ID after flush: {}".format(row.id))
            created_experiences.append(row)

        print("Total experiences: {}".format(len(created_experiences)))
        for exp in created_experiences:
            print("  {} (id={})".format(exp.title, exp.id))

        # Create tours
        tours_data = [
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
        for data in tours_data:
            row = db.query(HostTour).filter(HostTour.host_id == host.id, HostTour.title == data["title"]).first()
            if row:
                for key, value in data.items():
                    setattr(row, key, value)
            else:
                db.add(HostTour(host_id=host.id, is_active=True, **data))

        db.flush()

        # Assign at least 2 guides to each experience
        from app.models.guide_listing import GuideListing
        for i, exp in enumerate(created_experiences):
            print("Assigning guides to experience: {} (id={})".format(exp.title, exp.id))
            # Clear existing guide assignments for this experience
            db.query(HostExperienceGuide).filter(HostExperienceGuide.experience_id == exp.id).delete()
            
            # Assign 2 guides per experience (rotating through available guides)
            guide1 = guide_users[i % len(guide_users)]
            guide2 = guide_users[(i + 1) % len(guide_users)]
            
            # Get the guide catalog profile IDs
            guide_listing1 = db.query(GuideListing).filter(GuideListing.guide_user_id == guide1.id).first()
            guide_listing2 = db.query(GuideListing).filter(GuideListing.guide_user_id == guide2.id).first()
            
            print("  Guide 1: {} -> listing_id={}".format(guide1.email, guide_listing1.id if guide_listing1 else None))
            print("  Guide 2: {} -> listing_id={}".format(guide2.email, guide_listing2.id if guide_listing2 else None))
            
            if guide_listing1 and guide_listing2:
                db.add(HostExperienceGuide(
                    host_id=host.id,
                    experience_id=exp.id,
                    guide_id=guide_listing1.id,
                    is_primary=True
                ))
                db.add(HostExperienceGuide(
                    host_id=host.id,
                    experience_id=exp.id,
                    guide_id=guide_listing2.id,
                    is_primary=False
                ))
                print('Assigned guides to {}: {} (primary), {}'.format(exp.title, guide1.email, guide2.email))
            else:
                print('Warning: Could not find guide listings for {} or {}'.format(guide1.email, guide2.email))

        # Create some demo bookings
        experience = db.query(HostExperience).filter(HostExperience.host_id == host.id, HostExperience.title == "Pokhara Lakeside Sunrise Walk").first()
        if experience and not db.query(HostBooking).filter(HostBooking.host_id == host.id).count():
            now = datetime.now(timezone.utc)
            db.add_all([
                HostBooking(host_id=host.id, experience_id=experience.id, guest_name="Maya Thompson", guest_email="maya@example.com", guest_phone="+1 555 0101", date=now + timedelta(days=5), guests=2, total_price=84.0, notes="We love photography and would like to join the sunrise walk.", status="upcoming"),
                HostBooking(host_id=host.id, experience_id=experience.id, guest_name="Daniel Ortiz", guest_email="daniel@example.com", guest_phone="+1 555 0102", date=now + timedelta(days=9), guests=3, total_price=126.0, notes="Celebrating an anniversary with my partner.", status="accepted"),
            ])

        db.commit()
        print("Host dashboard demo data with guide assignments is ready.")
    finally:
        db.close()


if __name__ == "__main__":
    main()