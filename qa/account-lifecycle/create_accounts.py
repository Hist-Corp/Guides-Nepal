#!/usr/bin/env python3
"""Guides Nepal QA Account Lifecycle: Account Creation."""

import json
import os
import sys
import uuid
from datetime import datetime
from pathlib import Path

import httpx
from faker import Faker
from PIL import Image
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# Add backend to the path so app modules can be imported
backend_path = Path(__file__).resolve().parents[2] / "backend"
print(f"Adding backend path: {backend_path}")
sys.path.insert(0, str(backend_path))

from app.core.security import get_password_hash

BASE_URL = os.getenv("QA_BACKEND_URL", "http://127.0.0.1:8000")
API_V1 = f"{BASE_URL}/api/v1"
QA_RUN_ID = os.getenv("QA_RUN_ID", "qa-run-20261110-001")

MANIFEST_PATH = Path(__file__).resolve().parent / "account_manifest.json"
fake = Faker()

TRAVELER_PASSWORD = "Traveler@2024"
GUIDE_PASSWORD = "Guide@2024"
HOST_PASSWORD = "Host@2024"


def load_manifest():
    if MANIFEST_PATH.exists():
        return json.loads(MANIFEST_PATH.read_text())
    return {
        "qa_run_id": QA_RUN_ID,
        "environment": "local",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "accounts": {"travelers": [], "guides": [], "hosts": []},
        "summary": {
            "travelers_target": 10,
            "guides_target": 10,
            "hosts_target": 5,
            "total_target": 25,
            "cleanup_status": "pending",
        },
    }


def save_manifest(manifest):
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2))


def http_post(client, path, json_data):
    return client.post(f"{API_V1}{path}", json=json_data, timeout=30.0)


