#!/bin/bash

echo "🚀 Starting development environment..."
echo "📡 Backend will run on: http://localhost:8081"
echo "🔗 tRPC endpoint: http://localhost:8081/api/trpc"
echo "📱 Frontend will start after backend is ready"
echo ""

# Function to check if backend is ready
check_backend() {
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:8081/api > /dev/null 2>&1; then
            echo "✅ Backend is ready!"
            return 0
        fi
        echo "⏳ Waiting for backend... (attempt $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    echo "❌ Backend failed to start after $max_attempts attempts"
    return 1
}

# Start backend in background
echo "🔧 Starting backend server..."
bun run server.ts &
BACKEND_PID=$!

# Wait for backend to be ready
if check_backend; then
    echo "🎯 Starting frontend..."
    bunx rork start -p x7vmy1fyrvp1vamwe8dap --tunnel
else
    echo "❌ Could not start frontend - backend is not responding"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Cleanup on exit
trap 'kill $BACKEND_PID 2>/dev/null' EXIT