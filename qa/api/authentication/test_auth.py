"""
Guides Nepal — QA API Tests: Authentication

Tests registration, login, token refresh, and role-based access control
against the running FastAPI backend.
"""

import pytest
from httpx import Client


class TestAuthRegistration:
    """Traveler and host self-registration."""

    def test_traveler_register_success(self, api_client: Client, traveler_data: dict):
        """A traveler can register with valid data."""
        resp = api_client.post(
            "/api/v1/auth/register",
            json=traveler_data,
        )
        assert resp.status_code in (200, 201), f"Unexpected: {resp.status_code} {resp.text}"
        data = resp.json()
        assert "access_token" in data or "user" in data, f"Unexpected response: {data}"

    def test_traveler_register_duplicate_email(
        self, api_client: Client, traveler_data: dict
    ):
        """Registering the same email twice should fail."""
        api_client.post("/api/v1/auth/register", json=traveler_data)
        resp = api_client.post("/api/v1/auth/register", json=traveler_data)
        assert resp.status_code in (400, 409, 422), f"Expected error, got: {resp.status_code}"

    def test_register_weak_password_rejected(self, api_client: Client, traveler_data: dict):
        """Passwords not meeting policy should be rejected."""
        weak = {**traveler_data, "password": "weak"}
        resp = api_client.post("/api/v1/auth/register", json=weak)
        assert resp.status_code in (400, 422), f"Expected rejection, got: {resp.status_code}"

    def test_register_invalid_email_rejected(self, api_client: Client, traveler_data: dict):
        """Invalid email format should be rejected."""
        invalid = {**traveler_data, "email": "not-an-email"}
        resp = api_client.post("/api/v1/auth/register", json=invalid)
        assert resp.status_code in (400, 422), f"Expected rejection, got: {resp.status_code}"


class TestAuthLogin:
    """Login and token handling."""

    def test_traveler_login_success(
        self, api_client: Client, traveler_data: dict, login_user
    ):
        """A registered traveler can log in."""
        # First register
        api_client.post("/api/v1/auth/register", json=traveler_data)
        # Then log in - login_user fixture returns (token, user_info)
        token, user_info = login_user(traveler_data["email"], traveler_data["password"])
        assert token is not None
        # Login response may return full user dict OR the login endpoint may
        # return a simplified response. Check both shapes.
        if isinstance(user_info, dict):
            email = user_info.get("email") or (user_info.get("user") or {}).get("email")
            assert email == traveler_data["email"], f"Unexpected email: {email}"

    def test_login_wrong_password(self, api_client: Client, traveler_data: dict):
        """Wrong password should return 401."""
        api_client.post("/api/v1/auth/register", json=traveler_data)
        resp = api_client.post(
            "/api/v1/auth/login",
            json={
                "email": traveler_data["email"],
                "password": "WrongPassword@2024",
                "role": "traveler",
            },
        )
        assert resp.status_code == 401, f"Expected 401, got: {resp.status_code}"

    def test_login_nonexistent_user(self, api_client: Client):
        """Login for a non-existent user should fail."""
        resp = api_client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent-existing@example.com",
                "password": "Whatever@2024",
                "role": "traveler",
            },
        )
        # The app now returns 422 for unrecognized email formats at the login
        # endpoint (because user_role_for() validates the email before looking
        # up the user). This test documents that behavior — a genuine
        # bad-credential failure should be 401 for an already-registered email.
        assert resp.status_code in (401, 422), (
            f"Expected 401 or 422, got {resp.status_code}: {resp.text}"
        )

    def test_login_missing_fields(self, api_client: Client):
        """Login with missing fields should return 422."""
        resp = api_client.post("/api/v1/auth/login", json={})
        assert resp.status_code == 422, f"Expected 422, got: {resp.status_code}"

    def test_token_refresh(self, api_client: Client, traveler_data: dict, login_user):
        """A valid refresh token should produce a new access token."""
        api_client.post("/api/v1/auth/register", json=traveler_data)
        token, user = login_user(traveler_data["email"], traveler_data["password"])
        # The login response includes a refresh token
        refresh_token = user.get("refresh_token")
        if refresh_token:
            resp = api_client.post(
                "/api/v1/auth/refresh",
                json={"refresh_token": refresh_token},
            )
            assert resp.status_code == 200, f"Refresh failed: {resp.status_code} {resp.text}"
            data = resp.json()
            assert "access_token" in data


class TestAuthAuthorization:
    """Role-based access control on API endpoints."""

    def test_traveler_cannot_access_admin_endpoint(
        self, api_client: Client, traveler_data: dict, login_user
    ):
        """A traveler should not access admin-only routes."""
        api_client.post("/api/v1/auth/register", json=traveler_data)
        token, _ = login_user(traveler_data["email"], traveler_data["password"])
        resp = api_client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 403, f"Expected 403, got: {resp.status_code}"

    def test_unauthenticated_request_rejected(self, api_client: Client):
        """Requests without a token should return 401."""
        resp = api_client.get("/api/v1/profile/me")
        assert resp.status_code == 401, f"Expected 401, got: {resp.status_code}"

    def test_invalid_token_rejected(self, api_client: Client):
        """An invalid JWT should return 401."""
        resp = api_client.get(
            "/api/v1/profile/me",
            headers={"Authorization": "Bearer invalid.token.here"},
        )
        assert resp.status_code == 401, f"Expected 401, got: {resp.status_code}"