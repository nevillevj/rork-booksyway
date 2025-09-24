#!/usr/bin/env bun

// Backend Server Startup Script
import app from "./backend/hono";

const port = process.env.PORT || 8081;

console.log("🚀 Starting backend server...");
console.log(`📡 Server will run on: http://localhost:${port}`);
console.log(`🔗 tRPC endpoint: http://localhost:${port}/api/trpc`);
console.log(`🏥 Health check: http://localhost:${port}/api`);
console.log("");

// Test the app first
console.log("🧪 Testing backend routes...");

try {
  // Test health endpoint
  const healthReq = new Request("http://localhost:8081/api", {
    method: "GET",
  });
  
  const healthResponse = await app.fetch(healthReq);
  const healthData = await healthResponse.json();
  console.log("✅ Health endpoint working:", healthData);
  
  console.log("✅ Backend app is ready!");
} catch (error) {
  console.error("❌ Backend test failed:", error);
  console.log("⚠️  Continuing with server startup anyway...");
}

console.log("");
console.log("🎯 Starting server...");

// Start the server
export default {
  port: Number(port),
  fetch: app.fetch,
};

console.log(`✅ Backend server is now running!`);
console.log(`🌐 Visit: http://localhost:${port}/api`);
console.log(`📱 Your React Native app should now be able to connect.`);
console.log("");
console.log("📋 Next steps:");
console.log("1. Keep this terminal open (backend server)");
console.log("2. In another terminal, run your React Native app");
console.log("3. Test the API connection in the Search tab");
console.log("");