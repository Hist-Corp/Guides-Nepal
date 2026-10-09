# SOP-GN-EXP-001: Proposing a New Experience

> **Standard Operating Procedure — Guides Nepal**
>
> | Field | Value |
> |---|---|
> | **SOP ID** | SOP-GN-EXP-001 |
> | **Version** | 1.0 |
> | **Process Owner** | Content & Operations (Guides Nepal) |
> | **Applies To** | All verified Guide accounts (`guide` role) |
> | **Approvers (Approval Gate)** | Regional Manager **or** Content Writer (Admin as backup) |
> | **Effective Date** | 2026-10-09 |
> | **Review Cycle** | Every 6 months |
> | **Related SOP** | [SOP-GN-EXP-002 — Modifying Existing Experiences](./SOP_EXPERIENCE_MODIFICATION.md) |

## 1. Purpose

To define a single, auditable workflow for a Guide to propose a **brand-new experience**
(a trekking route, travel tour, or specialized activity listing) on Guides Nepal, ensuring
that no new experience is published without a formal submission and a mandatory approval
gate.

## 2. Scope

- **In scope:** Creation of new experience listings submitted by Guide accounts.
- **Out of scope:**
  - Edits to already-published experiences → see SOP-GN-EXP-002.
  - Guide onboarding/verification (`/guide/onboarding`) → separate admin process.
  - CMS pages, blog posts, and SEO pages managed directly in the dashboard → Content Manager process.

## 3. Roles & Responsibilities

| Role (Business Title) | System Role | Console / Access | Responsibility in This SOP |
|---|---|---|---|
| **Guide** | `guide` | Public site guide console: `/guide/dashboard`, `/guide/listings`, `/guide/listings/new` (no dashboard access) | Prepares the proposal, completes documentation, submits, implements approval feedback, publishes after approval |
| **Regional Manager** ("Regional Head") | `regional-head` | `/dashboard/regional-head/*` | **Approver #1** — verifies regional fit, feasibility, safety, pricing, and capacity |
| **Content Writer** ("Content Manager", legacy `content-writer`) | `content-manager` | `/dashboard/content-manager/*` | **Approver #2** — verifies content quality, SEO readiness, media, and brand voice |
| **Admin** | `admin` | `/dashboard/admin/*` | Backup approver (implicitly authorized for every role guard via `has_access()`); handles escalations |
| **Operations Coordinator** | staff | Email / ops tracker | Logs submissions, tracks SLA, sends reminders, maintains the Experience Register |

> **Authorization rule (mandatory):** a new experience may go live only after **exactly one of
> the two designated approvers — Regional Manager or Content Writer — has given written
> approval**. If both are consulted, whichever valid approval arrives first gates the release;
> the other is informational. An Admin approval substitutes for either.

## 4. Definitions

- **Experience:** A bookable listing stored as a `GuideListing` (`guide_listings` table):
  title, category (`trekking | tour | specialized`), city, area, description, itinerary,
  meeting point, duration, difficulty, price, `max_guests`, `is_active`.
- **Draft:** A listing saved with `is_active = false`. Drafts are never visible to travelers.
- **Formal submission:** The moment the completed Experience Proposal Form + attachments are
  emailed to the operations inbox (this starts the approval clock).
- **Approval gate:** The mandatory checkpoint in Step 6; the process cannot proceed past it
  without written authorization.

## 5. Required Documentation

| # | Document | Format | Purpose | Mandatory |
|---|---|---|---|---|
| D1 | **Experience Proposal Form (EXP-F-001)** — cover email body or attached template | Email / PDF | Identifies guide, experience title, category, city/area, duration, difficulty, price, max capacity, meeting point, summary itinerary | ✅ |
| D2 | Full itinerary & run-sheet (hour-by-hour plan, stops, inclusions/exclusions) | PDF / DOCX | Operational feasibility review | ✅ |
| D3 | Risk assessment & safety brief (terrain, altitude, transport, first-aid, emergency contacts) | PDF | Regional Manager safety review | ✅ |
| D4 | Pricing sheet (per-person price, discounts, child policy, foreign-national pricing if any) | XLSX / PDF | Pricing & margin review | ✅ |
| D5 | Photo/media pack — minimum 5 original images, each with source/licence note | JPG/PNG | Content Writer media review (no unlicensed third-party images) | ✅ |
| D6 | Guide credentials for this activity (permits, certifications, insurance) | PDF | Compliance check | ✅ (where applicable) |
| D7 | Draft listing saved in the guide console at `/guide/listings/new` with `is_active = false` | System record | Pre-publication draft of record | ✅ |
| D8 | Written approval email from the Regional Manager **or** Content Writer | Email | Proof of authorization for the approval gate | ✅ (produced in Step 6) |

