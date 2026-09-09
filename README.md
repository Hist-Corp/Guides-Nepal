# Guides Nepal

A modern, open-source platform for independent travelers and local guides in Nepal. Guides Nepal combines curated city experiences (Kathmandu, Pokhara, Lalitpur, Bhaktapur, Bharatpur) with a simple booking flow, user profiles, and an AI chat assistant to help visitors plan trips.

This repository contains a Vite + React frontend, an optional dashboard app, and a FastAPI backend.

---

## Quick links

- Live frontend (dev): http://localhost:5175
- Backend (dev): http://localhost:8000
- Dashboard (dev): http://localhost:5176

---

## User Roles & Permissions

Guides Nepal has a comprehensive role-based access control (RBAC) system with 8 user roles, each with specific permissions and dashboard access.

### Role Hierarchy

```
Super Admin
    └── Admin
            ├── Regional Head (by region)
            ├── Customer Support
            ├── Content Writer
            ├── Host (approved)
            └── Guide (approved)
    └── Traveler (default role for all users)
```

### Complete User Roles Table

| Role | Dashboard Access | Key Permissions |
|------|-----------------|-----------------|
| **Super Admin** | `/super-admin/*` | Full system access, manage all users, approve/reject host applications, manage support tickets, system-wide analytics |
| **Admin** | `/admin/*` | Manage users, hosts, guides, content, analytics, revenue reports, regional head applications |
| **Regional Head** | `/regional-head/*` | Manage host applications for assigned region, view regional information |
| **Customer Support** | `/customer-support/*` | View and manage support tickets, respond to customer inquiries |
| **Content Writer** | `/content-writer/*` | Create/edit pages, blog posts, guides content, media uploads, SEO settings |
| **Host** | `/host/*` | Manage own tours, view bookings, track earnings, view performance metrics |
| **Guide** | `/guide/*` | Manage own tours, view bookings, manage schedule, track earnings, edit profile |
| **Traveler** | `/` (public site) | Browse experiences, book tours, chat with guides, view profiles (default role) |

### Pre-configured Seed Users

The system comes with the following pre-configured users for development and testing:

| Email | Role | Password | Region/Scope |
|-------|------|----------|--------------|
| `admin@guides-nepal.com` | Admin | `Admin@12345` | Full system |
| `superadmin@guides-nepal.com` | Super Admin | `SuperAdmin@2024` | Full system |
| `regional@guides-nepal.com` | Regional Head | `Regional@2024` | Kathmandu Valley |
| `support@guides-nepal.com` | Customer Support | `Support@2024` | Full system |

> **⚠️ Security Notice:** These are development-only credentials. Always change default passwords before deploying to production. For security, these credentials are stored in `backend/.env` and should never be committed to version control.

### Dashboard Routes by Role

#### Public (All Users)
- `/` - Home page
- `/explore` - Explore experiences
- `/search` - Search
- `/city/:cityId` - City pages (Kathmandu, Pokhara, Lalitpur, Bhaktapur, Bharatpur)
- `/local/:id` - Local guide profiles
- `/contact` - Contact page
- `/faq` - FAQ

#### Super Admin (`super-admin` role)
- `/super-admin` - Overview dashboard
- `/super-admin/host-applications` - Review all host applications
- `/super-admin/support-tickets` - View all support tickets
- `/super-admin/website-content` - Full website content management

#### Admin (`admin` role)
- `/admin` - Admin overview
- `/admin/hosts` - Manage hosts
- `/admin/guides` - Manage guides
- `/admin/analytics` - Analytics dashboard
- `/admin/revenue` - Revenue reports
- `/admin/settings` - System settings
- `/admin/content` - Content management

#### Regional Head (`regional-head` role)
- `/regional-head` - Regional overview
- `/regional-head/applications` - Host applications for their region
- `/regional-head/region` - Regional information

#### Customer Support (`customer-support` role)
- `/customer-support` - Support overview
- `/customer-support/tickets` - Support tickets
- `/customer-support/faq` - FAQ management

