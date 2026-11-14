"""Dev seed: create admin, content-manager and host users. Idempotent."""

import os

from app.core.database import SessionLocal
from app.core.roles import ADMIN, CONTENT_MANAGER, HOST
from app.core.security import get_password_hash
from app.models.user import User

USERS = [
    {
        "email": "admin@guides-nepal.com",
        "firstName": "System",
        "lastName": "Admin",
        "role": ADMIN,
        "password": os.environ["SEED_ADMIN_PASSWORD"],
    },
    {
        "email": "content@guides-nepal.com",
        "firstName": "Content",
        "lastName": "Manager",
        "role": CONTENT_MANAGER,
        "password": os.environ["SEED_CONTENT_PASSWORD"],
    },
    {
        "email": "host@guides-nepal.com",
        "firstName": "Demo",
        "lastName": "Host",
        "role": HOST,
        "region": "Kathmandu Valley",
        "password": os.environ["SEED_HOST_PASSWORD"],
    },
]


def main() -> None:
    db = SessionLocal()
    try:
        for u in USERS:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if existing:
                existing.role = u["role"]
                existing.hashed_password = get_password_hash(u["password"])
                if u.get("region"):
                    existing.region = u["region"]
                print(f"Updated existing user: {u['email']} ({u['role']})")
            else:
                db.add(User(
                    email=u["email"],
                    firstName=u["firstName"],
                    lastName=u["lastName"],
                    hashed_password=get_password_hash(u["password"]),
                    role=u["role"],
                    region=u.get("region"),
                    is_active=True,
                ))
                print(f"Created user: {u['email']} ({u['role']})")
        db.commit()
        print("Done.")
    finally:
        db.close()


if __name__ == "__main__":
    main()