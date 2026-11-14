#!/usr/bin/env python3
"""Phase E — Security Audit."""

import httpx
import json
import sys
import uuid

BASE_URL = "http://127.0.0.1:8000"
client = httpx.Client(base_url=BASE_URL, timeout=30.0)


def main():
    print("=" * 70)
    print("Phase E — Security Audit")
    print(f"Test Run ID: qa-run-20261110-002")
    print(f"Backend: {BASE_URL}")
    print("=" * 70)

    findings = []

    # SECTION 1: Authentication Security
    print("\n1. Authentication Security")

    # 1.1: Wrong password rejection
    print("  [1.1] Wrong password rejection...")
    resp = client.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": "admin@guides-nepal.com",
        "password": "WrongPassword123!",
        "role": "admin",
    }, timeout=30.0)
    if resp.status_code == 401:
        print("  ✅ Wrong password rejected with 401")
    else:
        print(f"  ❌ Wrong password not properly rejected: {resp.status_code}")
        findings.append(("MEDIUM", "Weak password rejection", f"Wrong password returned {resp.status_code}"))

    # 1.2: Empty credentials rejection
    print("  [1.2] Empty credentials rejection...")
    resp = client.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": "",
        "password": "",
        "role": "traveler",
    }, timeout=30.0)
    if resp.status_code in (400, 422, 401):
        print(f"  ✅ Empty credentials rejected with {resp.status_code}")
    else:
        print(f"  ❌ Empty credentials not rejected: {resp.status_code}")
        findings.append(("MEDIUM", "Empty credential acceptance", f"Empty credentials returned {resp.status_code}"))

    # 1.3: Invalid email format
    print("  [1.3] Invalid email format rejection...")
    resp = client.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": "not-an-email",
        "password": "Password123!",
        "role": "traveler",
    }, timeout=30.0)
    if resp.status_code in (400, 422, 401):
        print(f"  ✅ Invalid email rejected with {resp.status_code}")
    else:
        print(f"  ❌ Invalid email not rejected: {resp.status_code}")

    # 1.4: Duplicate email registration
    print("  [1.4] Duplicate email registration...")
    resp = client.post(f"{BASE_URL}/api/v1/auth/register", json={
        "firstName": "Duplicate",
        "lastName": "User",
        "email": "admin@guides-nepal.com",
        "password": "Password123!",
        "phone": "+977-1-0000000",
        "role": "traveler",
    }, timeout=30.0)
    if resp.status_code in (400, 409, 422):
        print(f"  ✅ Duplicate email rejected with {resp.status_code}")
    else:
        print(f"  ❌ Duplicate email not rejected: {resp.status_code}")
        findings.append(("LOW", "Duplicate email registration", f"Duplicate email returned {resp.status_code}"))

    # 1.5: Weak password rejection
    print("  [1.5] Weak password rejection...")
    resp = client.post(f"{BASE_URL}/api/v1/auth/register", json={
        "firstName": "Weak",
        "lastName": "Password",
        "email": f"qa.weak.{uuid.uuid4().hex[:8]}@example.com",
        "password": "123",
        "phone": "+977-1-0000001",
        "role": "traveler",
    }, timeout=30.0)
    if resp.status_code in (400, 422):
        print(f"  ✅ Weak password rejected with {resp.status_code}")
    else:
        print(f"  ❌ Weak password not rejected: {resp.status_code}")
        findings.append(("MEDIUM", "Weak password acceptance", f"Weak password returned {resp.status_code}"))

    # 1.6: Invalid role assignment (self-registration as admin)
    print("  [1.6] Privileged self-registration prevention...")
    resp = client.post(f"{BASE_URL}/api/v1/auth/register", json={
        "firstName": "Privilege",
        "lastName": "Escalation",
        "email": f"qa.priv.{uuid.uuid4().hex[:8]}@example.com",
        "password": "Password123!",
        "phone": "+977-1-0000002",
        "role": "admin",
    }, timeout=30.0)
    if resp.status_code in (400, 403, 422):
        print(f"  ✅ Admin self-registration rejected with {resp.status_code}")
    else:
        print(f"  ❌ Admin self-registration not rejected: {resp.status_code} - potential privilege escalation!")
        findings.append(("CRITICAL", "Privileged self-registration allowed", f"Admin role self-registration returned {resp.status_code}"))

    # 1.7: Account enumeration
    print("  [1.7] Account enumeration check...")
    resp_existing = client.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": "admin@guides-nepal.com",
        "password": "wrongpassword",
        "role": "admin",
    }, timeout=30.0)
    resp_nonexisting = client.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "wrongpassword",
        "role": "admin",
    }, timeout=30.0)
    if resp_existing.status_code == resp_nonexisting.status_code:
        print("  ✅ Account enumeration prevented - same response for existing/non-existing emails")
    else:
        print(f"  ❌ Potential account enumeration: existing={resp_existing.status_code}, non-existing={resp_nonexisting.status_code}")
        findings.append(("LOW", "Account enumeration", f"Different responses: existing={resp_existing.status_code}, non-existing={resp_nonexisting.status_code}"))

    print("\n✅ Phase E — Security Audit (Part 1) Complete")

    # SECTION 2: Authorization & IDOR
    print("\n2. Authorization & IDOR")

    # Create two travelers for cross-account testing
    print("  [2.1] Creating two travelers for IDOR testing...")
    t1_email = f"qa.idor.t1.{uuid.uuid4().hex[:8]}@example.com"
    t2_email = f"qa.idor.t2.{uuid.uuid4().hex[:8]}@example.com"

    for email in [t1_email, t2_email]:
        client.post(f"{BASE_URL}/api/v1/auth/register", json={
            "firstName": "IDOR",
            "lastName": "Test",
            "email": email,
            "password": "Traveler@2024",
            "phone": "+977-1-0000003",
            "role": "traveler",
        }, timeout=30.0)

    # Login as traveler 1
    resp = client.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": t1_email,
        "password": "Traveler@2024",
        "role": "traveler",
    }, timeout=30.0)
    t1_token = resp.json()["access_token"]
    t1_headers = {"Authorization": f"Bearer {t1_token}"}

    # Login as traveler 2
    resp = client.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": t2_email,
        "password": "Traveler@2024",
        "role": "traveler",
    }, timeout=30.0)
    t2_token = resp.json()["access_token"]
    t2_headers = {"Authorization": f"Bearer {t2_token}"}
    t2_token = resp.json()["access_token"]
    t2_headers = {"Authorization": f"Bearer {t2_token}"}

    # 2.2: Traveler 1 tries to access traveler 2's bookings
    print("  [2.2] Cross-traveler booking access (IDOR)...")
    resp = client.get(f"{BASE_URL}/api/v1/experiences", headers=t1_headers, timeout=30.0)
    data = resp.json()
    exp_list = data if isinstance(data, list) else data.get("experiences", [])
    if exp_list:
        exp = exp_list[0]
        resp = client.post(f"{BASE_URL}/api/v1/bookings/",
                json={"experience_id": exp.get("id"), "experience_title": exp.get("title"),
                      "city": "Kathmandu", "guests": 2, "price": exp.get("price", 50.0),
                      "date": "2027-06-01"},
                headers=t1_headers, timeout=30.0)
        if resp.status_code == 200:
            booking_id = resp.json().get("id")
            resp = client.get(f"{BASE_URL}/api/v1/bookings/{booking_id}/", headers=t2_headers, timeout=30.0)
            if resp.status_code in (403, 404):
                print(f"  ✅ Cross-traveler booking access denied with {resp.status_code}")
            else:
                print(f"  ❌ Cross-traveler booking access NOT denied: {resp.status_code} - IDOR vulnerability!")
                findings.append(("HIGH", "IDOR - Cross-traveler booking access", f"Traveler 2 accessed Traveler 1's booking with {resp.status_code}"))
        else:
            print(f"  Could not create booking for IDOR test: {resp.status_code}")

    # 2.3: Traveler tries to access admin endpoint
    print("  [2.3] Traveler access to admin endpoint...")
    resp = client.get(f"{BASE_URL}/api/v1/operations/guide-applications", headers=t1_headers, timeout=30.0)
    if resp.status_code in (403, 401):
        print(f"  ✅ Traveler admin access denied with {resp.status_code}")
    else:
        print(f"  ❌ Traveler admin access not denied: {resp.status_code}")
        findings.append(("HIGH", "Unauthorized admin access", f"Traveler accessed admin endpoint with {resp.status_code}"))
        findings.append(("HIGH", "Unauthorized admin access", f"Traveler accessed admin endpoint with {resp.status_code}"))

    # SECTION 3: Session Security
    print("\n3. Session Security")

    # 3.1: Invalid token rejection
    print("  [3.1] Invalid token rejection...")
    resp = client.get(f"{BASE_URL}/api/v1/bookings/",
            headers={"Authorization": "Bearer invalid.token.here"}, timeout=30.0)
    if resp.status_code in (401, 403):
        print(f"  ✅ Invalid token rejected with {resp.status_code}")
    else:
        print(f"  ❌ Invalid token not rejected: {resp.status_code}")
        findings.append(("MEDIUM", "Invalid token acceptance", f"Invalid token returned {resp.status_code}"))

    # 3.2: Missing token rejection
    print("  [3.2] Missing token rejection...")
    resp = client.get(f"{BASE_URL}/api/v1/bookings/", timeout=30.0)
    if resp.status_code in (401, 403):
        print(f"  ✅ Missing token rejected with {resp.status_code}")
    else:
        print(f"  ❌ Missing token not rejected: {resp.status_code}")
        findings.append(("MEDIUM", "Missing token acceptance", f"Missing token returned {resp.status_code}"))

    # 3.3: Wrong token format
    print("  [3.3] Wrong token format...")
    resp = client.get(f"{BASE_URL}/api/v1/bookings/",
            headers={"Authorization": "Basic some_token"}, timeout=30.0)
    if resp.status_code in (401, 403):
        print(f"  ✅ Wrong token format rejected with {resp.status_code}")
    else:
        print(f"  ❌ Wrong token format not rejected: {resp.status_code}")

    # SECTION 4: Security Headers
    print("\n4. CORS & Security Headers")

    # 4.1: Check security headers
    print("  [4.1] Security headers check...")
    resp = client.get(f"{BASE_URL}/health", timeout=30.0)
    headers = resp.headers
    security_headers = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Content-Security-Policy": "default-src",
        "Referrer-Policy": "strict-origin",
    }
    for header, expected in security_headers.items():
        actual = headers.get(header, "")
        if actual and expected.lower() in actual.lower():
            print(f"  ✅ Security header present: {header}")
        else:
            print(f"  ❌ Security header missing or incorrect: {header} (got: {actual})")
            findings.append(("LOW", "Missing security header", f"{header} not properly configured"))

    # SECTION 5: Summary
    print("\n5. Security Audit Summary")
    print(f"  Total findings: {len(findings)}")
    for severity, title, description in findings:
        print(f"    [{severity}] {title}: {description[:100]}")

    critical = sum(1 for s, _, _ in findings if s == "CRITICAL")
    high = sum(1 for s, _, _ in findings if s == "HIGH")
    medium = sum(1 for s, _, _ in findings if s == "MEDIUM")
    low = sum(1 for s, _, _ in findings if s == "LOW")

    print(f"\n  Severity breakdown:")
    print(f"    🔴 Critical: {critical}")
    print(f"    🟠 High: {high}")
    print(f"    🟡 Medium: {medium}")
    print(f"    🟢 Low: {low}")

    if critical > 0:
        print("\n  ⚠️  CRITICAL findings require immediate attention!")
    elif high > 0:
        print("\n  ⚠️  HIGH findings should be addressed promptly.")
    else:
        print("\n  ✅ No critical or high security findings.")


if __name__ == "__main__":
    main()