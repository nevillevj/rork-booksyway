#!/bin/bash

echo "🚀 Starting backend server only..."
echo "📡 Server will run on: http://localhost:8081"
echo "🔗 tRPC endpoint: http://localhost:8081/api/trpc"
echo "🏥 Health check: http://localhost:8081/api"
echo ""

# Start the backend server
echo "🔧 Starting server..."
bun run server.ts