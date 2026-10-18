# DATABASE ERD — Guides Nepal

**Version:** 1.0 · **Date:** 2026-10-18
**Status:** Actual implemented schema (verified against app/models/*.py)

---

## 1. HIGH-LEVEL DIAGRAM

```mermaid
classDiagram|> users <|.. guide_listings
users <|.. guide_profiles
users <|.. guide_status_updates
users <|.. bookings
users <|.. experience_proposals
users <|.. experience_change_requests
users <|.. host_applications
users <|.. host_guides
users <|.. host_experience_guides
users <|.. host_experiences
users <|.. host_tours
users <|.. bookmarks
bookings }o--|| users
bookings }o--|| users
host_applications }o--|| users
guide_status_updates }o--|| guide_listings
experience_change_requests }o--|| guide_listings
```

## 2. RELATIONS TABLE

| From | To | Cardinality | FK | On Delete |
| user | guide_listings | 1:N | guide_user_id | CASCADE |
| user | guide_profiles | 1:1 | guide_user_id | CASCADE |
| user | guide_status_updates | 1:N | guide_user_id | CASCADE |
| user | guide_tours | 1:N | host_id | CASCADE |
| user | host_guides | 1:N | host_id | CASCADE |
| user | host_experiences | 1:N | host_id | CASCADE |
| user | bookings | 1:N | user_id | CASCADE |
| user | host_applications | 1:N | user_id | SET NULL |
| user | experience_proposals | 1:N | guide_user_id | CASCADE |
| user | experience_change_requests | 1:N | guide_user_id + listing_id | CASCADE |
| user | host_experience_guides | 1:N | host_id + guide_id | CASCADE |
| user | bookmarks | 1:N | user_id | CASCADE |
| user | support_tickets | 1:N | customer_email | SET NULL |
| guides | host_experience_guides | 1:N | guide_id | CASCADE |
| host_experiences | host_experience_guides | 1:N | experience_id | CASCADE |
| host_guides | host_experience_guides | 1:N | guide_id | CASCADE |

## 3. FULL TABLE LIST (MIGRATION-READY)

| Table | Columns | PK | FK | Unique |
|---|---|---|---|---|
| users | id, email, first_name, last_name, hashed_password, phone, role, region, bio, avatar_url, is_active, created_at, updated_at | id | | email |
| bookings | id, user_id, guide_user_id, experience_id, experience_title, city, date, guests, price, image, status, created_at, updated_at | id | user_id, guide_user_id | status |
| guide_listings | id, guide_user_id, title, category, city, area, description, itinerary, meeting_point, duration, difficulty, price, max_guests, booked_guests, is_active, created_at, updated_at | id | guide_user_id | max_guests, booked_guests |
| guide_profiles | id, guide_user_id, display_name, expertise_areas, cities, languages, bio, years_experience, default_max_guests, onboarding_completed, created_at, updated_at | id | guide_user_id | guide_user_id |
| guide_status_updates | id, guide_user_id, listing_id, update_type, message, area, event_date, current_capacity, max_capacity, is_active, created_at | id | guide_user_id, listing_id | update_type |
| host_applications | id, host_name, email, city, region, phone, experience, status, credential_token_hash, credential_password_hash, details_json, user_id, reviewed_by, review_note, reviewed_at, created_at, updated_at | id | user_id | email |
| guide_applications | id, full_name, email, phone, city, region, nin_number, documents, status, created_at, updated_at | id | | email |
| host_guides | id, host_id, guide_user_id, guide_id, email, full_name, phone, nin_number, city, region, documents, status, created_at, updated_at | id | host_id, guide_user_id, guide_id | email |
| host_experience_guides | id, host_id, experience_id, guide_id, is_primary, created_at | id | host_id, experience_id, guide_id | |
| host_experiences | id, host_id, title, slug, city, category, description, price, duration, hero_image, is_active, created_at, updated_at | id | host_id | slug |
| host_tours | id, host_id, title, city, description, itinerary, meeting_point, duration, difficulty, max_guests, price, is_active, created_at, updated_at | id | host_id | |
| support_tickets | id, subject, description, customer_name, customer_email, status, priority, assigned_to, resolution, resolved_at, created_at, updated_at | id | | customer_email |
| experience_proposals | id, guide_user_id, title, category, city, area, description, itinerary, meeting_point, duration, difficulty, price, max_guests, documents, status, submitted_at, decided_at, decided_by_user_id, decided_by_role, decision_notes, published_at, listing_id, created_at, updated_at | id | guide_user_id, listing_id | status |
| experience_change_requests | id, guide_user_id, listing_id, change_class, reason, changes, documents, status, submitted_at, decided_at, decided_by_user_id, decided_by_role, decision_notes, applied_at, created_at, updated_at | id | guide_user_id, listing_id | status |
| bookmarks | id, user_id, title, city, image, link | id | user_id | |

## 4. INDEX SUMMARY

| Index | Table | Columns | Type |
|---|---|---|---|
| ix_users_email | users | email | UNIQUE |
| ix_bookings_user_id | bookings | user_id | B-tree |
| ix_bookings_guide_user_id | bookings | guide_user_id | B-tree |
| ix_bookings_date | bookings | date | B-tree |
| ix_bookings_status_date | bookings | status, date | B-tree |
| ix_guide_listings_guide_user_id | guide_listings | guide_user_id | B-tree |
| ix_guide_listings_guide_active | guide_listings | guide_user_id, is_active | B-tree |
| ix_guide_listings_capacity | guide_listings | max_guests, booked_guests | B-tree |
| ix_guide_profiles_guide_user_id | guide_profiles | guide_user_id | UNIQUE |
| ix_guide_status_updates_guide_user_id | guide_status_updates | guide_user_id | B-tree |
| ix_guide_status_updates_type_date | guide_status_updates | guide_user_id, created_at DESC | B-tree |
| ix_host_applications_email | host_applications | email | B-tree |
| ix_host_applications_status_reviewed_at | host_applications | status, reviewed_at | B-tree |
| ix_guide_applications_email | guide_applications | email | B-tree |
| ix_host_guides_host_id | host_guides | host_id | B-tree |
| ix_host_guides_guide_user_id | host_guides | guide_user_id | B-tree |
| ix_host_guides_guide_id | host_guides | guide_id | B-tree |
| ix_host_experience_guides_host_id | host_experience_guides | host_id | B-tree |
| ix_host_experience_guides_experience_id | host_experience_guides | experience_id | B-tree |
| ix_host_experience_guides_guide_id | host_experience_guides | guide_id | B-tree |
| ix_host_experiences_host_id | host_experiences | host_id | B-tree |
| ix_host_experiences_slug | host_experiences | slug | UNIQUE (B-tree) |
| ix_host_experiences_city | host_experiences | city | B-tree |
| ix_host_experiences_is_active | host_experiences | host_id, is_active | B-tree |
| ix_support_tickets_customer_email | support_tickets | customer_email | B-tree |
| ix_support_tickets_status_priority | support_tickets | status, priority | B-tree |
| ix_experience_proposals_guide_user_id | experience_proposals | guide_user_id | B-tree |
| ix_experience_proposals_guide_status | experience_proposals | guide_user_id, status | B-tree |
| ix_experience_change_requests_guide_user_id | experience_change_requests | guide_user_id | B-tree |
| ix_experience_change_requests_listing_id | experience_change_requests | listing_id | B-tree |
| ix_experience_change_requests_status | experience_change_requests | status | B-tree |
| ix_bookmarks_user_id | bookmarks | user_id | B-tree |
