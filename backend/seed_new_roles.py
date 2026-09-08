"""Dev seed: create super-admin, regional-head and customer-support users,
plus sample host applications and support tickets. Idempotent."""

from sqlalchemy import inspect, text

from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app import models  # noqa: F401  (register all models)
from app.models.user import User
from app.models.host_application import HostApplication
from app.models.support_ticket import SupportTicket

USERS = [
    {
        "email": "superadmin@guides-nepal.com",
        "firstName": "Super",
        "lastName": "Admin",
        "role": "super-admin",
        "password": "SuperAdmin@2024",
    },
    {
        "email": "regional@guides-nepal.com",
        "firstName": "Regional",
        "lastName": "Head",
        "role": "regional-head",
        "region": "Kathmandu Valley",
        "password": "Regional@2024",
    },
    {
        "email": "support@guides-nepal.com",
        "firstName": "Customer",
        "lastName": "Support",
        "role": "customer-support",
        "password": "Support@2024",
    },
]

APPLICATIONS = [
    dict(host_name="Sita Gurung", email="sita.host@example.com", city="Pokhara",
         region="Gandaki", phone="9801234567", experience="10 years homestay"),
    dict(host_name="Bikash Tamang", email="bikash.host@example.com", city="Bhaktapur",
         region="Kathmandu Valley", phone="9802234567", experience="Cultural tours"),
    dict(host_name="Maya Sherpa", email="maya.host@example.com", city="Namche",
         region="Everest", phone="9803234567", experience="Trekking lodges"),
]

TICKETS = [
    dict(subject="Cannot log in to my account", description="Password reset email never arrives.",
         customer_name="Ram Thapa", customer_email="ram@example.com", priority="high"),
    dict(subject="Refund for cancelled tour", description="Guide cancelled last minute.",
         customer_name="Anna Meyer", customer_email="anna@example.com", priority="urgent"),
    dict(subject="How to become a host?", description="Interested in listing my homestay.",
         customer_name="Kiran Rai", customer_email="kiran@example.com", priority="medium"),
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

        if db.query(HostApplication).count() == 0:
            for a in APPLICATIONS:
                db.add(HostApplication(**a, status="pending"))
            print("Seeded sample host applications")
        if db.query(SupportTicket).count() == 0:
            for t in TICKETS:
                db.add(SupportTicket(**t, status="open"))
            print("Seeded sample support tickets")

        db.commit()
        print("Done.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
