# SOP-GN-EXP-002: Modifying an Existing Experience

> **Standard Operating Procedure — Guides Nepal**
>
> | Field | Value |
> |---|---|
> | **SOP ID** | SOP-GN-EXP-002 |
> | **Version** | 1.0 |
> | **Process Owner** | Content & Operations (Guides Nepal) |
> | **Applies To** | All verified Guide accounts (`guide` role) |
> | **Approver (Approval Gate)** | Regional Manager (Admin as backup) |
> | **Effective Date** | 2026-10-09 |
> | **Review Cycle** | Every 6 months |
> | **Related SOP** | [SOP-GN-EXP-001 — Proposing New Experiences](./SOP_EXPERIENCE_PROPOSAL.md) |

## 1. Purpose

To define a single, auditable workflow for a Guide to propose **additions or updates to an
already established (published or draft) experience** on Guides Nepal, ensuring that no
material change reaches travelers without a formal submission and a mandatory approval gate
authorized by the **Regional Manager**.

## 2. Scope

- **In scope:** Any change to an existing `GuideListing` record, including but not limited to:
  price changes · itinerary or route changes · meeting point changes · duration or difficulty
  changes · `max_guests` capacity changes · title/description rewrites · image swaps or
  additions · seasonal pausing/reactivating (`is_active` toggling) · category or area changes.
- **Out of scope:**
  - Creating brand-new experiences → see SOP-GN-EXP-001.
  - Emergency safety deactivations → handled under §7 "Emergency Provision" of this SOP (activate/deactivate immediately, then file paperwork within 24 hours).
  - Platform-level CMS pages, blog, and SEO pages → Content Manager process.

## 3. Roles & Responsibilities

| Role (Business Title) | System Role | Console / Access | Responsibility in This SOP |
|---|---|---|---|
| **Guide** | `guide` | Public site guide console: `/guide/listings`, `/guide/listings/:id/edit` (no dashboard access) | Identifies the change, files the Change Request, applies the change **only after approval**, verifies the result |
| **Regional Manager** ("Regional Head") | `regional-head` | `/dashboard/regional-head/*` | **Sole required approver** — verifies operational, safety, and pricing impact of the change on the region |
| **Content Writer** ("Content Manager", legacy `content-writer`) | `content-manager` | `/dashboard/content-manager/*` | **Consulted (informed)** when the change affects content/SEO (title, slug, description, images); updates dependent CMS pages. Cannot authorize on their own under this SOP |
| **Admin** | `admin` | `/dashboard/admin/*` | Backup approver (implicitly authorized via `has_access()`); handles escalations and disputed rejections |
| **Operations Coordinator** | staff | Email / ops tracker | Logs requests, tracks SLA, sends reminders, maintains the Experience Register |

> **Authorization rule (mandatory):** no modification may be applied to a live experience
> without **written approval from the Regional Manager**. An Admin approval substitutes for
> the Regional Manager. Content Writer sign-off alone is **never** sufficient under this SOP.

## 4. Definitions

- **Existing experience:** A `GuideListing` row (`guide_listings` table) that already exists,
  whether currently published (`is_active = true`) or paused (`is_active = false`).
- **Change class — Material:** affects what a traveler books or pays for — price, itinerary,
  route, meeting point, duration, difficulty, `max_guests`, inclusions, safety information,
  title, category, city/area. Requires full review.
- **Change class — Minor:** editorial only — typos, image swaps of equal subject matter,
  adding photos, minor description polishing with no factual change. Fast-track review.
- **Change Request:** The formal submission (EXP-F-002) that starts the approval clock.
- **Approval gate:** The mandatory checkpoint in Step 4; the change cannot be applied without
  the Regional Manager's written authorization.

## 5. Required Documentation

| # | Document | Format | Purpose | Mandatory |
|---|---|---|---|---|
| C1 | **Change Request Form (EXP-F-002)** — cover email body or attached template | Email / PDF | Lists: listing ID & title, fields to change, **current value → proposed value** for each field, change class (material/minor), reason, requested effective date | ✅ |
| C2 | Supporting evidence for the change (new price breakdown, revised safety brief, new route notes, new image licences, etc.) | PDF / XLSX / JPG | Enables the Regional Manager to verify impact | ✅ (where applicable) |
| C3 | Impact note — effect on existing bookings (travelers already booked at the old price/itinerary), capacity, and SEO | Email body | Protects existing bookings; informs rollback needs | ✅ for material changes |
| C4 | Screenshot or listing ID from `/guide/listings/:id/edit` showing the draft edit | PNG / listing ID | Ties the request to the exact record | ✅ |
| C5 | Written approval email from the **Regional Manager** | Email | Proof of authorization for the approval gate | ✅ (produced in Step 4) |

