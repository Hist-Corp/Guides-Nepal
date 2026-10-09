"""Tests for the Host guide-management workflow (SOP-GN-HOST-001)."""

from app.core.roles import HOST
from app.core.security import create_access_token, get_password_hash
from app.models.user import User


def _make_host(db_session) -> User:
    user = User(
        email="host-guides@example.com",
        hashed_password=get_password_hash("HostPass123!"),
        firstName="Host",
        lastName="Tester",
        role=HOST,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _bearer(user: User) -> dict:
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}


def test_host_guide_workflow(client, db_session):
    host = _make_host(db_session)
    headers = _bearer(host)

    payload = {
        "full_name": "Ram Bahadur",
        "email": "ram.guide@example.com",
        "password": "GuidePass123!",
        "phone": "+977 9812345678",
        "nin_number": "NIN-12345",
        "role_title": "Cultural Expert",
        "bio": "Expert in Kathmandu Valley history with over ten years guiding travelers.",
        "languages": ["English", "Nepali"],
        "cities": ["Kathmandu"],
        "lives_in": "Kathmandu",
        "image": "https://example.com/ram.jpg",
        "gallery": [],
        "city": "Kathmandu",
        "region": "Bagmati",
        "documents": [{"kind": "citizenshipFront", "name": "front.jpg"}],
    }
    created = client.post("/api/v1/host/guides", json=payload, headers=headers)
    assert created.status_code == 201, created.text
    guide = created.json()
    assert guide["guide_user_id"] and guide["guide_id"]
    assert guide["status"] == "active"

    # Duplicate email for the same host is rejected.
    dup = client.post("/api/v1/host/guides", json=payload, headers=headers)
    assert dup.status_code == 409

    listed = client.get("/api/v1/host/guides", headers=headers)
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    # Host creates an experience, then assigns the guide to it.
    exp = client.post(
        "/api/v1/host/experiences",
        json={
            "title": "Hidden Gems of Kathmandu",
            "city": "Kathmandu",
            "category": "Cultural",
            "description": "A private walk through hidden courtyards and temples with stories.",
            "price": 35.0,
            "duration": "3 hours",
            "hero_image": "https://example.com/hero.jpg",
        },
        headers=headers,
    )
    assert exp.status_code == 201, exp.text
    experience_id = exp.json()["id"]

    assigned = client.post(
        f"/api/v1/host/guides/experiences/{experience_id}/guides",
        json={"guide_id": guide["guide_id"], "is_primary": True},
        headers=headers,
    )
    assert assigned.status_code == 201, assigned.text

    rows = client.get(f"/api/v1/host/guides/experiences/{experience_id}/guides", headers=headers)
    assert rows.status_code == 200
    assert rows.json()[0]["guide"]["name"] == "Ram Bahadur"

    # Travelers see the assigned guide on the public feed + detail.
    feed = client.get("/api/v1/experiences")
    assert feed.status_code == 200
    live = [e for e in feed.json() if str(e.get("slug", "")).startswith("host-")]
    assert live, "expected the assigned experience in the public feed"
    assert live[0]["host"]["name"] == "Ram Bahadur"

    detail = client.get(f"/api/v1/experiences/{live[0]['slug']}")
    assert detail.status_code == 200
    assert detail.json()["host"]["name"] == "Ram Bahadur"

    # Suspend hides the guide from the public feed; reactivate restores it.
    suspend = client.post(f"/api/v1/host/guides/{guide['id']}/suspend", headers=headers)
    assert suspend.status_code == 200
    feed_after = client.get("/api/v1/experiences")
    assert not [e for e in feed_after.json() if str(e.get("slug", "")).startswith("host-")]
    reactivate = client.post(f"/api/v1/host/guides/{guide['id']}/reactivate", headers=headers)
    assert reactivate.status_code == 200