#### Content Writer (`content-writer` role)
- `/content-writer` - Content overview
- `/content-writer/pages` - Manage pages
- `/content-writer/blog` - Blog management
- `/content-writer/guides-content` - Guides content
- `/content-writer/media` - Media library
- `/content-writer/seo` - SEO settings

#### Host (`host` role)
- `/host` - Host overview
- `/host/guides` - Manage guide profiles
- `/host/tours` - Manage tours
- `/host/bookings` - View bookings
- `/host/earnings` - Earnings dashboard
- `/host/performance` - Performance metrics

#### Guide (`guide` role)
- `/guide` - Guide overview
- `/guide/my-tours` - Own tours
- `/guide/my-bookings` - View bookings
- `/guide/schedule` - Schedule management
- `/guide/earnings` - Earnings
- `/guide/profile` - Profile management

### Role Selection During Registration

When registering through the dashboard, users can select their intended role:
- `super-admin` - System administrator
- `admin` - Administrator
- `content-writer` - Content creator
- `regional-head` - Regional manager
- `customer-support` - Support staff
- `host` - Tour host
- `guide` - Local guide

After registration, hosts and guides must be approved by an admin or regional head before they can access their full dashboard features.

## Key features

- Experience browsing with consistent booking UI
- JWT + OAuth authentication (Google, Facebook)
- Booking management and host/guide workflows
- User profiles with avatar/photo uploads and bookmarks
- AI chat assistant (Ollama local model or OpenAI) with streaming support
- Role-based admin dashboard (Super Admin, Admin, Regional Head, Customer Support, Content Writer, Host, Guide)
- Mobile-first responsive UI using Tailwind CSS

---

## Tech stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: Python, FastAPI, SQLAlchemy, Alembic
- Database: SQLite (development) / PostgreSQL (production)
- AI: Ollama (local) or OpenAI
- Deployment: Vercel (frontend), Render (backend)

---

## Quick start (local development)

Prerequisites:
- Node.js 18+ and npm 8+
- Python 3.9+
- SQLite 3+ (for development) or PostgreSQL 12+

### Starting All Services

The project includes batch files for easy startup on Windows:

```bash
# Start all services (frontend, backend, dashboard)
.\start-all.bat

# Or start individual services:
.\start-frontend.bat    # Frontend on port 5175
.\start-backend.bat     # Backend on port 8000
.\start-dashboard.bat   # Dashboard on port 5176
```

### Manual Startup

**Frontend:**
```bash
cd frontend
npm run dev -- --port 5175 --host
```

**Backend:**
```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

**Dashboard:**
```bash
cd dashboard
npm run dev -- --port 5176 --host
```

### Access Points
- Frontend: http://localhost:5175
- Dashboard: http://localhost:5176
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/v1/docs

### Default Credentials

After starting the backend, you can log in with these pre-seeded accounts:

**Admin Login:**
- Email: `admin@guides-nepal.com`
- Password: `Admin@12345`

**Super Admin Login:**
- Email: `superadmin@guides-nepal.com`
- Password: `SuperAdmin@2024`

**Regional Head Login:**
- Email: `regional@guides-nepal.com`
- Password: `Regional@2024`
- Region: Kathmandu Valley

**Customer Support Login:**
- Email: `support@guides-nepal.com`
- Password: `Support@2024`

---

## Environment variables

### Frontend (.env.local)

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_API_URL=http://localhost:8000/api/v1
```

### Backend (backend/.env)

