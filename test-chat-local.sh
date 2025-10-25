#!/bin/bash

# Test Chat Locally - Quick Start Script

set -e

echo "🧪 Growzone Chat - Local Test Setup"
echo "===================================="
echo ""

# Check if backend server is running
echo "1️⃣  Checking backend server..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "   ✅ Backend server is running on http://localhost:8000"
else
    echo "   ❌ Backend server is NOT running"
    echo ""
    echo "   Start it with:"
    echo "   cd backend/local-test"
    echo "   source venv/bin/activate"
    echo "   python3 simple_server.py"
    echo ""
    exit 1
fi

# Show server stats
echo ""
echo "2️⃣  Server Status:"
curl -s http://localhost:8000/health | jq
echo ""

# Ask user which platform to test
echo "3️⃣  Start mobile app:"
echo ""
echo "   Choose platform:"
echo "   1) Web (Browser) - Fastest"
echo "   2) iOS Simulator"
echo "   3) Android Emulator"
echo ""
read -p "   Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Starting web version..."
        echo ""
        echo "📍 App will open at: http://localhost:8081"
        echo "📍 Backend API at: http://localhost:8000"
        echo ""
        npm run web
        ;;
    2)
        echo ""
        echo "📱 Starting iOS Simulator..."
        echo ""
        npm run ios
        ;;
    3)
        echo ""
        echo "🤖 Starting Android Emulator..."
        echo ""
        npm run android
        ;;
    *)
        echo ""
        echo "❌ Invalid choice. Run the script again."
        exit 1
        ;;
esac
