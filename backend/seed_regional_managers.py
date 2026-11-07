"""Dev seed: create 7 regional-head users, one for each province of Nepal. Idempotent."""

from sqlalchemy import inspect, text

from app.core.database import Base, engine, SessionLocal
from app.core.roles import REGIONAL_HEAD
from app.core.security import get_password_hash
from app import models  # noqa: F401  (register all models)
from app.models.user import User

import os

PROVINCES = [
    "Koshi Province",
    "Madhesh Province", 
    "Bagmati Province",
    "Gandaki Province",
    "Lumbini Province",
    "Karnali Province",
    "Sudurpashchim Province",
]

USERS = [
    {
        "email": f"regional-{i+1}@guides-nepal.com",
        "firstName": f"Regional",
        "lastName": f"Manager {i+1}",
        "role": REGIONAL_HEAD,
        "region": province,
        "password": os.environ.get("SEED_REGIONAL_PASSWORD", "RegionalManager123!"),
    }
    for i, province in enumerate(PROVINCES)
]


def main() -> None:
    inspector = inspect(engine)
    # Add the `region` column to existing users table if missing (SQLite).
    if "users" in inspector.get_table_names():
        cols = [c["name"] for c in inspector.get_columns("users")]
        if "region" not in cols:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE users ADD COLUMN region VARCHAR"))
            print("Added users.region column")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        for u in USERS:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if existing:
                existing.role = u["role"]
                existing.hashed_password = get_password_hash(u["password"])
                if u.get("region"):
                    existing.region = u["region"]
                print(f"Updated existing user: {u['email']} ({u['role']}) - Region: {u['region']}")
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
                print(f"Created user: {u['email']} ({u['role']}) - Region: {u['region']}")

        db.commit()
        print("Done.")
    finally:
        db.close()


if __name__ == "__main__":
    main()