"""Role-based access control tests for registration and the guide console.

These cover the two halves of RBAC that matter most:

- *Assignment* — a public signup cannot mint itself a privileged role.
- *Authorization* — the ``guide`` console is reachable by ``guide`` and by
  ``admin`` only, and rejects every other role.
"""
import pytest
from pydantic import ValidationError

from app.core.roles import ADMIN, GUIDE, HOST, TRAVELER
from app.core.security import create_access_token, get_password_hash
from app.models.user import User
from app.schemas.auth import PrivilegedUserCreate, UserCreate

GUIDE_ME = "/api/v1/guide/me"
REGISTER = "/api/v1/auth/register"
ADMIN_PATCH_USER = "/api/v1/admin/users/{user_id}"

STRONG_PASSWORD = "Guide@2024"


def _make_user(db_session, email: str, role: str, is_active: bool = True) -> User:
    user = User(
        email=email,
        hashed_password=get_password_hash(STRONG_PASSWORD),
        firstName=email.split("@")[0].title(),
        lastName="Test",
        role=role,
        is_active=is_active,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _bearer(user: User) -> dict:
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}


class TestRegistrationRoleAllowList:
    """``UserCreate`` is the only schema bound to the public signup route."""

    @pytest.mark.parametrize("role", [ADMIN, "content-manager", "regional-head", "customer-support", GUIDE])
    def test_elevated_roles_are_rejected_by_the_schema(self, role: str):
        with pytest.raises(ValidationError):
            UserCreate(email=f"{role}@example.com", password=STRONG_PASSWORD, role=role)

    @pytest.mark.parametrize("role", [TRAVELER, HOST])
    def test_public_roles_are_accepted_by_the_schema(self, role: str):
        assert UserCreate(
            email=f"{role}@example.com", password=STRONG_PASSWORD, role=role
        ).role == role

    def test_role_defaults_to_traveler(self):
        assert UserCreate(email="a@example.com", password=STRONG_PASSWORD).role == TRAVELER

    @pytest.mark.parametrize("role", ["super-admin", "wizard", "Admin"])
    def test_unknown_roles_are_rejected_by_the_schema(self, role: str):
        with pytest.raises(ValidationError):
            UserCreate(email="x@example.com", password=STRONG_PASSWORD, role=role)

    def test_privileged_schema_is_unrestricted(self):
        """The trusted server-side schema still allows elevated roles."""
        assert (
            PrivilegedUserCreate(
                email="seed@example.com", password=STRONG_PASSWORD, role=ADMIN
            ).role
            == ADMIN
        )

    def test_signup_cannot_create_an_admin(self, client, db_session):
        response = client.post(
            REGISTER,
            json={
                "email": "escalate@example.com",
                "password": STRONG_PASSWORD,
                "role": ADMIN,
            },
        )
        assert response.status_code == 422
        assert db_session.query(User).filter_by(email="escalate@example.com").first() is None

    def test_signup_cannot_create_a_guide(self, client, db_session):
        """Guides are granted by an admin or a seed script, never by self-signup."""
        response = client.post(
            REGISTER,
            json={
                "email": "self-guide@example.com",
                "password": STRONG_PASSWORD,
                "role": GUIDE,
            },
        )
        assert response.status_code == 422
        assert (
            db_session.query(User).filter_by(email="self-guide@example.com").first()
            is None
        )

    def test_signup_can_create_a_host(self, client, db_session):
        response = client.post(
            REGISTER,
            json={
                "email": "new-host@example.com",
                "password": STRONG_PASSWORD,
                "role": HOST,
            },
        )
        assert response.status_code == 200
        assert response.json()["user"]["role"] == HOST
        assert (
            db_session.query(User).filter_by(email="new-host@example.com").first()
            is not None
        )


class TestGuideConsoleGuard:
    """``GET /api/v1/guide/me`` is guarded by ``require_role(GUIDE)``."""

    def test_guide_reaches_its_own_console(self, client, db_session):
        guide = _make_user(db_session, "guide@example.com", GUIDE)
        response = client.get(GUIDE_ME, headers=_bearer(guide))
        assert response.status_code == 200
        body = response.json()
        assert body["id"] == guide.id
        assert body["role"] == GUIDE
        assert body["capabilities"]
        assert body["rank"] == 0

    def test_admin_is_implicitly_authorized(self, client, db_session):
        admin = _make_user(db_session, "admin@example.com", ADMIN)
        response = client.get(GUIDE_ME, headers=_bearer(admin))
        assert response.status_code == 200

    @pytest.mark.parametrize("role", [TRAVELER, HOST, "customer-support", "regional-head", "content-manager", "super-admin"])
    def test_every_other_role_is_forbidden(self, client, db_session, role: str):
        user = _make_user(db_session, f"{role}@example.com", role)
        response = client.get(GUIDE_ME, headers=_bearer(user))
        assert response.status_code == 403
        assert "guide" in response.json()["detail"].lower()

    def test_suspended_guide_is_forbidden(self, client, db_session):
        guide = _make_user(db_session, "suspended@example.com", GUIDE, is_active=False)
        response = client.get(GUIDE_ME, headers=_bearer(guide))
        assert response.status_code == 403

    def test_anonymous_request_is_unauthenticated(self, client):
        assert client.get(GUIDE_ME).status_code == 401

    def test_host_console_still_rejects_a_guide(self, client, db_session):
        guide = _make_user(db_session, "guide2@example.com", GUIDE)
        response = client.get("/api/v1/host/tours", headers=_bearer(guide))
        assert response.status_code == 403

    def test_guide_is_denied_the_admin_console(self, client, db_session):
        guide = _make_user(db_session, "guide3@example.com", GUIDE)
        response = client.get("/api/v1/admin/users", headers=_bearer(guide))
        assert response.status_code == 403


class TestAdminRoleAssignment:
    """Admins may grant roles, but only known ones, and never via mass assignment."""

    def test_admin_can_assign_the_guide_role(self, client, db_session):
        admin = _make_user(db_session, "admin2@example.com", ADMIN)
        target = _make_user(db_session, "promote@example.com", TRAVELER)
        response = client.patch(
            ADMIN_PATCH_USER.format(user_id=target.id),
            json={"role": GUIDE},
            headers=_bearer(admin),
        )
        assert response.status_code == 200
        db_session.refresh(target)
        assert target.role == GUIDE

    def test_admin_cannot_assign_an_unknown_role(self, client, db_session):
        admin = _make_user(db_session, "admin3@example.com", ADMIN)
        target = _make_user(db_session, "target@example.com", TRAVELER)
        response = client.patch(
            ADMIN_PATCH_USER.format(user_id=target.id),
            json={"role": "super-admin"},
            headers=_bearer(admin),
        )
        assert response.status_code == 400
        db_session.refresh(target)
        assert target.role == TRAVELER

    def test_admin_cannot_mass_assign_the_password_hash(self, client, db_session):
        admin = _make_user(db_session, "admin4@example.com", ADMIN)
        target = _make_user(db_session, "victim@example.com", TRAVELER)
        original = target.hashed_password
        response = client.patch(
            ADMIN_PATCH_USER.format(user_id=target.id),
            json={"hashed_password": get_password_hash("Hijacked@123")},
            headers=_bearer(admin),
        )
        assert response.status_code == 400
        db_session.refresh(target)
        assert target.hashed_password == original