**Submission completeness checklist:** D1–D7 must all be present. Incomplete packages are
returned at Step 5 and do **not** start the approval clock.

## 6. Communication Channels

| Channel | Used For | Authoritative? |
|---|---|---|
| **Guide Console** (public site — `/guide/listings/new`) | Creating and saving the draft listing | ✅ System of record for listing content |
| **Email — operations inbox** (`experiences@guides-nepal.com`*) | Formal submission of D1–D6; approval decisions ("APPROVED" / "CHANGES REQUESTED" / "REJECTED" reply-all) | ✅ System of record for approvals |
| **Team channel** (`#experiences-ops` Slack/WhatsApp*) | Day-to-day questions, SLA reminders, status pings | ❌ Informational only — never valid for approval |
| **Experience Register** (shared ops tracker*) | Logging submission ID, dates, approver, decision | ✅ System of record for SLA tracking |
| **Video/phone call** | Clarifying feedback after "CHANGES REQUESTED" | ❌ Follow-up must always be confirmed by email |

\* Organizational conventions — confirm the exact inbox address and channel name with your
Operations Coordinator on day one. The platform does not yet host a built-in approval module,
so **email is the audit trail until one is delivered**.

## 7. Procedure (Step-by-Step)

| Step | Owner | Action | Channel / System | Output |
|---|---|---|---|---|
| **1. Prepare** | Guide | Verify the idea is genuinely new (search existing listings at `/guide/listings` and the public site). Collect documents D1–D6. | Guide console, email attachments | Complete document pack |
| **2. Create draft** | Guide | Go to `/guide/listings/new` and complete all five form steps (type → place → details & capacity → review → rules). **Save with `is_active = false` (draft).** Never publish at this stage. | Guide console | Draft listing (D7) |
| **3. Self-check** | Guide | Run the pre-submission checklist: itinerary matches the form, price ≥ cost, `max_guests` realistic (1–100), images licensed, safety brief present, no duplicate of an existing experience. | Checklist (§5) | Ready-to-submit pack |
| **4. Formal submission** ⭐ | Guide | Email the operations inbox with subject `NEW EXPERIENCE PROPOSAL — <listing title> — <guide name>`, body = EXP-F-001 (D1), attachments D2–D6, and the draft listing ID from Step 2. **CC the Regional Manager and the Content Writer.** | Email | Submission logged with **Day 0 timestamp** |
| **5. Acknowledgment** | Ops Coordinator / Approver | Acknowledge receipt in writing within **1 business day**; log the submission in the Experience Register; flag any missing documents within the same window. | Email, Experience Register | Submission ID assigned |
| **6. APPROVAL GATE** ⭐ | **Regional Manager OR Content Writer** | Review against the criteria below and reply-all with one of: `APPROVED`, `CHANGES REQUESTED (+ list)`, or `REJECTED (+ reasons)`. **No experience may proceed without this written decision.** | Email | Decision recorded (D8) |
| **7a. Publish (approved)** | Guide | Within **2 business days** of approval, set `is_active = true` on the draft and verify the live page. | Guide console | Experience live |
| **7b. Revise (changes requested)** | Guide | Address every comment and **re-submit per Step 4 within 3 business days**; the approval clock restarts. | Email | Resubmission |
| **7c. Close (rejected)** | Guide / Ops | Rejection is communicated with written reasons. A revised proposal may be refiled after **30 days**, or appealed to the Admin within **5 business days**. | Email | Closed record |
| **8. Register & announce** | Ops Coordinator / Content Writer | Record the approval in the Experience Register (approver name, date, listing ID). Content Writer schedules any supporting CMS/city-page mention and SEO entry. | Experience Register, `/dashboard/content-manager/*` | Listing registered |
| **9. Post-publication check** | Ops Coordinator | Confirm the experience appears correctly (images, price, capacity, booking path) within **5 business days** of publication. | Public site | QA sign-off |

