import { publicProcedure } from "@/backend/trpc/create-context";

export const testLiteApiProcedure = publicProcedure
  .query(async () => {
    try {
      const apiKey = process.env.LiteAPI_Sandbox;
      
      if (!apiKey) {
        return {
          success: false,
          message: "LiteAPI-Sandbox API key not found in environment variables",
          data: null
        };
      }

      console.log('=== LiteAPI Connection Test ===');
      console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
      

      // First try a simple GET request to test connectivity and authentication
      const testUrl = 'https://api.liteapi.travel/v3.0/data/countries';
      
      console.log('Test request URL:', testUrl);
      console.log('Using GET request to test basic connectivity');
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'Accept': 'application/json'
        }
      });
      
      console.log('Test response status:', response.status);
      console.log('Test response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Test response length:', responseText.length);
      console.log('Test response preview:', responseText.substring(0, 500));
      
      // Check if response is empty or truncated
      if (!responseText || responseText.length === 0) {
        console.error('Empty response received from LiteAPI test');
        return {
          success: false,
          message: 'Empty response from LiteAPI - possible API key or endpoint issue',
          data: {
            responseLength: 0,
            requestUrl: testUrl,
            httpStatus: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            apiKeyPresent: !!apiKey,
            endpoint: testUrl
          }
        };
      }
      
      if (!response.ok) {
        console.error('Test API error:', response.status, response.statusText);
        console.error('Error response body:', responseText);
        return {
          success: false,
          message: `LiteAPI Test Failed: ${response.status} ${response.statusText}`,
          data: {
            httpStatus: response.status,
            httpStatusText: response.statusText,
            responseBody: responseText.substring(0, 1000),
            requestUrl: testUrl,
            apiKeyPresent: !!apiKey,
            endpoint: testUrl
          }
        };
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Test response parsed successfully');
      } catch (parseError) {
        console.error('Failed to parse test response:', parseError);
        return {
          success: false,
          message: 'Failed to parse LiteAPI test response',
          data: {
            parseError: parseError instanceof Error ? parseError.message : String(parseError),
            responseText: responseText.substring(0, 1000),
            apiKeyPresent: !!apiKey,
            endpoint: testUrl
          }
        };
      }
      
      // Check for API errors
      if (data.error || data.errors) {
        const errorMessage = data.error || (data.errors && data.errors[0]) || 'API returned an error';
        console.error('LiteAPI returned error:', errorMessage);
        return {
          success: false,
          message: `LiteAPI Error: ${errorMessage}`,
          data: {
            apiError: data.error || data.errors,
            fullResponse: data,
            apiKeyPresent: !!apiKey,
            endpoint: testUrl
          }
        };
      }
      
      // Extract hotels count
      let hotelsCount = 0;
      if (data.data && Array.isArray(data.data)) {
        hotelsCount = data.data.length;
      } else if (Array.isArray(data)) {
        hotelsCount = data.length;
      } else if (data.hotels && Array.isArray(data.hotels)) {
        hotelsCount = data.hotels.length;
      }
      
      return {
        success: true,
        message: `LiteAPI connection successful! Test endpoint responded with data.`,
        data: {
          status: response.status,
          hotelsFound: hotelsCount,
          responseStructure: Object.keys(data),
          apiKeyPresent: !!apiKey,
          endpoint: testUrl,
          testRequestUrl: testUrl,
          sampleResponse: JSON.stringify(data, null, 2).substring(0, 1000)
        }
      };
    } catch (error) {
      console.error('=== LiteAPI Test Error ===');
      console.error('Error details:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      
      return {
        success: false,
        message: `Test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: {
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          apiKeyPresent: !!process.env.LiteAPI_Sandbox
        }
      };
    }
  });