```bash
# Environment
ENV=development

# Database
DATABASE_URL=sqlite:///./guides_nepal.db
# For production: DATABASE_URL=postgresql://user:password@localhost:5432/guides_nepal

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Dev seeding
DEV_ALLOW_SEED=true
DEV_SEED_ADMIN_EMAIL=admin@guides-nepal.com
DEV_SEED_ADMIN_PASSWORD=Admin@12345

# AI (optional)
AI_PROVIDER=auto
OLLAMA_URL=http://localhost:11434
OPENAI_API_KEY=your-api-key

# Supabase (for password reset)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Never commit secrets or .env files to the repository.

---

## Project layout

```
Guides Nepal/
├── frontend/              # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts (Currency, Cart)
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   ├── data/          # Static data files
│   │   └── styles/        # CSS styles
│   └── ...
├── dashboard/             # Admin dashboard (React + Vite)
│   ├── src/
│   │   ├── admin/         # Admin pages
│   │   ├── superadmin/    # Super admin pages
│   │   ├── regionalhead/  # Regional head pages
│   │   ├── support/       # Support pages
│   │   ├── host/          # Host pages
│   │   ├── guide/         # Guide pages
│   │   ├── writer/        # Content writer pages
│   │   ├── auth/          # Authentication
│   │   ├── layouts/       # Layout components
│   │   ├── guards/        # Auth guards
│   │   └── ...
│   └── ...
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/v1/        # API endpoints
│   │   ├── models/        # SQLAlchemy models
│   │   ├── core/          # Config, database, security
│   │   └── ...
│   ├── migrations/        # Alembic migrations
│   └── ...
├── scripts/               # Utility scripts
├── docs/                  # Documentation
├── start-all.bat          # Start all services (Windows)
├── start-frontend.bat     # Start frontend only
├── start-backend.bat      # Start backend only
├── start-dashboard.bat    # Start dashboard only
└── README.md              # This file
```

---

## Development notes

- Frontend: TypeScript strict mode, ESLint and Prettier configured
- Backend: Use Black, Ruff, and Mypy for formatting and type checks
- Run tests with pytest and frontend checks with `npm run check`

### AI Chat Providers
- **Ollama** (recommended for local, privacy-friendly usage)
  - Install and run: `brew install ollama && ollama serve && ollama pull llama3.2`
- **OpenAI**: set `OPENAI_API_KEY` to enable

### API Endpoints
- Base: `/api/v1`
- Auth: `/api/v1/auth/*`
- Bookings: `/api/v1/bookings/*`
- Profile: `/api/v1/profile/*`
- AI: `/api/v1/ai/chat` and `/api/v1/ai/chat/stream`
- Admin: `/api/v1/admin/*`
- Content: `/api/v1/content/*`
- Operations: `/api/v1/operations/*`

---

## Database Schema (Users Table)

The users table includes the following fields:

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| email | String | Unique, indexed, required |
| firstName | String | Optional |
| lastName | String | Optional |
| hashed_password | String | Required, stored as hash |
| phone | String | Optional |
| role | String | Default: "traveler" - see [User Roles](#user-roles--permissions) |
| region | String | For regional heads (e.g., "Kathmandu Valley") |
| bio | String | User biography |
| avatar_url | String | Profile image URL |
| is_active | Boolean | Default: true |
| created_at | DateTime | Auto-generated |
| updated_at | DateTime | Auto-updated |

---

## Deployment

### Frontend
Configure Vercel with build `npm run build` and output `dist`.

### Backend
Render blueprint provided (render.yaml) — set environment variables and database.

### Docker
Containerized deployment supported:
```bash
docker-compose up -d
```

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes with conventional commits
4. Push and open a Pull Request

Code quality: run `npm run check` and `npm run lint` (frontend). Backend checks: `cd backend && ./scripts/run_checks.sh`.

---

## Security

- Do not commit secrets or .env files
- Prefer HTTP-only secure cookies for JWT storage
- Run security scans (Bandit) before production deploy
- Default credentials are for development only - change them in production!
- The system uses password hashing (bcrypt) for all user passwords
- JWT tokens with configurable expiration (default: 30 min access, 7 days refresh)

---

## License

This project is licensed under MIT. See the LICENSE file for details.

---

**Last updated:** 2026-09-09  
**Version:** 1.0.1
