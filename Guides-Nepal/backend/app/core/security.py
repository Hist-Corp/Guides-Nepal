"""
Security utilities for authentication, password hashing, and token management
"""

from datetime import datetime, timedelta
from typing import Any, Optional, Union, cast
import re
import logging

import bcrypt
from jose import jwt
from jose.exceptions import JWTError

from app.core.config import settings

logger = logging.getLogger(__name__)

# bcrypt only uses the first 72 bytes of a password. bcrypt >= 4.1 raises instead
# of silently truncating, so we truncate explicitly and consistently for both
# hashing and verification.
_BCRYPT_MAX_BYTES = 72


def _to_bcrypt_bytes(password: str) -> bytes:
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password meets security requirements
    Returns: (is_valid, error_message)
    """
    if len(password) < settings.MIN_PASSWORD_LENGTH:
        return (
            False,
            f"Password must be at least {settings.MIN_PASSWORD_LENGTH} characters",
        )

    if settings.REQUIRE_PASSWORD_UPPERCASE and not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"

    if settings.REQUIRE_PASSWORD_NUMBERS and not re.search(r"[0-9]", password):
        return False, "Password must contain at least one number"

    if settings.REQUIRE_PASSWORD_SPECIAL and not re.search(
        r"[!@#$%^&*()_+\-=\[\]{};:,.<>?]", password
    ):
        return False, "Password must contain at least one special character (!@#$%^&*)"

    return True, ""


def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """Create JWT access token with expiration"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return cast(str, encoded_jwt)


def create_refresh_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """Create JWT refresh token with longer expiration"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return cast(str, encoded_jwt)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password using bcrypt"""
    try:
        return bcrypt.checkpw(
            _to_bcrypt_bytes(plain_password),
            hashed_password.encode("utf-8"),
        )
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


def get_password_hash(password: str) -> str:
    """Hash password using bcrypt with cost factor 12 (secure)"""
    hashed = bcrypt.hashpw(_to_bcrypt_bytes(password), bcrypt.gensalt(rounds=12))
    return hashed.decode("utf-8")


def get_user_id_from_token(token: str, expected_type: str = "access") -> Optional[int]:
    """Extract and verify user ID from JWT token.

    ``expected_type`` lets callers validate either access or refresh tokens.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )

        token_type = payload.get("type")
        if token_type != expected_type:
            logger.warning(f"Invalid token type: {token_type}")
            return None

        sub = payload.get("sub")
        if sub is None:
            return None

        try:
            return int(sub)
        except ValueError:
            logger.warning(f"Invalid user ID in token: {sub}")
            return None
    except JWTError as e:
        logger.debug(f"JWT error: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error in token verification: {e}")
        return None


def verify_token_and_get_user_id(token: str) -> Optional[int]:
    """Alias for get_user_id_from_token for backwards compatibility"""
    return get_user_id_from_token(token)


def is_token_expired(token: str) -> bool:
    """Check if token is expired"""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        exp = payload.get("exp")
        if exp is None:
            return True
        return datetime.utcfromtimestamp(exp) < datetime.utcnow()
    except JWTError:
        return True


def sanitize_input(input_string: str, max_length: int = 1000) -> str:
    """
    Sanitize user input to prevent XSS and injection attacks
    """
    if not isinstance(input_string, str):
        return ""

    # Limit length
    input_string = input_string[:max_length]

    # Remove null bytes
    input_string = input_string.replace("\x00", "")

    # Remove script tags (basic XSS protection)
    dangerous_patterns = ["<script", "</script>", "javascript:", "onerror=", "onload="]
    for pattern in dangerous_patterns:
        if pattern.lower() in input_string.lower():
            logger.warning(f"Dangerous pattern detected in input: {pattern}")
            input_string = input_string.replace(pattern, "")

    return input_string
