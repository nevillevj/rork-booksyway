# 🚨 Backend Connection Fix

## The Problem
You're seeing these errors because **the backend server is not running**:
- `TypeError: Failed to fetch`
- `Cannot connect to backend server`
- `Cities query error`
- `tRPC Network Error`

## ✅ Quick Fix (2 Steps)

### Step 1: Start the Backend Server

**Open a new terminal** and run:

```bash
bun run start-backend.ts
```

**You should see this output:**
```
🚀 Starting backend server on port 8081...
✅ Backend server running on http://localhost:8081
✅ Backend health check: { status: "ok", message: "API is running" }
```

### Step 2: Test the Connection

1. **Keep the backend terminal open**
2. **In your app**, scroll down to "Network Diagnostics"
3. **Click "Refresh"** - it should show "Backend Online"
4. **Try the search** - autocomplete should now work

## 🔧 Alternative Commands

If the first command doesn't work, try:

```bash
# Option 2
bun run backend-server.ts

# Option 3
bun run server.ts

# Option 4
./start-server.sh
```

## 🚫 Common Issues

### "Port 8081 already in use"
```bash
# Use a different port
PORT=8082 bun run start-backend.ts
```
Then update `.env.local`:
```env
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:8082
```

### "Bun command not found"
```bash
# Install Bun first
curl -fsSL https://bun.sh/install | bash
# Then restart your terminal
```

### Mobile device testing
Replace `localhost` with your computer's IP:
```env
EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.1.100:8081
```

## 🧪 Quick Tests

| Test | How | Expected Result |
|------|-----|----------------|
| Backend Health | Visit `http://localhost:8081/api` | `{"status":"ok"}` |
| App Diagnostics | Check "Network Diagnostics" | "Backend Online" |
| API Connection | Click "Test LiteAPI Connection" | Success message |
| Autocomplete | Type in search box | City suggestions appear |

## 📋 Development Workflow

**Always run these in order:**

1. **Terminal 1** (Backend):
   ```bash
   bun run start-backend.ts
   ```

2. **Terminal 2** (React Native):
   ```bash
   bun start
   ```

3. **Keep both terminals open** while developing

## 🔍 Environment Check

Your `.env.local` should have:
```env
LiteAPI_Sandbox=sand_9dc1fa68-005d-4430-8b62-01c42e1cff27
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:8081
```

## 📡 Backend Endpoints

- **Health Check:** http://localhost:8081/api
- **tRPC Endpoint:** http://localhost:8081/api/trpc
- **Available APIs:**
  - `example.hi` - Test endpoint
  - `example.testLiteApi` - LiteAPI connection test
  - `example.searchHotels` - Hotel search
  - `example.getCities` - City autocomplete

## 🔧 Backend Architecture

- **Framework:** Hono.js
- **API:** tRPC for type-safe APIs
- **CORS:** Enabled for development
- **Port:** 8081 (configurable via PORT env var)

---

**💡 Remember**: The app **cannot work** without the backend server running. Always start the backend first!