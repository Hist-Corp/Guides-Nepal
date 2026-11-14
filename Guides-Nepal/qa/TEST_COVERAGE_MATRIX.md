# Guides Nepal — Test Coverage Matrix

**QA Run ID:** qa-run-20261110-001  
**Last Updated:** 2026-11-10

## Legend
| Status | Meaning |
|--------|---------|
| PASS | Verified successfully through actual testing |
| FAIL | Actual defect reproduced |
| BLOCKED | Cannot execute — dependency or missing configuration |
| NOT TESTED | Not yet executed |
| NOT APPLICABLE | Not relevant to this feature |

## 1. Public Frontend Routes

| # | Route | Page | Role | Auth | Status | Test ID |
|---|-------|------|------|------|--------|---------|
| 1 | / | HomePage | All | No | NOT TESTED | PUB-001 |
| 2 | /search | SearchPage | All | No | NOT TESTED | PUB-002 |
| 3 | /explore | ExplorePage | All | No | NOT TESTED | PUB-003 |
| 4 | /city/kathmandu | KathmanduPage | All | No | NOT TESTED | PUB-004 |
| 5 | /city/pokhara | PokharaPage | All | No | NOT TESTED | PUB-005 |
| 6 | /city/lalitpur | LalitpurPage | All | No | NOT TESTED | PUB-006 |
| 7 | /city/bhaktapur | BhaktapurPage | All | No | NOT TESTED | PUB-007 |
| 8 | /city/bharatpur | BharatpurPage | All | No | NOT TESTED | PUB-008 |
| 9 | /city/:cityId | CityPage | All | No | NOT TESTED | PUB-009 |
| 10 | /city/:city/experiences | CityExperiencesPage | All | No | NOT TESTED | PUB-010 |
| 11 | /city/:city/experience/:slug | CityExperienceRoute | All | No | NOT TESTED | PUB-011 |
| 12 | /guidesprofile/:slug | LocalProfilePage | All | No | NOT TESTED | PUB-012 |
| 13 | /guidesprofile/:slug/gallery | GalleryPage | All | No | NOT TESTED | PUB-013 |
| 14 | /guidesprofile/:slug/contact | ContactGuidePage | All | No | NOT TESTED | PUB-014 |
| 15 | /host | BecomeHostPage | All | No | NOT TESTED | PUB-015 |
| 16 | /host/... | HostApplicationWizard | All | No | NOT TESTED | PUB-016 |
| 17 | /guide/register | GuideRegistrationWizard | All | No | NOT TESTED | PUB-017 |
| 18 | /guide/dashboard | GuideDashboardPage | Guide | Yes | NOT TESTED | PUB-018 |
| 19 | /guide/listings | GuideListingsPage | Guide | Yes | NOT TESTED | PUB-019 |
| 20 | /host/dashboard | HostDashboardPage | Host | Yes | NOT TESTED | PUB-020 |
| 21 | /host/experiences | HostExperiencesPage | Host | Yes | NOT TESTED | PUB-021 |
| 22 | /host/bookings | HostBookingsPage | Host | Yes | NOT TESTED | PUB-022 |
| 23 | /host/earnings | HostEarningsPage | Host | Yes | NOT TESTED | PUB-023 |
| 24 | /host/settings | HostSettingsPage | Host | Yes | NOT TESTED | PUB-024 |
| 25 | /about | AboutPage | All | No | NOT TESTED | PUB-025 |
| 26 | /contact | ContactPage | All | No | NOT TESTED | PUB-026 |
| 27 | /faq | FaqPage | All | No | NOT TESTED | PUB-027 |
| 28 | /terms | TermsPage | All | No | NOT TESTED | PUB-028 |
| 29 | /privacy | PrivacyPage | All | No | NOT TESTED | PUB-029 |
| 30 | /sustainability | SustainabilityPage | All | No | NOT TESTED | PUB-030 |
| 31 | /blog | BlogPage | All | No | NOT TESTED | PUB-031 |
| 32 | /destinations | DestinationsPage | All | No | NOT TESTED | PUB-032 |
| 33 | /how-it-works | HowItWorksPage | All | No | NOT TESTED | PUB-033 |
| 34 | /press | PressPage | All | No | NOT TESTED | PUB-034 |
| 35 | /jobs | JobsPage | All | No | NOT TESTED | PUB-035 |
| 36 | /host-center | HostCenterPage | All | No | NOT TESTED | PUB-036 |
| 37 | /* | NotFoundPage | All | No | NOT TESTED | PUB-037 |

## 2. Dashboard Routes

| # | Route | Console | Role | Auth | Status | Test ID |
|---|-------|---------|------|------|--------|---------|
| D1 | /dashboard/login | LoginPage | All | No | NOT TESTED | DB-001 |
| D2 | /dashboard/admin/* | Admin | admin | Yes | NOT TESTED | DB-002 |
| D3 | /dashboard/content-manager/* | Content Manager | content-manager | Yes | NOT TESTED | DB-003 |
| D4 | /dashboard/regional-head/* | Regional Head | regional-head | Yes | NOT TESTED | DB-004 |
| D5 | /dashboard/customer-support/* | Customer Support | customer-support | Yes | NOT TESTED | DB-005 |
| D6 | /dashboard/host/* | Host | host | Yes | NOT TESTED | DB-006 |
| D7 | /dashboard/guide/* | Guide Console | guide | Yes | NOT TESTED | DB-007 |

### Authentication

| # | Method | Path | Role | Status | Test ID |
|---|--------|------|------|--------|---------|
| API-1 | POST | /api/v1/auth/register | traveler, host | NOT TESTED | AUTH-001 |
| API-2 | POST | /api/v1/auth/login | All | NOT TESTED | AUTH-002 |
| API-3 | POST | /api/v1/auth/refresh | All | NOT TESTED | AUTH-003 |
| API-4 | POST | /api/v1/auth/forgot-password | All | NOT TESTED | AUTH-004 |
| API-5 | POST | /api/v1/auth/sync-password | All | NOT TESTED | AUTH-005 |
| API-6 | POST | /api/v1/auth/change-password | All | NOT TESTED | AUTH-006 |
| API-7 | GET | /api/v1/auth/oauth/google/start | All | NOT TESTED | AUTH-007 |
| API-8 | GET | /api/v1/auth/oauth/google/callback | All | NOT TESTED | AUTH-008 |
| API-9 | GET | /api/v1/auth/oauth/facebook/start | All | NOT TESTED | AUTH-009 |

### Bookings

| # | Method | Path | Role | Status | Test ID |
|---|--------|------|------|--------|---------|
| API-11 | GET | /api/v1/bookings/availability | All | NOT TESTED | BKG-001 |
| API-12 | GET | /api/v1/bookings/availability/month | All | NOT TESTED | BKG-002 |
| API-13 | GET | /api/v1/bookings/ | traveler | NOT TESTED | BKG-003 |
| API-14 | POST | /api/v1/bookings/ | traveler | NOT TESTED | BKG-004 |
| API-15 | POST | /api/v1/bookings/{id}/cancel | traveler | NOT TESTED | BKG-005 |
| API-16 | POST | /api/v1/bookings/{id}/archive | traveler | NOT TESTED | BKG-006 |

### Guide

| # | Method | Path | Role | Status | Test ID |
|---|--------|------|------|--------|---------|
| API-17 | GET | /api/v1/guide/me | guide | NOT TESTED | GDE-001 |
| API-18 | GET | /api/v1/guide/bookings | guide | NOT TESTED | GDE-002 |

### Host

| # | Method | Path | Role | Status | Test ID |
|---|--------|------|------|--------|---------|
| API-24 | GET | /api/v1/host/experiences | host | NOT TESTED | HST-001 |
| API-25 | POST | /api/v1/host/experiences | host | NOT TESTED | HST-002 |
| API-26 | PATCH | /api/v1/host/experiences/{id} | host | NOT TESTED | HST-003 |
| API-27 | DELETE | /api/v1/host/experiences/{id} | host | NOT TESTED | HST-004 |
| API-28 | POST | /api/v1/host/bookings | host | NOT TESTED | HST-005 |
| API-29 | PATCH | /api/v1/host/bookings/{id}/decide | host | NOT TESTED | HST-006 |
| API-30 | GET | /api/v1/host/earnings | host | NOT TESTED | HST-007 |
| API-31 | GET | /api/v1/host/earnings/summary | host | NOT TESTED | HST-008 |

### Admin

| # | Method | Path | Role | Status | Test ID |
|---|--------|------|------|--------|---------|
| API-32 | GET | /api/v1/admin/users | admin | NOT TESTED | ADM-001 |
| API-33 | PATCH | /api/v1/admin/users/{id} | admin | NOT TESTED | ADM-002 |
| API-34 | POST | /api/v1/admin/users/{id}/suspend | admin | NOT TESTED | ADM-003 |

### Operations

| # | Method | Path | Role | Status | Test ID |
|---|--------|------|------|--------|---------|
| API-43 | GET | /api/v1/operations/guide-applications | admin, regional-head | NOT TESTED | OPS-001 |
| API-44 | PATCH | /api/v1/operations/guide-applications/{id} | admin, regional-head | NOT TESTED | OPS-002 |
| API-45 | GET | /api/v1/operations/host-applications | admin, regional-head | NOT TESTED | OPS-003 |
| API-46 | PATCH | /api/v1/operations/host-applications/{id} | admin, regional-head | NOT TESTED | OPS-004 |
| API-47 | GET | /api/v1/operations/support-tickets | admin, customer-support | NOT TESTED | OPS-005 |
| API-48 | POST | /api/v1/operations/support-tickets | All | NOT TESTED | OPS-006 |

### Profile

| # | Method | Path | Role | Status | Test ID |
|---|--------|------|------|--------|---------|
| API-49 | GET | /api/v1/profile/me | All | NOT TESTED | PRF-001 |
| API-50 | PATCH | /api/v1/profile/me | All | NOT TESTED | PRF-002 |
| API-51 | POST | /api/v1/profile/photos/upload | All | NOT TESTED | PRF-003 |
| API-52 | GET | /api/v1/profile/bookmarks | All | NOT TESTED | PRF-004 |
| API-53 | POST | /api/v1/profile/bookmarks | All | NOT TESTED | PRF-005 |
| API-54 | DELETE | /api/v1/profile/bookmarks/{id} | All | NOT TESTED | PRF-006 |

### Reviews

| # | Method | Path | Role | Status | Test ID |
|---|--------|------|------|--------|---------|
| API-55 | GET | /api/v1/reviews/ | All | NOT TESTED | REV-001 |
| API-56 | GET | /api/v1/reviews/me | traveler | NOT TESTED | REV-002 |
| API-57 | GET | /api/v1/reviews/can-review | traveler | NOT TESTED | REV-003 |
| API-58 | POST | /api/v1/reviews/ | traveler | NOT TESTED | REV-004 |
| API-59 | PUT | /api/v1/reviews/{id} | traveler | NOT TESTED | REV-005 |
| API-60 | DELETE | /api/v1/reviews/{id} | traveler | NOT TESTED | REV-006 |

### AI

| # | Method | Path | Role | Status | Test ID |
|---|--------|------|------|--------|---------|
| API-61 | POST | /api/v1/ai/chat | All | NOT TESTED | AI-001 |

### Content


## 4. Database Tables

| # | Table | Model | Status | Test ID |
|---|-------|-------|--------|---------|
| DB-1 | users | User | NOT TESTED | DB-001 |
| DB-2 | bookings | Booking | NOT TESTED | DB-002 |
| DB-3 | host_bookings | HostBooking | NOT TESTED | DB-003 |
| DB-4 | host_experiences | HostExperience | NOT TESTED | DB-004 |
| DB-5 | host_tours | HostTour | NOT TESTED | DB-005 |
| DB-6 | guides | Guide | NOT TESTED | DB-006 |
| DB-7 | guide_applications | GuideApplication | NOT TESTED | DB-007 |
| DB-8 | guide_listings | GuideListing | NOT TESTED | DB-008 |
| DB-9 | guide_profiles | GuideProfile | NOT TESTED | DB-009 |
| DB-10 | guide_experience_requests | GuideExperienceRequest | NOT TESTED | DB-010 |
| DB-11 | host_applications | HostApplication | NOT TESTED | DB-011 |
| DB-12 | host_guides | HostGuide | NOT TESTED | DB-012 |
| DB-13 | host_experience_guides | HostExperienceGuide | NOT TESTED | DB-013 |

## 5. Role-Based Access Control Matrix

| # | Feature | traveler | guide | host | admin | regional-head | content-manager | customer-support | Status | Test ID |
|---|---------|----------|-------|------|-------|---------------|-----------------|------------------|--------|---------|
| RBAC-1 | Public site browsing | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | NOT TESTED | RBAC-001 |
| RBAC-2 | Traveler signup | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | NOT TESTED | RBAC-002 |
| RBAC-3 | Host application | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | NOT TESTED | RBAC-003 |
| RBAC-4 | Guide application | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | NOT TESTED | RBAC-004 |
| RBAC-5 | Create booking | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | NOT TESTED | RBAC-005 |
| RBAC-6 | View own bookings | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | NOT TESTED | RBAC-006 |
| RBAC-7 | Guide dashboard | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | NOT TESTED | RBAC-007 |
| RBAC-8 | Host dashboard | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | NOT TESTED | RBAC-008 |
| RBAC-9 | Admin console | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | NOT TESTED | RBAC-009 |
| RBAC-10 | Regional head console | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | NOT TESTED | RBAC-010 |
| RBAC-11 | Approve guide application | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | NOT TESTED | RBAC-011 |

## 6. Critical User Workflows

| # | Workflow | Steps | Status | Test ID |
|---|----------|-------|--------|---------|
| WF-1 | Traveler signup → login → browse → book → cancel | 8 | NOT TESTED | WF-001 |
| WF-2 | Guide application → approval → login → onboarding → create listing | 9 | NOT TESTED | WF-002 |
| WF-3 | Host application → approval → login → create experience → manage bookings → earnings | 10 | NOT TESTED | WF-003 |
| WF-4 | Guide booking request → accept → complete → review | 7 | NOT TESTED | WF-004 |
| WF-5 | Admin user management → suspend/activate | 5 | NOT TESTED | WF-005 |
| WF-6 | Regional head review guide application → approve/reject | 5 | NOT TESTED | WF-006 |
| WF-7 | Support ticket creation → dashboard view → resolve | 6 | NOT TESTED | WF-007 |

## 7. Security Test Coverage

| # | Test Area | Status | Test ID |
|---|-----------|--------|---------|
| SEC-1 | Weak password rejection | NOT TESTED | SEC-001 |
| SEC-2 | Invalid credentials | NOT TESTED | SEC-002 |
| SEC-3 | Account enumeration | NOT TESTED | SEC-003 |
| SEC-4 | IDOR - booking access | NOT TESTED | SEC-004 |
| SEC-5 | IDOR - guide listing access | NOT TESTED | SEC-005 |
| SEC-6 | IDOR - host experience access | NOT TESTED | SEC-006 |
| SEC-7 | IDOR - support ticket access | NOT TESTED | SEC-007 |
| SEC-8 | XSS in forms | NOT TESTED | SEC-008 |
| SEC-9 | SQL injection | NOT TESTED | SEC-009 |
| SEC-10 | File upload - executable | NOT TESTED | SEC-010 |
| SEC-11 | File upload - oversized | NOT TESTED | SEC-011 |
| SEC-12 | File upload - double extension | NOT TESTED | SEC-012 |
| SEC-13 | Session expiration | NOT TESTED | SEC-013 |
| SEC-14 | CORS configuration | NOT TESTED | SEC-014 |
| SEC-15 | Security headers | NOT TESTED | SEC-015 |
| SEC-16 | Unprivileged role escalation | NOT TESTED | SEC-016 |
| SEC-17 | Unapproved guide login | NOT TESTED | SEC-017 |
| SEC-18 | Inactive host login | NOT TESTED | SEC-018 |

## 8. Responsive Viewport Coverage

| # | Viewport | Device | Status | Test ID |
|---|----------|--------|--------|---------|
| RV-1 | 320 × 568 | Small mobile | NOT TESTED | RSP-001 |
| RV-2 | 375 × 812 | Standard mobile | NOT TESTED | RSP-002 |
| RV-3 | 430 × 932 | Large mobile | NOT TESTED | RSP-003 |
| RV-4 | 768 × 1024 | Tablet | NOT TESTED | RSP-004 |
| RV-5 | 1366 × 768 | Laptop | NOT TESTED | RSP-005 |
| RV-6 | 1440 × 900 | Desktop | NOT TESTED | RSP-006 |
| RV-7 | 1920 × 1080 | Large desktop | NOT TESTED | RSP-007 |

## 9. Accessibility Coverage (WCAG 2.2 AA)

| # | Check | Status | Test ID |
|---|-------|--------|---------|
| A11Y-1 | Semantic HTML | NOT TESTED | ACC-001 |
| A11Y-2 | Form labels | NOT TESTED | ACC-002 |
| A11Y-3 | Keyboard navigation | NOT TESTED | ACC-003 |
| A11Y-4 | Focus visibility | NOT TESTED | ACC-004 |
| A11Y-5 | Color contrast | NOT TESTED | ACC-005 |
| A11Y-6 | Image alt text | NOT TESTED | ACC-006 |
| A11Y-7 | Heading hierarchy | NOT TESTED | ACC-007 |
| A11Y-8 | Focus trapping in modals | NOT TESTED | ACC-008 |

---

**Total Test Cases Tracked:** 170+ across all categories  
**Current Status:** 0% executed — all tests are NOT TESTED  
**Next Action:** Begin Phase B — QA Framework setup
| WF-8 | Experience proposal → submit → Regional Head decision | 6 | NOT TESTED | WF-008 |
| WF-9 | Profile upload → update → delete | 4 | NOT TESTED | WF-009 |
| WF-10 | Search → filter → sort → view details | 5 | NOT TESTED | WF-010 |
| RBAC-12 | Approve host application | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | NOT TESTED | RBAC-012 |
| RBAC-13 | View support tickets | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | NOT TESTED | RBAC-013 |
| RBAC-14 | Content management | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | NOT TESTED | RBAC-014 |
| DB-14 | support_tickets | SupportTicket | NOT TESTED | DB-014 |
| DB-15 | bookmarks | Bookmark | NOT TESTED | DB-015 |
| DB-16 | reviews | Review | NOT TESTED | DB-016 |
| # | Method | Path | Role | Status | Test ID |
|---|--------|------|------|--------|---------|
| API-62 | GET | /api/v1/content/pages | content-manager, admin | NOT TESTED | CNT-001 |
| API-63 | POST | /api/v1/content/pages | content-manager, admin | NOT TESTED | CNT-002 |
| API-64 | PUT | /api/v1/content/pages/{id} | content-manager, admin | NOT TESTED | CNT-003 |
| API-65 | DELETE | /api/v1/content/pages/{id} | content-manager, admin | NOT TESTED | CNT-004 |

### Experience Workflow

| # | Method | Path | Role | Status | Test ID |
|---|--------|------|------|--------|---------|
| API-66 | GET | /api/v1/experience-workflow/proposals | guide | NOT TESTED | EXP-001 |
| API-67 | POST | /api/v1/experience-workflow/proposals | guide | NOT TESTED | EXP-002 |
| API-68 | POST | /api/v1/experience-workflow/proposals/{id}/submit | guide | NOT TESTED | EXP-003 |
| API-69 | POST | /api/v1/experience-workflow/proposals/{id}/decision | regional-head, content-manager | NOT TESTED | EXP-004 |
| API-70 | GET | /api/v1/experience-workflow/change-requests | guide | NOT TESTED | EXP-005 |
| API-71 | POST | /api/v1/experience-workflow/change-requests | guide | NOT TESTED | EXP-006 |
| API-72 | POST | /api/v1/experience-workflow/change-requests/{id}/decision | regional-head | NOT TESTED | EXP-007 |

### Host Guides

| # | Method | Path | Role | Status | Test ID |
|---|--------|------|------|--------|---------|
| API-73 | GET | /api/v1/host/guides | host | NOT TESTED | HGD-001 |
| API-74 | POST | /api/v1/host/guides | host | NOT TESTED | HGD-002 |
| API-75 | GET | /api/v1/host/experiences/{id}/guides | host | NOT TESTED | HGD-003 |
| API-76 | POST | /api/v1/host/experiences/{id}/guides | host | NOT TESTED | HGD-004 |
| API-35 | POST | /api/v1/admin/users/{id}/activate | admin | NOT TESTED | ADM-004 |
| API-36 | GET | /api/v1/admin/stats | admin | NOT TESTED | ADM-005 |

### Public

| # | Method | Path | Role | Status | Test ID |
|---|--------|------|------|--------|---------|
| API-37 | POST | /api/v1/inquiries | All | NOT TESTED | PUB-001 |
| API-38 | POST | /api/v1/host-applications | All | NOT TESTED | PUB-002 |
| API-39 | POST | /api/v1/guide-applications | All | NOT TESTED | PUB-003 |
| API-40 | GET | /api/v1/experiences | All | NOT TESTED | PUB-004 |
| API-41 | GET | /api/v1/guides | All | NOT TESTED | PUB-005 |
| API-42 | GET | /api/v1/guides/{id}/profile | All | NOT TESTED | PUB-006 |
| API-19 | POST | /api/v1/guide/listings | guide | NOT TESTED | GDE-003 |
| API-20 | GET | /api/v1/guide/listings | guide | NOT TESTED | GDE-004 |
| API-21 | PATCH | /api/v1/guide/listings/{id}/capacity | guide | NOT TESTED | GDE-005 |
| API-22 | POST | /api/v1/guide/experience-requests | guide | NOT TESTED | GDE-006 |
| API-23 | GET | /api/v1/guide/experience-requests | guide | NOT TESTED | GDE-007 |
| API-10 | GET | /api/v1/auth/oauth/facebook/callback | All | NOT TESTED | AUTH-010 |