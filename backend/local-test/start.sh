#!/bin/bash

# Growzone Chat Local Test - Quick Start Script

set -e

echo "🚀 Starting Growzone Chat Local Test Environment..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Start PostgreSQL
echo "1️⃣  Starting PostgreSQL database..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "2️⃣  Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "3️⃣  Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "4️⃣  Installing Python dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next step: Start the FastAPI server"
echo ""
echo "Run:"
echo "  source venv/bin/activate"
echo "  uvicorn main:app --reload --port 8000"
echo ""
echo "Then open: http://localhost:8000"
echo ""
