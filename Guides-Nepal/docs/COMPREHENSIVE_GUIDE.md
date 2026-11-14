# Guides Nepal - Comprehensive Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Development Setup](#development-setup)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)
8. [Deployment Guide](#deployment-guide)
9. [Features](#features)
10. [Contributing](#contributing)

## Project Overview

Guides Nepal is a full-stack web application that connects travelers with local guides for authentic experiences in Nepal. The platform showcases city experiences, cultural tours, food tours, and outdoor activities with a focus on sustainable tourism and local community engagement.

### Key Features
- **City Experiences**: Kathmandu, Pokhara, Lalitpur, Bhaktapur, Bharatpur
- **Local Guides**: Verified guides with profiles, ratings, and reviews
- **Booking System**: Secure booking with date/time selection
- **AI Chat Assistant**: Local travel advice and recommendations
- **User Profiles**: Personal profiles with bookmarks and booking history
- **Multi-language Support**: Guides speak multiple languages
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React + Vite)│◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard       │    │   AI Services     │    │   File Storage  │
│   (React)         │    │   (Ollama/OpenAI)│    │   (Local/Cloud) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture
- **Frontend**: React functional components with TypeScript
- **Backend**: FastAPI with service layer architecture
- **Database**: PostgreSQL with SQLAlchemy ORM
- **State Management**: Zustand for frontend state
- **Authentication**: JWT tokens with OAuth2

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Forms**: React Hook Form

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Authentication**: OAuth2 with JWT
- **AI Integration**: Ollama (local) or OpenAI
- **File Upload**: Local storage with static serving

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (frontend), Render (backend)
- **Monitoring**: Health checks and logging

## Project Structure

```
guides-nepal/
├── frontend/                    # Main React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── contexts/          # React contexts
│   │   ├── store/             # Zustand stores
│   │   └── data/              # Static data files
│   ├── public/                # Static assets
│   └── docs/                  # Frontend documentation
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── api/v1/            # API endpoints
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # Business logic
│   │   └── core/               # Core configuration
│   ├── migrations/             # Database migrations
│   ├── scripts/              # Utility scripts
│   └── tests/                  # Test files
├── dashboard-app/              # Admin dashboard
└── docs/                      # Project documentation
```

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+ and pip
- PostgreSQL 15+
- Docker and Docker Compose (optional)

### Frontend Setup
```bash
cd guides-nepal
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Configure DATABASE_URL and SECRET_KEY in .env
alembic upgrade head
uvicorn app.main:app --reload
```

### Environment Variables

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

#### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/guides_nepal
SECRET_KEY=your-secret-key
ENV=development
AI_PROVIDER=auto
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest
```

## API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/auth/me` - Get current user

### Public Endpoints
- `GET /api/v1/guides` - List all guides
- `GET /api/v1/guides/{id}` - Get guide details
- `GET /api/v1/experiences` - List experiences
- `GET /api/v1/experiences/{slug}` - Get experience details

### Protected Endpoints
- `GET /api/v1/bookings` - User bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/profile/me` - User profile
- `PATCH /api/v1/profile/me` - Update profile

### AI Chat Endpoints
- `POST /api/v1/ai/chat` - Non-streaming chat
- `POST /api/v1/ai/chat/stream` - Streaming chat

## Database Schema

### Core Tables
- **users**: User accounts and profiles
- **guides**: Guide profiles and information
- **bookings**: User bookings
- **experiences**: Available experiences
- **cities**: City information

### Guide Model Schema
```python
class Guide(Base):
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    image = Column(String, nullable=False)
    role = Column(String, nullable=False)
    rating = Column(Float, default=0.0)
    reviews = Column(Integer, default=0)
    bio = Column(Text, nullable=False)
    languages = Column(JSON, default=list)
    verified = Column(Boolean, default=False)
    lives_in = Column(String)
    cities = Column(JSON, default=list)
    gallery = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
```

## Deployment Guide

### Frontend Deployment (Vercel)
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Set up redirects for SPA routing
4. Deploy with automatic CI/CD

### Backend Deployment (Render)
1. Use provided `render.yaml` blueprint
2. Configure environment variables
3. Set up PostgreSQL database
4. Run migrations on deployment

### Docker Deployment
```bash
docker compose up --build
```

## Features

### User Features
- Browse city experiences
- View guide profiles
- Book experiences with guides
- User authentication and profiles
- Bookmark favorite experiences
- AI chat assistant
- Multi-language support

### Guide Features
- Profile management
- Booking management
- Portfolio showcase
- Rating and reviews

### Admin Features
- Dashboard for analytics
- Content management
- User and guide management
- Booking oversight

## Contributing

### Code Standards
- Follow TypeScript/React best practices
- Use consistent naming conventions
- Write comprehensive tests
- Document API changes

### Git Workflow
1. Create feature branch from main
2. Make changes with descriptive commits
3. Run tests and linting
4. Create pull request
5. Code review and merge

### Testing
```bash
# Frontend tests
npm run test

# Backend tests
cd backend
pytest

# Run all checks
cd backend && ./scripts/run_checks.sh
```

---

For more detailed information, see:
- [Frontend README](README.md)
- [Backend Documentation](backend/docs/)
- [API Contract](backend/docs/api-contract.md)
- [Architecture Documentation](ARCHITECTURE.md)