### Approval review criteria (Step 6)

- **Regional Manager:** regional fit for their region · route/logistics feasibility · safety &
  risk documentation · pricing sanity · `max_guests` capacity · guide credentials.
- **Content Writer:** title/description quality & brand voice · SEO readiness (title, slug,
  structured content) · media quality and licensing · consistency with existing city and
  experience pages.

## 8. Mandatory Approval Gate — Summary

```
Guide submits (Step 4)
        │
        ▼
┌─────────────────────────────────────┐
│  APPROVAL GATE — written decision   │
│  Authorized: Regional Manager       │
│          OR Content Writer          │
│  (Admin may substitute)             │
└─────────────────────────────────────┘
   │              │                │
APPROVED    CHANGES REQUESTED    REJECTED
   │              │                │
   ▼              ▼                ▼
Publish      Resubmit ≤3 bd     Appeal ≤5 bd
(Step 7a)    (clock resets)     or refile ≤30 d
```

- **No verbal, chat, or implied approvals are valid.** Only a reply-all email counts.
- If **neither** approver has responded: send a reminder at **Day 3**, escalate to the Admin at **Day 6**.

## 9. Expected Timeline (Approval Process)

| Phase | SLA | Clock starts |
|---|---|---|
| Guide preparation (Steps 1–3) | Guide's discretion (recommend ≤ 5 business days) | — |
| Acknowledgment of submission | **1 business day** | Day 0 = submission email |
| Completeness check / triage | **1 business day** | Day 0 |
| **Approval decision (Gate)** | **5 business days** (target: 3 for complete packs) | Day 0 |
| Reminder if silent | Day 3 | Day 0 |
| Escalation to Admin | Day 6 | Day 0 |
| Publication after approval | **2 business days** | Approval email |
| Resubmission after "changes requested" | **3 business days** | Feedback email |
| Appeal after rejection | **5 business days** | Rejection email |
| Re-file after rejection (fresh proposal) | After **30 calendar days** | Rejection email |
| Post-publication QA check | **5 business days** | Publication |

*Business day = Sunday–Thursday, excluding public holidays (confirm the local calendar with
Operations). A submission lapses after 60 days and must be refiled.*

## 10. Escalation Path

1. **Day 3** — no acknowledgment → Guide pings approvers in `#experiences-ops` and sends a polite email reminder.
2. **Day 6** — no decision → Operations Coordinator escalates to the **Admin** with the full submission thread.
3. **Disputed rejection** — Guide appeals to the Admin within 5 business days; the Admin's decision is final.
4. **Safety-critical objection** raised at any time → experience stays unpublished until resolved, regardless of prior approval.

## 11. Records & Retention

- Approval emails and the Experience Register entry are retained for **24 months** minimum.
- Draft listings withdrawn before approval are archived with `is_active = false` and retained for 12 months.
- Every published listing keeps its originating submission ID in the Experience Register for traceability.

## 12. References (Repository)

- Workflow API (SOP implementation) — `backend/app/api/v1/experience_workflow.py`
- Workflow data model — `backend/app/models/experience_workflow.py`
- Workflow business logic — `backend/app/services/experience_workflow_service.py`
- Workflow schemas — `backend/app/schemas/experience_workflow.py`
- Migration — `backend/migrations/versions/c8e1f2a3b4c5_create_experience_workflow_tables.py`
- Approval-gate tests — `backend/tests/test_experience_workflow.py`
- Guide console routes — `frontend/src/App.tsx` (`/guide/listings`, `/guide/listings/new`)
- Listing form (draft/publish toggle) — `frontend/src/pages/guide/GuideListingFormPage.tsx`
- Listing data model — `backend/app/models/guide_listing.py` (`GuideListing`, `is_active`)
- Guide API — `frontend/src/services/guideDashboardApi.ts`, `backend/app/api/v1/guide.py`
- Role hierarchy & approval authority — `backend/app/core/roles.py` (`has_access`, `REGIONAL_OR_ABOVE`, `CMS_OR_ABOVE`)
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

