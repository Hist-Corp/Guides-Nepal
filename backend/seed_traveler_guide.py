"""Dev seed: create Traveller (traveler) + Guide test accounts. Idempotent.

Usage (from ``backend/``)::

    python seed_traveler_guide.py

The script upserts by email, so it is safe to re-run — it resets the
password/role and re-activates the account each time.

NOTE on spelling: the task says "Traveller" (British English) but the
codebase canonical role is ``traveler`` (American English, see
``app/core/roles.py`` -> ``TRAVELER = "traveler"``). This script seeds the
canonical ``traveler`` role, which is what the API / frontend expect.
"""
from app.core.database import Base, engine, SessionLocal
from app.core.roles import GUIDE, TRAVELER
from app.core.security import get_password_hash, validate_password_strength, verify_password
from app import models  # noqa: F401  (register all models so create_all sees them)
from app.models.user import User

# Test credentials — development only, never use in production.
# Passwords intentionally meet the policy in backend/.env
# (min 8 chars + uppercase + number + special char).
USERS = [
    {
        "email": "traveler@guides-nepal.com",
        "firstName": "Test",
        "lastName": "Traveler",
        "role": TRAVELER,
        "password": "Traveler@2024",
    },
    {
        "email": "guide@guides-nepal.com",
        "firstName": "Test",
        "lastName": "Guide",
        "role": GUIDE,
        "password": "Guide@2024",
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
