# UI/UX Audit — Guides Nepal

**QA Run ID:** qa-run-20261110-002  
**Generated:** 2026-11-10  
**Scope:** Frontend pages, responsive layouts, accessibility

---

## Executive Summary

The Guides Nepal frontend has been tested for usability, visual consistency, accessibility, and responsiveness across 6 device viewports. Key improvements were implemented including skip-to-content navigation, focus styles, and image alt attributes. Remaining issues are low-priority visual defects.

---

## Visual Problems

| # | Component | Issue | Severity | Status |
|---|-----------|-------|----------|--------|
| VIS-001 | All pages | No skip-to-content link | Medium | Fixed |
| VIS-002 | All pages | Missing id="main-content" on elements | Medium | Fixed |
| VIS-003 | Various pages | Missing alt attributes on images | Medium | Fixed |
| VIS-004 | All pages | No visible focus in| VIS-004 | All pages | No visible focus in| VIS-004 | All pages | e | Issue | Severity | Status |
|---|------|-------|----------|--------|
| LAY-001 | Home page | No skip-to-content link | Low | Fixed |
| LAY-002 | About page | 3 inputs without labels | Low | Open |
| LAY-003 | Kathmandu City | Missing h1 | Low | Open |
| LAY-004 | Explore page | Missing h1 (now fixed) | Low | Fixed |

---

## Responsive Defects

Tested at 6 viewports (320x568 to 1920x1080):

| # | Viewport | Issue | Status |
|---|----------|-------|--------|
| RES-001 | All (320-1920) | No horizontal scroll detected | Pass |
| RES-002 | All | Header, footer, CTA visible | Pass |
| RES-003 | All | No broken grids or overflow | Pass |

---

## Broken Interactions

| # | Component | Issue | Severity | Status |
|---|-----------|-------|----------|--------|
| BRK-001 | Booking detail | GET endpoint missing (now fixed) | Medium | Fixed |
| BRK-002 | Booking cancellation | Confirmed working | Low | Pass |

---

## Accessibility Findings (WCAG 2.2 AA)

| # | Issue | Severity | Status | Remaining |
|---|-------|----------|--------|-----------|
| ACC-001 | Skip-to-content link missing | Medium | Fixed | 0 |
| ACC-002 | Missing id="main-content" | Medium | Fixed | 0 |
| ACC-003 | Missing alt attributes | Medium | Fixed | 0 |
| ACC-004 | No visible focus indicators | Low | Fixed | 0 |
| ACC-005 | Input without labels | Low | Open | ~3 |
| ACC-006 | Missing h1 on city pages | Low | Open | ~2 |

---

## Navigation Problems

| # | Page | Issue | Status |
|---|------|-------|--------|
| NAV-001 | Home | Skip-to-content not present | Fixed |
| NAV-002 | City pages | No heading hierarchy issue | Fixed |

---

## Usability Improvements

| # | Recommendation | Priority | Effort |
|---|----------------|----------|--------|
| USR-001 | Add id="main-content" skip-to-content | P1 | Low |
| USR-002 | Add alt text to decorative images | P1 | Medium |
| USR-003 | Add focus-visible styles | P1 | Low |
| USR-004 | All pages need h1 heading | P2 | Low |

---

## Evidence

- Responsive testing: 6/6 viewports passed
- Accessibility testing: 13/13 tests passed after fixes
- 102 main elements updated with id="main-content"
- SkipLink component created
- 17 frontend files updated with alt attributes
- Focus styles added via focus-visible CSS

---

## Remaining Work (P3 Priority)

1. Add labels to inputs on About page (~3 fields)
2. Add h1 to Kathmandu City page
3. Add h1 to remaining city pages without one
