#!/usr/bin/env bun
import app from "./backend/hono";

const port = process.env.PORT || 8081;

console.log(`🚀 Backend server starting on port ${port}`);
console.log(`📡 tRPC endpoint: http://localhost:${port}/api/trpc`);
console.log(`🏥 Health check: http://localhost:${port}/api`);

// Start the server first
const server = Bun.serve({
  fetch: app.fetch,
  port: Number(port),
  hostname: "0.0.0.0", // Allow connections from any IP
});

console.log(`✅ Backend server running on http://localhost:${port}`);
console.log(`🔗 Frontend should connect to: http://localhost:${port}/api/trpc`);
console.log(`🌐 Server accessible at: http://0.0.0.0:${port}`);

// Test the backend after server is running
setTimeout(async () => {
  try {
    const response = await fetch(`http://localhost:${port}/api`);
    const data = await response.json();
    console.log("✅ Backend health check passed:", data);
  } catch (error) {
    console.error("❌ Backend health check failed:", error);
  }
}, 1000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...');
  server.stop();
  process.exit(0);
});