# Standard Operating Procedure (SOP): Guide Onboarding Workflow

**Document Version:** 1.0  
**Effective Date:** 2026-11-07  
**Owner:** Operations / Regional Heads  
**Applies To:** All Guide Applications via Guides Nepal Platform  

---

## 1. Purpose & Scope

This SOP defines the end-to-end workflow for onboarding new Guides onto the Guides Nepal platform, from initial sign-up through application review, approval/rejection, and formal handover to the assigned Regional Head. It documents the **existing implemented process** without altering any workflow logic or system behavior.

The process applies to all individuals applying for the **Guide** role via the public frontend at `/guide/register` (multi-step `GuideRegistrationWizard`).

---

## 2. Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| **Applicant (Guide Candidate)** | Completes 5-step registration wizard; uploads documents; sets password; submits application |
| **System (Backend API)** | Validates input; stores application with `status=pending`; hashes password; enforces regional scoping |
| **Regional Head** | Reviews applications for their assigned province only; approves/rejects; records review note; mints login account on approval |
| **Admin** | Full access to all applications across all regions; can override regional scoping; audits decisions |
| **Platform (Automated)** | Sends confirmation reference ID on submission; activates login credentials only on approval |

**Regional Assignment:** Each Regional Head is assigned exactly one of Nepal's 7 provinces:
- Koshi Province
- Madhesh Province
- Bagmati Province
- Gandaki Province
- Lumbini Province
- Karnali Province
- Sudurpashchim Province

Regional Heads **only see and act on** applications where `application.region == regional_head.region`.

---

## 3. Workflow Overview

```mermaid
flowchart TD
    A[Applicant Opens /guide/register] --> B[Step 0: Basics - Name, Email, Password, Region, Phone]
    B --> C[Step 1: Profile - Display Name, Bio, Languages, Province, Group Size, Photo]
    C --> D[Step 2: Experience - Years, Expertise, Cities, License #, Summary]
    D --> E[Step 3: Documents - NIN, Citizenship Front/Back, Live Selfie, Holding Citizenship, Certificate, Supplementary]
    E --> F[Step 4: Preview & Declarations - Terms, Privacy, Accuracy]
    F --> G[Submit: POST /api/v1/guide-applications]
    G --> H{Validation Pass?}
    H -- No --> I[Return Field Errors to Wizard]
    H -- Yes --> J[Create GuideApplication row: status=pending, credential_password_hash=bcrypt(password)]
    J --> K[Return application_id; Show Reference GU-XXXXXX]
    K --> L[Regional Head (matching region) sees application in Dashboard]
    L --> M[Regional Head Reviews: Documents, NIN, Selfie, Credentials]
    M --> N{Decision}
    N -- Approve --> O[_provision_guide_user(): Create User row role=guide, is_active=true, region=app.region]
    O --> P[Update application: status=approved, reviewed_by, reviewed_at, user_id]
    P --> Q[Applicant can now login at /login (Guide tab)]
    N -- Reject --> R[Update application: status=rejected, reviewed_by, reviewed_at, review_note]
    R --> S[Applicant notified; login remains inactive]
    N -- Pending --> T[Application stays in queue for further review]
```

---

## 4. Detailed Procedure

### 4.1 Phase 1: Applicant Registration (Frontend)

**Entry Point:** `http://localhost:5175/guide/register` → `GuideRegistrationWizard`

#### Step 0 — Basics (Required Fields)
| Field | Validation | Notes |
|-------|------------|-------|
| First Name | Required, non-empty | |
| Last Name | Required, non-empty | |
| Email | Required, valid format (`^\S+@\S+\.\S+$`) | Lowercased on submit |
| Phone | Optional, E.164 format recommended (`+977 98XXXXXXXX`) | |
| Region | **Required** — Select from 7 provinces (dropdown) | **Determines Regional Head assignment** |
| Password | Required, 8+ chars, 1 uppercase, 1 number, 1 special char | bcrypt-hashed server-side; stored on application row |
| Confirm Password | Must match Password | |

**Auto-save:** Draft persisted to `localStorage` key `gn-guide-registration-draft` after each field change.

#### Step 1 — Profile (Required Fields)
| Field | Validation | Notes |
|-------|------------|-------|
| Display Name | Required, non-empty | Public-facing name |
| Bio | Required, ≥30 chars | "What makes your guiding special?" |
| Languages | Required, non-empty | e.g., "Nepali, English" |
| Province | Required, select from 7 provinces | May differ from Step 0 region |
| Preferred Group Size | Optional, dropdown: 1-4, 5-8, 9+, Flexible | |
| Profile Photo | Optional, image ≤5 MB, JPG/PNG | Stored as data URL in draft |

