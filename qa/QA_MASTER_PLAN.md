# Guides Nepal — QA Master Plan

**QA Run ID:** qa-run-20261110-001  
**Author:** Autonomous QA Engineering Team  
**Date:** 2026-11-10  
**Repository:** /Volumes/programming/Guides-Nepal

## 1. Objective
Establish whether every important component of the Guides Nepal platform works correctly from the perspective of actual users (travelers, guides, hosts, admins, regional heads, content managers, customer support). Prove each feature works through actual browser interactions, API requests, database verification, permission checks, and complete user workflows.

## 2. Architecture Summary

### Backend (FastAPI + SQLAlchemy)
- **Port:** 8000
- **Database:** PostgreSQL (local dev), SQLite fallback
- **Auth:** JWT (access 30min, refresh 7 days), bcrypt password hashing
- **Roles:** admin, content-manager, regional-head, customer-support, host, guide, traveler
- **Self-registerable:** traveler, host only
- **Guide/host accounts:** Created only after application approval by regional-head/admin
- **API Routers:** auth, bookings, reviews, host, host_guides, guide, experience_workflow, public, ai, profile, content, admin, operations

### Frontend (React + Vite + TypeScript)
- **Port:** 5175
- **Routes:** Home, Search, City pages, Experience pages, Guide profiles, Host pages (BecomeHost, HostDashboard), Guide pages (Registration, Dashboard, Listings), Auth (Login, Signup), Static pages

### Dashboard (React + Vite + TypeScript)
- **Port:** 5176
- **Consoles:** Admin, Content Manager, Regional Head, Customer Support, Host
- **Guards:** RequireAuth (frontend), require_role (backend)

## 3. Test Phases

| Phase | Name | Description | Status |
|-------|------|-------------|--------|
| A | Discovery | Repository audit, architecture analysis, route/model inventory | COMPLETE |
| B | QA Framework | Playwright, pytest, fixtures, page objects, helpers | PENDING |
| C | Functional Audit | Public frontend, dashboard, APIs, database, integrations | PENDING |
| D | Account Simulation | 25 accounts (10 travelers, 10 guides, 5 hosts) with full workflows | PENDING |
| E | Security Audit | Auth, authorization, IDOR, XSS, injection, file uploads, sessions | PENDING |
| F | UI/UX & Performance | Responsive, visual, accessibility, performance, reliability | PENDING |
| G | Remediation | Fix defects, add regression tests, retest | PENDING |
| H | Cleanup | Remove only current-run test accounts and data | PENDING |
| I | Final Reporting | All QA reports, release recommendation | PENDING |

## 4. Test Account Plan

| Role | Count | Creation Method | Approval Required |
|------|-------|-----------------|-------------------|
| Traveler | 10 | Public signup modal | No |
| Guide | 10 | Public guide application + Regional Head approval | Yes |
| Host | 5 | Public host application + Regional Head approval | Yes |
| **Total** | **25** | | |

**Protected accounts (never touch):** Seed accounts from README, admin accounts, regional head accounts, existing catalog guides.

## 5. QA Directory Structure

```
qa/
├── STATE.md
├── QA_MASTER_PLAN.md
├── TEST_COVERAGE_MATRIX.md
├── DEFECT_REGISTER.md
├── SECURITY_FINDINGS.md
├── IMPROVEMENT_ROADMAP.md
├── config/           # environments, browsers, roles, test-limits
├── e2e/              # Playwright E2E tests by feature/role
├── api/              # pytest API tests by feature/role
├── security/         # Security audit tests
├── performance/      # k6 and Playwright performance tests
├── accessibility/    # WCAG 2.2 AA checks
├── visual/           # Visual regression baselines
├── fixtures/         # Test data fixtures
├── factories/        # Deterministic fixture factories
├── page-objects/     # Playwright page objects
├── helpers/          # Test utilities
├── database/         # DB inspection scripts
├── account-lifecycle/# Account creation/approval scripts
├── cleanup/          # Test data cleanup scripts
├── reports/          # Generated QA reports
├── screenshots/      # Failure screenshots
├── videos/           # Failure videos
└── test-data/        # Upload fixtures, images, PDFs
```

## 6. Test Execution Commands

```bash
# Smoke tests (fast)
npm run qa:smoke

# Full E2E suite
npm run qa:e2e

# API tests
npm run qa:api

# Security audit
npm run qa:security

# Accessibility
npm run qa:accessibility

# Performance
npm run qa:performance

# Full QA suite
npm run qa:full

# Generate reports
npm run qa:report

# Cleanup test data (requires QA run ID)
npm run qa:cleanup
```

## 7. Evidence Standards
Every test result must include:
- Unique test ID
- Module and feature
- User role
- Preconditions
- Test data
- Execution steps
- Expected result
- Actual result
- Pass/fail status (PASS/FAIL/BLOCKED/NOT TESTED/NOT APPLICABLE)
- Evidence (screenshot, API response, DB query)
- Defect reference when applicable

## 8. Safety Rules
- Never delete existing seed/production data
- Never expose credentials or secrets in reports
- Never perform destructive operations against production
- Only delete accounts created by current QA run (identified by QA run ID)
- Use separate browser contexts for independent users
- Never bypass authorization to make a test pass
- Never fabricate test results