def http_get(client, path, token=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return client.get(f"{API_V1}{path}", headers=headers, timeout=30.0)


def http_patch(client, path, json_data, token=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return client.patch(f"{API_V1}{path}", json=json_data, headers=headers, timeout=30.0)


def login(client, email, password, role="traveler"):
    resp = client.post(
        f"{API_V1}/auth/login",
        json={"email": email, "password": password, "role": role},
        timeout=30.0,
    )
    if resp.status_code != 200:
        print(f"  LOGIN FAILED: {email} status={resp.status_code} body={resp.text[:200]}")
        return None, None
    data = resp.json()
    return data.get("access_token"), data

def create_traveler(client, index):
    first = fake.first_name()
    last = fake.last_name()
    email = f"qa.traveler.{index}.{uuid.uuid4().hex[:6]}@example.com"

    payload = {
        "firstName": first,
        "lastName": last,
        "email": email,
        "password": TRAVELER_PASSWORD,
        "phone": fake.phone_number(),
        "role": "traveler",
    }

    resp = http_post(client, "/auth/register", payload)
    if resp.status_code not in (200, 201):
        print(f"  TRAVELER {index} REGISTER FAILED: {resp.status_code} {resp.text[:200]}")
        return None

    token, user_data = login(client, email, TRAVELER_PASSWORD, "traveler")
    if not token:
        print(f"  TRAVELER {index} LOGIN FAILED: {email}")
        return None

    me_resp = http_get(client, "/profile/me", token)
    if me_resp.status_code != 200:
        print(f"  TRAVELER {index} PROFILE CHECK FAILED: {me_resp.status_code}")
        return None

    account = {
        "account_id": f"traveler-{index}",
        "email": email,
        "role": "traveler",
        "firstName": first,
        "lastName": last,
        "password": TRAVELER_PASSWORD,
        "user_id": user_data.get("user", {}).get("id") if isinstance(user_data, dict) else None,
        "token": token,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "signup_method": "public_api",
        "status": "active",
        "profile_completed": False,
        "uploads": [],
        "bookings": [],
        "cleanup": "pending",
    }
    print(f"  [OK] Traveler {index}: {email} (user_id={account['user_id']})")
    return account

import io
import os


def create_guide_application(client, index):
    first = fake.first_name()
    last = fake.last_name()
    email = f"qa.guide.{index}.{uuid.uuid4().hex[:6]}@example.com"

    # Create test image bytes
    def make_image(color, size=(400, 600)):
        img = Image.new('RGB', size, color)
        buf = io.BytesIO()
        img.save(buf, 'PNG')
        return buf.getvalue()

    files = {
        "citizenshipFront": ("citizenship_front.png", make_image((79, 70, 229)), "image/png"),
        "citizenshipBack": ("citizenship_back.png", make_image((168, 85, 247)), "image/png"),
        "liveSelfie": ("selfie.png", make_image((236, 72, 91)), "image/png"),
        "holdingCitizenship": ("holding_citizenship.png", make_image((129, 199, 130)), "image/png"),
        "certificate": ("certificate.png", make_image((249, 168, 35)), "image/png"),
    }

    data = {
        "full_name": f"{first} {last}",
        "email": email,
        "password": GUIDE_PASSWORD,
        "region": "Bagmati Province",
        "phone": fake.phone_number(),
        "city": fake.city(),
        "nin_number": fake.bothify(text="########"),
    }

    resp = client.post(
        f"{API_V1}/guide-applications",
        data=data,
        files=files,
        timeout=30.0,
    )
    if resp.status_code not in (200, 201):
        print(f"  GUIDE {index} APPLICATION FAILED: {resp.status_code} {resp.text[:200]}")
        return None

    print(f"  [OK] Guide {index} application submitted: {email}")
    return {
        "account_id": f"guide-{index}",
        "email": email,
        "role": "guide",
        "firstName": first,
        "lastName": last,
        "password": GUIDE_PASSWORD,
        "application_status": "pending",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "cleanup": "pending",
    }


def create_host_application(client, index):
    first = fake.first_name()
    last = fake.last_name()
    email = f"qa.host.{index}.{uuid.uuid4().hex[:6]}@example.com"

    payload = {
        "full_name": f"{first} {last}",
        "email": email,
        "phone": fake.phone_number(),
        "city": fake.city(),
        "documents": "business_registration.pdf",
        "password": HOST_PASSWORD,
    }

    resp = http_post(client, "/host-applications", payload)
    if resp.status_code not in (200, 201):
        print(f"  HOST {index} APPLICATION FAILED: {resp.status_code} {resp.text[:200]}")
        return None

    print(f"  [OK] Host {index} application submitted: {email}")
    return {
        "account_id": f"host-{index}",
        "email": email,
        "role": "host",
        "firstName": first,
        "lastName": last,
        "password": HOST_PASSWORD,
        "application_status": "pending",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "cleanup": "pending",
    }

def approve_guide_application(client, admin_token, email):
    list_resp = http_get(client, "/operations/guide-applications", admin_token)
    if list_resp.status_code != 200:
        print(f"    GUIDE APPROVAL: Failed to list applications: {list_resp.status_code}")
        return

    applications = list_resp.json()
    target = None
    for app in applications:
        if app.get("email") == email:
            target = app
            break

    if not target:
        print(f"    GUIDE APPROVAL: Application not found for {email}")
        return

    app_id = target.get("id")
    resp = http_patch(
        client,
        f"/operations/guide-applications/{app_id}",
        {"status": "approved", "review_note": "QA test approval"},
        admin_token,
    )
    if resp.status_code != 200:
        print(f"    GUIDE APPROVAL: Failed to approve {email}: {resp.status_code} {resp.text[:200]}")
        return

    print(f"    [OK] Guide application approved: {email} (app_id={app_id})")


def approve_host_application(client, admin_token, email):
    list_resp = http_get(client, "/operations/host-applications", admin_token)
    if list_resp.status_code != 200:
        print(f"    HOST APPROVAL: Failed to list applications: {list_resp.status_code}")
        return

    applications = list_resp.json()
    target = None
    for app in applications:
        if app.get("email") == email:
            target = app
            break

    if not target:
        print(f"    HOST APPROVAL: Application not found for {email}")
        return

    app_id = target.get("id")

    # Check if password hash is already set
    app_resp = http_get(client, f"/operations/host-applications/{app_id}", admin_token)
    if app_resp.status_code == 200:
        app_data = app_resp.json()
        if not app_data.get("credential_password_hash"):
            # The public host application API doesn't capture passwords.
            # This is a known defect: host applications via public API
            # cannot be approved without a password.
            print(f"    [DEFECT] Host application {email} has no password hash - patching DB")
            # Set the password hash directly in the database
            try:
                from app.models.host_application import HostApplication
                from app.core.security import get_password_hash
                from sqlalchemy import create_engine
                from sqlalchemy.orm import sessionmaker

                engine = create_engine(os.getenv("QA_DATABASE_URL", "sqlite:///./guidesnepal.db"))
                Session = sessionmaker(bind=engine)
                db = Session()
                app_db = db.query(HostApplication).filter(HostApplication.id == app_id).first()
                if app_db:
                    app_db.credential_password_hash = get_password_hash("Host@2024")
                    db.commit()
                    print(f"    [OK] Set password hash in DB for host application {app_id}")
                db.close()
            except Exception as e:
                print(f"    [ERROR] Failed to set password hash in DB: {e}")
                return

    resp = http_patch(
        client,
        f"/operations/host-applications/{app_id}",
        {"status": "approved", "review_note": "QA test approval"},
        admin_token,
    )
    if resp.status_code != 200:
        print(f"    HOST APPROVAL: Failed to approve {email}: {resp.status_code} {resp.text[:200]}")
        return

    print(f"    [OK] Host application approved: {email} (app_id={app_id})")


def main():
    print("=" * 70)
    print("Guides Nepal - QA Account Creation")
    print(f"QA Run ID: {QA_RUN_ID}")
    print(f"Backend: {BASE_URL}")
    print("=" * 70)

    manifest = load_manifest()

    client = httpx.Client(base_url=BASE_URL, timeout=30.0)
    health = client.get("/health", timeout=10.0)
    if health.status_code != 200:
        print(f"ERROR: Backend not healthy: {health.status_code}")
        sys.exit(1)
    print(f"Backend healthy: {health.json()}")

    admin_email = os.getenv("QA_ADMIN_EMAIL", "admin@guides-nepal.com")
    admin_password = os.getenv("QA_ADMIN_PASSWORD", "Admin@12345")
    admin_token, admin_data = login(client, admin_email, admin_password, "admin")
    if admin_token:
        print("Admin login successful")
    else:
        print("WARNING: Admin login failed. Guide/host approvals will be skipped.")
        admin_token = None

    print()
    print("--- Creating 10 Traveler Accounts ---")
    for i in range(1, 11):
        account = create_traveler(client, i)
        if account:
            manifest["accounts"]["travelers"].append(account)

    print()
    print("--- Creating 10 Guide Applications ---")
    for i in range(1, 11):
        account = create_guide_application(client, i)
        if account:
            manifest["accounts"]["guides"].append(account)

    print()
    print("--- Creating 5 Host Applications ---")
    for i in range(1, 6):
        account = create_host_application(client, i)
        if account:
            manifest["accounts"]["hosts"].append(account)

    save_manifest(manifest)

    if admin_token:
        print()
        print("--- Approving Guide Applications ---")
        for guide in manifest["accounts"]["guides"]:
            if guide["application_status"] == "pending":
                approve_guide_application(client, admin_token, guide["email"])

        print()
        print("--- Approving Host Applications ---")
        for host in manifest["accounts"]["hosts"]:
            if host["application_status"] == "pending":
                approve_host_application(client, admin_token, host["email"])

    t_count = len(manifest["accounts"]["travelers"])
    g_count = len(manifest["accounts"]["guides"])
    h_count = len(manifest["accounts"]["hosts"])

    print()
    print("=" * 70)
    print("ACCOUNT CREATION SUMMARY")
    print(f"  Travelers: {t_count}/10")
    print(f"  Guides: {g_count}/10")
    print(f"  Hosts: {h_count}/5")
    print(f"  Total: {t_count + g_count + h_count}/25")
    print("=" * 70)

    client.close()


if __name__ == "__main__":
    main()
