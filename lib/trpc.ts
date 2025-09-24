import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('Using configured API base URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // Fallback for development
  if (__DEV__) {
    console.warn('EXPO_PUBLIC_RORK_API_BASE_URL not set, using localhost fallback');
    console.log('🚨 Make sure to start the backend server with: bun run start-backend.ts');
    return 'http://localhost:8081';
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        // Input validation
        if (!url || typeof url !== 'string' || url.trim().length === 0) {
          throw new Error('Invalid URL provided to tRPC fetch');
        }
        if (url.length > 2000) {
          throw new Error('URL too long');
        }
        
        const sanitizedUrl = url.trim();
        
        console.log('=== tRPC Request ===');
        console.log('URL:', sanitizedUrl);
        console.log('Base URL:', getBaseUrl());
        console.log('Options:', options ? JSON.stringify(options, null, 2) : 'null');
        
        try {
          const response = await fetch(sanitizedUrl, {
            ...options,
            headers: {
              ...options?.headers,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('Response status:', response.status);
          console.log('Response headers:', Object.fromEntries(response.headers.entries()));
          
          if (!response.ok) {
            console.error('HTTP Error:', response.status, response.statusText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          return response;
        } catch (error) {
          console.error('=== tRPC Network Error ===');
          console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
          console.error('Error message:', error instanceof Error ? error.message : String(error));
          console.error('Full error:', error);
          
          // Provide more helpful error messages
          if (error instanceof Error && error.message.includes('Failed to fetch')) {
            throw new Error('Cannot connect to backend server. Please ensure the server is running on ' + getBaseUrl());
          }
          
          throw error;
        }
      },
    }),
  ],
});