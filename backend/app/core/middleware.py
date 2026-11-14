"""
Security middleware for FastAPI application
Includes rate limiting, security headers, request logging, and input validation
"""

import logging
import time
from typing import Callable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response: Response = await call_next(request)

        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=()"
        )

        # HSTS header in production
        if not settings.DEBUG:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )

        # CSP header
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "connect-src 'self' https://wuyxvqkokyhjbfzemjyw.supabase.co https://api.openai.com https://guides-nepal.onrender.com"
        )

        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all incoming requests for security monitoring"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not settings.ENABLE_REQUEST_LOGGING:
            return await call_next(request)  # type: ignore[no-any-return]

        start_time = time.time()

        # Log request details (sanitized)
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")[:100]  # Limit length

        logger.info(
            f"REQUEST | Method: {request.method} | Path: {request.url.path} | "
            f"Client: {client_ip} | User-Agent: {user_agent}"
        )

        try:
            response: Response = await call_next(request)
            process_time = time.time() - start_time

            # Log response
            logger.info(
                f"RESPONSE | Method: {request.method} | Path: {request.url.path} | "
                f"Status: {response.status_code} | Duration: {process_time:.3f}s"
            )

            return response
        except Exception as exc:
            logger.error(
                f"ERROR | Method: {request.method} | Path: {request.url.path} | "
                f"Exception: {type(exc).__name__}"
            )
            raise


class InputValidationMiddleware(BaseHTTPMiddleware):
    """Validate and sanitize input"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Check for suspicious patterns in URL
        if self._is_suspicious_request(request):
            client_ip = request.client.host if request.client else "unknown"
            logger.warning(
                f"Suspicious request detected | IP: {client_ip} | "
                f"Method: {request.method} | Path: {request.url.path}"
            )
            return JSONResponse(status_code=400, content={"detail": "Invalid request"})

        return await call_next(request)  # type: ignore[no-any-return]

    @staticmethod
    def _is_suspicious_request(request: Request) -> bool:
        """Check for common attack patterns"""
        path = request.url.path.lower()
        query = str(request.query_params).lower()
        full_string = path + query

        # SQL injection patterns
        sql_patterns = [
            "union select",
            "select from",
            "insert into",
            "delete from",
            "drop table",
            "exec(",
            "';--",
        ]
        if any(pattern in full_string for pattern in sql_patterns):
            return True

        # Path traversal
        if "../" in path or "..\\" in path or "%2e%2e" in path:
            return True

        # Command injection - only check path, not query string
        # Query strings legitimately contain & and ; (e.g., OAuth callbacks)
        dangerous_chars = ["`", "$", "$(", "{$("]
        if any(char in path for char in dangerous_chars):
            return True

        # Null byte injection
        if "%00" in full_string or "\x00" in full_string:
            return True

        return False


class HTTPSEnforcementMiddleware(BaseHTTPMiddleware):
    """Enforce HTTPS in production"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not settings.DEBUG and request.url.scheme != "https":
            # Check if X-Forwarded-Proto header indicates HTTPS (for proxies)
            if request.headers.get("x-forwarded-proto") != "https":
                logger.warning(f"Non-HTTPS request in production: {request.url}")
                return JSONResponse(
                    status_code=403, content={"detail": "HTTPS required"}
                )

        return await call_next(request)  # type: ignore[no-any-return]
