#!/usr/bin/env bun

// Test script to verify backend connectivity
import { trpcClient } from "./lib/trpc";

console.log("🧪 Testing backend connection...");

async function testBackend() {
  try {
    // Test the health endpoint first
    const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://localhost:8081';
    console.log(`🔍 Testing health endpoint: ${baseUrl}/api`);
    
    const healthResponse = await fetch(`${baseUrl}/api`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log("✅ Health endpoint working:", healthData);
    } else {
      console.error("❌ Health endpoint failed:", healthResponse.status, healthResponse.statusText);
      return;
    }

    // Test tRPC endpoint
    console.log(`🔍 Testing tRPC endpoint: ${baseUrl}/api/trpc`);
    
    const hiResult = await trpcClient.example.hi.mutate({ name: "Test User" });
    console.log("✅ tRPC hi mutation result:", hiResult);

    const testResult = await trpcClient.example.testLiteApi.query();
    console.log("✅ tRPC testLiteApi query result:", testResult);

    console.log("🎉 All backend tests passed!");
    
  } catch (error) {
    console.error("❌ Backend test failed:");
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Full error:", error);
    
    console.log("\n📋 Troubleshooting steps:");
    console.log("1. Make sure the backend server is running: bun run server.ts");
    console.log("2. Check if port 8081 is available");
    console.log("3. Verify the .env.local file has the correct EXPO_PUBLIC_RORK_API_BASE_URL");
    console.log("4. Try accessing http://localhost:8081/api in your browser");
  }
}

testBackend();