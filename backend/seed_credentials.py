"""Set known passwords for dev seed users that had undocumented passwords."""
from app.core.roles import (
    ADMIN,
    CONTENT_MANAGER,
    CUSTOMER_SUPPORT,
    HOST,
    REGIONAL_HEAD,
)
from app.core.database import SessionLocal
from app.core.security import get_password_hash, verify_password, validate_password_strength
from app.models.user import User

# All credentials for every dashboard role in the project.
# Role hierarchy: admin > content-manager > regional-head > customer-support > host
CREDENTIALS = {
    "admin@guides-nepal.com":        {"password": "Admin@12345",      "role": ADMIN},
    "content@guides-nepal.com":      {"password": "Content@2024",     "role": CONTENT_MANAGER},
    "regional@guides-nepal.com":     {"password": "Regional@2024",    "role": REGIONAL_HEAD},
    "support@guides-nepal.com":      {"password": "Support@2024",     "role": CUSTOMER_SUPPORT},
    "host@guides-nepal.com":         {"password": "Host@2024",        "role": HOST},
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