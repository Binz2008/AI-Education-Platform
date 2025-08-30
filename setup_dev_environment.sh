#!/bin/bash
# AI Education Platform - Development Environment Setup Script (Linux/macOS)
# This script sets up a complete development environment with virtual environment and Docker

echo "🚀 Setting up AI Education Platform Development Environment"

# Check if Python is installed
echo "📋 Checking Python installation..."
if command -v python3 &> /dev/null; then
    python_version=$(python3 --version)
    echo "✅ Found: $python_version"
else
    echo "❌ Python3 not found. Please install Python 3.11 or higher."
    exit 1
fi

# Check if Docker is installed
echo "📋 Checking Docker installation..."
if command -v docker &> /dev/null; then
    docker_version=$(docker --version)
    echo "✅ Found: $docker_version"
else
    echo "❌ Docker not found. Please install Docker."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")"

# Create virtual environment for backend
echo "🐍 Creating Python virtual environment..."
cd backend

if [ -d "venv" ]; then
    echo "📁 Virtual environment already exists. Removing old one..."
    rm -rf venv
fi

python3 -m venv venv
echo "✅ Virtual environment created"

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ Python dependencies installed"

# Go back to project root
cd ..

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update with your actual values."
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"

# Go back to project root
cd ..

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your database and API keys"
echo "2. Start services with Docker: docker-compose up -d"
echo "3. Run database migrations: cd backend && source venv/bin/activate && alembic upgrade head"
echo "4. Start backend development: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "5. Start frontend development: cd frontend && npm run dev"
echo ""
echo "🐳 Docker commands:"
echo "- Start all services: docker-compose up -d"
echo "- View logs: docker-compose logs -f"
echo "- Stop services: docker-compose down"
echo "- Rebuild: docker-compose up --build"