**Fast-track eligibility (Minor class):** C1 + C3 (one line) + C4 are enough; C2 only if media
is involved. Incomplete requests are returned at Step 3 and do **not** start the approval clock.

## 6. Communication Channels

| Channel | Used For | Authoritative? |
|---|---|---|
| **Guide Console** (`/guide/listings/:id/edit`) | Preparing the edit; applying it **only after approval** | ✅ System of record for listing content |
| **Email — operations inbox** (`experiences@guides-nepal.com`*) | Formal Change Request submission; approval decision ("APPROVED" / "CHANGES REQUESTED" / "REJECTED" reply-all); Content Writer notification | ✅ System of record for approvals |
| **Team channel** (`#experiences-ops` Slack/WhatsApp*) | Questions, reminders, fast-track pings for urgent minor changes | ❌ Informational only — never valid for approval |
| **Experience Register** (shared ops tracker*) | Logging change request ID, dates, approver, decision, applied date | ✅ System of record for SLA tracking |
| **Video/phone call** | Discussing contentious changes (e.g., price increases) | ❌ Must be confirmed by email afterwards |

\* Organizational conventions — confirm the exact inbox address and channel name with your
Operations Coordinator. Email is the audit trail until a built-in approval module exists.

## 7. Procedure (Step-by-Step)

| Step | Owner | Action | Channel / System | Output |
|---|---|---|---|---|
| **1. Identify** | Guide | Open `/guide/listings`, select the listing, press **Edit** (`/guide/listings/:id/edit`). List every field you intend to change. Classify the change as **Material** or **Minor** (§4). Check for existing bookings that would be affected (`/guide/dashboard`, `/guide/bookings`). | Guide console | Change inventory + class |
| **2. Prepare documents** | Guide | Complete Change Request Form **EXP-F-002 (C1)** with `current value → proposed value` per field, the reason, and the requested effective date. Attach supporting evidence (C2) and the impact note (C3) for material changes. | Email attachments | Document pack C1–C4 |
| **3. Formal submission** ⭐ | Guide | Email the operations inbox with subject `EXPERIENCE CHANGE REQUEST — <listing ID> — <listing title>`, body = EXP-F-002, attachments C2–C4. **CC the Regional Manager (mandatory approver). CC the Content Writer whenever content/SEO fields are affected (title, slug, description, images).** Do **not** apply the edit to the live listing yet. | Email | Submission logged with **Day 0 timestamp** |
| **4. APPROVAL GATE** ⭐ | **Regional Manager** | Review operational, safety, pricing, and booking impact; reply-all with one of: `APPROVED (+ effective date)`, `CHANGES REQUESTED (+ list)`, or `REJECTED (+ reasons)`. **The guide must not apply the change before this decision.** | Email | Decision recorded (C5) |
| **5. Notify (if approved & content affected)** | Ops Coordinator | Forward the approval to the Content Writer when CMS/SEO pages reference the experience, so dependent pages can be updated in parallel. | Email, `/dashboard/content-manager/*` | Content team informed |
| **6a. Apply (approved)** | Guide | Within **1 business day** of approval, apply the approved edits at `/guide/listings/:id/edit`. Apply **only the approved changes** — anything extra requires a new Change Request. Confirm the live listing reflects them. | Guide console | Change live |
| **6b. Revise (changes requested)** | Guide | Address every comment and **re-submit per Step 3 within 3 business days**; the approval clock restarts. | Email | Resubmission |
| **6c. Close (rejected)** | Guide / Ops | Listing remains untouched. Written reasons are recorded. Appeal to the Admin within **5 business days**, or file a fresh request addressing the objections. | Email | Closed record |
| **7. Verify & register** | Ops Coordinator (+ Regional Manager for material changes) | Verify the applied change matches the approval; log applied date, approver, and fields changed in the Experience Register. Content Writer updates dependent CMS/SEO pages. | Experience Register, dashboard | Audit record complete |

### Emergency Provision (safety-critical only)

If an existing experience presents an **immediate safety risk** (route closed, permit
revoked, structural hazard), the Guide may set `is_active = false` **immediately** without
prior approval, then must email the operations inbox and the Regional Manager **within
24 hours** with a retroactive Change Request (EXP-F-002, flagged `URGENT-SAFETY`).
Reactivation always requires a fresh Regional Manager approval — emergency powers cover
deactivation only.

### Approval review criteria (Step 4) — Regional Manager

- Safety and feasibility of the new itinerary/route/timing · effect on already-booked travelers (grandfathering vs. notification) · pricing fairness and regional consistency · capacity (`max_guests` vs. `booked_guests` — the platform blocks lowering capacity below booked guests) · compliance with permits and house rules.


