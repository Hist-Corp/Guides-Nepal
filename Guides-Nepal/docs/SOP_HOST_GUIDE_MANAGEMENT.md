# SOP-GN-HOST-001 — Host Guide Management (Creation → Assignment → Traveler Display)

## 1. Purpose
Single auditable workflow for a **Host** to add guides (full login accounts
mirroring frontend `BecomeGuidePage` registration), assign them to the Host's
own **Experiences**, and surface the assigned guide on traveler search and
experience pages.

## 2. Scope
- In scope: `POST/GET /host/guides`, suspend/reactivate, per-experience
  assign/unassign, public surfacing of assigned guides.
- Out of scope: admin verification of `GuideApplication`, pricing/payouts.

## 3. Roles
| Actor | Capability |
|---|---|
| Host | Create guides, assign to own experiences only |
| Guide (created) | Signs in (`role=guide`), manages own listings |
| Traveler | Sees assigned guide on search + detail pages |
| Admin | Verifies `guides.verified` via existing admin panel |

## 4. Guide creation (mirrors BecomeGuidePage exactly)
Frontend registration collects:
1. **Personal:** `fullName`, `email`, `password`, `phone`.
2. **Verification:** `ninNumber` + 5 documents
   (`citizenshipFront`, `citizenshipBack`, `liveSelfie`,
   `holdingCitizenship`, `certificate`).
3. Host dashboard collects the same fields **plus** the catalog profile:
   `role_title`, `bio` (≥30 chars), `languages[]`, `cities[]`, `lives_in`,
   `image`, `gallery[]`, `city`, `region`.

Transaction (`HostGuideService.create_guide`) writes 4 rows atomically:
1. `users` (`role='guide'`, bcrypt hash, validated strength).
2. `guides` catalog profile (`verified=false`, `rating=0`).
3. `guide_applications` (`status='pending'`, documents summary).
4. `host_guides` ownership link (`status='active'`).

Guards: unique email globally (409), unique per host (409), password policy
(422), host owns every row it creates.

## 5. Experience assignment
- `GET /host/guides/experiences/{id}/guides` — assigned guides + profiles.
- `POST .../guides { guide_id, is_primary }` — only an **active** guide owned
  by the same host; setting `is_primary=true` demotes the previous primary.
- `DELETE .../guides/{guide_id}` — removes the assignment only.

## 6. Frontend integration (traveler sees the guide)
1. **Search (`/search`):** static catalog renders instantly, then
   `GET /experiences` merges rows with `slug=host-*`. The card footer shows
   the assigned guide avatar + name and links to `/experience/host-{slug}`.
2. **Detail (`/experience/:id`):** existing API fallback (`guidesApi`) matches
   by `id` or `slug`, renders `host` (name, image, rating, reviews, about).
   Public `GET /experiences/host-{slug}` returns the primary assigned guide
   as `host` plus all assigned guides in `guides[]`.
3. **Offline:** search still renders the static catalog when the API fails.

## 7. Endpoints
| Method & path | Auth | Purpose |
|---|---|---|
| `GET /host/guides` | host | List own guides + profiles |
| `POST /host/guides` | host | Create guide (user + profile + application) |
| `POST /host/guides/{id}/suspend` | host | Deactivate login + profile |
| `POST /host/guides/{id}/reactivate` | host | Restore login + profile |
| `GET /host/guides/experiences/{eid}/guides` | host | List assignments |
| `POST /host/guides/experiences/{eid}/guides` | host | Assign guide |
| `DELETE /host/guides/experiences/{eid}/guides/{gid}` | host | Unassign |
| `GET /experiences` | public | Mocks + live host experiences with guides |
| `GET /experiences/host-{slug}` | public | Single live experience + assigned guide |

## 8. Data model
- `host_guides(host_id, guide_user_id, guide_id, full_name, email, phone, nin_number, city, region, documents[], status)` 
- `host_experience_guides(host_id, experience_id, guide_id, is_primary)`

Migration: `d4e5f6a7b8c9_create_host_guide_tables.py` (revises `c8e1f2a3b4c5`).

## 9. Failure modes
| Case | Result |
|---|---|
| Duplicate email | 409, nothing written |
| Weak password | 422 with policy message |
| Assign other host's guide | 404 (ownership check) |
| Experience without guide | Hidden from public feed until assigned |
| Backend unreachable on search | Static catalog still renders |
