"""Tests for the experience workflow (SOP-GN-EXP-001 / SOP-GN-EXP-002).

These cover the two approval gates end-to-end:

- Proposals: Regional Manager **or** Content Writer may authorize.
- Change requests: Regional Manager **only** — Content Writer is 403.

Plus the SOP-aligned state machine (draft → submitted → approved →
published/applied) and ownership scoping.
"""
import pytest

from app.core.roles import ADMIN, CONTENT_MANAGER, GUIDE, REGIONAL_HEAD, TRAVELER
from app.core.security import create_access_token, get_password_hash
from app.models.guide_listing import GuideListing
from app.models.user import User

BASE = "/api/v1/experience-workflow"
PROPOSALS = f"{BASE}/proposals"
CHANGE_REQUESTS = f"{BASE}/change-requests"
PROPOSAL_QUEUE = f"{BASE}/queue/proposals"
CHANGE_REQUEST_QUEUE = f"{BASE}/queue/change-requests"

STRONG_PASSWORD = "Guide@2024"

VALID_PROPOSAL = {
    "title": "Sunrise Kayak on Phewa Lake",
    "category": "tour",
    "city": "Pokhara",
    "area": "Phewa Lake",
    "description": "Paddle out before dawn to watch the sun rise over the Annapurnas.",
    "itinerary": "05:00 meet at the boathouse, 05:30 on the water, 07:30 breakfast on shore.",
    "meeting_point": "Phewa Lake boathouse",
    "duration": "3 hours",
    "difficulty": "Easy",
    "price": 45.0,
    "max_guests": 8,
    "documents": [{"name": "Risk assessment", "url": "https://docs.example.com/risk.pdf"}],
}


def _make_user(db_session, email: str, role: str) -> User:
    user = User(
        email=email,
        hashed_password=get_password_hash(STRONG_PASSWORD),
        firstName=email.split("@")[0].title(),
        lastName="Tester",
        role=role,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _make_listing(db_session, guide: User, **overrides) -> GuideListing:
    defaults = {
        "guide_user_id": guide.id,
        "title": "Bhaktapur Heritage Walk",
        "category": "tour",
        "city": "Bhaktapur",
        "description": "A slow walk through the pottery square and old palace lanes.",
        "duration": "4 hours",
        "difficulty": "Easy",
        "price": 50.0,
        "max_guests": 10,
        "is_active": True,
    }
    defaults.update(overrides)
    listing = GuideListing(**defaults)
    db_session.add(listing)
    db_session.commit()
    db_session.refresh(listing)
    return listing


def _bearer(user: User) -> dict:
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}


def _create_and_submit_proposal(client, guide: User) -> dict:
    res = client.post(PROPOSALS, json=VALID_PROPOSAL, headers=_bearer(guide))
    assert res.status_code == 201
    proposal_id = res.json()["id"]
    res = client.post(f"{PROPOSALS}/{proposal_id}/submit", headers=_bearer(guide))
    assert res.status_code == 200
    assert res.json()["status"] == "submitted"
    return res.json()


def _create_and_submit_cr(client, guide: User, listing_id: int, **extra) -> dict:
    payload = {
        "listing_id": listing_id,
        "reason": "Seasonal price update after fuel costs rose.",
        "changes": [{"field": "price", "proposed": 65.0}],
    }
    payload.update(extra)
    res = client.post(CHANGE_REQUESTS, json=payload, headers=_bearer(guide))
    assert res.status_code == 201, res.text
    cr = res.json()
    res = client.post(f"{CHANGE_REQUESTS}/{cr['id']}/submit", headers=_bearer(guide))
    assert res.status_code == 200
    assert res.json()["status"] == "submitted"
    return res.json()


