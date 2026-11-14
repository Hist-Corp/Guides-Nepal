# Information Architecture (IA) & System Design

This document outlines the high-level Information Architecture and System Design for **Guides-Nepal**, covering the Frontend, Backend, Data Flow, and User Journeys.

## 1. High-Level Architecture

The system follows a modern **Client-Server Architecture**:

```mermaid
graph TD
    User[User Browser] -->|HTTPS| CDN[CDN / Static Hosting]
    CDN -->|Serves| React[React Frontend (SPA)]
    
    React -->|JSON / API Calls| API[FastAPI Backend]
    
    subgraph "Backend Infrastructure"
        API -->|Read/Write| DB[(PostgreSQL Database)]
        API -->|Auth| JWT[JWT Service]
    end
    
    subgraph "Frontend Layer"
        React -->|State| Store[Zustand Store]
        React -->|Routing| Router[React Router]
    end
```

## 2. Core Entities & Data Model

The platform revolves around connecting **Travelers** with **Local Guides** through **Experiences**.

### 2.1 User Roles
- **Traveler**: An authenticated user looking to book experiences.
  - *Capabilities*: Search, Book, Chat, Review.
- **Guide**: An authenticated & verified user offering experiences.
  - *Capabilities*: Create Profile, Manage Experiences, Accept/Reject Bookings.
- **Admin**: Internal staff.
  - *Capabilities*: Verify Guides, Content Moderation.

### 2.2 Key Resources
| Resource | Description | Owner | Backend Endpoint |
|----------|-------------|-------|------------------|
| **User** | Identity & Profile (Auth) | User | `/api/v1/auth/*` |
| **Experience** | A tour or activity listing | Guide | `/api/v1/experiences` |
| **Booking** | A transaction record connecting User & Experience | Traveler | `/api/v1/bookings` |
| **GuideProfile** | Public portfolio of a Guide | Guide | `/api/v1/guides` |

## 3. Frontend Architecture

### 3.1 Sitemap & Routing structure
- **Public**
    - `/` (Home)
    - `/search` (Global Search)
    - `/experiences/:slug` (Experience Detail)
    - `/guides/:id` (Guide Profile)
    - `/city/:name` (City Landing Pages)
- **Auth**
    - `(Modals)`: Login / Signup
- **Private (User Dashboard)**
    - `/user/bookings` (My Bookings)
    - `/user/chat` (Messages)
- **Private (Host)**
    - `/host/application` (Become a Guide)

### 3.2 State Management (Zustand)
- `authStore`: User session, tokens, login status.
- `bookingStore`: Active bookings, history, cancellation actions.
- `uiStore`: Modal visibility, global UI feedback.

## 4. Backend Architecture

### 4.1 Modules
- **API Layer (`app/api/v1`)**: REST endpoints tailored to frontend needs.
- **Service Layer (`app/services`)**: Business logic (e.g., Auth flow, Booking rules).
- **Data Layer (`app/models`)**: SQLAlchemy ORM models mapping to Postgres tables.
- **Schemas (`app/schemas`)**: Pydantic models for request/response validation.

### 4.2 Security & Compliance
- **Authentication**: OAuth2 with Password Flow (JWT Access + Refresh Tokens).
- **Password Storage**: Bcrypt hashing.
- **Validation**: Strict typing via Pydantic.
- **CI/CD**: Automated testing and security scanning (Bandit, Safety) on every push.

## 5. Data Flow Example: "Booking an Experience"

1.  **Discovery**: User views `ExperiencePage`. Frontend fetches data from `/api/v1/experiences/{slug}`.
2.  **Action**: User clicks "Book Now".
3.  **Auth Check**: Frontend checks `authStore`. If not logged in, opens `LoginModal`.
4.  **Submission**: Frontend sends POST to `/api/v1/bookings` with JWT token.
5.  **Processing**:
    - Backend validates token.
    - Backend checks availability (mocked for MVP).
    - Backend creates `Booking` record in DB with status `upcoming`.
6.  **Response**: Backend returns created Booking object.
7.  **Update**: Frontend updates `bookingStore` and redirects to `/user/bookings`.

## 6. DevOps & Infrastructure

- **Containerization**: Docker & Docker Compose for consistent dev/prod environments.
- **Pipeline**: GitHub Actions for:
    - Code Quality (Black, Ruff, Mypy)
    - Testing (Pytest)
    - Security (TruffleHog, Bandit)
    - Readiness Checks (Env vars, DB connection)
- **Documentation**: API Contract and Setup Guides located in `backend/docs/`.
