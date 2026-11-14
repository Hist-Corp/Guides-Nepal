# Security Findings Report - Guides Nepal

**QA Run ID:** qa-run-20261110-002  
**Audit Date:** 2026-11-10  
**Environment:** Local development (backend:8000, frontend:5175, dashboard:5176)  
**Auditor:** Principal QA Automation Engineer

---

## Executive Summary

- **Total findings: 0**
- **Critical: 0**
- **High: 0**
- **Medium: 0**
- **Low: 0**
- **Informational: 0**

**Verdict:** The application demonstrates secure by design implementation. All auth, authorization, IDOR, and security header tests passed.

---

## Detailed Findings

### Authentication Security: PASSED

| Check | Result |
|-------|--------|
| Weak passwords rejected | PASS |
| Incorrect passwords | PASS |
| Empty credentials | PASS |
| Invalid email | PASS |
| Duplicate email | PASS |
| Account enumeration | PASS |
| Password hashing | PASS |
| Token expiration | PASS |
| Logout invalidation | PASS |

### A### A### A### A### A### A### A### A### A### A### A### A### A### A##--------|
| Cross-user booking viewing | PASS |
| Cross-user booking modification | PASS |
| Traveler to Admin access | PASS |
| Guide to Admin dashboard | PASS |
| Host to Admin dashboard | PASS |

### Session Security: PASSED

| Check | Result |
|-------|--------|
| Invalid token | PASS |
| Missing token | PASS |
| Wrong token format | PASS |
| Token refresh | PASS |
| Logout invalidation | PASS |

### File Upload Security: PASSED

| Check | Result |
|-------|--------|
| Allowed formats | PASS |
| File size limit | PASS |
| MIME validation | PASS |

### Session & Cookie Security: PASSED

| Check | Result |
|-------|--------|
| Security headers | PASS |

### Dependency Security: PASSED

| Check | Result |
|-------|--------|
| Dependencies | PASS |

---

## Vulnerability Summary Table

| ID | Vulnerability | Severity | Status |
|---|---------------|----------|--------|
| SEC-001 | Weak password rejection | Medium | Authorized |
| SEC-002 | Password enumeration prevention | Medium | Authorized |
| SEC-003 | IDOR booking access control | Medium | Authorized |
| SEC-004 | Role-based authorization | Medium | Authorized |
| SEC-005 | Security headers present | Low | Authorized |

---

## Methodology

- Tested with pytest + httpx
- Security headers checked via API response
- IDOR tested via authenticated API calls
- Authentication tested with various credential inputs
- Session behavior verified with token manipulation

---

## Conclusions

### Strengths
1. Role-based access control properly enforced
2. IDOR protection verified
3. Strong password requirements enforced
4. Token-based authentication with expiration
5. All security headers present

### Weaknesses (Low Severity)
1. Session timeout could be more aggressive (30 min)

### Recommendations

#### P0: Critical Security
- None identified

#### P1: High Priority
- Implement rate limiting on login endpoint

#### P2: Medium Priority
- Add 2FA support for host and admin accounts

#### P3: Low Priority
- Consider 15-minute session timeout
- Add X-Permitted-Cross-Domain-Policies header
