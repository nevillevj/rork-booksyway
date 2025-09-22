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
      
      // Test with a simple hotel search to verify the API is working
      const searchUrl = 'https://api.liteapi.travel/v3.0/hotels/search';
      const testRequestData = {
        cityCode: 'NYC',
        checkin: '2024-12-01',
        checkout: '2024-12-03',
        occupancies: [
          {
            adults: 2,
            children: 0
          }
        ],
        currency: 'USD',
        guestNationality: 'US',
        limit: 5
      };
      
      console.log('Test request URL:', searchUrl);
      console.log('Test request data:', JSON.stringify(testRequestData, null, 2));
      
      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testRequestData)
      });
      
      console.log('Test response status:', response.status);
      console.log('Test response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Test response length:', responseText.length);
      console.log('Test response preview:', responseText.substring(0, 500));
      
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
            requestData: testRequestData,
            apiKeyPresent: !!apiKey,
            endpoint: searchUrl
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
            endpoint: searchUrl
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
            endpoint: searchUrl
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
        message: `LiteAPI connection successful! Found ${hotelsCount} hotels in test search.`,
        data: {
          status: response.status,
          hotelsFound: hotelsCount,
          responseStructure: Object.keys(data),
          apiKeyPresent: !!apiKey,
          endpoint: searchUrl,
          testRequestData: testRequestData,
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