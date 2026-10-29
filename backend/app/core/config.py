import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import List

# Load environment variables from backend/.env so DATABASE_URL, SECRET_KEY, etc.
# are available via os.getenv below. Without this, the app silently falls back to
# the local Postgres default and never connects to the configured database.i need to change
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

# Derive environment flags as plain module constants so they are NOT treated as
# independently-settable env-var fields by pydantic-settings. (A stray OS env var
# like DEBUG=release would otherwise crash startup on bool parsing.)
_ENV = os.getenv("ENV", "development")
_DEBUG = _ENV == "development"

# Default CORS origins (comma-separated string). Used when the
# BACKEND_CORS_ORIGINS env var is NOT set (e.g. local development).
_DEFAULT_CORS_ORIGINS = ",".join(
    [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:4173",
        "http://localhost:3000",
        "https://guides-nepal-nine.vercel.app",
        "https://guides-nepal-bi2y.vercel.app",
    ]
)


class Settings(BaseSettings):
    PROJECT_NAME: str = "Guides-Nepal Backend"
    API_V1_STR: str = "/api/v1"

    # Environment
    ENV: str = _ENV

    @property
    def DEBUG(self) -> bool:
        return self.ENV == "development"

    # Security - CRITICAL: Must be set via environment variable.
    SECRET_KEY: str = os.getenv("SECRET_KEY") or __import__("secrets").token_urlsafe(32)
    if not os.getenv("SECRET_KEY") and _ENV == "production":
        raise ValueError("❌ SECURITY ERROR: SECRET_KEY must be set in production!")

    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Security Headers
    SECURE_HEADERS: dict = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": (
            "max-age=31536000; includeSubDomains" if not _DEBUG else ""
        ),
        "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    }

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60  # seconds

    # Authentication
    REQUIRE_HTTPS: bool = not _DEBUG
    TOKEN_ALGORITHM: str = "HS256"

    # Password Policy
    MIN_PASSWORD_LENGTH: int = 8
    REQUIRE_PASSWORD_UPPERCASE: bool = True
    REQUIRE_PASSWORD_NUMBERS: bool = True
    REQUIRE_PASSWORD_SPECIAL: bool = True

    # Dev seeding (guarded - ONLY in development)
    DEV_ALLOW_SEED: bool = (
        bool(os.getenv("DEV_ALLOW_SEED", False)) if _ENV == "development" else False
    )
    DEV_SEED_ADMIN_EMAIL: str | None = (
        os.getenv("DEV_SEED_ADMIN_EMAIL") if _ENV == "development" else None
    )
    DEV_SEED_ADMIN_PASSWORD: str | None = (
        os.getenv("DEV_SEED_ADMIN_PASSWORD") if _ENV == "development" else None
    )

    # Database - Use DATABASE_URL in production for security
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/guides_nepal"
    )

    # CORS - Comma-separated list of allowed origins.
    # Declared as `str` (NOT List[str]) on purpose: pydantic-settings would try
    # to JSON-parse a List[str] field, which breaks the comma-separated env var
    # format used by BACKEND_CORS_ORIGINS on Render. Use the `cors_origins`
    # property below for the parsed list.
    BACKEND_CORS_ORIGINS: str = _DEFAULT_CORS_ORIGINS

    @property
    def cors_origins(self) -> List[str]:
        """Parsed list of allowed CORS origins."""
        return [o.strip() for o in self.BACKEND_CORS_ORIGINS.split(",") if o.strip()]

    # AI Services
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
    AI_MODEL: str = os.getenv("AI_MODEL", "gpt-4o-mini")
    AI_SYSTEM_PROMPT: str = os.getenv(
        "AI_SYSTEM_PROMPT",
        "You are Maila Dai, a friendly Nepali guide. Give straight, direct answers first, then (optional) one short follow-up. Prefer concrete numbers, short lists, and clear steps. Be warm but concise. For travel, culture, food, and bookings: provide practical suggestions. If live data is needed, fetch when possible; otherwise give typical ranges without long disclaimers.",
    )
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "auto")
    OLLAMA_URL: str | None = os.getenv("OLLAMA_URL")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2:latest")

    # OAuth (require HTTPS redirect URIs in production)
    GOOGLE_CLIENT_ID: str | None = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str | None = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI: str | None = os.getenv("GOOGLE_REDIRECT_URI")
    FACEBOOK_CLIENT_ID: str | None = os.getenv("FACEBOOK_CLIENT_ID")
    FACEBOOK_CLIENT_SECRET: str | None = os.getenv("FACEBOOK_CLIENT_SECRET")
    FACEBOOK_REDIRECT_URI: str | None = os.getenv("FACEBOOK_REDIRECT_URI")
    FRONTEND_OAUTH_REDIRECT: str | None = os.getenv("FRONTEND_OAUTH_REDIRECT")

    # Supabase (used for password reset email verification on the backend)
    SUPABASE_URL: str | None = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY: str | None = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    # Where the reset link in the email should land the user. This must be a
    # URL allowed in the Supabase project's "Redirect URLs" config.
    RESET_PASSWORD_REDIRECT_URL: str | None = os.getenv("RESET_PASSWORD_REDIRECT_URL")

    # Logging & Monitoring
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO" if not _DEBUG else "DEBUG")
    ENABLE_REQUEST_LOGGING: bool = True

    class Config:
        case_sensitive = True


settings = Settings()

# Validate HTTPS in production
if settings.ENV == "production":
    for origin in settings.cors_origins:
        if origin.startswith("http://") and not origin.startswith("http://localhost"):
            raise ValueError(
                f"⚠️  SECURITY WARNING: Non-HTTPS origin in production: {origin}"
            )
