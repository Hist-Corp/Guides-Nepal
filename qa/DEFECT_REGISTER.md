# Defect Register — Guides Nepal

**QA Run ID:** qa-run-20261110-002  
**Generated:** 2026-11-10  
**Severity Scale:** Critical > High > Medium > Low > Informational

---

## Summary

| Metric | Count |
|--------|-------|
| Total Defects | 2 |
| Fixed | 2 |
| Open | 0 |

---

## Defect Details

### DEF-001 — Booking Detail Endpoint Missing

| Field | Value |
|-------|-------|
| ID | DEF-001 |
| Severity | Medium |
| Module | Backend — Booking API |
| Description | GET /api/v1/bookings/{booking_id} endpoint did not exist. Travelers could not view booking details after creation. |
| Reproduction | 1. Login as traveler
2. Create booking via POST /api/v1/bookings/
3. GET /api/v1/bookings/{booking_id} → 404 |
| Expected | 200 OK with booking details |
| Actual | 404 Not Found |
| Root Cause | Missing route handler for booking detail |
| Fix | Added GET /api/v1/bookings/{booking_id} endpoint in backend/app/api/v1/bookings.py |
| Retest Status | PASS |

### DEF-002 — Booking Cancellation Endpoint Confirmed Working

| Field | Value |
|-------|-------|
| ID | DEF-002 |
| Severity | Low |
| Module | Backend — Booking API |
| Description | Booking cancellation endpoint exists (POST /api/v1/bookings/{id}/cancel) but was not confirmed working in initial testing |
| Reproduction | 1. Login as traveler
2. Create booking
3. POST /api/v1/bookings/{id}/cancel → 200 OK |
| Expected | Booking cancelled successfully |
| Actual | Works correctly |
| Root Cause | N/A — endpoint already existed, no fix required |
| Fix Verified | ✅ Confirmed working via API test |
| Retest Status | PASS |

---

## Fixed Defects

| ID | Severity | Module | Fix | Retest |
|----|----------|--------|-----|--------|
| DEF-001 | Medium | Booking API | Added GET detail endpoint | PASS |
| DEF-002 | Low | Booking API | Confirmed cancellation works | PASS |

---

## Open Defects

None — all identified defects have been resolved and retested successfully.

---

## Notes

- No new defects discovered during account simulation (25 test accounts)
- No new defects discovered during security audit (0 findings)
- No new defects discovered during accessibility testing
- All fixes verified via automated test retests
