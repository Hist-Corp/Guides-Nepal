# Backend Documentation

## 🚀 Project Overview

The **Guides-Nepal Backend** is a high-performance, secure REST API built with **FastAPI** (Python). It serves as the data layer for the frontend, handling authentication, bookings, and content delivery for experiences and guides.

## 🛠 Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Authentication**: OAuth2 with JWT (Access + Refresh tokens)
- **Containerization**: Docker & Docker Compose
 - **AI Providers**: Ollama (FOSS, auto-detected) or OpenAI

## 📦 Setup & Installation

### 1. Prerequisites
- Docker & Docker Compose
- Python 3.11+ (for local dev)

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` and `SECRET_KEY` are set.
Optional AI:
- `AI_PROVIDER` (`auto` | `ollama`)
- `OLLAMA_URL` (default `http://localhost:11434`)
- `OLLAMA_MODEL` (default `llama3.2:latest`)
- `OPENAI_API_KEY` (optional)

### 3. Run with Docker
```bash
docker compose up --build
```
The API will be available at `http://localhost:8000`.
Docs: `http://localhost:8000/docs`.

### 4. Run Locally
```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations (ensure DB is running)
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

## 🤖 AI Chat
- Endpoints:
  - `POST /api/v1/ai/chat` — non-stream response
  - `POST /api/v1/ai/chat/stream` — streaming tokens (text/plain)
- Behavior:
  - Auto-detect and use local Ollama if available; otherwise use OpenAI if API key is set.
  - Friendly direct fallbacks for common queries (e.g., Kathmandu weather, local time) when no provider is available.

## 🔐 Authentication Flow

1.  **Register**: POST `/api/v1/auth/register`
2.  **Login**: POST `/api/v1/auth/login` returns `access_token` and `refresh_token`.
3.  **Authenticated Requests**: Send header `Authorization: Bearer <access_token>`.
4.  **Refresh**: POST `/api/v1/auth/refresh` when access token expires.

## 📂 Project Structure

```
backend/
├── app/
│   ├── api/v1/          # Route handlers (Auth, Bookings, Public)
│   ├── core/            # Config, Security, Database
│   ├── models/          # SQLAlchemy Database Models
│   ├── schemas/         # Pydantic Response/Request Schemas
│   ├── services/        # Business Logic Layer
│   └── main.py          # App Entrypoint
├── migrations/          # Alembic Migration Scripts
├── docs/                # API Contract & Architecture Docs
└── tests/               # Pytest Unit Tests
```

## 🛡 Security Practices

- **Password Hashing**: Uses **bcrypt** for secure storage.
- **Input Validation**: **Pydantic** enforces strict schema validation.
- **SQL Injection**: Prevented via **SQLAlchemy ORM**.
- **CORS**: Configured to allow only specific frontend origins.
- **Docker**: Runs as non-root user.

## 📚 API Reference

See `docs/api-contract.md` for a detailed breakdown of endpoints matching the frontend.
