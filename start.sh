#!/bin/bash

# Teacher Job Portal Startup Script

echo "🚀 Starting Teacher Job Portal..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   On macOS: brew services start mongodb-community"
    echo "   On Ubuntu: sudo systemctl start mongod"
    echo "   On Windows: net start MongoDB"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir -p uploads
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create one based on .env.example"
    echo "   Copy the .env file and update the values"
    exit 1
fi

# Start the server
echo "🌐 Starting server on port 5000..."
echo "📱 Frontend will be available at http://localhost:3000"
echo "🔧 Backend API will be available at http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start