#### Step 2 — Experience (Required Fields)
| Field | Validation | Notes |
|-------|------------|-------|
| Years of Experience | Required, numeric | |
| Areas of Expertise | Required, non-empty | e.g., "Trekking, Cultural tours, Food tours" |
| Cities / Areas Covered | Required, non-empty | Comma-separated; first city used as `application.city` |
| Guide License Number | Optional | e.g., "GUIDE-2024-0123" |
| Experience Summary | Required, ≥30 chars | Professional background narrative |

#### Step 3 — Documents (All Required)
| Document | Type | Max Size | Notes |
|----------|------|----------|-------|
| National ID Number (NIN) | Text input | — | Required field |
| Citizenship (Front) | PDF/JPG/PNG/WebP | 10 MB | Phase 1: Identity |
| Citizenship (Back) | PDF/JPG/PNG/WebP | 10 MB | Phase 1: Identity |
| Live Selfie (3-angle: left, front, right) | Captured via WebRTC | — | Phase 2: Biometric; `SelfieAuthentication` component |
| Photo Holding Citizenship | Image | 10 MB | Phase 2: Biometric |
| Guide Certificate | PDF/JPG/PNG/WebP | 10 MB | Phase 3: Professional |
| Supplementary Documents | PDF/DOC/XLS/CSV | 10 MB | Phase 3: Professional |

**File Validation:** Client-side checks for MIME type and size before upload. Files appended to `FormData` on submit.

#### Step 4 — Preview & Declarations (Required)
- **Review Summary:** All entered data displayed in read-only grid
- **Declarations (3 checkboxes, all required):**
  1. Accept Terms of Service
  2. Consent to document verification/processing
  3. Confirm information accuracy

#### Submission
- **Endpoint:** `POST /api/v1/guide-applications` (multipart/form-data)
- **Payload:** All form fields + uploaded files + `details_json` (profile, expertise, selfie images)
- **On Success:** Returns `{ id, status: "pending" }` → Shows reference `GU-{id.padStart(6,'0')}` → Clears localStorage draft
- **On Error:** Displays server error message (e.g., duplicate email, validation failure)

---

### 4.2 Phase 2: Application Created (Backend)

**Model:** `GuideApplication` (`backend/app/models/guide_application.py`)

| Column | Purpose |
|--------|---------|
| `id` | Primary key |
| `full_name`, `email`, `phone`, `city`, `region` | Core applicant info |
| `nin_number` | National ID number |
| `documents` | Legacy summary field |
| `status` | `pending` (default) / `approved` / `rejected` |
| `credential_password_hash` | bcrypt hash of applicant's chosen password (set at submit) |
| `credential_token_hash` | SHA-256 of setup token (for future invite flow) |
| `details_json` | Full profile/experience/selfie data (JSON string) |
| `user_id` | FK to `users` table (NULL until approved) |
| `reviewed_by`, `review_note`, `reviewed_at` | Audit trail (set on review) |
| `created_at`, `updated_at` | Timestamps |

**Key Invariant:** No `User` row with `role=guide` exists until approval. The password hash lives on the application row, not the user table.

---

### 4.3 Phase 3: Regional Head Review (Dashboard)

**Access:** `http://localhost:5176/dashboard/regional-head/applications` → `RegionalApplications` → `GuideApplicationsPanel`

**Regional Scoping Enforcement (Backend):**
```python
# In GET /guide-applications (operations.py:382-424)
if current_user.role == REGIONAL_HEAD:
    if not current_user.region:
        raise HTTPException(403, "Regional head has no assigned region")
    query = query.filter(GuideApplication.region == current_user.region)
```

**Dashboard UI (`GuideApplicationsPanel.tsx`):**
- **Filter:** All / Pending / Approved / Rejected
- **Table Columns:** Guide Name, Email, City, Region, Status, Actions
- **Actions per Row:**
  - **Review** → Opens modal with full details + document viewer
  - **Approve** → `PATCH /guide-applications/{id}` with `{"status": "approved"}`
  - **Reject** → `PATCH /guide-applications/{id}` with `{"status": "rejected"}`
  - **Delete** → Hard delete (removes files from `private_guide_applications/`)

**Review Modal Shows:**
- All applicant fields (name, email, phone, city, region, NIN)
- Uploaded documents with preview (images inline, PDFs in iframe)
- Status, submission timestamp

---

### 4.4 Phase 4: Decision & Account Provisioning (Backend)

**Endpoint:** `PATCH /guide-applications/{application_id}` (`operations.py:518-557`)

**Authorization:**
- Roles allowed: `ADMIN`, `REGIONAL_HEAD`
- Regional Head **must** have `current_user.region == application.region` (403 otherwise)

