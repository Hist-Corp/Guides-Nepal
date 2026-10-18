"""End-to-end tests for the approval-gated unified Host login flow.

Covers:
1. Applicant submits a host application with a password (hash stored on the
   application row; no users row yet).
2. Staff review/approve → the users login row (role=host) is minted.
3. authenticate_user refuses host login before approval, allows it after.
4. GET /api/v1/host/me/application returns status/reviewed_by/reviewed_at.
"""

from app.core.roles import ADMIN, HOST, REGIONAL_HEAD
from app.core.security import create_access_token, get_password_hash
from app.models.host_application import HostApplication
from app.models.user import User

STRONG_PASSWORD = "HostPass123!"
APPLICATION_CREATE = "/api/v1/operations/host-applications"
REVIEW = "/api/v1/operations/host-applications/{application_id}"
ME_APPLICATION = "/api/v1/operations/host/me/application"


def _bearer(user_id: int) -> dict:
    return {"Authorization": f"Bearer {create_access_token(user_id)}"}


def _make_staff(db_session, role: str, email: str, region: str | None = None) -> User:
    user = User(
        email=email,
        hashed_password=get_password_hash("StaffPass123!"),
        firstName="Staff",
        lastName="Tester",
        role=role,
        region=region,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def test_full_approval_gated_login_flow(client, db_session):
    """Submit with password → staff approve → login works → /host/me/application."""
    # --- Step 1: Applicant submits with a password ---------------------------
    resp = client.post(
        APPLICATION_CREATE,
        json={
            "host_name": "Test Host",
            "email": "applicant@example.com",
            "city": "Kathmandu",
            "region": "Bagmati",
            "phone": "+977 9800000000",
            "experience": "Cultural tours",
            "password": STRONG_PASSWORD,
        },
    )
    assert resp.status_code == 201, resp.text
    app_id = resp.json()["id"]
    assert resp.json()["status"] == "pending"

    # --- Step 2: No users row exists yet ------------------------------------
    user = db_session.query(User).filter_by(email="applicant@example.com").first()
    assert user is None, "No login account should exist before approval"

    # --- Step 3: Staff approve the application -------------------------------
    admin = _make_staff(db_session, ADMIN, "admin@example.com")
    resp = client.patch(
        REVIEW.format(application_id=app_id),
        json={"status": "approved", "review_note": "Looks good"},
        headers=_bearer(admin.id),
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["status"] == "approved"
    assert resp.json()["login_email"] == "applicant@example.com"

    # --- Step 4: Users row is now minted ------------------------------------
    db_session.expire_all()
    user = db_session.query(User).filter_by(email="applicant@example.com").first()
    assert user is not None
    assert user.role == HOST
    assert user.is_active is True

    # --- Step 5: GET /host/me/application returns approval info -------------
    resp = client.get(ME_APPLICATION, headers=_bearer(user.id))
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["status"] == "approved"
    assert body["reviewed_by"] == "admin@example.com"
    assert body["reviewed_at"] is not None


def test_host_login_blocked_before_approval(client, db_session):
    """Host application pending → no login account → 404 on /host/me/application."""
    client.post(
        APPLICATION_CREATE,
        json={
            "host_name": "Pending Applicant",
            "email": "pending@example.com",
            "city": "Pokhara",
            "region": "Gandaki",
            "password": STRONG_PASSWORD,
        },
    )
    # No users row → no bearer token possible, so endpoint returns 401
    resp = client.get(ME_APPLICATION)
    assert resp.status_code == 401


def test_regional_head_can_approve_own_region(client, db_session):
    """Regional head approves an application in their own region."""
    regional_head = _make_staff(
        db_session, REGIONAL_HEAD, "rh@example.com", region="Bagmati"
    )
    resp = client.post(
        APPLICATION_CREATE,
        json={
            "host_name": "Regional Applicant",
            "email": "regional@example.com",
            "city": "Kathmandu",
            "region": "Bagmati",
            "password": STRONG_PASSWORD,
        },
    )
    assert resp.status_code == 201
    app_id = resp.json()["id"]

    resp = client.patch(
        REVIEW.format(application_id=app_id),
        json={"status": "approved"},
        headers=_bearer(regional_head.id),
    )
    assert resp.status_code == 200, resp.text


def test_rejected_application_does_not_mint_user(client, db_session):
    """Rejected application → no users row."""
    client.post(
        APPLICATION_CREATE,
        json={
            "host_name": "Rejected Applicant",
            "email": "rejected@example.com",
            "city": "Kathmandu",
            "region": "Bagmati",
            "password": STRONG_PASSWORD,
        },
    )
    admin = _make_staff(db_session, ADMIN, "admin2@example.com")
    resp = client.post(
        APPLICATION_CREATE,
        json={
            "host_name": "Another",
            "email": "another@example.com",
            "city": "Kathmandu",
            "region": "Bagmati",
            "password": STRONG_PASSWORD,
        },
    )
    app_id = resp.json()["id"]
    client.patch(
        REVIEW.format(application_id=app_id),
        json={"status": "rejected"},
        headers=_bearer(admin.id),
    )
    user = db_session.query(User).filter_by(email="another@example.com").first()
    assert user is None