class TestProposalLifecycle:
    def test_full_lifecycle_to_published_listing(self, client, db_session):
        guide = _make_user(db_session, "kayak-guide@example.com", GUIDE)
        proposal = _create_and_submit_proposal(client, guide)

        # Regional Manager approves (SOP-GN-EXP-001 approval gate).
        rm = _make_user(db_session, "rm@example.com", REGIONAL_HEAD)
        res = client.post(
            f"{PROPOSALS}/{proposal['id']}/decision",
            json={"action": "approve", "notes": "Solid safety plan."},
            headers=_bearer(rm),
        )
        assert res.status_code == 200
        body = res.json()
        assert body["status"] == "approved"
        assert body["decided_by_role"] == REGIONAL_HEAD

        # Guide publishes within the SLA — listing goes live.
        res = client.post(f"{PROPOSALS}/{proposal['id']}/publish", headers=_bearer(guide))
        assert res.status_code == 200
        assert res.json()["status"] == "published"
        listing_id = res.json()["listing_id"]
        assert listing_id is not None

        listing = db_session.get(GuideListing, listing_id)
        assert listing is not None
        assert listing.guide_user_id == guide.id
        assert listing.title == VALID_PROPOSAL["title"]
        assert listing.is_active is True

    def test_content_writer_may_approve_a_proposal(self, client, db_session):
        guide = _make_user(db_session, "cw-guide@example.com", GUIDE)
        proposal = _create_and_submit_proposal(client, guide)
        cw = _make_user(db_session, "cw@example.com", CONTENT_MANAGER)
        res = client.post(
            f"{PROPOSALS}/{proposal['id']}/decision",
            json={"action": "approve"},
            headers=_bearer(cw),
        )
        assert res.status_code == 200
        assert res.json()["decided_by_role"] == CONTENT_MANAGER

    def test_admin_is_implicitly_authorized(self, client, db_session):
        guide = _make_user(db_session, "admin-guide@example.com", GUIDE)
        proposal = _create_and_submit_proposal(client, guide)
        admin = _make_user(db_session, "boss@example.com", ADMIN)
        res = client.post(
            f"{PROPOSALS}/{proposal['id']}/decision",
            json={"action": "approve"},
            headers=_bearer(admin),
        )
        assert res.status_code == 200

    @pytest.mark.parametrize("role", [GUIDE, TRAVELER, "customer-support", "host"])
    def test_unauthorized_roles_cannot_decide_proposals(self, client, db_session, role):
        guide = _make_user(db_session, "gate-guide@example.com", GUIDE)
        proposal = _create_and_submit_proposal(client, guide)
        outsider = _make_user(db_session, f"outsider-{role}@example.com", role)
        res = client.post(
            f"{PROPOSALS}/{proposal['id']}/decision",
            json={"action": "approve"},
            headers=_bearer(outsider),
        )
        assert res.status_code == 403

    def test_reject_requires_notes(self, client, db_session):
        guide = _make_user(db_session, "notes-guide@example.com", GUIDE)
        proposal = _create_and_submit_proposal(client, guide)
        rm = _make_user(db_session, "notes-rm@example.com", REGIONAL_HEAD)
        res = client.post(
            f"{PROPOSALS}/{proposal['id']}/decision",
            json={"action": "reject"},
            headers=_bearer(rm),
        )
        assert res.status_code == 422

    def test_submitted_proposal_cannot_be_edited(self, client, db_session):
        guide = _make_user(db_session, "edit-guide@example.com", GUIDE)
        proposal = _create_and_submit_proposal(client, guide)
        res = client.patch(
            f"{PROPOSALS}/{proposal['id']}",
            json={"price": 99.0},
            headers=_bearer(guide),
        )
        assert res.status_code == 422

    def test_unapproved_proposal_cannot_be_published(self, client, db_session):
        guide = _make_user(db_session, "premature@example.com", GUIDE)
        res = client.post(PROPOSALS, json=VALID_PROPOSAL, headers=_bearer(guide))
        proposal_id = res.json()["id"]
        res = client.post(f"{PROPOSALS}/{proposal_id}/publish", headers=_bearer(guide))
        assert res.status_code == 422

    def test_guide_only_sees_their_own_proposals(self, client, db_session):
        guide_a = _make_user(db_session, "guide-a@example.com", GUIDE)
        guide_b = _make_user(db_session, "guide-b@example.com", GUIDE)
        res = client.post(PROPOSALS, json=VALID_PROPOSAL, headers=_bearer(guide_a))
        proposal_id = res.json()["id"]
        # Guide B cannot read, edit or submit Guide A's proposal.
        assert client.get(f"{PROPOSALS}/{proposal_id}", headers=_bearer(guide_b)).status_code == 404
        assert (
            client.post(f"{PROPOSALS}/{proposal_id}/submit", headers=_bearer(guide_b)).status_code
            == 404
        )
        assert client.get(PROPOSALS, headers=_bearer(guide_b)).json() == []

    def test_non_guide_cannot_create_proposals(self, client, db_session):
        traveler = _make_user(db_session, "wanderer@example.com", TRAVELER)
        res = client.post(PROPOSALS, json=VALID_PROPOSAL, headers=_bearer(traveler))
        assert res.status_code == 403

    def test_resubmission_clears_previous_decision(self, client, db_session):
        guide = _make_user(db_session, "resub@example.com", GUIDE)
        proposal = _create_and_submit_proposal(client, guide)
        rm = _make_user(db_session, "resub-rm@example.com", REGIONAL_HEAD)
        client.post(
            f"{PROPOSALS}/{proposal['id']}/decision",
            json={"action": "request_changes", "notes": "Add meal inclusions."},
            headers=_bearer(rm),
        )
        # Guide edits (allowed in changes_requested) and resubmits — clock resets.
        res = client.patch(
            f"{PROPOSALS}/{proposal['id']}",
            json={"description": VALID_PROPOSAL["description"] + " Meals included."},
            headers=_bearer(guide),
        )
        assert res.status_code == 200
        res = client.post(f"{PROPOSALS}/{proposal['id']}/submit", headers=_bearer(guide))
        body = res.json()
        assert body["status"] == "submitted"
        assert body["decided_at"] is None
        assert body["decision_notes"] is None

    def test_withdraw(self, client, db_session):
        guide = _make_user(db_session, "withdraw@example.com", GUIDE)
        proposal = _create_and_submit_proposal(client, guide)
        res = client.post(f"{PROPOSALS}/{proposal['id']}/withdraw", headers=_bearer(guide))
        assert res.status_code == 200
        assert res.json()["status"] == "cancelled"

    def test_rejection_closes_the_request(self, client, db_session):
        guide = _make_user(db_session, "closed@example.com", GUIDE)
        proposal = _create_and_submit_proposal(client, guide)
        rm = _make_user(db_session, "closed-rm@example.com", REGIONAL_HEAD)
        res = client.post(
            f"{PROPOSALS}/{proposal['id']}/decision",
            json={"action": "reject", "notes": "Duplicates a seasonal listing."},
            headers=_bearer(rm),
        )
        assert res.status_code == 200
        body = res.json()
        assert body["status"] == "rejected"
        assert "Duplicates" in body["decision_notes"]
        # A rejected proposal can never be published.
        res = client.post(f"{PROPOSALS}/{proposal['id']}/publish", headers=_bearer(guide))
        assert res.status_code == 422


