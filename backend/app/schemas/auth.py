from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional

from app.core.roles import (
    SELF_REGISTERABLE_ROLES,
    TRAVELER,
    can_self_register,
    normalize_role,
)


class UserBase(BaseModel):
    email: EmailStr
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    role: str = TRAVELER


class UserCreate(UserBase):
    """Public self-registration payload.

    ``role`` is clamped to :data:`app.core.roles.SELF_REGISTERABLE_ROLES`.
    Requesting an elevated role (``admin``, ``content-manager``,
    ``regional-head``, ``customer-support`` or ``guide``) is rejected with a 422
    instead of silently creating a privileged account, because this body is
    attacker-controlled.  Elevated roles are granted by an admin through
    ``PATCH /api/v1/admin/users/{id}`` or by a seed script.
    """

    password: str
    phone: Optional[str] = None

    @field_validator("role")
    @classmethod
    def _reject_elevated_role(cls, value: str) -> str:
        canonical = normalize_role(value)
        if not can_self_register(canonical):
            raise ValueError(
                f"Role '{value}' cannot be self-assigned. "
                f"Allowed at registration: {', '.join(sorted(SELF_REGISTERABLE_ROLES))}"
            )
        return canonical


class PrivilegedUserCreate(UserBase):
    """Server-side creation payload whose ``role`` is *not* restricted.

    Reserved for trusted server-side callers such as the dev seed endpoint.
    Never bind this schema to a publicly reachable route — use
    :class:`UserCreate` for those.
    """

    password: str
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    isActive: bool = Field(default=True, alias="is_active")

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
    }


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


class ChangePasswordRequest(BaseModel):
    """Request body for changing the password while logged in.

    current_password must match the user's existing password; the new
    password is validated against the same strength policy used at
    registration before being hashed server-side.
    """

    current_password: str
    new_password: str
