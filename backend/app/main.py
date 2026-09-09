from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy import inspect
from app.core.config import settings
from app.core.database import Base, engine
from app import models  # noqa: F401  (registers all models on Base.metadata)
from app.core.middleware import (
    SecurityHeadersMiddleware,
    RequestLoggingMiddleware,
    InputValidationMiddleware,
    HTTPSEnforcementMiddleware,
)
from app.api.v1 import auth, bookings, public, ai, profile, admin, content, operations
import os
import logging

logger = logging.getLogger(__name__)

# Initialize FastAPI app with security settings
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.DEBUG else None,
    docs_url="/api/v1/docs" if settings.DEBUG else None,
    redoc_url="/api/v1/redoc" if settings.DEBUG else None,
)

# Add security middleware (order matters!)
app.add_middleware(HTTPSEnforcementMiddleware)
app.add_middleware(InputValidationMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# Configure CORS with strict settings
cors_origins = settings.cors_origins
logger.info(f"Configured CORS origins: {cors_origins}")

if cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
        allow_headers=["Content-Type", "Authorization"],
        max_age=600,  # Cache preflight for 10 minutes
    )

# Include routers
app.include_router(
    auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"]
)
app.include_router(
    bookings.router, prefix=f"{settings.API_V1_STR}/bookings", tags=["bookings"]
)
app.include_router(public.router, prefix=f"{settings.API_V1_STR}", tags=["public"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])
app.include_router(
    profile.router, prefix=f"{settings.API_V1_STR}/profile", tags=["profile"]
)
app.include_router(
    admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"]
)
app.include_router(
    content.router, prefix=f"{settings.API_V1_STR}/content", tags=["content"]
)
app.include_router(
    operations.router, prefix=f"{settings.API_V1_STR}/operations", tags=["operations"]
)

# Static file mounting with restrictions
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
try:
    os.makedirs(uploads_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
except PermissionError:
    # If uploads dir can't be created, continue without file serving
    # (common in containerized environments with read-only filesystems)
    logger.warning(f"Could not create uploads directory at {uploads_dir}")
except Exception as e:
    logger.warning(f"Could not mount uploads directory: {e}")


@app.on_event("startup")
def ensure_database_schema() -> None:
    """Create database tables if they don't exist yet.

    This guarantees the `users` (and other) tables exist wherever the app can
    reach the configured database, so registrations actually have somewhere to
    be stored. Failures are logged (not fatal) so the app still boots and can
    report a clear error on DB-dependent requests instead of crashing.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema verified/created successfully.")
    except Exception as e:  # pragma: no cover - depends on DB availability
        logger.error(f"Could not create/verify database schema: {e}")


@app.get("/")
def root() -> dict:
    """Root endpoint - API info"""
    return {
        "name": settings.PROJECT_NAME,
        "status": "running",
        "api_base": settings.API_V1_STR,
        "health": "/health",
        "docs": settings.API_V1_STR + "/docs" if settings.DEBUG else None,
    }


@app.get("/health")
def health_check() -> dict:
    """Health check endpoint for deployment monitoring"""
    return {"status": "ok", "environment": settings.ENV}


@app.get("/api/v1/health")
def api_health_check() -> dict:
    """API health check endpoint"""
    return {"status": "ok", "version": "1.0"}


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler to prevent information leakage"""
    logger.error(f"Unhandled exception: {exc}")
    if settings.DEBUG:
        raise exc
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
