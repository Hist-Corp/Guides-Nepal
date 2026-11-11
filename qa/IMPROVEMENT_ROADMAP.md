# Improvement Roadmap — Guides Nepal

**QA Run ID:** qa-run-20261110-002  
**Generated:** 2026-11-10

---

## Overview

| Priority | Count |
|----------|-------|
| P0: Critical | 0 |
| P1: High | 1 |
| P2: Medium | 1 |
| P3: Low | 2 |
| P4: Optional | 2 |

---

## P0: Critical Security

| ID | Why It Matters | Current Problem | Proposed Improvement | Affected Components | Estimated Complexity | Dependencies |
|-----|----------------|-----------------|---------------------|--------------------|---------------------|------|
| None | | | | | | |

---

## P1: High Priority

| ID | Why It Matters | Current Problem | Proposed Improvement | Affected Components | Estimated Complexity | Dependencies |
|-----|----------------|-----------------|---------------------|--------------------|---------------------|------|
| IMPR-001 | Login endpoint brute-force protection | Login API a| IMPR-001 | Login endpoint brute-force protection | Login API a| I15 min) | backend/app/api/v1/auth.py | Medium (~2 days) | None |

---

## P2: Medium Priority

| ID | Why It Matters | Current Problem | Proposed Improvement | Affected Components | Estimated Complexity | Dependencies |
|-----|----------------|-----------------|---------------------|--------------------|---------------------|------|
| IMPR-002 | Two-factor authentication | No 2FA for host/admin accounts | Implement 2FA using TOTP | backend/app/api/v1/auth.py, frontend/src/pages/ | High (~1 week) | None |

---

## P3: Low Priority

| ID | Why It Matters | Current Problem | Proposed Improvement | Affected Components | Estimated Complexity | Dependencies |
|-----|----------------|-----------------|---------------------|--------------------|---------------------|------|
| IMPR-003 | Session timeout | 30 minutes is long for sensitive operations | Reduce to 15 minutes | backend/app/api/v1/auth.py | Low (~1 day) | None |
| IMPR-004 | CORS policy | Wide CORS config | Restrict to production domains | backend/main.py | Low (~1 day) | None |

---

## P4: Optional Enhancements

| ID | Why It Matters | Current Problem | Proposed Improvement | Affected Components | Estimated Complexity | Dependencies |
|-----|----------------|-----------------|---------------------|--------------------|---------------------|------|
| IMPR-005 | API documentation | OpenAPI/Swagger generated | Add interactive API docs (Swagger UI) | backend/main.py | Low (~1 day) | None |
| IMPR-006 | Automated visual testing | Screenshots not consistent | Use Playwright screenshot snapshots | tests/e2e/ | Medium (~2 days) | None |

---

## Summary

| Priority | Count | Effort |
|----------|-------|--------|
| P0: Critical | 0 | - |
| P1: High | 1 | 2 days |
| P2: Medium | 1 | 1 week |
| P3: Low | 2 | 2 days |
| P4: Optional | 2 | 2 days |

**Total estimated effort:** ~2 weeks

---

## Recommendation

Implement P0-P2 items before production release. P3 and P4 can be addressed after launch as they are quality-of-life improvements.
