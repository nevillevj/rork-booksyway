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
      

      // Try multiple endpoints to find one that works
      const testEndpoints = [
        'https://api.liteapi.travel/v3.0/data/countries',
        'https://api.liteapi.travel/v3.0/data/cities',
        'https://api.liteapi.travel/v3.0/data/currencies'
      ];
      
      let testUrl = testEndpoints[0];
      
      console.log('Testing multiple endpoints:', testEndpoints);
      
      let response: Response | null = null;
      let workingEndpoint = '';
      
      // Try each endpoint until one works
      for (const endpoint of testEndpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          
          const testResponse = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'X-API-Key': apiKey,
              'Accept': 'application/json',
              'User-Agent': 'BookingApp/1.0'
            },
            signal: AbortSignal.timeout(10000) // 10 second timeout per endpoint
          });
          
          console.log(`Response from ${endpoint}: ${testResponse.status}`);
          
          if (testResponse.ok) {
            response = testResponse;
            workingEndpoint = endpoint;
            testUrl = endpoint;
            break;
          } else {
            console.log(`Endpoint ${endpoint} returned ${testResponse.status}: ${testResponse.statusText}`);
            const errorText = await testResponse.text();
            console.log(`Error response: ${errorText.substring(0, 200)}`);
          }
        } catch (endpointError) {
          console.log(`Endpoint ${endpoint} failed:`, endpointError instanceof Error ? endpointError.message : String(endpointError));
        }
      }
      
      if (!response) {
        return {
          success: false,
          message: 'All test endpoints failed',
          data: {
            testedEndpoints: testEndpoints,
            apiKeyPresent: !!apiKey,
            apiKeyPrefix: apiKey.substring(0, 10) + '...'
          }
        };
      }
      
      console.log(`Successfully connected to: ${workingEndpoint}`);
      
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
        message: `LiteAPI connection successful! Connected to: ${workingEndpoint}`,
        data: {
          status: response.status,
          workingEndpoint: workingEndpoint,
          dataCount: hotelsCount,
          responseStructure: Object.keys(data),
          apiKeyPresent: !!apiKey,
          apiKeyPrefix: apiKey.substring(0, 10) + '...',
          testedEndpoints: testEndpoints,
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