class TestChangeRequestLifecycle:
    def test_full_lifecycle_apply_updates_listing(self, client, db_session):
        guide = _make_user(db_session, "cr-guide@example.com", GUIDE)
        listing = _make_listing(db_session, guide)
        cr = _create_and_submit_cr(client, guide, listing.id)

        # Server-side snapshot: current → proposed (SOP-GN-EXP-002 form EXP-F-002).
        assert cr["change_class"] == "material"
        assert cr["changes"] == [{"field": "price", "current": 50.0, "proposed": 65.0}]

        rm = _make_user(db_session, "cr-rm@example.com", REGIONAL_HEAD)
        res = client.post(
            f"{CHANGE_REQUESTS}/{cr['id']}/decision",
            json={"action": "approve", "notes": "Market rate OK."},
            headers=_bearer(rm),
        )
        assert res.status_code == 200
        assert res.json()["decided_by_role"] == REGIONAL_HEAD

        # Guide applies the approved change (Step 6a) — only the reviewed diff.
        res = client.post(f"{CHANGE_REQUESTS}/{cr['id']}/apply", headers=_bearer(guide))
        assert res.status_code == 200
        assert res.json()["status"] == "applied"
        db_session.refresh(listing)
        assert listing.price == 65.0
        assert listing.title == "Bhaktapur Heritage Walk"  # untouched fields stay

    def test_content_writer_cannot_decide_change_requests(self, client, db_session):
        """SOP-GN-EXP-002 gate: Regional Manager ONLY."""
        guide = _make_user(db_session, "cw-cr-guide@example.com", GUIDE)
        listing = _make_listing(db_session, guide)
        cr = _create_and_submit_cr(client, guide, listing.id)
        cw = _make_user(db_session, "cw-cr@example.com", CONTENT_MANAGER)
        res = client.post(
            f"{CHANGE_REQUESTS}/{cr['id']}/decision",
            json={"action": "approve"},
            headers=_bearer(cw),
        )
        assert res.status_code == 403


    @pytest.mark.parametrize("role", [GUIDE, TRAVELER, "customer-support", "host"])
    def test_unauthorized_roles_cannot_decide_change_requests(self, client, db_session, role):
        guide = _make_user(db_session, f"cr-gate-{role}@example.com", GUIDE)
        listing = _make_listing(db_session, guide)
        cr = _create_and_submit_cr(client, guide, listing.id)
        outsider = _make_user(db_session, f"cr-outsider-{role}@example.com", role)
        res = client.post(
            f"{CHANGE_REQUESTS}/{cr['id']}/decision",
            json={"action": "approve"},
            headers=_bearer(outsider),
        )
        assert res.status_code == 403

    def test_minor_change_is_classified_editorial(self, client, db_session):
        guide = _make_user(db_session, "minor-guide@example.com", GUIDE)
        listing = _make_listing(db_session, guide)
        res = client.post(
            CHANGE_REQUESTS,
            json={
                "listing_id": listing.id,
                "reason": "Polished the description wording.",
                "changes": [{"field": "description", "proposed": "A gentle walk through Bhaktapur's pottery square, palace lanes and hidden courtyards."}],
            },
            headers=_bearer(guide),
        )
        assert res.status_code == 201
        assert res.json()["change_class"] == "minor"

    def test_noop_change_is_rejected(self, client, db_session):
        guide = _make_user(db_session, "noop@example.com", GUIDE)
        listing = _make_listing(db_session, guide)
        res = client.post(
            CHANGE_REQUESTS,
            json={
                "listing_id": listing.id,
                "reason": "Trying to set the same price.",
                "changes": [{"field": "price", "proposed": listing.price}],
            },
            headers=_bearer(guide),
        )
        assert res.status_code == 422

    def test_max_guests_below_booked_is_rejected(self, client, db_session):
        guide = _make_user(db_session, "capacity@example.com", GUIDE)
        listing = _make_listing(db_session, guide, max_guests=10, booked_guests=8)
        res = client.post(
            CHANGE_REQUESTS,
            json={
                "listing_id": listing.id,
                "reason": "Reducing group size for the season.",
                "changes": [{"field": "max_guests", "proposed": 6}],
            },
            headers=_bearer(guide),
        )
        assert res.status_code == 422
        assert "booked" in res.json()["detail"]

    def test_unknown_field_is_rejected(self, client, db_session):
        guide = _make_user(db_session, "unknown-field@example.com", GUIDE)
        listing = _make_listing(db_session, guide)
        res = client.post(
            CHANGE_REQUESTS,
            json={
                "listing_id": listing.id,
                "reason": "Attempting an unsupported field edit.",
                "changes": [{"field": "guide_user_id", "proposed": 999}],
            },
            headers=_bearer(guide),
        )
        assert res.status_code == 422

    def test_cannot_apply_an_unapproved_change_request(self, client, db_session):
        guide = _make_user(db_session, "apply-early@example.com", GUIDE)
        listing = _make_listing(db_session, guide)
        cr = _create_and_submit_cr(client, guide, listing.id)
        res = client.post(f"{CHANGE_REQUESTS}/{cr['id']}/apply", headers=_bearer(guide))
        assert res.status_code == 422
        db_session.refresh(listing)
        assert listing.price == 50.0  # unchanged

    def test_change_request_only_touches_owned_listings(self, client, db_session):
        guide_a = _make_user(db_session, "owner@example.com", GUIDE)
        guide_b = _make_user(db_session, "intruder@example.com", GUIDE)
        listing = _make_listing(db_session, guide_a)
        res = client.post(
            CHANGE_REQUESTS,
            json={
                "listing_id": listing.id,
                "reason": "Someone else's listing edit attempt.",
                "changes": [{"field": "price", "proposed": 1.0}],
            },
            headers=_bearer(guide_b),
        )
        assert res.status_code == 404


