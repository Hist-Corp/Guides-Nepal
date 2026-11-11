# Account Simulation Report — Guides Nepal

**QA Run ID:** qa-run-20261110-002  
**Generated:** 2026-11-10  
**Scope:** 25 test accounts created and validated via actual platform APIs

---

## Account Summary

| Account Type | Target | Created | Approved | Login Usable | Status |
|--------------|--------|---------|----------|--------------|--------|
| Travelers | 10 | 10 | N/A (direct registration) | Yes | Complete |
| Guides | 10 | 10 | 10 (via admin approval) | Yes | Complete |
| Hosts | 5 | 5 | 5 (via admin approval) | Yes | Complete |
| **Total** | **25** | **25** | **15** | **25** | **Complete** |

---

## Traveler Accounts (10/10)

Traveler accounts created via public signup API with real registration flow. Each traveler completed task-specific scenarios:

| # | Account | Tasks Completed | Status |
|---|---------|----------------|--------|
| T-01 | traveler-1 | Browse experiences, inspect details | Complete |
| T-02 | traveler-2 | Search by city | Complete |
| T-03 | traveler-3 | Search by experience category | Complete |
| T-04 | traveler-4 | Apply price and sorting filters | Complete |
| T-05 | traveler-5 | View guide profiles and portfolios | Complete |
| T-06 | traveler-6 | Bookmark and remove favorites | Complete |
| T-07 | traveler-7 | Complete successful booking | Complete |
| T-08 | traveler-8 | Cancel permitted booking | Complete |
| T-09 | traveler-9 | Test booking history, cart isolation | Complete |
| T-10 | traveler-10 | Submit support request, interact with Maila Dai | Complete |

---

## Guide Accounts (10/10)

Guide accounts created via guide application API with document uploads and admin approval workflow:

| # | Account | Application | Approval | Login | Status |
|---|---------|-------------|----------|-------|--------|
| G-01 | guide-1 | Submitted | Approved | Yes | Complete |
| G-02 | guide-2 | Submitted | Approved | Yes | Complete |
| G-03 | guide-3 | Submitted | Approved | Yes | Complete |
| G-04 | guide-4 | Submitted | Approved | Yes | Complete |
| G-05 | guide-5 | Submitted | Approved | Yes | Complete |
| G-06 | guide-6 | Submitted | Approved | Yes | Complete |
| G-07 | guide-7 | Submitted | Approved | Yes | Complete |
| G-08 | guide-8 | Submitted | Approved | Yes | Complete |
| G-09 | guide-9 | Submitted | Approved | Yes | Complete |
| G-10 | guide-10 | Submitted | Approved | Yes | Complete |

Guide document uploads: Citizenship front, citizenship back, selfie, holding citizenship, certificate.

---

## Host Accounts (5/5)

Host accounts created via host application wizard with document uploads and admin approval:

| # | Account | Application | Approval | Login | Status |
|---|---------|-------------|----------|-------|--------|
| H-01 | host-1 | Submitted | Approved | Yes | Complete |
| H-02 | host-2 | Submitted | Approved | Yes | Complete |
| H-03 | host-3 | Submitted | Approved | Yes | Complete |
| H-04 | host-4 | Submitted | Approved | Yes | Complete |
| H-05 | host-5 | Submitted | Approved | Yes | Complete |

---

## Approval Status

| Account Type | Submitted | Approved | Pending | Rejected |
|--------------|-----------|----------|---------|----------|
| Travelers | N/A | N/A | N/A | N/A |
| Guides | 10 | 10 | 0 | 0 |
| Hosts | 5 | 5 | 0 | 0 |

---

## Bookings Created

Total bookings created: 7 (across traveler accounts)

---

## Account Cleanup Status

| Action | Status |
|--------|--------|
| All test accounts removed from database | Complete |
| All test bookings removed | Complete |
| All test applications removed | Complete |
| Seed accounts preserved | Verified |

---

## Test Data Location

- Account manifest: qa/account-lifecycle/account_manifest.json
- Test images: qa/test-uploads/
- Account creation script: qa/account-lifecycle/create_accounts.py