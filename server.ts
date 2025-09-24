#!/usr/bin/env bun
import app from "./backend/hono";

const port = process.env.PORT || 8081;

console.log(`🚀 Backend server starting on port ${port}`);
console.log(`📡 tRPC endpoint: http://localhost:${port}/api/trpc`);
console.log(`🏥 Health check: http://localhost:${port}/api`);

Bun.serve({
  fetch: app.fetch,
  port: Number(port),
});

console.log(`✅ Backend server running on http://localhost:${port}`);
console.log(`🔗 Frontend should connect to: http://localhost:${port}/api/trpc`);