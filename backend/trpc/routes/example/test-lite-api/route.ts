import { publicProcedure } from "@/backend/trpc/create-context";

export default publicProcedure.query(async () => {
  try {
    const apiKey = process.env.LiteAPI_Sandbox;
    
    if (!apiKey) {
      return {
        success: false,
        message: "LiteAPI-Sandbox API key not found in environment variables",
        data: null
      };
    }

    // Test endpoint - get list of cities (simple GET request)
    const response = await fetch('https://api.liteapi.travel/v3.0/data/cities?countryCode=US&limit=5', {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        success: false,
        message: `API request failed with status: ${response.status}`,
        data: null
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      message: "LiteAPI connection successful!",
      data: {
        status: response.status,
        cities: data.data || data,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('LiteAPI test error:', error);
    return {
      success: false,
      message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: null
    };
  }
});