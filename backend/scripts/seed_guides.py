#!/usr/bin/env python3
"""
Seed script to populate guides data from frontend guidesData.ts
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import SessionLocal
from app.models.guide import Guide

# Import the guides data from frontend
guides_data = [
    {
        "id": 1,
        "name": "Apicha",
        "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
        "role": "Cultural Expert",
        "rating": 4.9,
        "reviews": 120,
        "bio": "Expert in Kathmandu Valley history, culture, and hidden gems. Passionate about sharing authentic Nepali experiences.",
        "languages": ["English", "Nepali", "Newari"],
        "verified": True,
        "livesIn": "Kathmandu",
        "cities": ["Kathmandu", "Bhaktapur"],
        "gallery": [
            "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
            "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
        ],
    },
    {
        "id": 2,
        "name": "Sujal",
        "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
        "role": "Adventure Specialist",
        "rating": 4.92,
        "reviews": 89,
        "bio": "Mountain guide with 8+ years of experience. Specialized in trekking, hiking, and outdoor adventures in the Himalayas.",
        "languages": ["English", "Nepali", "Hindi"],
        "verified": True,
        "livesIn": "Pokhara",
        "cities": ["Pokhara", "Kathmandu"],
        "gallery": [
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
            "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
        ],
    },
    {
        "id": 3,
        "name": "Priya",
        "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
        "role": "Food & Culture Guide",
        "rating": 4.95,
        "reviews": 156,
        "bio": "Culinary expert specializing in traditional Nepali cuisine. Loves sharing food culture and cooking experiences.",
        "languages": ["English", "Nepali", "Newari"],
        "verified": True,
        "livesIn": "Kathmandu",
        "cities": ["Kathmandu", "Pokhara", "Lalitpur"],
        "gallery": [
            "https://images.unsplash.com/photo-1556909114-f6e7a7a97c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
            "https://images.unsplash.com/photo-1574484284002-952d92456975?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
        ],
    },
    {
        "id": 4,
        "name": "Rohan",
        "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
        "role": "Adventure Enthusiast",
        "rating": 4.92,
        "reviews": 78,
        "bio": "Passionate about outdoor adventures and eco-tourism. Specializes in sustainable travel and nature experiences.",
        "languages": ["English", "Nepali"],
        "verified": True,
        "livesIn": "Pokhara",
        "cities": ["Pokhara", "Kathmandu", "Lalitpur"],
        "gallery": [
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
            "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
        ],
    },

    {
        "id": 5,
        "name": "Mingma",
        "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
        "role": "Everest Region Trek Lead",
        "rating": 4.94,
        "reviews": 156,
        "bio": "High-altitude trekking specialist with 10+ years of experience leading expeditions in the Everest region.",
        "languages": ["English", "Nepali", "Sherpa"],
        "verified": True,
        "livesIn": "Kathmandu",
        "cities": ["Kathmandu", "Lalitpur"],
        "gallery": [
            "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
            "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
            "https://images.unsplash.com/photo-1523275334575-1c0148a2533b?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80",
        ],
    },
    {
        "id": 6,
        "name": "Sarita",
        "image": "https://images.unsplash.com/photo-1615109398623-88346a601842?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
        "role": "Cultural Experience Host",
        "rating": 4.88,
        "reviews": 178,
        "bio": "Passionate about Nepali heritage, festivals, and local traditions. Loves introducing travelers to authentic cultural experiences.",
        "languages": ["English", "Nepali"],
        "verified": True,
        "livesIn": "Bhaktapur",
        "cities": ["Bhaktapur", "Kathmandu"],
        "gallery": [
            "https://images.unsplash.com/photo-1615109398623-88346a601842?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
            "https://images.unsplash.com/photo-1615109398623-88346a601842?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80",
        ],
    },
]

def seed_guides() -> None:
    """Seed the database with guides data"""
    db = SessionLocal()
    try:
        # Clear existing guides
        db.query(Guide).delete()

        # Insert new guides
        for guide_data in guides_data:
            guide = Guide(
                id=guide_data["id"],
                name=guide_data["name"],
                image=guide_data["image"],
                role=guide_data["role"],
                rating=guide_data["rating"],
                reviews=guide_data["reviews"],
                bio=guide_data["bio"],
                languages=guide_data["languages"],
                verified=guide_data["verified"],
                lives_in=guide_data["livesIn"],
                cities=guide_data["cities"],
                gallery=guide_data["gallery"],
                is_active=True,
            )
            db.add(guide)

        db.commit()
        print(f"Successfully seeded {len(guides_data)} guides")

    except Exception as e:
        db.rollback()
        print(f"Error seeding guides: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_guides()