**On Approve (`status="approved"`):**
1. `_provision_guide_user(db, app)` creates/updates `User` row:
   - `email` = application email (lowercased)
   - `firstName`/`lastName` = split from `full_name`
   - `hashed_password` = `app.credential_password_hash` (from application)
   - `phone` = application phone
   - `role` = `GUIDE`
   - `region` = application region
   - `is_active` = `True`
2. Sets `app.user_id = user.id`
3. Sets `app.status = "approved"`, `app.reviewed_by = current_user.email`, `app.reviewed_at = now()`, `app.review_note = payload.review_note`
4. Returns `{ id, status, login_email, user_id }`

**On Reject (`status="rejected"`):**
1. Sets `app.status = "rejected"`, `app.reviewed_by`, `app.reviewed_at`, `app.review_note`
2. **No User row created** — applicant cannot log in
3. Returns `{ id, status, login_email: null, user_id: app.user_id }`

**On Pending (`status="pending"`):**
- Resets to pending; no user provisioning

**Idempotency:** Re-approving an already-approved application re-links the existing `user_id` (does not create duplicate).

**Conflict Guard:** If `application.email` already exists on a *different* `User` row → `409 Conflict` ("This email is already registered to another account.")

---

### 4.5 Phase 5: Post-Approval — Guide Activation

**Applicant Experience:**
- Receives reference ID on submission: `GU-XXXXXX`
- **Cannot log in** until approved (login returns 403: "Your guide account is not active yet. It is activated once a regional head approves your application.")
- On approval: Can log in at `http://localhost:5175` → Login modal → **Guide** tab → email + chosen password
- Lands on `/guide/dashboard` (Guide Console)

**Guide Console Access (`backend/app/api/v1/guide.py`):**
- `GET /api/v1/guide/me` — Returns own profile + capabilities
- `GET /api/v1/guide/dashboard` — Stats, listings, updates, bookings
- `GET/PUT /api/v1/guide/onboarding` — 4-step onboarding wizard
- `GET/POST/PATCH/DELETE /api/v1/guide/listings` — Manage experience listings
- `GET/PATCH /api/v1/guide/bookings` — Accept/reject/complete assigned bookings

---

## 5. Data Verification Checklist (Regional Head)

When reviewing an application, the Regional Head **must** verify:

| Category | Checks |
|----------|--------|
| **Identity** | NIN number format; Citizenship front/back match name; Photo holding citizenship shows same person |
| **Biometric** | Live selfie (3-angle) matches citizenship photo; no spoofing indicators |
| **Credentials** | Guide certificate valid/legible; License number format (if provided) |
| **Completeness** | All 6 document slots filled; Supplementary docs relevant |
| **Consistency** | Region in Step 0 matches Step 1 province; Cities covered align with region |
| **Experience** | Years of experience plausible; Expertise areas specific; Summary ≥30 chars |
| **Declarations** | All 3 checkboxes confirmed (enforced client-side, re-verified server-side via `details_json`) |

**Document Access:** Click "Review" → Modal loads documents via `GET /guide-applications/{id}/documents/{key}` (streams file from `backend/app/private_guide_applications/`).

---

## 6. Communication Touchpoints

| Trigger | Channel | Recipient | Content |
|---------|---------|-----------|---------|
| Application Submitted | On-screen (Wizard) | Applicant | Reference ID `GU-XXXXXX`; "We will contact you at {email} after a regional head reviews your application. Your login becomes active once you are approved to guide." |
| Application Approved | Email (Not yet implemented) | Applicant | "Your guide application has been approved. You can now log in at Guides Nepal using your email and chosen password." |
| Application Rejected | Email (Not yet implemented) | Applicant | "Your guide application was not approved. Reason: {review_note}. You may re-apply after addressing the concerns." |
| Review Action Taken | Dashboard Toast | Regional Head | "Guide application #{id} approved/rejected" |
| Document Load Error | Dashboard Modal | Regional Head | "Unable to load application documents." |

**Note:** Automated email notifications are **not yet implemented** in the codebase. Current touchpoints are in-app only. This is a known gap for future enhancement.

---

## 7. Escalation & Approval Criteria

### 7.1 Mandatory Approval Criteria (All Must Pass)
1. **Identity Verified:** Citizenship documents + live selfie match; NIN provided
2. **Credentials Valid:** Guide certificate uploaded and legible
3. **Region Match:** Application region = Regional Head's assigned region (enforced by API)
4. **Completeness:** All required fields + 6 document slots filled
5. **Declarations Signed:** All 3 checkboxes true
6. **No Duplicate Email:** Email not already registered to another active user

