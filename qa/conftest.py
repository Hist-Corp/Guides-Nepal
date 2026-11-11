"""
Guides Nepal — QA API Test Configuration (pytest)

Fixtures for backend API testing using httpx against the running FastAPI
server on http://127.0.0.1:8000.

Requires the backend dev server to be running (npm run dev:backend).
"""

import os
import uuid
from typing import Any, Dict, Optional

import httpx
import pytest
from faker import Faker

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_URL = os.getenv("QA_BACKEND_URL", "http://127.0.0.1:8000")
API_V1 = f"{BASE_URL}/api/v1"

# Test-run identifier — used to isolate test data and for cleanup
QA_RUN_ID = os.getenv("QA_RUN_ID", f"qa-run-{uuid.uuid4().hex[:8]}")

fake = Faker()

# ---------------------------------------------------------------------------
# HTTP client fixture
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def http_client() -> httpx.Client:
    """Shared HTTP client for the test session."""
    client = httpx.Client(base_url=BASE_URL, timeout=30.0)
    yield client
    client.close()


@pytest.fixture
def api_client(http_client: httpx.Client) -> httpx.Client:
    """Alias for http_client — clearer intent in API tests."""
    return http_client


# ---------------------------------------------------------------------------
# Authentication helpers
# ---------------------------------------------------------------------------

@pytest.fixture
def auth_headers() -> Dict[str, str]:
    """Returns a function that builds Bearer auth headers from a token."""
    def _headers(token: str) -> Dict[str, str]:
        return {"Authorization": f"Bearer {token}"}
    return _headers


@pytest.fixture
def login_user(api_client: httpx.Client):
    """
    Log in a user and return (access_token, user_info).
    Usage: token, user = login_user(email, password)
    """
    def _login(email: str, password: str, role: str = "traveler"):
        resp = api_client.post(
            f"{API_V1}/auth/login",
            json={"email": email, "password": password, "role": role},
        )
        assert resp.status_code == 200, f"Login failed: {resp.status_code} {resp.text}"
        data = resp.json()
        return data["access_token"], data
    return _login


# ---------------------------------------------------------------------------
# Test data factories
# ---------------------------------------------------------------------------

@pytest.fixture
def traveler_data() -> Dict[str, Any]:
    """Generate a unique traveler signup payload."""
    return {
        "firstName": fake.first_name(),
        "lastName": fake.last_name(),
        "email": f"qa_traveler_{uuid.uuid4().hex[:8]}@example.com",
        "password": "Traveler@2024",
        "phone": fake.phone_number(),
        "role": "traveler",
    }


@pytest.fixture
def host_application_data() -> Dict[str, Any]:
    """Generate a unique host application payload."""
    return {
        "full_name": f"{fake.first_name()} {fake.last_name()}",
        "email": f"qa_host_{uuid.uuid4().hex[:8]}@example.com",
        "phone": fake.phone_number(),
        "city": fake.city(),
        "documents": "passport.pdf",
    }


@pytest.fixture
def guide_application_data() -> Dict[str, Any]:
    """Generate a unique guide application payload."""
    return {
        "full_name": f"{qa_guide_name()}",
        "email": f"qa_guide_{uuid.uuid4().hex[:8]}@example.com",
        "password": "Guide@2024",
        "phone": fake.phone_number(),
        "city": fake.city(),
        "region": "Bagmati Province",
        "nin_number": fake.bothify(text="#########"),
    }


def qa_guide_name() -> str:
    """Generate a plausible Nepali-sounding guide name."""
    first = fake.first_name()
    last = fake.last_name()
    return f"{first} {last}"


# ---------------------------------------------------------------------------
# QA run ID accessor
# ---------------------------------------------------------------------------

@pytest.fixture
def qa_run_id() -> str:
    """Return the current QA run ID for test-data isolation."""
    return QA_RUN_ID


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session", autouse=True)
def ensure_backend_healthy(http_client: httpx.Client):
    """Verify the backend is reachable before running any API test."""
    resp = http_client.get(f"{BASE_URL}/health")
    assert resp.status_code == 200, f"Backend not healthy: {resp.status_code}"
    print(f"\n[INFO] QA Run ID: {QA_RUN_ID}")
    print(f"[INFO] Backend URL: {BASE_URL}")