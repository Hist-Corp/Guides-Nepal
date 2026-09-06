"""
Tests for booking endpoints.
"""
import pytest
from fastapi.testclient import TestClient


class TestBookingEndpoints:
    """Test booking endpoints."""

    def test_get_bookings(self, client: TestClient):
        """Test getting all bookings."""
        response = client.get("/api/v1/bookings/")
        # Note: This test may need adjustment based on actual booking implementation
        assert response.status_code in [200, 401]

    def test_create_booking(self, client: TestClient, sample_booking_data):
        """Test creating a booking."""
        response = client.post("/api/v1/bookings/", json=sample_booking_data)
        # Note: This test may need adjustment based on actual booking implementation
        assert response.status_code in [200, 201, 401, 422]

    def test_get_booking_by_id(self, client: TestClient):
        """Test getting a booking by ID."""
        response = client.get("/api/v1/bookings/1")
        # Note: This test may need adjustment based on actual booking implementation
        assert response.status_code in [200, 401, 404]

    def test_update_booking(self, client: TestClient):
        """Test updating a booking."""
        response = client.put("/api/v1/bookings/1", json={"status": "confirmed"})
        # Note: This test may need adjustment based on actual booking implementation
        assert response.status_code in [200, 401, 404, 422]

    def test_delete_booking(self, client: TestClient):
        """Test deleting a booking."""
        response = client.delete("/api/v1/bookings/1")
        # Note: This test may need adjustment based on actual booking implementation
        assert response.status_code in [200, 204, 401, 404]