# Information Architecture (IA)

## 1. System Hierarchy

The system follows a RESTful resource hierarchy rooted at `/api/v1`.

- **Auth** (`/auth`)
  - Entry point for all users (Travelers & Guides).
  - Handles Identity & Access Management (IAM).
- **Public Resources**
  - **Experiences** (`/experiences`): Browseable catalog of tours.
  - **Guides** (`/guides`): Public profiles of hosts.
  - **Cities** (`/cities`): Aggregation points for experiences.
- **Private Resources** (Protected)
  - **Bookings** (`/bookings`): Transactional records owned by Users.
  - **User Profile** (`/users`): Personal settings.
  - **Chat** (`/chat`): Real-time communication.

## 2. Data Ownership

| Resource | Owner | Access | Notes |
|----------|-------|--------|-------|
| **User Account** | User | Owner (RW), Admin (RW) | PII protected. |
| **Guide Profile** | Guide | Public (R), Guide (RW) | Verified status managed by Admin. |
| **Experience** | Guide | Public (R), Guide (RW) | Linked to City and Guide. |
| **Booking** | Traveler | Traveler (RW), Guide (R) | Immutable after completion. |
| **Chat Message** | Sender | Sender/Receiver (R) | Private channel. |

## 3. Frontend-Backend Dependency Mapping

| Frontend Page | Backend Resource | Critical Data |
|---------------|------------------|---------------|
| `HomePage` | `/experiences`, `/cities` | Featured items, search filters. |
| `SearchPage` | `/experiences` | filtering (city, type, price). |
| `ExperiencePage`| `/experiences/{slug}` | Rich content, host details. |
| `GuideProfile` | `/guides/{id}` | Bio, reviews, gallery. |
| `BookingsPage` | `/bookings` | List status, cancel actions. |
| `HostApplication`| `/auth/register/guide` | Multipart file uploads (KYC). |

## 4. Access Control Levels

1.  **Public (Anonymous)**: Read Experiences, Guides, Cities.
2.  **Traveler (Authenticated)**: Create Bookings, Chat, Edit Own Profile.
3.  **Guide (Authenticated + Verified)**: Create Experiences, Manage Incoming Bookings.
4.  **Admin (Internal)**: Verify Guides, Moderate Content.
