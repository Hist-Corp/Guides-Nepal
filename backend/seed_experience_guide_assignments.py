#!/usr/bin/env python3
"""Seed ``host_experience_guides`` from the README-documented seed accounts.

Reads the guide-to-experience assignments documented in
``README.md`` under "Experience Guide Assignments" and the catalog
guide id → user account mapping under "Default mapping", then creates
``host_experience_guides`` rows so those guides appear in the
traveller-facing "Who you'll meet" section.

Idempotent — upserts by (experience_id, guide_id), safe to re-run.

Usage (from ``backend/``)::

    python seed_experience_guide_assignments.py
"""
from __future__ import annotations

from app import models  # noqa: F401  (register all models)
from app.core.database import Base, SessionLocal, engine
from app.models.host_guide import HostExperienceGuide


# ---------------------------------------------------------------------------
# Seed data from README.md — "Experience Guide Assignments" and "Default mapping"
# ---------------------------------------------------------------------------
#
# README "Experience Guide Assignments" (experience → city → primary → secondary):
#   Pokhara Lakeside Sunrise Walk      | Pokhara | guide@        | guide2@
#   Traditional Nepali Cooking Session | Lalitpur| guide2@       | guide3@
#   Kathmandu Heritage Temple Tour     | Kathmandu| guide3@      | guide4@
#   Chitwan Jungle Safari Experience   | Bharatpur| guide4@      | guide5@
#   Bhaktapur Pottery & Culture Workshop| Bhaktapur| guide5@      | guide6@
#
# README "Default mapping" (guide email → catalog profile id):
#   guide@guides-nepal.com   → catalog id 1 (Apicha)
#   guide2@guides-nepal.com  → catalog id 5 (Lhakpa)
#   guide3@guides-nepal.com  → catalog id 6 (Dawa)
#   guide4@guides-nepal.com  → catalog id 2 (Sujal)
#   guide5@guides-nepal.com  → catalog id 3 (Priya)
#   guide6@guides-nepal.com  → catalog id 4 (Rohan)
#
# MOCK_EXPERIENCES ids matched by theme/city:
#   Pokhara sunrise → id 4  (Sarangkot Sunrise Trek, Pokhara)
#   Cooking class   → id 12 (Traditional Nepali Cooking Class, Lalitpur)
#   Heritage tour   → id 2  (Hidden Gems of Kathmandu, Kathmandu)
#   Jungle safari   → id 7  (Chitwan Wildlife Safari, Bharatpur)
#   Pottery workshop→ id 11 (Bhaktapur Pottery Workshop, Bhaktapur)

GUIDE_EMAIL_TO_CATALOG_ID = {
    "guide@guides-nepal.com": 1,
    "guide2@guides-nepal.com": 5,
    "guide3@guides-nepal.com": 6,
    "guide4@guides-nepal.com": 2,
    "guide5@guides-nepal.com": 3,
    "guide6@guides-nepal.com": 4,
}

# (experience_id, [(guide_email, is_primary), ...])
SEED_ASSIGNMENTS = [
    (4, [("guide@guides-nepal.com", True), ("guide2@guides-nepal.com", False)]),
    (12, [("guide2@guides-nepal.com", True), ("guide3@guides-nepal.com", False)]),
    (2, [("guide3@guides-nepal.com", True), ("guide4@guides-nepal.com", False)]),
    (7, [("guide4@guides-nepal.com", True), ("guide5@guides-nepal.com", False)]),
    (11, [("guide5@guides-nepal.com", True), ("guide6@guides-nepal.com", False)]),
]

# A valid host user id that owns these assignments.  host@guides-nepal.com
# (user id 5) is pre-seeded by seed_credentials.py.
HOST_USER_ID = 5


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        created = 0
        for experience_id, guide_pairs in SEED_ASSIGNMENTS:
            for guide_email, is_primary in guide_pairs:
                catalog_id = GUIDE_EMAIL_TO_CATALOG_ID[guide_email]
                existing = (
                    db.query(HostExperienceGuide)
                    .filter(
                        HostExperienceGuide.experience_id == experience_id,
                        HostExperienceGuide.guide_id == catalog_id,
                    )
                    .first()
                )
                if existing is not None:
                    existing.is_primary = is_primary
                    existing.host_id = HOST_USER_ID
                    db.add(existing)
                    continue
                db.add(
                    HostExperienceGuide(
                        host_id=HOST_USER_ID,
                        experience_id=experience_id,
                        guide_id=catalog_id,
                        is_primary=is_primary,
                    )
                )
                created += 1
        db.commit()
        print(f"Created {created} new host_experience_guides rows (idempotent upsert).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
