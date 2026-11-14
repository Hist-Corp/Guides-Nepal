# Guides Nepal — QA Automation Framework

**QA Run ID:** qa-run-20261110-001  
**Repository:** /Volumes/programming/Guides-Nepal

## Overview

This is the comprehensive QA automation framework for the Guides Nepal platform.
It covers E2E browser testing (Playwright), API testing (pytest), security
auditing, accessibility, performance, and account lifecycle simulation.

## Directory Structure

```
qa/
├── STATE.md                  # Current QA state (updated after each phase)
├── QA_MASTER_PLAN.md         # Master test plan
├── TEST_COVERAGE_MATRIX.md   # Test coverage matrix (170+ cases)
├── README.md                 # This file
├── DEFECT_REGISTER.md        # Defect tracking (created during Phase C)
├── SECURITY_FINDINGS.md      # Security findings (created during Phase E)
├── IMPROVEMENT_ROADMAP.md    # Improvement recommendations
├── playwright.config.ts      # Playwright E2E configuration
├── conftest.py               # Pytest configuration & fixtures
├── config/                   # Environment, browser, role configs
├── e2e/                      # Playwright E2E specs (by feature/role)
├── api/                      # Pytest API tests (by feature/role)
├── security/                 # Security audit tests
├── performance/              # Performance & load tests
├── accessibility/            # WCAG 2.2 AA checks
├── visual/                   # Visual regression baselines
├── fixtures/                 # Test data fixtures
├── factories/                # Deterministic fixture factories
├── page-objects/             # Playwright page objects
├── helpers/                  # Test utilities
├── database/                 # DB inspection scripts
├── account-lifecycle/        # Account creation/approval scripts
├── cleanup/                  # Test data cleanup scripts
├── reports/                  # Generated QA reports
├── screenshots/              # Failure screenshots
├── videos/                   # Failure videos
└── test-data/                # Upload fixtures, images, PDFs
```

## Prerequisites

### Backend
- Running on `http://127.0.0.1:8000` (started via `npm run dev:backend`)
- Python virtualenv at `backend/.venv`

### Frontend
- Running on `http://localhost:5175` (started via `npm run dev:frontend`)

### Dashboard
- Running on `http://localhost:5176` (started via `npm run dev:dashboard`)

All three servers are already running in this environment.

## Quick Start

```bash
# Run smoke tests (E2E auth + navigation)
npx playwright test --config qa/playwright.config.ts

# Run API tests
cd qa && backend/.venv/bin/python -m pytest api/ -v

# Run specific E2E project
npx playwright test --config qa/playwright.config.ts --project frontend-chromium

# Run all QA tests
npm run qa:full  (see package.json scripts below)
```

## Package.json QA Scripts

Add these to the root `package.json` `scripts` section:

```json
"qa:smoke": "npx playwright test --config qa/playwright.config.ts --project frontend-chromium",
"qa:e2e": "npx playwright test --config qa/playwright.config.ts",
"qa:api": "cd qa && backend/.venv/bin/python -m pytest api/ -v",
"qa:security": "cd qa && backend/.venv/bin/python -m pytest security/ -v",
"qa:accessibility": "npx playwright test --config qa/playwright.config.ts --project frontend-chromium",
"qa:performance": "echo 'Use k6 for load testing'",
"qa:full": "npx playwright test --config qa/playwright.config.ts && cd qa && backend/.venv/bin/python -m pytest api/ security/ -v",
"qa:report": "open qa/reports/playwright-report/index.html",
"qa:cleanup": "node qa/cleanup/cleanup.js"
```

## Test Standards

Every test must include:
- Unique test ID (e.g., AUTH-001, BKG-004)
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

## Safety Rules

- Never delete existing seed/production data
- Never expose credentials or secrets in reports
- Never perform destructive operations against production
- Only delete accounts created by current QA run (identified by QA run ID)
- Use separate browser contexts for independent users
- Never bypass authorization to make a test pass
- Never fabricate test results

## Running Tests

The dev servers (backend:8000, frontend:5175, dashboard:5176) must be running.
They were started earlier with `npm run dev` and are running in the background.

Output is logged to `run-dev.log`.