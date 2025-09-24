import { publicProcedure } from "@/backend/trpc/create-context";
import crypto from 'crypto';

// Helper function to create LiteAPI authorization signature
function createLiteApiAuth(publicKey: string, privateKey: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHmac('sha512', privateKey)
    .update(publicKey + privateKey + timestamp)
    .digest('hex');
  
  return {
    authorization: `PublicKey=${publicKey},Signature=${signature},Timestamp=${timestamp}`,
    timestamp
  };
}

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
      
      // Try different authentication methods for sandbox
      let headers: Record<string, string>;
      
      if (apiKey.startsWith('sand_')) {
        // For sandbox keys, try simple API key authentication first
        console.log('Using simple API key authentication for sandbox');
        headers = {
          'X-API-Key': apiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        };
      } else {
        // For production keys, use signature authentication
        let publicKey: string;
        let privateKey: string;
        
        if (apiKey.includes(':')) {
          // Format: public_key:private_key
          const [pub, priv] = apiKey.split(':');
          publicKey = pub;
          privateKey = priv;
        } else {
          // Single key format
          publicKey = apiKey;
          privateKey = apiKey;
        }
        
        console.log('Public Key:', publicKey);
        console.log('Private Key (first 10 chars):', privateKey.substring(0, 10) + '...');
        
        // Create secure authorization
        const auth = createLiteApiAuth(publicKey, privateKey);
        console.log('Authorization header created');
        
        headers = {
          'Authorization': auth.authorization,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        };
      }
      
      // Test with the correct LiteAPI endpoint - use v3.0 version with POST method
      const searchUrl = 'https://api.liteapi.travel/v3.0/hotels/search';
      
      // Build occupancies array - mandatory parameter for LiteAPI
      const occupancies = [{
        adults: 2,
        children: 0
      }];
      
      const requestBody = {
        cityCode: 'NYC',
        checkin: '2024-12-01',
        checkout: '2024-12-03',
        currency: 'USD',
        guestNationality: 'US',
        occupancies: occupancies,
        limit: 10
      };
      
      console.log('Test request URL:', searchUrl);
      console.log('Test request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(searchUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
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
            requestUrl: searchUrl,
            httpStatus: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            apiKeyPresent: !!apiKey,
            endpoint: searchUrl
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
            requestUrl: searchUrl,
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
          testRequestUrl: searchUrl,
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