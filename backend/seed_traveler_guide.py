"""Dev seed: create Traveller (traveler) + Guide test accounts for frontend testing.
Seeds 12 frontend test accounts by default (4 travellers + 8 guides) so every
catalog guide profile can be connected to a backend guide account.
Idempotent — upserts by email, so it is safe to re-run.

Usage (from ``backend/``)::

    python seed_traveler_guide.py

Override passwords via environment variables::

    SEED_TRAVELER_PASSWORD=... SEED_GUIDE_PASSWORD=... python seed_traveler_guide.py

NOTE on spelling: the task says "Traveller" (British English) but the
codebase canonical role is ``traveler`` (American English, see
``app/core/roles.py`` -> ``TRAVELER = "traveler"``). This script seeds the
canonical ``traveler`` role, which is what the API / frontend expect.
"""
import os

from app.core.database import Base, engine, SessionLocal
from app.core.roles import GUIDE, TRAVELER
from app.core.security import get_password_hash, validate_password_strength, verify_password
from app import models  # noqa: F401  (register all models so create_all sees them)
from app.models.user import User

# Default passwords meet the backend password policy (min 8, upper, number, special).
DEFAULT_TRAVELER_PASSWORD = "Traveler@2024"
DEFAULT_GUIDE_PASSWORD = "Guide@2024"


def _password(env_key: str, default: str) -> str:
    return os.environ.get(env_key, default)


USERS = [
    {
        "email": "traveler@guides-nepal.com",
        "firstName": "Test",
        "lastName": "Traveler",
        "role": TRAVELER,
        "password": _password("SEED_TRAVELER_PASSWORD", DEFAULT_TRAVELER_PASSWORD),
    },
    {
        "email": "guide@guides-nepal.com",
        "firstName": "Test",
        "lastName": "Guide",
        "role": GUIDE,
        "password": _password("SEED_GUIDE_PASSWORD", DEFAULT_GUIDE_PASSWORD),
    },
    {
        "email": "traveler2@guides-nepal.com",
        "firstName": "Sita",
        "lastName": "Tamang",
        "role": TRAVELER,
        "password": _password("SEED_TRAVELER2_PASSWORD", "Traveler2@2024"),
    },
    {
        "email": "traveler3@guides-nepal.com",
        "firstName": "Ramesh",
        "lastName": "Gurung",
        "role": TRAVELER,
        "password": _password("SEED_TRAVELER3_PASSWORD", "Traveler3@2024"),
    },
    {
        "email": "guide2@guides-nepal.com",
        "firstName": "Anita",
        "lastName": "Sherpa",
        "role": GUIDE,
        "password": _password("SEED_GUIDE2_PASSWORD", "Guide2@2024"),
    },
    {
        "email": "guide3@guides-nepal.com",
        "firstName": "Kiran",
        "lastName": "Thapa",
        "role": GUIDE,
        "password": _password("SEED_GUIDE3_PASSWORD", "Guide3@2024"),
    },
    {
        "email": "traveler4@guides-nepal.com",
        "firstName": "Maya",
        "lastName": "Rai",
        "role": TRAVELER,
        "password": _password("SEED_TRAVELER4_PASSWORD", "Traveler4@2024"),
    },
    {
        "email": "guide4@guides-nepal.com",
        "firstName": "Sujal",
        "lastName": "Lama",
        "role": GUIDE,
        "password": _password("SEED_GUIDE4_PASSWORD", "Guide4@2024"),
    },
    {
        "email": "guide5@guides-nepal.com",
        "firstName": "Priya",
        "lastName": "Sharma",
        "role": GUIDE,
        "password": _password("SEED_GUIDE5_PASSWORD", "Guide5@2024"),
    },
    {
        "email": "guide6@guides-nepal.com",
        "firstName": "Rohan",
        "lastName": "Rai",
        "role": GUIDE,
        "password": _password("SEED_GUIDE6_PASSWORD", "Guide6@2024"),
    },
    {
        "email": "guide7@guides-nepal.com",
        "firstName": "Mingma",
        "lastName": "Tamang",
        "role": GUIDE,
        "password": _password("SEED_GUIDE7_PASSWORD", "Guide7@2024"),
    },
    {
        "email": "guide8@guides-nepal.com",
        "firstName": "Sarita",
        "lastName": "Gurung",
        "role": GUIDE,
        "password": _password("SEED_GUIDE8_PASSWORD", "Guide8@2024"),
    },
]


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for u in USERS:
            valid, msg = validate_password_strength(u["password"])
            if not valid:
                print(f"  [SKIP] {u['email']} - weak password: {msg}")
                continue
            existing = db.query(User).filter(User.email == u["email"]).first()
            hashed = get_password_hash(u["password"])
            if existing:
                existing.role = u["role"]
                existing.hashed_password = hashed
                existing.is_active = True
                if not existing.firstName:
                    existing.firstName = u["firstName"]
                if not existing.lastName:
                    existing.lastName = u["lastName"]
                db.commit()
                db.refresh(existing)
                ok = verify_password(u["password"], str(existing.hashed_password))
                print(
                    f"  [UPDATED] {u['email']:30s} | role: {u['role']:10s} "
                    f"| password: {u['password']:15s} | verified: {ok}"
                )
            else:
                db.add(
                    User(
                        email=u["email"],
                        firstName=u["firstName"],
                        lastName=u["lastName"],
                        hashed_password=hashed,
                        role=u["role"],
                        is_active=True,
                    )
                )
                db.commit()
                created = db.query(User).filter(User.email == u["email"]).first()
                ok = verify_password(u["password"], str(created.hashed_password))
                print(
                    f"  [CREATED] {u['email']:30s} | role: {u['role']:10s} "
                    f"| password: {u['password']:15s} | verified: {ok}"
                )
        print(f"Total users: {db.query(User).count()}")
        print("Done.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
