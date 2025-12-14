#!/bin/bash

# ECG Heart Prediction System - Start Script
# This script starts both frontend and backend servers

echo "🚀 Starting ECG Heart Prediction System..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Check if ports are already in use
if check_port 5000; then
    echo "⚠️  Warning: Port 5000 is already in use (Backend)"
fi

if check_port 8080; then
    echo "⚠️  Warning: Port 8080 is already in use (Frontend)"
fi

echo ""
echo "${BLUE}📂 Starting Backend Server...${NC}"
echo "   Location: ./backend"
echo "   Port: 5000"
echo ""

# Start backend in background
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

echo "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo ""
echo "${BLUE}📂 Starting Frontend Server...${NC}"
echo "   Location: ./frontend"
echo "   Port: 8080"
echo ""

# Start frontend in background
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 3

echo ""
echo "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 System is running!"
echo ""
echo "   Frontend: http://localhost:8080"
echo "   Backend:  http://localhost:5000"
echo ""
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop the servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   or press Ctrl+C"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Wait for user to stop
wait

