from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    Token,
    ForgotPasswordRequest,
    SyncPasswordRequest,
    ChangePasswordRequest,
)
from app.services.auth_service import AuthService
from app.core.config import settings, Settings
from app.core.dependencies import get_current_user
from app.models.user import User
import httpx
import urllib.parse
import logging

logger = logging.getLogger(__name__)


def _ensure_supabase_user_exists(email: str, settings: "Settings") -> None:
    """Create the user in Supabase Auth (if missing) so a recovery email can be sent.

    Our app keeps the source of truth in its own Postgres DB and only mirrors
    accounts into Supabase Auth on login/register. A user who triggers
    forgot-password without a Supabase record would otherwise never receive the
    reset email, because Supabase only emails existing Auth users. We create a
    placeholder Auth user (auto-confirmed) here using a random password; the real
    password is set later via the recovery flow's sync-password endpoint.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        return
    try:
        headers = {
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": "application/json",
        }
        # Check whether the user already exists in Supabase Auth.
        check = httpx.get(
            f"{settings.SUPABASE_URL}/auth/v1/admin/users",
            params={"email": email},
            headers=headers,
            timeout=10.0,
        )
        if check.status_code == 200 and check.json().get("users"):
            return  # already exists, nothing to do

        # Not found — create a placeholder Auth user so the recovery email can be sent.
        import secrets

        placeholder_password = secrets.token_urlsafe(16)
        create = httpx.post(
            f"{settings.SUPABASE_URL}/auth/v1/admin/users",
            headers=headers,
            json={
                "email": email,
                "password": placeholder_password,
                "email_confirm": True,
            },
            timeout=10.0,
        )
        if create.status_code in (200, 201):
            logger.info("Created placeholder Supabase Auth user for %s", email)
        elif create.status_code == 409:
            logger.info("Supabase Auth user already exists for %s", email)
        else:
            logger.warning(
                "Supabase Auth user creation failed for %s: %s %s",
                email,
                create.status_code,
                create.text,
            )
    except httpx.HTTPError as e:
        logger.warning("Supabase Auth user check/create error for %s: %s", email, e)


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
    # Ensure the user also exists in Supabase Auth so the forgot-password
    # flow (which uses Supabase's resetPasswordForEmail) can find them.
    # This handles users who registered before Supabase sync was added.
    auth_service.ensure_supabase_user(str(user.email), login_data.password)
    return auth_service.create_tokens(user)


@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Change the logged-in user's password.

    Requires the current password to be correct, then validates the new
    password against the same strength policy used at registration and
    updates the stored hash.
    """
    auth_service = AuthService(db)

    # Ensure the current password matches what we have on file.
    if not auth_service.authenticate_user(str(current_user.email), request.current_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    # The new password must actually be different.
    if request.current_password == request.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from your current password",
        )

    # Validate strength and persist the new hash.
    try:
        auth_service.update_user_password(current_user, request.new_password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return {"message": "Password updated successfully"}


# --- Password Reset ---
# SECURITY: This endpoint always returns the same generic success response
# regardless of whether the email exists in the system. This prevents user
# enumeration. The actual reset email is sent via Supabase Admin API from
# the backend, which ensures the email exists in Supabase Auth before sending.
@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest, db: Session = Depends(get_db)
) -> dict:
    # Intentionally do NOT check or reveal whether the email exists.
    # We attempt to send a reset email via Supabase for every request to
    # avoid timing attacks that could reveal registered emails.

    email = request.email
    logger.info(
        "Password reset requested for email (existence not confirmed): %s", email
    )

    # Try to send reset email via Supabase Admin API if configured
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        try:
            # Ensure the user exists in Supabase Auth. Our app stores users in
            # our own Postgres DB and only syncs to Supabase on login/register,
            # so a user who has never logged in since that sync was added may not
            # exist in Supabase yet. `generate_link` (recovery) only emails users
            # that exist in Supabase Auth, so without this step no email is sent.
            _ensure_supabase_user_exists(email, settings)

            # Use Supabase Admin API `generate_link` with type=recovery. This is
            # the correct endpoint that actually sends a password-reset email to
            # the registered address. (The old code hit /auth/v1/admin/otp, which
            # does not send reset emails, so nothing was ever delivered.)
            headers = {
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Content-Type": "application/json",
            }
            payload = {
                "type": "recovery",
                "email": email,
            }
            if settings.RESET_PASSWORD_REDIRECT_URL:
                payload["redirect_to"] = settings.RESET_PASSWORD_REDIRECT_URL

            resp = httpx.post(
                f"{settings.SUPABASE_URL}/auth/v1/admin/generate_link",
                headers=headers,
                json=payload,
                timeout=10.0,
            )

            if resp.status_code in (200, 201):
                logger.info("Password reset email sent successfully to %s", email)
            else:
                logger.warning(
                    "Password reset email request returned %s for %s: %s",
                    resp.status_code,
                    email,
                    resp.text,
                )
        except httpx.HTTPError as e:
            logger.error("Error sending password reset email via Supabase: %s", e)
        except Exception as e:
            logger.error("Unexpected error during password reset: %s", e)
    else:
        logger.warning(
            "Supabase not configured; cannot send password reset email for %s", email
        )

    # Always return the same generic message to prevent user enumeration
    return {
        "message": (
            "If an account exists for that email, we have sent a password "
            "reset link. Please check your inbox (and spam folder) for an "
            "email from Guides Nepal with instructions to reset your password."
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
        logger.warning("Supabase not configured on backend; skipping password sync.")
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
