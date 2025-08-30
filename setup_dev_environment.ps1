# AI Education Platform - Development Environment Setup Script
# This script sets up a complete development environment with virtual environment and Docker

Write-Host "🚀 Setting up AI Education Platform Development Environment" -ForegroundColor Green

# Check if Python is installed
Write-Host "📋 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.11 or higher." -ForegroundColor Red
    exit 1
}

# Check if Docker is installed
Write-Host "📋 Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "✅ Found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Navigate to project root
Set-Location "f:\jarv\supernova_main\ai-education-platform"

# Create virtual environment for backend
Write-Host "🐍 Creating Python virtual environment..." -ForegroundColor Yellow
Set-Location "backend"

if (Test-Path "venv") {
    Write-Host "📁 Virtual environment already exists. Removing old one..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "venv"
}

python -m venv venv
Write-Host "✅ Virtual environment created" -ForegroundColor Green

# Activate virtual environment
Write-Host "🔄 Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install Python dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
pip install --upgrade pip
pip install -r requirements.txt
Write-Host "✅ Python dependencies installed" -ForegroundColor Green

# Go back to project root
Set-Location ".."

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "⚙️ Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created. Please update with your actual values." -ForegroundColor Green
}

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location "frontend"
npm install
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green

# Go back to project root
Set-Location ".."

Write-Host ""
Write-Host "🎉 Development environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env file with your database and API keys" -ForegroundColor White
Write-Host "2. Start services with Docker: docker-compose up -d" -ForegroundColor White
Write-Host "3. Run database migrations: cd backend && alembic upgrade head" -ForegroundColor White
Write-Host "4. Start backend development: cd backend && .\venv\Scripts\Activate.ps1 && uvicorn app.main:app --reload" -ForegroundColor White
Write-Host "5. Start frontend development: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🐳 Docker commands:" -ForegroundColor Cyan
Write-Host "- Start all services: docker-compose up -d" -ForegroundColor White
Write-Host "- View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "- Stop services: docker-compose down" -ForegroundColor White
Write-Host "- Rebuild: docker-compose up --build" -ForegroundColor White
