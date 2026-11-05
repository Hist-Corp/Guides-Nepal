"""Approval-gated guide registration and login tests."""

import json

from app.core.roles import ADMIN, GUIDE, REGIONAL_HEAD
from app.core.security import create_access_token, get_password_hash, verify_password
from app.api.v1 import operations, public
from app.models.guide_application import GuideApplication
from app.models.user import User
import pytest

GUIDE_APPLICATIONS = "/api/v1/guide-applications"
GUIDE_REVIEW = "/api/v1/operations/guide-applications/{application_id}"
GUIDE_APPLICATION_LIST = "/api/v1/operations/guide-applications"
GUIDE_PASSWORD = "GuidePass123!"
DOCUMENT_CONTENT = b"\x89PNG\r\n\x1a\nreview-test-image"


@pytest.fixture(autouse=True)
def isolate_guide_uploads(tmp_path, monkeypatch):
    monkeypatch.setattr(public, "GUIDE_APPLICATION_UPLOAD_ROOT", tmp_path)
    monkeypatch.setattr(operations, "GUIDE_APPLICATION_UPLOAD_ROOT", tmp_path)


def _bearer(user_id: int) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user_id)}"}


def _make_regional_head(db_session, region: str | None) -> User:
    user = User(
        email="regional-head@example.com",
        hashed_password=get_password_hash("StaffPass123!"),
        firstName="Regional",
        lastName="Head",
        role=REGIONAL_HEAD,
        region=region,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _submit_application(client, email: str = "guide@example.com", region: str = "Bagmati"):
    return client.post(
        GUIDE_APPLICATIONS,
        data={
            "full_name": "Test Guide",
            "email": email,
            "password": GUIDE_PASSWORD,
            "region": region,
            "phone": "+977 9800000000",
        },
        files={
            key: (f"{key}.png", DOCUMENT_CONTENT, "image/png")
            for key in (
                "citizenshipFront",
                "citizenshipBack",
                "liveSelfie",
                "holdingCitizenship",
                "certificate",
            )
        },
    )


def test_guide_can_login_with_submitted_credentials_after_regional_approval(
    client, db_session
):
    response = _submit_application(client)
    assert response.status_code == 201, response.text
    application_id = response.json()["id"]

    application = db_session.get(GuideApplication, application_id)
    assert application is not None
    assert application.status == "pending"
    assert application.credential_password_hash != GUIDE_PASSWORD
    assert verify_password(GUIDE_PASSWORD, application.credential_password_hash)
    assert db_session.query(User).filter_by(email="guide@example.com").first() is None

    regional_head = _make_regional_head(db_session, "Bagmati")
    response = client.patch(
        GUIDE_REVIEW.format(application_id=application_id),
        json={"status": "approved"},
        headers=_bearer(regional_head.id),
    )
    assert response.status_code == 200, response.text
    assert response.json()["login_email"] == "guide@example.com"

    db_session.expire_all()
    user = db_session.query(User).filter_by(email="guide@example.com").one()
    assert user.role == GUIDE
    assert user.is_active is True
    assert db_session.get(GuideApplication, application_id).user_id == user.id

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "GUIDE@example.com", "password": GUIDE_PASSWORD},
    )
    assert response.status_code == 200, response.text
    assert response.json()["user"]["role"] == GUIDE


def test_regional_head_cannot_approve_guide_from_another_region(client, db_session):
    response = _submit_application(client, region="Gandaki")
    assert response.status_code == 201, response.text
    regional_head = _make_regional_head(db_session, "Bagmati")

    response = client.patch(
        GUIDE_REVIEW.format(application_id=response.json()["id"]),
        json={"status": "approved"},
        headers=_bearer(regional_head.id),
    )
    assert response.status_code == 403
    assert db_session.query(User).filter_by(email="guide@example.com").first() is None


def test_regional_head_sees_only_guide_applications_for_assigned_region(
    client, db_session
):
    bagmati_response = _submit_application(client, "bagmati@example.com", "Bagmati")
    gandaki_response = _submit_application(client, "gandaki@example.com", "Gandaki")
    assert bagmati_response.status_code == 201
    assert gandaki_response.status_code == 201
    regional_head = _make_regional_head(db_session, "Bagmati")

    response = client.get(
        GUIDE_APPLICATION_LIST,
        headers=_bearer(regional_head.id),
    )
    assert response.status_code == 200, response.text
    assert [application["email"] for application in response.json()] == [
        "bagmati@example.com"
    ]


def test_admin_can_assign_regional_head_region_and_scope_application_queue(
    client, db_session
):
    _submit_application(client, "bagmati@example.com", "Bagmati")
    regional_head = _make_regional_head(db_session, None)
    admin = User(
        email="admin@example.com",
        hashed_password=get_password_hash("StaffPass123!"),
        role=ADMIN,
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)

    users_response = client.get(
        "/api/v1/admin/users",
        headers=_bearer(admin.id),
    )
    assert users_response.status_code == 200
    head_row = next(row for row in users_response.json() if row["id"] == regional_head.id)
    assert head_row["region"] is None

    update_response = client.patch(
        f"/api/v1/admin/users/{regional_head.id}",
        json={"region": "Bagmati"},
        headers=_bearer(admin.id),
    )
    assert update_response.status_code == 200, update_response.text
    db_session.refresh(regional_head)
    assert regional_head.region == "Bagmati"

    applications_response = client.get(
        GUIDE_APPLICATION_LIST,
        headers=_bearer(regional_head.id),
    )
    assert applications_response.status_code == 200
    assert [row["email"] for row in applications_response.json()] == [
        "bagmati@example.com"
    ]


def test_guide_application_requires_password(client):
    response = client.post(
        GUIDE_APPLICATIONS,
        data={"full_name": "No Password", "email": "nopassword@example.com", "region": "Bagmati"},
    )
    assert response.status_code == 422


def test_regional_head_can_view_and_delete_application_documents(client, db_session):
    response = _submit_application(client)
    assert response.status_code == 201, response.text
    application_id = response.json()["id"]
    regional_head = _make_regional_head(db_session, "Bagmati")
    headers = _bearer(regional_head.id)

    list_response = client.get(GUIDE_APPLICATION_LIST, headers=headers)
    assert list_response.status_code == 200
    application = list_response.json()[0]
    assert len(application["uploaded_files"]) == 5

    document_response = client.get(
        f"{GUIDE_APPLICATION_LIST}/{application_id}/documents/liveSelfie",
        headers=headers,
    )
    assert document_response.status_code == 200
    assert document_response.content == DOCUMENT_CONTENT
    details = json.loads(db_session.get(GuideApplication, application_id).details_json)
    stored_name = details["files"]["liveSelfie"]["stored_name"]

    delete_response = client.delete(
        f"{GUIDE_APPLICATION_LIST}/{application_id}",
        headers=headers,
    )
    assert delete_response.status_code == 204
    assert db_session.get(GuideApplication, application_id) is None
    assert not (operations.GUIDE_APPLICATION_UPLOAD_ROOT / stored_name).exists()
