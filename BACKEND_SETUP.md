# Backend Setup Guide

## 🚀 Quick Fix for Connection Errors

**The error "Cannot connect to backend server" means the backend is not running.**

Here's how to fix it:

### 🔴 Step 1: Start the Backend Server

**Open a new terminal** and run:

```bash
# Option 1 (Recommended)
bun run start-backend.ts

# Option 2 (Alternative)
bun run backend-server.ts

# Option 3 (Shell script)
./start-server.sh
```

### ✅ Step 2: Verify It's Working

You should see this output:
```
🚀 Starting backend server on port 8081...
✅ Backend server running on http://localhost:8081
✅ Backend health check: { status: "ok", message: "API is running" }
```

### 📱 Step 3: Test in Your App

1. Go to the **Home tab** in your app
2. Scroll down to **"Network Diagnostics"**
3. Click **"Refresh"** - it should show "Backend Online"
4. Try the **"Test LiteAPI Connection"** button

## 🔧 What the Backend Does

- **Health Check**: `http://localhost:8081/api`
- **tRPC API**: `http://localhost:8081/api/trpc`
- **City Search**: Autocomplete for destinations
- **Hotel Search**: LiteAPI integration
- **CORS**: Enabled for web and mobile

## 🚫 Common Issues & Solutions

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
```

### Mobile device can't connect
Replace `localhost` with your computer's IP address:
```env
EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.1.100:8081
```

## 📝 Development Workflow

1. **Terminal 1**: Start backend
   ```bash
   bun run start-backend.ts
   ```

2. **Terminal 2**: Start React Native app
   ```bash
   bun start
   ```

3. **Keep both running** - The app needs the backend!

## 🔍 Quick Tests

| Test | Command | Expected Result |
|------|---------|----------------|
| Backend Health | `curl http://localhost:8081/api` | `{"status":"ok","message":"API is running"}` |
| Browser Test | Visit `http://localhost:8081/api` | JSON response |
| App Diagnostics | Check "Network Diagnostics" in app | "Backend Online" |

## 🆘 Environment Variables

Your `.env.local` should have:
```env
# LiteAPI Key
LiteAPI_Sandbox=sand_9dc1fa68-005d-4430-8b62-01c42e1cff27

# Backend URL
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:8081
```

---

**💡 Pro Tip**: Always start the backend first, then your React Native app. The app will show connection errors if the backend isn't running!