# Backend Connection Fix

## Problem
The error "Backend health check failed: TypeError: Failed to fetch" occurs because the backend server is not running.

## Solution

### Option 1: Start Backend and Frontend Together (Recommended)

For mobile development:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

For web development:
```bash
chmod +x start-dev-web.sh
./start-dev-web.sh
```

### Option 2: Start Backend and Frontend Separately

**Terminal 1 - Start Backend:**
```bash
chmod +x start-backend-only.sh
./start-backend-only.sh
```

**Terminal 2 - Start Frontend:**
```bash
# For mobile
bunx rork start -p x7vmy1fyrvp1vamwe8dap --tunnel

# For web
bunx rork start -p x7vmy1fyrvp1vamwe8dap --web --tunnel
```

### Option 3: Manual Backend Start

```bash
bun run server.ts
```

## Verification

1. Backend health check: http://localhost:8081/api
2. tRPC endpoint: http://localhost:8081/api/trpc

## Troubleshooting

If you still get connection errors:

1. **Check if port 8081 is available:**
   ```bash
   lsof -i :8081
   ```

2. **Kill any process using port 8081:**
   ```bash
   kill -9 $(lsof -t -i:8081)
   ```

3. **Check firewall settings** - ensure localhost connections are allowed

4. **Verify environment variables** - check that `.env.local` has:
   ```
   EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:8081
   ```

## Current Configuration

- Backend runs on: `http://localhost:8081`
- tRPC endpoint: `http://localhost:8081/api/trpc`
- Health check: `http://localhost:8081/api`
- Frontend connects to backend via the URL in `.env.local`