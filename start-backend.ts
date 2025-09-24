#!/usr/bin/env bun

// Simple test script to verify backend works
import app from "./backend/hono";

console.log("🧪 Testing backend app...");

// Test the health endpoint
const testReq = new Request("http://localhost:8081/api", {
  method: "GET",
});

try {
  const response = await app.fetch(testReq);
  const data = await response.json();
  console.log("✅ Backend health check:", data);
} catch (error) {
  console.error("❌ Backend test failed:", error);
}

// Now start the server
const port = process.env.PORT || 8081;

console.log(`🚀 Starting backend server on port ${port}...`);
console.log(`📡 tRPC endpoint will be: http://localhost:${port}/api/trpc`);
console.log(`🏥 Health check: http://localhost:${port}/api`);

export default {
  port: Number(port),
  fetch: app.fetch,
};