## 8. Mandatory Approval Gate — Summary

```
Guide prepares Change Request (Step 3)
        │
        ▼
┌────────────────────────────────────────┐
│  APPROVAL GATE — written decision      │
│  Authorized: Regional Manager ONLY     │
│  (Admin may substitute;                │
│   Content Writer alone is NOT valid)   │
└────────────────────────────────────────┘
   │              │                │
APPROVED    CHANGES REQUESTED    REJECTED
   │              │                │
   ▼              ▼                ▼
Apply ≤1 bd   Resubmit ≤3 bd    Appeal ≤5 bd
(Step 6a)     (clock resets)     to Admin
```

- **No verbal, chat, or implied approvals are valid.** Only a reply-all email counts.
- **Applying a change before approval is a policy violation** and may result in the change being rolled back and the guide's listing privileges reviewed by the Admin.
- If the Regional Manager has not responded: reminder at **Day 2**, escalate to the Admin at **Day 4**.

## 9. Expected Timeline (Approval Process)

| Phase | SLA | Clock starts |
|---|---|---|
| Guide preparation (Steps 1–2) | Guide's discretion (recommend ≤ 2 business days) | — |
| Acknowledgment of Change Request | **1 business day** | Day 0 = submission email |
| **Approval decision (Gate) — Material change** | **3 business days** | Day 0 |
| **Approval decision (Gate) — Minor change (fast-track)** | **1 business day** | Day 0 |
| **Approval decision — Urgent-Safety** | **24 hours** | Submission (or incident) |
| Reminder if silent | Day 2 | Day 0 |
| Escalation to Admin | Day 4 | Day 0 |
| Applying an approved change | **1 business day** | Approval email |
| Resubmission after "changes requested" | **3 business days** | Feedback email |
| Appeal after rejection | **5 business days** | Rejection email |
| Retroactive paperwork after emergency deactivation | **24 hours** | Deactivation |
| Content/SEO page updates (Content Writer) | **3 business days** after approval | Approval email |

*Business day = Sunday–Thursday, excluding public holidays (confirm the local calendar with
Operations). A Change Request lapses after 30 days and must be refiled.*

## 10. Escalation Path

1. **Day 2** — no acknowledgment → Guide pings the Regional Manager in `#experiences-ops` and sends an email reminder (CC Content Writer if content is affected).
2. **Day 4** — no decision → Operations Coordinator escalates to the **Admin** with the full Change Request thread.
3. **Disputed rejection** — Guide appeals to the Admin within 5 business days; the Admin's decision is final.
4. **Safety issue at any moment** — apply the Emergency Provision (§7) first, report within 24 hours.
5. **Already-booked travelers affected** — Customer Support is looped in before the change goes live so booked guests are notified per the impact note (C3).

## 11. Records & Retention

- Change Request emails, approval replies, and Experience Register entries are retained for **24 months**.
- Every register entry records: submission ID, listing ID, fields changed, old → new values, approver, decision date, applied date.
- Superseded values are preserved in the register (never overwritten) so any listing can be audited or rolled back.

## 12. References (Repository)

- Workflow API (SOP implementation) — `backend/app/api/v1/experience_workflow.py`
- Workflow data model — `backend/app/models/experience_workflow.py`
- Workflow business logic — `backend/app/services/experience_workflow_service.py`
- Workflow schemas — `backend/app/schemas/experience_workflow.py`
- Migration — `backend/migrations/versions/c8e1f2a3b4c5_create_experience_workflow_tables.py`
- Approval-gate tests — `backend/tests/test_experience_workflow.py`
- Listing edit route — `frontend/src/App.tsx` (`/guide/listings/:id/edit`)
- Listing edit form — `frontend/src/pages/guide/GuideListingFormPage.tsx`
- Listing data model — `backend/app/models/guide_listing.py` (`GuideListing`: `price`, `max_guests`, `booked_guests`, `is_active`)
- Guide update API — `frontend/src/services/guideDashboardApi.ts` (`updateListing`), `backend/app/api/v1/guide.py`
- Capacity guard (cannot set `max_guests` < `booked_guests`) — backend guide dashboard service
- Role hierarchy & approval authority — `backend/app/core/roles.py` (`has_access`, `REGIONAL_OR_ABOVE`)
- Dashboard consoles — `dashboard/docs/ROUTING.md` (`/dashboard/regional-head/*`, `/dashboard/content-manager/*`)

## 13. Revision History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-10-09 | Initial release |

---
*Assumptions: email aliases, channel names, and the Experience Register are operational
conventions to be confirmed with Operations; the platform currently has no built-in approval
module, so approvals are captured by email until one is delivered.*

**Last Updated**: 2026 · **Version**: 1.0.0

