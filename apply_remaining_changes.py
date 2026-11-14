import os

base = r'c:\Users\poude\Desktop\Guides Nepal\backend\app'

# 1. schemas/auth.py
schemas_auth = '''from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    role: str = "traveler"


class UserCreate(UserBase):
    password: str
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    isActive: bool = True

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse


class ForgotPasswordRequest(BaseModel):
    """Request body for the forgot-password endpoint.

    The endpoint always returns a generic success message regardless of
    whether the email exists, to prevent user enumeration.
    """
    email: EmailStr


class SyncPasswordRequest(BaseModel):
    """Request body for syncing a password reset to the backend database.

    The supabase_access_token is verified against the Supabase API to
    identify the user, ensuring only the account owner can update their
    password.  password is the plaintext new password (validated and
    hashed server-side).
    """
    supabase_access_token: str
    password: str
'''

with open(os.path.join(base, 'schemas', 'auth.py'), 'w', encoding='utf-8') as f:
    f.write(schemas_auth)
print('Wrote schemas/auth.py')

# 2. services/auth_service.py
auth_service = '''from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import UserCreate
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    validate_password_strength,
)
import secrets


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

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
        return {
            "access_token": create_access_token(user.id),
            "refresh_token": create_refresh_token(user.id),
            "token_type": "bearer",  # nosec
            "user": user,
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
'''

with open(os.path.join(base, 'services', 'auth_service.py'), 'w', encoding='utf-8') as f:
    f.write(auth_service)
print('Wrote services/auth_service.py')

