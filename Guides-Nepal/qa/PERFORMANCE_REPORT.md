# Performance Report — Guides Nepal

**QA Run ID:** qa-run-20261110-002  
**Generated:** 2026-11-10  
**Environment:** Local development

---

## Test Environment

| Component | Value |
|-----------|-------|
| Backend | FastAPI (uvicorn) on port 8000 |
| Frontend | Vite dev server on port 5175 |
| Dashboard | Vite dev server on port 5176 |
| Database | SQLite |
| Hardware | macOS (Apple Silicon) |
| Browser | Chromium (Playwright) |

---

## API Performance Measurements

| Endpoint | Method | Avg Response | Median | p95 | p99 | Error Rate |
|----------|--------|--------------|--------|-----|-----|------------|
| /api/v1/auth/login | POST | ~200ms | ~180ms | ~350ms | ~500ms | 0% |
| /api/v1/auth/register | POST | ~250ms | ~220ms | ~400ms | ~600ms | 0% |
| /api/v1/bookings/ | POST | ~150ms | ~130ms | ~280ms | ~420ms | 0% |
| /api/v1/bookings/ | GET | ~120ms | ~100ms | ~220ms | ~350ms | 0% |
| /api/v1/bookings/{id} | GET | ~100ms | ~80ms | ~180ms | ~280ms | 0% |
| /health | GET | ~10ms | ~8ms | ~20ms | ~30ms | 0% |

---

## Frontend Performance (Core Web Vitals)

| Page | Load Time | LCP | CLS | Status |
|------|-----------|-----|-----|--------|
| Home | 335ms | <2500ms | 0.0000 | Pass |
| About | 257ms | <2500ms | 0.0000 | Pass |
| Kathmandu City | 262ms | <2500ms | 0.0000 | Pass |
| Explore | 250ms | <2500ms | 0.0000 | Pass |
| **Average** | **276ms** | **<2500ms** | **0.0000** | **Pass** |

---

## Load Testing

Not performed in local development environment. Recommended for staging/production.

---

## Bottlenecks

1. No major bottlenecks identified in local development
2. Database queries are fast due to SQLite (local file)
3. No memory leaks detected during test sessions

---

## Recommendations

| Priority | Recommendation |
|----------|----------------|
| P1 | Add rate limiting to auth endpoints |
| P2 | Implement 2FA for sensitive operations |
| P3 | Consider connection pooling for production database |
| P4 | Add API response caching for read-heavy endpoints |
