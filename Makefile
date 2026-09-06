.PHONY: help setup dev build test lint format typecheck clean

# Default target
help: ## Show this help message
	@echo "Guides Nepal - Available Commands"
	@echo "================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Setup
setup: ## Run initial project setup
	@echo "🚀 Setting up Guides Nepal..."
	node scripts/setup.js

# Development
dev: ## Start all development services
	@echo "🚀 Starting all development services..."
	npm run dev

dev-frontend: ## Start frontend development server
	@echo "🎨 Starting frontend..."
	npm run dev:frontend

dev-backend: ## Start backend development server
	@echo "⚙️ Starting backend..."
	npm run dev:backend

dev-dashboard: ## Start dashboard development server
	@echo "📊 Starting dashboard..."
	npm run dev:dashboard

# Build
build: ## Build all projects
	@echo "🔨 Building all projects..."
	npm run build

build-frontend: ## Build frontend
	@echo "🎨 Building frontend..."
	npm run build:frontend

build-dashboard: ## Build dashboard
	@echo "📊 Building dashboard..."
	npm run build:dashboard

build-backend: ## Build backend Docker image
	@echo "⚙️ Building backend..."
	npm run build:backend

# Testing
test: ## Run all tests
	🧪 Running all tests..."
	npm test

test-frontend: ## Run frontend tests
	@echo "🎨 Running frontend tests..."
	npm run test:frontend

test-backend: ## Run backend tests
	@echo "⚙️ Running backend tests..."
	npm run test:backend

test-dashboard: ## Run dashboard tests
	@echo "📊 Running dashboard tests..."
	npm run test:dashboard

test-e2e: ## Run E2E tests
	@echo "🧪 Running E2E tests..."
	npm run test:e2e

test-e2e-ui: ## Run E2E tests with UI
	@echo "🧪 Running E2E tests with UI..."
	npm run test:e2e:ui

# Code Quality
lint: ## Lint all code
	@echo "🔍 Linting all code..."
	npm run lint

lint-frontend: ## Lint frontend code
	@echo "🎨 Linting frontend..."
	npm run lint:frontend

lint-backend: ## Lint backend code
	@echo "⚙️ Linting backend..."
	npm run lint:backend

lint-dashboard: ## Lint dashboard code
	@echo "📊 Linting dashboard..."
	npm run lint:dashboard

format: ## Format all code
	@echo "✨ Formatting all code..."
	npm run format

format-frontend: ## Format frontend code
	@echo "🎨 Formatting frontend..."
	npm run format:frontend

format-backend: ## Format backend code
	@echo "⚙️ Formatting backend..."
	npm run format:backend

format-dashboard: ## Format dashboard code
	@echo "📊 Formatting dashboard..."
	npm run format:dashboard

typecheck: ## Type check all code
	@echo "🔍 Type checking all code..."
	npm run typecheck

typecheck-frontend: ## Type check frontend code
	@echo "🎨 Type checking frontend..."
	npm run typecheck:frontend

typecheck-backend: ## Type check backend code
	@echo "⚙️ Type checking backend..."
	npm run typecheck:backend

typecheck-dashboard: ## Type check dashboard code
	@echo "📊 Type checking dashboard..."
	npm run typecheck:dashboard

# Cleanup
clean: ## Clean all build artifacts
	@echo "🧹 Cleaning all build artifacts..."
	npm run clean

clean-frontend: ## Clean frontend build artifacts
	@echo "🎨 Cleaning frontend..."
	npm run clean:frontend

clean-backend: ## Clean backend build artifacts
	@echo "⚙️ Cleaning backend..."
	npm run clean:backend

clean-dashboard: ## Clean dashboard build artifacts
	@echo "📊 Cleaning dashboard..."
	npm run clean:dashboard

# Database
db-migrate: ## Run database migrations
	@echo "🗄️ Running database migrations..."
	cd backend && .venv\Scripts\alembic upgrade head

db-downgrade: ## Downgrade database
	@echo "🗄️ Downgrading database..."
	cd backend && .venv\Scripts\alembic downgrade -1

db-revision: ## Create new database migration
	@echo "🗄️ Creating new migration..."
	cd backend && .venv\Scripts\alembic revision --autogenerate -m "$(message)"

# Docker
docker-up: ## Start all Docker containers
	@echo "🐳 Starting Docker containers..."
	docker compose up -d

docker-down: ## Stop all Docker containers
	@echo "🐳 Stopping Docker containers..."
	docker compose down

docker-build: ## Build all Docker images
	@echo "🐳 Building Docker images..."
	docker compose build

docker-logs: ## View Docker container logs
	@echo "📋 Viewing Docker logs..."
	docker compose logs -f

# Deployment
deploy-frontend: ## Deploy frontend to Vercel
	@echo "🚀 Deploying frontend..."
	cd frontend && vercel --prod

deploy-backend: ## Deploy backend to Render
	@echo "🚀 Deploying backend..."
	cd backend && render deploy

deploy-dashboard: ## Deploy dashboard to Vercel
	@echo "🚀 Deploying dashboard..."
	cd dashboard && vercel --prod