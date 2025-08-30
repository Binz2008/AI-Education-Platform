# AI Education Platform - Development Makefile
# Provides convenient commands for development workflow

.PHONY: help setup dev-backend dev-frontend docker-up docker-down docker-build test clean

# Default target
help:
	@echo "🚀 AI Education Platform Development Commands"
	@echo ""
	@echo "Setup Commands:"
	@echo "  setup          - Set up development environment (virtual env + dependencies)"
	@echo "  setup-backend  - Set up backend virtual environment only"
	@echo "  setup-frontend - Install frontend dependencies only"
	@echo ""
	@echo "Development Commands:"
	@echo "  dev-backend    - Start backend development server"
	@echo "  dev-frontend   - Start frontend development server"
	@echo "  dev-full       - Start both backend and frontend"
	@echo ""
	@echo "Docker Commands:"
	@echo "  docker-up      - Start all services with Docker Compose"
	@echo "  docker-down    - Stop all Docker services"
	@echo "  docker-build   - Rebuild Docker containers"
	@echo "  docker-logs    - View Docker logs"
	@echo ""
	@echo "Database Commands:"
	@echo "  db-migrate     - Run database migrations"
	@echo "  db-reset       - Reset database (WARNING: destroys data)"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  test           - Run all tests"
	@echo "  test-backend   - Run backend tests only"
	@echo "  lint           - Run code linting"
	@echo "  format         - Format code"
	@echo ""
	@echo "Utility Commands:"
	@echo "  clean          - Clean up temporary files"
	@echo "  logs           - View application logs"

# Setup commands
setup:
	@echo "🚀 Setting up complete development environment..."
	@powershell -ExecutionPolicy Bypass -File setup_dev_environment.ps1

setup-backend:
	@echo "🐍 Setting up backend virtual environment..."
	@cd backend && python -m venv venv
	@cd backend && .\venv\Scripts\Activate.ps1 && pip install --upgrade pip && pip install -r requirements.txt
	@echo "✅ Backend environment ready"

setup-frontend:
	@echo "📦 Installing frontend dependencies..."
	@cd frontend && npm install
	@echo "✅ Frontend dependencies installed"

# Development commands
dev-backend:
	@echo "🚀 Starting backend development server..."
	@cd backend && .\venv\Scripts\Activate.ps1 && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	@echo "🚀 Starting frontend development server..."
	@cd frontend && npm run dev

dev-full:
	@echo "🚀 Starting full development environment..."
	@start /B make dev-backend
	@timeout /t 3 /nobreak > nul
	@make dev-frontend

# Docker commands
docker-up:
	@echo "🐳 Starting Docker services..."
	@docker-compose up -d
	@echo "✅ Services started. Backend: http://localhost:8000, Frontend: http://localhost:3000"

docker-down:
	@echo "🛑 Stopping Docker services..."
	@docker-compose down

docker-build:
	@echo "🔨 Building Docker containers..."
	@docker-compose up --build -d

docker-logs:
	@echo "📋 Viewing Docker logs..."
	@docker-compose logs -f

# Database commands
db-migrate:
	@echo "🗄️ Running database migrations..."
	@cd backend && .\venv\Scripts\Activate.ps1 && alembic upgrade head

db-reset:
	@echo "⚠️ Resetting database (this will destroy all data)..."
	@docker-compose down -v
	@docker-compose up -d postgres redis
	@timeout /t 10 /nobreak > nul
	@make db-migrate

# Testing and quality commands
test:
	@echo "🧪 Running all tests..."
	@make test-backend

test-backend:
	@echo "🧪 Running backend tests..."
	@cd backend && .\venv\Scripts\Activate.ps1 && pytest

lint:
	@echo "🔍 Running code linting..."
	@cd backend && .\venv\Scripts\Activate.ps1 && ruff check .
	@cd frontend && npm run lint

format:
	@echo "✨ Formatting code..."
	@cd backend && .\venv\Scripts\Activate.ps1 && ruff format .
	@cd frontend && npm run format

# Utility commands
clean:
	@echo "🧹 Cleaning up temporary files..."
	@if exist "backend\__pycache__" rmdir /s /q "backend\__pycache__"
	@if exist "backend\.pytest_cache" rmdir /s /q "backend\.pytest_cache"
	@if exist "frontend\.next" rmdir /s /q "frontend\.next"
	@if exist "frontend\node_modules\.cache" rmdir /s /q "frontend\node_modules\.cache"

logs:
	@echo "📋 Viewing application logs..."
	@if exist "log" (type log\*.log) else (echo "No log files found")

# Environment status
status:
	@echo "📊 Environment Status:"
	@echo "Backend virtual env:" 
	@if exist "backend\venv" (echo "  ✅ Created") else (echo "  ❌ Not found - run 'make setup-backend'")
	@echo "Frontend dependencies:"
	@if exist "frontend\node_modules" (echo "  ✅ Installed") else (echo "  ❌ Not found - run 'make setup-frontend'")
	@echo "Docker services:"
	@docker-compose ps 2>nul || echo "  ❌ Not running - run 'make docker-up'"
