"""
Guides Nepal — QA API Tests: Bookings

Tests booking creation, retrieval, cancellation, and ownership isolation.
"""

import pytest
from httpx import Client


class TestBookings:
    """Traveler booking workflow."""

    def test_traveler_can_view_bookings(
        self, api_client: Client, traveler_data: dict, login_user
    ):
        """A traveler can view their bookings (empty initially)."""
        api_client.post("/api/v1/auth/register", json=traveler_data)
        token, _ = login_user(traveler_data["email"], traveler_data["password"])

        resp = api_client.get(
            "/api/v1/bookings/",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        bookings = resp.json()
        assert isinstance(bookings, list)

    def test_unauthenticated_cannot_view_bookings(self, api_client: Client):
        """Unauthenticated requests to bookings should be rejected."""
        resp = api_client.get("/api/v1/bookings/")
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"

    def test_booking_availability_endpoint(self, api_client: Client, login_user):
        """Booking availability endpoint works for authenticated users."""
        # Register and login a traveler first
        traveler_data = {
            "firstName": "Test",
            "lastName": "User",
            "email": f"qa_traveler_availability_{__import__('uuid').uuid4().hex[:8]}@example.com",
            "password": "Traveler@2024",
            "phone": "+1234567890",
            "role": "traveler",
        }
        api_client.post("/api/v1/auth/register", json=traveler_data)
        token, _ = login_user(traveler_data["email"], traveler_data["password"])

        resp = api_client.get(
            "/api/v1/bookings/availability",
            params={"date": "2026-12-01"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"

    def test_booking_availability_month_endpoint(
        self, api_client: Client, login_user
    ):
        """Booking availability month endpoint works."""
        traveler_data = {
            "firstName": "Test",
            "lastName": "User",
            "email": f"qa_traveler_month_{__import__('uuid').uuid4().hex[:8]}@example.com",
            "password": "Traveler@2024",
            "phone": "+1234567890",
            "role": "traveler",
        }
        api_client.post("/api/v1/auth/register", json=traveler_data)
        token, _ = login_user(traveler_data["email"], traveler_data["password"])

        resp = api_client.get(
            "/api/v1/bookings/availability/month",
            params={"year": 2026, "month": 12},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"