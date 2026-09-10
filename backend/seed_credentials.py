"""Set known passwords for dev seed users that had undocumented passwords."""
from app.core.database import SessionLocal
from app.core.security import get_password_hash, verify_password, validate_password_strength
from app.models.user import User

# All credentials for every role in the project
CREDENTIALS = {
    "admin@guides-nepal.com":       {"password": "Admin@12345",      "role": "admin"},
    "superadmin@guides-nepal.com":   {"password": "SuperAdmin@2024",  "role": "super-admin"},
    "regional@guides-nepal.com":     {"password": "Regional@2024",    "role": "regional-head"},
    "support@guides-nepal.com":      {"password": "Support@2024",     "role": "customer-support"},
    "writer@guides-nepal.com":       {"password": "Writer@12345",     "role": "content-writer"},
    "host@guides-nepal.com":         {"password": "Host@12345",       "role": "host"},
    "guide@guides-nepal.com":        {"password": "Guide@12345",      "role": "guide"},
    "traveler@guides-nepal.com":     {"password": "Traveler@12345",   "role": "traveler"},
}

db = SessionLocal()
print("=" * 80)
print("Guide Nepal - User Credentials Setup")
print("=" * 80)

for email, info in CREDENTIALS.items():
    password = info["password"]
    role = info["role"]

    # Validate password meets policy
    valid, msg = validate_password_strength(password)
    if not valid:
        print(f"  [SKIP] {email} - password does not meet policy: {msg}")
        continue

    user = db.query(User).filter(User.email == email).first()
    if user:
        # Update password if role doesn't match or always update for dev reset
        old_hash = user.hashed_password
        user.hashed_password = get_password_hash(password)
        if user.role != role:
            user.role = role
        user.is_active = True
        db.commit()
        db.refresh(user)
        # Verify the password works
        ok = verify_password(password, user.hashed_password)
        print(f"  [UPDATED] {email:35s} | Role: {role:20s} | Password: {password:20s} | Verified: {ok}")
    else:
        # Create new user
        db.add(User(
            email=email,
            firstName=email.split("@")[0].title(),
            lastName="User",
            hashed_password=get_password_hash(password),
            role=role,
            is_active=True,
        ))
        db.commit()
        ok = verify_password(password, db.query(User).filter(User.email == email).first().hashed_password)
        print(f"  [CREATED] {email:35s} | Role: {role:20s} | Password: {password:20s} | Verified: {ok}")

print("=" * 80)
print(f"Total users: {db.query(User).count()}")
print("=" * 80)
db.close()