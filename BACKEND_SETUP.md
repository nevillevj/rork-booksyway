# Backend Server Setup

## Quick Fix for tRPC Connection Issues

The error you're seeing (`TypeError: Failed to fetch`) means the backend server isn't running. Here's how to fix it:

### Option 1: Start Backend Server (Recommended)

1. **Open a new terminal** in your project directory
2. **Run the backend server:**
   ```bash
   bun run backend-server.ts
   ```
3. **Keep this terminal open** - the server needs to stay running
4. **In another terminal**, start your React Native app as usual
5. **Test the connection** in the Search tab of your app

### Option 2: Alternative Backend Start

If the above doesn't work, try:
```bash
bun run start-backend.ts
```

### What Should Happen

When the backend starts successfully, you should see:
```
🚀 Starting backend server...
📡 Server will run on: http://localhost:8081
🔗 tRPC endpoint: http://localhost:8081/api/trpc
✅ Backend server is now running!
```

### Testing the Connection

1. Go to the **Search tab** in your app
2. Scroll down to **"API Connection Test"**
3. Click **"Test LiteAPI Connection"**
4. You should see a success message instead of network errors

### Troubleshooting

If you still get connection errors:

1. **Check if port 8081 is free:**
   ```bash
   lsof -i :8081
   ```

2. **Try a different port:**
   ```bash
   PORT=8082 bun run backend-server.ts
   ```
   Then update your `.env.local`:
   ```
   EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:8082
   ```

3. **Check your network:** Make sure you can access `http://localhost:8081/api` in your browser

### Current Setup

- **Backend:** Hono server with tRPC
- **Frontend:** React Native with Expo
- **API:** LiteAPI for hotel data
- **Database:** None (using mock data and API calls)

The backend provides:
- `/api` - Health check
- `/api/trpc` - tRPC endpoints
- City search with LiteAPI integration
- Hotel search functionality