### 7.2 Discretionary Rejection Reasons (Document in `review_note`)
- Inconsistent information across steps (e.g., region mismatch)
- Poor quality / illegible documents
- Guide certificate expired or not recognized
- Insufficient experience for claimed expertise
- Suspected fraudulent documents (report to Admin)
- Applicant unresponsive to clarification requests

### 7.3 Escalation Path
| Situation | Escalate To | Method |
|-----------|-------------|--------|
| Regional Head has no assigned region | Admin | Dashboard shows 403; Admin assigns region via `PATCH /admin/users/{id}` |
| Application outside Regional Head's region | Admin | Admin can review any region; reassign if needed |
| Suspected fraud / duplicate identity | Admin | Admin reviews via `/admin/administration` or direct DB |
| Technical error (file missing, 500) | Admin/Dev | Check backend logs; `private_guide_applications/` folder |
| Applicant appeals rejection | Admin | Admin can override via `PATCH /guide-applications/{id}` with `status=approved` |

---

## 8. Handover to Regional Head

**Automatic Handover:** The system **automatically routes** each application to the correct Regional Head based on the `region` field selected in Step 0 (Basics). No manual handoff step is required.

**Regional Head Notification:** Currently **not implemented** (no email/push notification when new application arrives). Regional Heads must periodically check the Dashboard → Applications tab.

**Audit Trail:** Every decision records:
- `reviewed_by` = Regional Head's email
- `reviewed_at` = UTC timestamp
- `review_note` = Free-text justification
- Immutable once set (re-approval preserves original reviewer)

---

## 9. Error Handling & Edge Cases

| Scenario | System Behavior | Resolution |
|----------|----------------|------------|
| Duplicate email on submit | `400 Bad Request` / `422` | Applicant uses "Forgot Password" or different email |
| Duplicate email on approve | `409 Conflict` | Admin resolves conflict (merge/delete existing user) |
| Regional Head has no region | `403 Forbidden` on list/review | Admin sets `region` on Regional Head's user row |
| Missing uploaded file on disk | `404` on document fetch | File was deleted; only DB metadata remains |
| Password not captured (legacy app) | `422` on approve | Admin must set `credential_password_hash` manually or applicant re-applies |
| Selfie capture fails | Client-side error | Applicant retries via `SelfieAuthentication` modal |

---

## 10. Security & Compliance

- **Password Handling:** Never stored in plaintext. Applicant's password → bcrypt hash on application row → copied to User row on approval. Original hash on application row retained for audit.
- **Document Storage:** Files saved to `backend/app/private_guide_applications/` (non-public path). Served via authenticated endpoint with regional scoping.
- **Access Control:** All review endpoints guarded by `require_role(ADMIN, REGIONAL_HEAD)`. Regional scoping enforced in query layer.
- **Data Retention:** Rejected applications retained in DB. Deleted applications remove files from disk + cascade deactivate linked User (if any).
- **PII:** Email, NIN, citizenship images, selfies = sensitive PII. Access limited to Regional Head (own region) + Admin.

---

## 11. Monitoring & Metrics (Recommended)

| Metric | Source | Target |
|--------|--------|--------|
| Applications Submitted (daily) | `GuideApplication.created_at` count | Track trend |
| Time to First Review | `reviewed_at - created_at` (approved/rejected) | < 48 hours |
| Approval Rate | `count(status=approved) / count(status!=pending)` | > 70% |
| Rejections by Reason | `review_note` categorization | Identify patterns |
| Regional Workload Balance | Applications per region | Even distribution |
| Duplicate Email Attempts | `409` on approve / `400` on submit | Monitor fraud |

---

## 12. Appendix: API Reference

### Create Application
```
POST /api/v1/guide-applications
Content-Type: multipart/form-data

Fields: full_name, email, password, region, city, phone?, nin_number?, documents(JSON), files...
Response: 201 { id, status: "pending" }
```

### List Applications (Regional Head)
```
GET /api/v1/guide-applications?status_filter=pending
Authorization: Bearer <token>
Response: 200 [ { id, full_name, email, city, region, nin_number, documents, uploaded_files[], status, created_at }, ... ]
```

### Get Document
```
GET /api/v1/guide-applications/{id}/documents/{key}
Authorization: Bearer <token>
Response: 200 File (inline)
```

### Review Application
```
PATCH /api/v1/guide-applications/{id}
Authorization: Bearer <token>
Body: { "status": "approved"|"rejected"|"pending", "review_note": "..." }
Response: 200 { id, status, login_email, user_id }
```

### Delete Application
```
DELETE /api/v1/guide-applications/{id}
Authorization: Bearer <token>
Response: 204
```

---

## 13. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-11-07 | Kilo AI | Initial SOP documenting existing implemented workflow |

---

**End of SOP**