#!/usr/bin/env bun

// Simple backend server startup
import app from "./backend/hono";

const port = process.env.PORT || 8081;

console.log(`🚀 Starting backend server on port ${port}...`);
console.log(`📡 tRPC endpoint will be: http://localhost:${port}/api/trpc`);
console.log(`🏥 Health check: http://localhost:${port}/api`);

// Start the server
const server = Bun.serve({
  port: Number(port),
  fetch: app.fetch,
  hostname: "0.0.0.0",
});

console.log(`✅ Backend server running on http://localhost:${port}`);

// Test the backend after server is running
setTimeout(async () => {
  console.log("🧪 Testing backend app...");
  try {
    const response = await fetch(`http://localhost:${port}/api`);
    const data = await response.json();
    console.log("✅ Backend health check:", data);
  } catch (error) {
    console.error("❌ Backend test failed:", error);
  }
}, 1000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...');
  server.stop();
  process.exit(0);
});