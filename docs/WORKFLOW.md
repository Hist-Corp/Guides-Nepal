# Guides Nepal - Development Workflow

This document outlines the optimized development workflow for the Guides Nepal project.

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development Commands](#development-commands)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- Node.js 18+
- npm 8+
- Python 3.9+
- PostgreSQL 12+ (optional, can use Docker)
- Docker (optional)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/Hist-Corp/Guides-Nepal.git
cd Guides-Nepal

# Run the automated setup
npm run setup
```

The setup script will:
1. Check for required prerequisites
2. Create environment files from templates
3. Install all dependencies
4. Set up the Python virtual environment
5. Configure git hooks

### Environment Configuration

After setup, update the environment files with your credentials:

1. **Backend** (`backend/.env`):
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/guides_nepal
   SECRET_KEY=your-secret-key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Frontend** (`frontend/.env`):
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

3. **Dashboard** (`dashboard/.env`):
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

## Project Structure

```
guides-nepal/
├── frontend/              # Customer-facing React app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state management
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   ├── data/          # Static data
│   │   └── test/          # Unit tests
## Development Commands

### Using npm

```bash
# Start all services
npm run dev

# Start individual services
npm run dev:frontend    # Frontend only (port 5175)
npm run dev:backend     # Backend only (port 8000)
npm run dev:dashboard   # Dashboard only (port 5176)

# Build all projects
npm run build

# Run all tests
npm test

# Lint all code
npm run lint

# Format all code
npm run format

# Type check all code
npm run typecheck
```

### Using Make

```bash
# Show all available commands
make help

# Development
make dev
make dev-frontend
make dev-backend
make dev-dashboard

# Testing
make test
make test-frontend
make test-backend
make test-e2e

# Code Quality
make lint
make format
make typecheck

# Docker
make docker-up
make docker-down
make docker-build
```

### Using Docker

```bash
# Start all services with Docker
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild services
docker compose build
```

## Testing

### Unit Tests

```bash
# Frontend unit tests
## Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

### Backend (Render)

The backend is automatically deployed to Render when changes are pushed to the main branch.

### Dashboard (Vercel)

```bash
cd dashboard
vercel --prod
```

## Troubleshooting

### Common Issues

1. **Port already in use**:
   - Frontend: Change port in `frontend/vite.config.ts`
   - Backend: Change port in `backend/.env`
   - Dashboard: Change port in `dashboard/vite.config.ts`

2. **Database connection issues**:
   - Verify PostgreSQL is running
   - Check DATABASE_URL in `backend/.env`
   - Run migrations: `cd backend && .venv\Scripts\alembic upgrade head`

3. **Module not found errors**:
   - Run `npm run setup` to reinstall dependencies
   - Clear cache: `npm run clean`

4. **Test failures**:
   - Ensure all environment variables are set
   - Check database connection for backend tests
   - Verify frontend is running for E2E tests

### Getting Help

- Check the existing documentation in `/docs` and `/dashboard/docs`
- Review the API documentation at `/api/v1/docs` (development mode)
- Create an issue on GitHub

## Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Run tests: `npm test`
4. Run linting: `npm run lint`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Commit Convention

We use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build process or auxiliary tool changes

---

**Last Updated**: 2025
**Version**: 1.0.0
cd frontend
npm test

# Backend unit tests
cd backend
.venv\Scripts\activate
pytest

# Dashboard unit tests
cd dashboard
npm test
```

### Test Coverage

```bash
# Frontend coverage
cd frontend
npm run test:coverage

# Backend coverage
cd backend
.venv\Scripts\activate
pytest --cov=app --cov-report=html
```

### E2E Tests

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Code Quality

### Pre-commit Hooks

The project uses Husky and lint-staged to run checks before each commit:

- **Frontend/Dashboard**: ESLint + Prettier
- **Backend**: Black + Ruff

### Linting

```bash
# Lint all code
npm run lint

# Lint individual projects
npm run lint:frontend
npm run lint:backend
npm run lint:dashboard
```

### Formatting

```bash
# Format all code
npm run format

# Format individual projects
npm run format:frontend
npm run format:backend
npm run format:dashboard
```

### Type Checking

```bash
# Type check all code
npm run typecheck

# Type check individual projects
npm run typecheck:frontend
npm run typecheck:backend
npm run typecheck:dashboard
```
│   └── ...
├── dashboard/             # Admin dashboard React app
│   ├── src/
│   │   ├── admin/         # Admin pages
│   │   ├── host/          # Host pages
│   │   ├── guide/         # Guide pages
│   │   ├── writer/        # Content writer pages
│   │   ├── components/    # Reusable components
│   │   ├── layouts/       # Layout components
│   │   ├── guards/        # Route guards
│   │   ├── hooks/         # Custom hooks
│   │   ├── state/         # State management
│   │   └── test/          # Unit tests
│   └── ...
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/v1/        # API routes
│   │   ├── core/          # Core configuration
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Custom middleware
│   ├── tests/             # Backend tests
│   └── ...
├── tests/e2e/             # End-to-end tests
├── scripts/               # Automation scripts
├── docs/                  # Documentation
└── ...
```