class TestApproverQueues:
    def test_proposal_queue_visible_to_both_approver_roles(self, client, db_session):
        guide = _make_user(db_session, "queue-guide@example.com", GUIDE)
        _create_and_submit_proposal(client, guide)
        for role, email in ((REGIONAL_HEAD, "queue-rm@example.com"), (CONTENT_MANAGER, "queue-cw@example.com")):
            user = _make_user(db_session, email, role)
            res = client.get(PROPOSAL_QUEUE, headers=_bearer(user))
            assert res.status_code == 200
            assert len(res.json()) == 1
            assert res.json()[0]["guide_email"] == guide.email

    def test_change_request_queue_is_regional_manager_only(self, client, db_session):
        guide = _make_user(db_session, "crq-guide@example.com", GUIDE)
        listing = _make_listing(db_session, guide)
        cr = _create_and_submit_cr(client, guide, listing.id)
        rm = _make_user(db_session, "crq-rm@example.com", REGIONAL_HEAD)
        res = client.get(CHANGE_REQUEST_QUEUE, headers=_bearer(rm))
        assert res.status_code == 200
        assert res.json()[0]["id"] == cr["id"]
        cw = _make_user(db_session, "crq-cw@example.com", CONTENT_MANAGER)
        assert client.get(CHANGE_REQUEST_QUEUE, headers=_bearer(cw)).status_code == 403

    def test_guide_cannot_read_any_queue(self, client, db_session):
        guide = _make_user(db_session, "nosy@example.com", GUIDE)
        assert client.get(PROPOSAL_QUEUE, headers=_bearer(guide)).status_code == 403
        assert client.get(CHANGE_REQUEST_QUEUE, headers=_bearer(guide)).status_code == 403


