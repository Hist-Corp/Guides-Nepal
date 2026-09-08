from typing import Optional, Dict, Any
import secrets
import logging
import httpx
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import UserCreate, UserResponse
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    validate_password_strength,
)
from app.core.config import settings

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def check_supabase_user_exists(self, email: str) -> Dict[str, Any]:
        """
        Check whether a user exists in Supabase Auth.

        Returns a dict with:
            - email: the email checked
            - exists: True if the user exists in Supabase Auth
            - user_id: the Supabase user ID (or None)
            - email_confirmed: whether the email is confirmed (or None)
        """
        result: Dict[str, Any] = {
            "email": email,
            "exists": False,
            "user_id": None,
            "email_confirmed": None,
        }
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            result["error"] = "Supabase not configured on backend"
            return result

        headers = {
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": "application/json",
        }
        try:
            resp = httpx.get(
                f"{settings.SUPABASE_URL}/auth/v1/admin/users",
                params={"email": email},
                headers=headers,
                timeout=15.0,
            )
            if resp.status_code == 200:
                users = resp.json().get("users", [])
                if users:
                    user = users[0]
                    result["exists"] = True
                    result["user_id"] = user.get("id")
                    result["email_confirmed"] = user.get("email_confirmed_at") is not None
            else:
                result["error"] = f"Supabase returned status {resp.status_code}: {resp.text}"
        except httpx.HTTPError as e:
            result["error"] = str(e)
        return result

    def _create_supabase_user(self, email: str, password: str) -> None:
        """Create a user in Supabase Auth via the Admin API.

        This keeps the backend DB and Supabase Auth in sync so that the
        forgot-password flow (which uses Supabase's resetPasswordForEmail)
        can find the user and send a reset link.

        If Supabase is not configured, we log a warning and continue — the
        backend login still works, but password reset via email will not.
        """
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            logger.warning(
                "Supabase not configured; skipping Supabase Auth user creation for %s",
                email,
            )
            return

        headers = {
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": "application/json",
        }
        payload = {
            "email": email,
            "password": password,
            "email_confirm": True,  # auto-confirm so the user can log in immediately
        }
        try:
            resp = httpx.post(
                f"{settings.SUPABASE_URL}/auth/v1/admin/users",
                headers=headers,
                json=payload,
                timeout=10.0,
            )
            if resp.status_code in (200, 201):
                logger.info("Created Supabase Auth user for %s", email)
            elif resp.status_code == 409:
                # User already exists in Supabase — that's fine, nothing to do.
                logger.info("Supabase Auth user already exists for %s", email)
            else:
                logger.warning(
                    "Supabase Auth user creation failed for %s: %s %s",
                    email,
                    resp.status_code,
                    resp.text,
                )
        except httpx.HTTPError as e:
            logger.warning("Supabase Auth user creation error for %s: %s", email, e)

    def ensure_supabase_user(self, email: str, password: str) -> None:
        """Ensure a user exists in Supabase Auth.

        This is called on login for users who registered before Supabase
        sync was added, so the forgot-password flow can find them. If the
        user already exists in Supabase, this is a no-op.
        """
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            logger.warning(
                "Supabase not configured; skipping Supabase Auth sync for %s",
                email,
            )
            return

        headers = {
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        }
        try:
            # Check if the user already exists in Supabase
            resp = httpx.get(
                f"{settings.SUPABASE_URL}/auth/v1/admin/users",
                params={"email": email},
                headers=headers,
                timeout=10.0,
            )
            if resp.status_code == 200:
                users = resp.json().get("users", [])
                if users:
                    # User already exists in Supabase — nothing to do.
                    logger.info("Supabase Auth user already exists for %s", email)
                    return
            # User does not exist — create them.
            self._create_supabase_user(email, password)
        except httpx.HTTPError as e:
            logger.warning("Supabase Auth sync error for %s: %s", email, e)

    def register_user(self, user_in: UserCreate) -> User:
        if self.get_user_by_email(user_in.email):
            raise Exception("Email already registered")

        is_valid, error_message = validate_password_strength(user_in.password)
        if not is_valid:
            raise Exception(error_message)

        db_user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            firstName=user_in.firstName,
            lastName=user_in.lastName,
            phone=user_in.phone,
            role=user_in.role,
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)

        # Keep Supabase Auth in sync so the forgot-password flow works.
        self._create_supabase_user(user_in.email, user_in.password)

        return db_user

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not user.is_active:
            return None
        if not verify_password(password, str(user.hashed_password)):
            return None
        return user

    def create_tokens(self, user: User) -> dict:
        # Explicitly convert the ORM User to a Pydantic UserResponse so the
        # response serialization is deterministic and the field alias mapping
        # (is_active -> isActive) is handled correctly.
        user_response = UserResponse.model_validate(user)
        return {
            "access_token": create_access_token(user.id),
            "refresh_token": create_refresh_token(user.id),
            "token_type": "bearer",  # nosec
            "user": user_response,
        }

    def upsert_social_user(
        self,
        email: str,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
    ) -> User:
        user = self.get_user_by_email(email)
        if user:
            if first_name and not user.firstName:
                setattr(user, "firstName", first_name)
            if last_name and not user.lastName:
                setattr(user, "lastName", last_name)
            self.db.commit()
            self.db.refresh(user)
            return user
        # Create a new user with a random password (OAuth users don't use local password)
        random_password = secrets.token_urlsafe(16)
        db_user = User(
            email=email,
            hashed_password=get_password_hash(random_password),
            firstName=first_name or "",
            lastName=last_name or "",
            role="traveler",
            is_active=True,
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update_user_password(self, user: User, new_password: str) -> User:
        """Update a user's password after validating strength.

        SECURITY: This method does NOT reveal whether the user exists. The
        caller is responsible for ensuring the caller is authorized (e.g.
        via a verified Supabase access token) before calling this method.
        """
        is_valid, error_message = validate_password_strength(new_password)
        if not is_valid:
            raise ValueError(error_message)

        setattr(user, "hashed_password", get_password_hash(new_password))
        self.db.commit()
        self.db.refresh(user)
        return user
