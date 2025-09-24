# Backend Setup and Troubleshooting

## Quick Start

1. **Start the backend server:**
   ```bash
   bun run server.ts
   ```

2. **Test the backend connection:**
   ```bash
   bun run test-backend.ts
   ```

3. **Start both frontend and backend (if you have concurrently):**
   ```bash
   # This would require adding to package.json scripts
   # concurrently "bun run server.ts" "bun start"
   ```

## Backend Endpoints

- **Health Check:** http://localhost:8081/api
- **tRPC Endpoint:** http://localhost:8081/api/trpc
- **Available tRPC Procedures:**
  - `example.hi` (mutation) - Test endpoint
  - `example.testLiteApi` (query) - LiteAPI connection test
  - `example.searchHotels` (query) - Hotel search
  - `example.getCities` (query) - City search

## Environment Variables

Make sure your `.env.local` file contains:
```
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:8081
LiteAPI_Sandbox=sand_9dc1fa68-005d-4430-8b62-01c42e1cff27
```

## Troubleshooting

### "Failed to fetch" Error

This usually means the backend server is not running. Solutions:

1. **Start the backend server:**
   ```bash
   bun run server.ts
   ```

2. **Check if port 8081 is available:**
   ```bash
   lsof -i :8081
   ```

3. **Test the health endpoint:**
   ```bash
   curl http://localhost:8081/api
   ```

### CORS Issues

The backend is configured to allow requests from:
- http://localhost:8081 (backend)
- http://localhost:19006 (Expo web)
- http://localhost:3000 (alternative web port)
- All origins (*) for development

### Network Connection Issues

1. **Check your network configuration**
2. **Try accessing the health endpoint in your browser:** http://localhost:8081/api
3. **Check the console logs in both frontend and backend**

### tRPC Connection Issues

1. **Verify the tRPC endpoint is accessible:** http://localhost:8081/api/trpc
2. **Check the browser network tab for failed requests**
3. **Look for CORS errors in the browser console**

## Development Workflow

1. **Terminal 1 - Backend:**
   ```bash
   bun run server.ts
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   bun start
   ```

3. **Terminal 3 - Testing (optional):**
   ```bash
   bun run test-backend.ts
   ```

## Backend Architecture

- **Framework:** Hono.js
- **API:** tRPC for type-safe APIs
- **CORS:** Enabled for development
- **Port:** 8081 (configurable via PORT env var)

## Files Structure

- `server.ts` - Main server startup script
- `backend/hono.ts` - Hono app configuration
- `backend/trpc/app-router.ts` - tRPC router setup
- `backend/trpc/routes/` - Individual tRPC procedures
- `lib/trpc.ts` - Frontend tRPC client configuration
- `test-backend.ts` - Backend connectivity test script