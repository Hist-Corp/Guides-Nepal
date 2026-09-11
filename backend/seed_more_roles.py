"""Dev seed: create admin, content-writer, host and guide users. Idempotent."""

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User

USERS = [
    {
        "email": "admin@guides-nepal.com",
        "firstName": "System",
        "lastName": "Admin",
        "role": "admin",
        "password": "Admin@12345",
    },
    {
        "email": "content@guides-nepal.com",
        "firstName": "Content",
        "lastName": "Writer",
        "role": "content-writer",
        "password": "Content@2024",
    },
    {
        "email": "host@guides-nepal.com",
        "firstName": "Demo",
        "lastName": "Host",
        "role": "host",
        "region": "Kathmandu Valley",
        "password": "Host@2024",
    },
    {
        "email": "guide@guides-nepal.com",
        "firstName": "Demo",
        "lastName": "Guide",
        "role": "guide",
        "region": "Kathmandu Valley",
        "password": "Guide@2024",
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