"""Seed guide listings only (without experience assignments)."""

from datetime import datetime, timezone

from app.core.database import Base, SessionLocal, engine
from app.core.roles import GUIDE, HOST
from app.models.guide_listing import GuideListing, GuideProfile
from app.models.user import User


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Get all guide users
        guide_users = db.query(User).filter(User.role == GUIDE).all()
        if not guide_users:
            raise RuntimeError("No guide users found")

        # Guide listing data matching the guide users
        guide_listings_data = [
            {
                "guide_user_id": guide_users[0].id if len(guide_users) > 0 else None,
                "title": "Pokhara Lakeside Sunrise Walk",
                "category": "tour",
                "city": "Pokhara",
                "area": "Lakeside",
                "description": "A gentle sunrise walk around Phewa Lake with local stories, tea, and mountain views.",
                "itinerary": "5:30 AM: Meet at Lakeside\n6:00 AM: Sunrise walk\n7:30 AM: Tea and local snacks",
                "meeting_point": "Lakeside, Pokhara",
                "duration": "3 hours",
                "difficulty": "Easy",
                "price": 42.0,
                "max_guests": 10,
            },
            {
                "guide_user_id": guide_users[1].id if len(guide_users) > 1 else None,
                "title": "Traditional Nepali Cooking Session",
                "category": "tour",
                "city": "Lalitpur",
                "area": "Patan",
                "description": "Cook dal bhat, momos, and sel roti with a local family in a welcoming home kitchen.",
                "itinerary": "10:00 AM: Meet at Patan Durbar Square\n10:30 AM: Market tour for ingredients\n12:00 PM: Cooking session\n2:00 PM: Enjoy your meal",
                "meeting_point": "Patan Durbar Square",
                "duration": "4 hours",
                "difficulty": "Easy",
                "price": 58.0,
                "max_guests": 8,
            },
            {
                "guide_user_id": guide_users[2].id if len(guide_users) > 2 else None,
                "title": "Kathmandu Heritage Temple Tour",
                "category": "trekking",
                "city": "Kathmandu",
                "area": "Thamel",
                "description": "Explore ancient temples and UNESCO heritage sites with a knowledgeable local guide.",
                "itinerary": "9:00 AM: Meet at Thamel\n9:30 AM: Swayambhunath (Monkey Temple)\n11:30 AM: Pashupatinath\n1:00 PM: Boudhanath Stupa",
                "meeting_point": "Thamel, Kathmandu",
                "duration": "5 hours",
                "difficulty": "Easy",
                "price": 65.0,
                "max_guests": 12,
            },
            {
                "guide_user_id": guide_users[3].id if len(guide_users) > 3 else None,
                "title": "Chitwan Jungle Safari Experience",
                "category": "trekking",
                "city": "Bharatpur",
                "area": "Chitwan National Park",
                "description": "Wildlife safari in Chitwan National Park with expert naturalist guides.",
                "itinerary": "Day 1: Arrival, village tour, sunset view\nDay 2: Jeep safari, canoe ride, elephant breeding center",
                "meeting_point": "Sauraha, Chitwan",
                "duration": "2 days",
                "difficulty": "Easy",
                "price": 120.0,
                "max_guests": 6,
            },
            {
                "guide_user_id": guide_users[4].id if len(guide_users) > 4 else None,
                "title": "Bhaktapur Pottery & Culture Workshop",
                "category": "tour",
                "city": "Bhaktapur",
                "area": "Pottery Square",
                "description": "Hands-on pottery making and cultural immersion in the ancient city of Bhaktapur.",
                "itinerary": "10:00 AM: Meet at Pottery Square\n10:30 AM: Pottery workshop\n12:30 PM: City tour\n2:00 PM: Traditional lunch",
                "meeting_point": "Pottery Square, Bhaktapur",
                "duration": "4 hours",
                "difficulty": "Easy",
                "price": 55.0,
                "max_guests": 10,
            },
            {
                "guide_user_id": guide_users[5].id if len(guide_users) > 5 else None,
                "title": "Annapurna Base Camp Trek",
                "category": "trekking",
                "city": "Pokhara",
                "area": "Nayapul",
                "description": "Classic trek to Annapurna Base Camp with stunning mountain views.",
                "itinerary": "Day 1: Pokhara to Nayapul, trek to Ghandruk\nDay 2: Ghandruk to Chhomrong\nDay 3: Chhomrong to Bamboo\nDay 4: Bamboo to Annapurna Base Camp\nDay 5: Base Camp to Bamboo\nDay 6: Bamboo to Nayapul, return to Pokhara",
                "meeting_point": "Pokhara Airport",
                "duration": "6 days",
                "difficulty": "Moderate",
                "price": 450.0,
                "max_guests": 8,
            },
            {
                "guide_user_id": guide_users[6].id if len(guide_users) > 6 else None,
                "title": "Everest View Trek",
                "category": "trekking",
                "city": "Lukla",
                "area": "Khumbu",
                "description": "Short trek to Everest View Hotel with panoramic Himalayan vistas.",
                "itinerary": "Day 1: Fly to Lukla, trek to Phakding\nDay 2: Phakding to Namche Bazaar\nDay 3: Acclimatization day\nDay 4: Namche to Everest View Hotel\nDay 5: Return to Lukla",
                "meeting_point": "Kathmandu Domestic Airport",
                "duration": "5 days",
                "difficulty": "Moderate",
                "price": 680.0,
                "max_guests": 6,
            },
            {
                "guide_user_id": guide_users[7].id if len(guide_users) > 7 else None,
                "title": "Langtang Valley Trek",
                "category": "trekking",
                "city": "Kathmandu",
                "area": "Syabrubesi",
                "description": "Beautiful trek through Langtang Valley with Tibetan culture and mountain scenery.",
                "itinerary": "Day 1: Kathmandu to Syabrubesi\nDay 2: Syabrubesi to Lama Hotel\nDay 3: Lama Hotel to Langtang Village\nDay 4: Langtang to Kyanjin Gompa\nDay 5: Kyanjin to Lama Hotel\nDay 6: Lama Hotel to Syabrubesi, return to Kathmandu",
                "meeting_point": "Kathmandu (Machhapokhari)",
                "duration": "6 days",
                "difficulty": "Moderate",
                "price": 420.0,
                "max_guests": 8,
            },
        ]

        created_listings = []
        for data in guide_listings_data:
            if data["guide_user_id"] is None:
                continue
            row = db.query(GuideListing).filter(GuideListing.guide_user_id == data["guide_user_id"], GuideListing.title == data["title"]).first()
            if row:
                for key, value in data.items():
                    setattr(row, key, value)
            else:
                row = GuideListing(is_active=True, booked_guests=0, **data)
                db.add(row)
            db.flush()
            created_listings.append(row)
            print(f"Created/Updated guide listing: {data['title']} for guide_user_id={data['guide_user_id']}")

        # Create guide profiles for each guide user
        for user in guide_users:
            profile = db.query(GuideProfile).filter(GuideProfile.guide_user_id == user.id).first()
            if not profile:
                profile = GuideProfile(
                    guide_user_id=user.id,
                    display_name=f"{user.firstName} {user.lastName}",
                    expertise_areas=["Culture", "Nature", "Food"],
                    cities=["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Bharatpur"],
                    languages=["English", "Nepali"],
                    bio=f"Experienced local guide {user.firstName} {user.lastName} showing you the best of Nepal.",
                    years_experience="5+",
                    default_max_guests=10,
                    onboarding_completed=True,
                )
                db.add(profile)
                print(f"Created guide profile for {user.email}")

        db.commit()
        print("Guide listings and profiles created successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    main()