#!/usr/bin/env python3
"""Phase C: Booking Lifecycle & Functional Workflow Testing."""

import httpx
import json
import sys

BASE_URL = "http://127.0.0.1:8000"
client = httpx.Client(base_url=BASE_URL, timeout=30.0)

def print_step(title):
    print()
    print('='*70)
    print(f"  {title}")
    print('='*70)

def main():
    print_step("Booking Lifecycle & Functional Workflow Testing")
    print("Phase C - Booking Lifecycle Testing")
    print(f"Test Run ID: qa-run-20261110-002")
    print(f"Backend: {BASE_URL}")

    # STEP 1: Create a test traveler account
    print_step("STEP 1: Creating test traveler account")
    import uuid
    traveler_email = f"qa.booking.{uuid.uuid4().hex[:8]}@example.com"
    traveler = {
        "firstName": "Test",
        "lastName": "Booking",
        "email": traveler_email,
        "password": "Traveler@2024",
        "phone": "+977-1-5550001",
        "role": "traveler",
    }
    resp = client.post(f"{BASE_URL}/api/v1/auth/register", json=traveler, timeout=30.0)
    print(f"Registration: {resp.status_code}")
    if resp.status_code not in (200, 201):
        print(f"  ERROR: {resp.text[:300]}")
        sys.exit(1)

    # Login
    resp = client.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": traveler_email,
        "password": "Traveler@2024",
        "role": "traveler",
    }, timeout=30.0)
    print(f"Login: {resp.status_code}")
    if resp.status_code != 200:
        print(f"  ERROR: {resp.text[:300]}")
        sys.exit(1)

    token = resp.json()["access_token"]
    traveler_headers = {"Authorization": f"Bearer {token}"}
    print(f"  ✅ Traveler account created and logged in")

    # STEP 2: Discover experiences
    print_step("STEP 2: Discovering available experiences")
    resp = client.get(f"{BASE_URL}/api/v1/experiences", headers=traveler_headers, timeout=30.0)
    print(f"Experiences API: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        if isinstance(data, dict):
            print(f"  Count: {data.get('count', 'N/A')}")
        elif isinstance(data, list):
            print(f"  Count: {len(data)}")
        else:
            print(f"  Data type: {type(data)}")
    else:
        print(f"  ERROR: {resp.text[:300]}")

    # STEP 3: Check guide assignments
    print_step("STEP 3: Checking guide assignments")
    resp = client.get(f"{BASE_URL}/api/v1/experiences", headers=traveler_headers, timeout=30.0)
    if resp.status_code == 200:
        data = resp.json()
        exp_list = data if isinstance(data, list) else data.get("experiences", [])
        if exp_list:
            guides = exp_list[0].get("guides", [])
            print(f"  Sample experience ID: {exp_list[0].get('id')}")
            print(f"  Guides on experience: {len(guides)}")

    # STEP 4: Test booking creation
    print_step("STEP 4: Testing booking creation")
    resp = client.get(f"{BASE_URL}/api/v1/experiences", headers=traveler_headers, timeout=30.0)
    if resp.status_code == 200:
        data = resp.json()
        exp_list = data if isinstance(data, list) else data.get("experiences", [])
        if exp_list:
            exp = exp_list[0]
            exp_id = exp.get('id')
            exp_title = exp.get('title', '')
            host_cities = exp.get('host', {}).get('cities', [])
            city = host_cities[0] if host_cities else 'Kathmandu'
            print(f"  Experience: {exp_title} (ID={exp_id}, city={city})")
            print(f"  Guides assigned: {len(exp.get('guides', []))}")

            # Try booking with all required fields
            booking_payload = {
                "experience_id": exp_id,
                "experience_title": exp_title,
                "city": city,
                "guests": 2,
                "price": exp.get('price', 50.0),
                "date": "2027-03-20",  # Unique date to avoid guide conflict
            }

            for url in [f"{BASE_URL}/api/v1/bookings/", f"{BASE_URL}/api/v1/bookings"]:
                resp = client.post(url,
                        json=booking_payload,
                        headers=traveler_headers, timeout=30.0)
                print(f"  Booking API ({url}): {resp.status_code}")
                print(f"  Response: {resp.text[:500]}")
                if resp.status_code in (200, 201):
                    booking = resp.json()
                    print(f"  ✅ Booking created: ID={booking.get('id')}, Status={booking.get('status')}")
                    booking_id = booking.get('id')
                    break
                else:
                    print(f"  INFO: Unexpected status code: {resp.status_code}")

    print_step("Phase C Summary")
    print("✅ Test traveler account created")
    print("✅ Experience discover tested")
    print("✅ Booking creation attempted")

    # STEP 5: View booking details
    print_step("STEP 5: View booking details")
    if 'booking_id' in locals():
        # Try both with and without trailing slash
        for url in [f"{BASE_URL}/api/v1/bookings/{booking_id}/", f"{BASE_URL}/api/v1/bookings/{booking_id}"]:
            resp = client.get(url, headers=traveler_headers, timeout=30.0, follow_redirects=True)
            print(f"  Booking detail API ({url}): {resp.status_code}")
            if resp.status_code == 200:
                detail = resp.json()
                print(f"  ✅ Booking details retrieved: ID={detail.get('id')}, Status={detail.get('status')}")
                print(f"  User ID: {detail.get('user_id')}, Guide User ID: {detail.get('guide_user_id')}")
                print(f"  Price: {detail.get('price')}, Guests: {detail.get('guests')}")
                break
            else:
                print(f"  INFO: {resp.status_code} - {resp.text[:200]}")

    # STEP 6: View traveler's booking list
    print_step("STEP 6: View traveler's booking list")
    if 'booking_id' in locals():
        resp = client.get(f"{BASE_URL}/api/v1/bookings/", headers=traveler_headers, timeout=30.0, follow_redirects=True)
        print(f"  Booking list API: {resp.status_code}")
        if resp.status_code == 200:
            bookings = resp.json()
            bookings_list = bookings if isinstance(bookings, list) else bookings.get('bookings', [])
            print(f"  ✅ Found {len(bookings_list)} booking(s) for traveler")
            for b in bookings_list:
                print(f"    - ID={b.get('id')}, Status={b.get('status')}, Experience={b.get('experience_title')}")
        else:
            print(f"  INFO: {resp.status_code} - {resp.text[:200]}")

    # STEP 7: Guide views assigned bookings
    print_step("STEP 7: Guide views assigned bookings")
    # Login as a guide
    resp = client.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": "qa.guide.1.034dcc@example.com",
        "password": "Guide@2024",
        "role": "guide",
    }, timeout=30.0)
    print(f"  Guide login: {resp.status_code}")
    if resp.status_code == 200:
        guide_token = resp.json()["access_token"]
        guide_headers = {"Authorization": f"Bearer {guide_token}"}
        # Guide bookings endpoint
        resp = client.get(f"{BASE_URL}/api/v1/guide/bookings", headers=guide_headers, timeout=30.0, follow_redirects=True)
        print(f"  Guide booking list API: {resp.status_code}")
        if resp.status_code == 200:
            bookings = resp.json()
            bookings_list = bookings if isinstance(bookings, list) else bookings.get('bookings', [])
            print(f"  ✅ Guide can view {len(bookings_list)} booking(s)")
            for b in bookings_list:
                print(f"    - ID={b.get('id')}, Status={b.get('status')}, Traveler={b.get('user_id')}")
        else:
            print(f"  INFO: {resp.status_code} - {resp.text[:200]}")
    else:
        print(f"  Guide login failed: {resp.text[:200]}")

    # STEP 8: Cross-user isolation test
    print_step("STEP 8: Cross-user isolation test (IDOR)")
    if 'booking_id' in locals():
        # Create another traveler and try to access the first traveler's booking
        other_traveler_email = f"qa.isolation.{uuid.uuid4().hex[:8]}@example.com"
        other_traveler = {
            "firstName": "Isolation",
            "lastName": "Test",
            "email": other_traveler_email,
            "password": "Traveler@2024",
            "phone": "+977-1-5550002",
            "role": "traveler",
        }
        resp = client.post(f"{BASE_URL}/api/v1/auth/register", json=other_traveler, timeout=30.0)
        if resp.status_code in (200, 201):
            resp = client.post(f"{BASE_URL}/api/v1/auth/login", json={
                "email": other_traveler_email,
                "password": "Traveler@2024",
                "role": "traveler",
            }, timeout=30.0)
            if resp.status_code == 200:
                other_token = resp.json()["access_token"]
                other_headers = {"Authorization": f"Bearer {other_token}"}
                # Try to access the first traveler's booking
                resp = client.get(f"{BASE_URL}/api/v1/bookings/{booking_id}", headers=other_headers, timeout=30.0)
                print(f"  Other traveler accessing booking: {resp.status_code}")
                if resp.status_code in (403, 404):
                    print(f"  ✅ Cross-user access properly denied (status {resp.status_code})")
                else:
                    print(f"  ⚠️  Unexpected status: {resp.status_code} - potential IDOR vulnerability!")
                    print(f"  Response: {resp.text[:300]}")
            else:
                print(f"  Other traveler login failed")
        else:
            print(f"  Other traveler registration failed: {resp.text[:200]}")

    # STEP 9: Cancel booking
    print_step("STEP 9: Test booking cancellation")
    if 'booking_id' in locals():
        # Try to cancel the booking with trailing slash
        for url in [f"{BASE_URL}/api/v1/bookings/{booking_id}/", f"{BASE_URL}/api/v1/bookings/{booking_id}"]:
            resp = client.patch(url,
                    json={"status": "cancelled"},
                    headers=traveler_headers, timeout=30.0, follow_redirects=True)
            print(f"  Booking cancellation API ({url}): {resp.status_code}")
            print(f"  Response: {resp.text[:300]}")
            if resp.status_code == 200:
                print(f"  ✅ Booking cancelled successfully")
                break
            else:
                print(f"  INFO: Cancellation returned {resp.status_code}")

if __name__ == "__main__":
    main()