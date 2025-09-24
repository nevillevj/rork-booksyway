#!/usr/bin/env bun

// Backend Server Startup Script
import app from "./backend/hono";

const port = process.env.PORT || 8081;

console.log("🚀 Starting backend server...");
console.log(`📡 Server will run on: http://localhost:${port}`);
console.log(`🔗 tRPC endpoint: http://localhost:${port}/api/trpc`);
console.log(`🏥 Health check: http://localhost:${port}/api`);
console.log("");

console.log("🎯 Starting server...");

// Start the server
const server = Bun.serve({
  port: Number(port),
  fetch: app.fetch,
  hostname: "0.0.0.0",
});

console.log(`✅ Backend server is now running!`);
console.log(`🌐 Visit: http://localhost:${port}/api`);
console.log(`📱 Your React Native app should now be able to connect.`);
console.log("");

// Test the backend after server is running
setTimeout(async () => {
  console.log("🧪 Testing backend routes...");
  try {
    const response = await fetch(`http://localhost:${port}/api`);
    const data = await response.json();
    console.log("✅ Health endpoint working:", data);
    console.log("✅ Backend app is ready!");
  } catch (error) {
    console.error("❌ Backend test failed:", error);
  }
}, 1000);

console.log("📋 Next steps:");
console.log("1. Keep this terminal open (backend server)");
console.log("2. In another terminal, run your React Native app");
console.log("3. Test the API connection in the Search tab");
console.log("");

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...');
  server.stop();
  process.exit(0);
});