# 3. api/v1/auth.py
api_auth = '''from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    Token,
    ForgotPasswordRequest,
    SyncPasswordRequest,
)
from app.services.auth_service import AuthService
from app.core.config import settings
import httpx
import urllib.parse
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> dict:
    auth_service = AuthService(db)
    if auth_service.get_user_by_email(user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    try:
        user = auth_service.register_user(user_in)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    return auth_service.create_tokens(user)


@router.post("/seed-admin", response_model=Token)
def seed_admin(db: Session = Depends(get_db)) -> dict:
    if not settings.DEV_ALLOW_SEED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Seeding disabled"
        )
    email = settings.DEV_SEED_ADMIN_EMAIL
    password = settings.DEV_SEED_ADMIN_PASSWORD
    if not email or not password:
        raise HTTPException(status_code=400, detail="Seed credentials not set")
    auth_service = AuthService(db)
    existing = auth_service.get_user_by_email(email)
    if not existing:
        user_in = UserCreate(
            email=email,
            password=password,
            role="admin",
            firstName="Admin",
            lastName="User",
        )
        try:
            user = auth_service.register_user(user_in)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )
        return auth_service.create_tokens(user)
    return auth_service.create_tokens(existing)


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)) -> dict:
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_service.create_tokens(user)


# --- Password Reset ---
# SECURITY: This endpoint always returns the same generic success response
# regardless of whether the email exists in the system. This prevents user
# enumeration. The actual reset email is sent by Supabase from the frontend
# via supabase.auth.resetPasswordForEmail(), which sends the link exclusively
# to the email address associated with the registered account.
@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest, db: Session = Depends(get_db)
) -> dict:
    # Intentionally do NOT check or reveal whether the email exists.
    # The frontend uses Supabase to send the reset email; this endpoint
    # exists only to provide a consistent API surface and to optionally
    # be used for rate-limiting / logging in the future.
    logger.info(
        "Password reset requested for email (existence not confirmed): %s",
        request.email,
    )
    return {
        "message": (
            "If an account exists for that email, we have sent a password "
            "reset link. Please check your inbox for instructions."
        )
    }


@router.post("/sync-password")
async def sync_password(
    request: SyncPasswordRequest, db: Session = Depends(get_db)
) -> dict:
    """Sync a password reset from Supabase to the backend database.

    The caller must provide a valid Supabase access token (obtained during
    the recovery flow). We verify it against the Supabase API to identify
    the user, then update the backend password hash. This ensures the
    backend's own JWT login continues to work after a Supabase-based reset.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        # If Supabase is not configured on the backend, we cannot verify the
        # token. Return a soft success so the frontend flow is not blocked
        # (the Supabase password is already updated).
        logger.warning(
            "Supabase not configured on backend; skipping password sync."
        )
        return {"message": "Password sync skipped (Supabase not configured)"}

    # Verify the Supabase access token by calling the Supabase user endpoint.
    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{settings.SUPABASE_URL}/auth/v1/user",
                headers={
                    **headers,
                    "Authorization": f"Bearer {request.supabase_access_token}",
                },
            )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired reset session.",
                )
            user_info = resp.json()
            email = user_info.get("email")
            if not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Could not determine user from reset session.",
                )
    except httpx.HTTPError as e:
        logger.error("Error verifying Supabase token: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not verify reset session with Supabase.",
        )

    auth_service = AuthService(db)
    user = auth_service.get_user_by_email(email)
    if not user:
        # The user exists in Supabase but not in our backend DB. This can
        # happen for social-login-only accounts. We return success without
        # creating a backend record (the Supabase password is already set).
        logger.info(
            "User %s not found in backend DB during password sync; "
            "Supabase password already updated.",
            email,
        )
        return {"message": "Password updated."}

    try:
        auth_service.update_user_password(user, request.password)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return {"message": "Password updated successfully."}


# --- OAuth: Google ---
@router.get("/oauth/google/start")
def oauth_google_start() -> RedirectResponse:
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_REDIRECT_URI:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(
        params
    )
    return RedirectResponse(url)


@router.get("/oauth/google/callback", response_model=None)
async def oauth_google_callback(
    code: str, db: Session = Depends(get_db)
) -> JSONResponse | RedirectResponse:
    if (
        not settings.GOOGLE_CLIENT_ID
        or not settings.GOOGLE_CLIENT_SECRET
        or not settings.GOOGLE_REDIRECT_URI
    ):
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    async with httpx.AsyncClient(timeout=10.0) as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if token_resp.status_code != 200:
            raise HTTPException(
                status_code=400, detail="Failed to exchange Google code"
            )
        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Google access token missing")
        userinfo_resp = await client.get(
            "https://openidconnect.googleapis.com/v1/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if userinfo_resp.status_code != 200:
            raise HTTPException(
                status_code=400, detail="Failed to fetch Google userinfo"
            )
        info = userinfo_resp.json()
        email = info.get("email")
        first_name = info.get("given_name")
        last_name = info.get("family_name")
        if not email:
            raise HTTPException(
                status_code=400, detail="Google user email not available"
            )
    auth_service = AuthService(db)
    user = auth_service.upsert_social_user(
        email=email, first_name=first_name, last_name=last_name
    )
    tokens = auth_service.create_tokens(user)
    # Redirect to frontend with tokens in query (MVP approach)
    if settings.FRONTEND_OAUTH_REDIRECT:
        params = urllib.parse.urlencode(
            {
                "access_token": tokens["access_token"],
                "refresh_token": tokens["refresh_token"],
                "email": user.email,
            }
        )
        return RedirectResponse(f"{settings.FRONTEND_OAUTH_REDIRECT}?{params}")
    return JSONResponse(tokens)


# --- OAuth: Facebook ---
@router.get("/oauth/facebook/start")
def oauth_facebook_start() -> RedirectResponse:
    if not settings.FACEBOOK_CLIENT_ID or not settings.FACEBOOK_REDIRECT_URI:
        raise HTTPException(status_code=500, detail="Facebook OAuth not configured")
    params = {
        "client_id": settings.FACEBOOK_CLIENT_ID,
        "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
        "response_type": "code",
        "scope": "email,public_profile",
    }
    url = "https://www.facebook.com/v17.0/dialog/oauth?" + urllib.parse.urlencode(
        params
    )
    return RedirectResponse(url)


@router.get("/oauth/facebook/callback", response_model=None)
async def oauth_facebook_callback(
    code: str, db: Session = Depends(get_db)
) -> JSONResponse | RedirectResponse:
    if (
        not settings.FACEBOOK_CLIENT_ID
        or not settings.FACEBOOK_CLIENT_SECRET
        or not settings.FACEBOOK_REDIRECT_URI
    ):
        raise HTTPException(status_code=500, detail="Facebook OAuth not configured")
    async with httpx.AsyncClient(timeout=10.0) as client:
        token_resp = await client.get(
            "https://graph.facebook.com/v17.0/oauth/access_token",
            params={
                "client_id": settings.FACEBOOK_CLIENT_ID,
                "client_secret": settings.FACEBOOK_CLIENT_SECRET,
                "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
                "code": code,
            },
        )
        if token_resp.status_code != 200:
            raise HTTPException(
                status_code=400, detail="Failed to exchange Facebook code"
            )
        access_token = token_resp.json().get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Facebook access token missing")
        userinfo_resp = await client.get(
            "https://graph.facebook.com/me",
            params={"fields": "id,name,email"},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if userinfo_resp.status_code != 200:
            raise HTTPException(
                status_code=400, detail="Failed to fetch Facebook userinfo"
            )
        info = userinfo_resp.json()
        email = info.get("email")
        full_name = info.get("name") or ""
        first_name, last_name = None, None
        if full_name:
            parts = full_name.split(" ")
            first_name = parts[0]
            last_name = " ".join(parts[1:]) if len(parts) > 1 else ""
        if not email:
            raise HTTPException(
                status_code=400, detail="Facebook user email not available"
            )
    auth_service = AuthService(db)
    user = auth_service.upsert_social_user(
        email=email, first_name=first_name, last_name=last_name
    )
    tokens = auth_service.create_tokens(user)
    if settings.FRONTEND_OAUTH_REDIRECT:
        params = urllib.parse.urlencode(
            {
                "access_token": tokens["access_token"],
                "refresh_token": tokens["refresh_token"],
                "email": user.email,
            }
        )
        return RedirectResponse(f"{settings.FRONTEND_OAUTH_REDIRECT}?{params}")
    return JSONResponse(tokens)
'''

with open(os.path.join(base, 'api', 'v1', 'auth.py'), 'w', encoding='utf-8') as f:
    f.write(api_auth)
print('Wrote api/v1/auth.py')

print('All backend files written successfully.')