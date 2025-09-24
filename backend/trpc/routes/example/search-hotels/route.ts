import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

const searchHotelsSchema = z.object({
  cityCode: z.string().min(1),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().min(1).default(2),
  children: z.number().min(0).default(0),
  rooms: z.number().min(1).default(1),
  currency: z.string().default('USD'),
  guestNationality: z.string().default('US'),
  limit: z.number().min(1).max(100).default(20)
});

// Helper function to convert city codes to city names
const getCityNameFromCode = (cityCode: string): string => {
  const codeToNameMapping: Record<string, string> = {
    'NYC': 'New York',
    'PAR': 'Paris',
    'LON': 'London',
    'TYO': 'Tokyo',
    'DXB': 'Dubai',
    'BCN': 'Barcelona',
    'ROM': 'Rome',
    'AMS': 'Amsterdam',
    'SYD': 'Sydney',
    'BKK': 'Bangkok',
    'LAX': 'Los Angeles',
    'SFO': 'San Francisco',
    'MIA': 'Miami',
    'CHI': 'Chicago',
    'BOS': 'Boston',
    'LAS': 'Las Vegas',
    'BER': 'Berlin',
    'MAD': 'Madrid',
    'VIE': 'Vienna',
    'PRG': 'Prague'
  };
  
  return codeToNameMapping[cityCode] || cityCode;
};

export const searchHotelsProcedure = publicProcedure
  .input(searchHotelsSchema)
  .query(async ({ input }) => {
    try {
      const apiKey = process.env.LiteAPI_Sandbox;
      
      if (!apiKey) {
        console.error('LiteAPI_Sandbox environment variable not found');
        return {
          success: false,
          message: "LiteAPI-Sandbox API key not found in environment variables",
          data: null
        };
      }

      console.log('=== LiteAPI Hotel Search Request ===');
      console.log('Input parameters:', input);
      console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
      
      // Build occupancies array
      const occupancies = [];
      for (let i = 0; i < input.rooms; i++) {
        occupancies.push({
          adults: Math.ceil(input.adults / input.rooms),
          children: i === 0 ? input.children : 0
        });
      }

      console.log('Generated occupancies:', occupancies);

      // Try multiple LiteAPI endpoints and request formats
      const searchEndpoints = [
        {
          url: 'https://api.liteapi.travel/v3.0/hotels/search',
          method: 'POST',
          body: {
            checkin: input.checkin,
            checkout: input.checkout,
            currency: input.currency,
            guestNationality: input.guestNationality,
            occupancies: occupancies,
            cityName: getCityNameFromCode(input.cityCode),
            limit: input.limit
          }
        },
        {
          url: 'https://api.liteapi.travel/v3.0/hotels',
          method: 'GET',
          params: {
            checkin: input.checkin,
            checkout: input.checkout,
            currency: input.currency,
            guestNationality: input.guestNationality,
            cityName: getCityNameFromCode(input.cityCode),
            adults: input.adults.toString(),
            children: input.children.toString(),
            rooms: input.rooms.toString(),
            limit: input.limit.toString()
          }
        },
        {
          url: 'https://api.liteapi.travel/v2.0/hotels',
          method: 'GET',
          params: {
            checkin: input.checkin,
            checkout: input.checkout,
            currency: input.currency,
            guestNationality: input.guestNationality,
            cityName: getCityNameFromCode(input.cityCode),
            adults: input.adults.toString(),
            children: input.children.toString(),
            rooms: input.rooms.toString()
          }
        }
      ];
      
      console.log('Trying multiple search endpoints:', searchEndpoints.map(e => `${e.method} ${e.url}`));
      
      let response: Response | null = null;
      let workingEndpoint = '';
      
      // Try each endpoint until one works
      for (const endpoint of searchEndpoints) {
        try {
          console.log(`\n=== Trying ${endpoint.method} ${endpoint.url} ===`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout per endpoint
          
          let fetchOptions: RequestInit;
          let fullUrl = endpoint.url;
          
          if (endpoint.method === 'GET' && endpoint.params) {
            // Filter out undefined values and ensure all values are strings
            const cleanParams: Record<string, string> = {};
            Object.entries(endpoint.params).forEach(([key, value]) => {
              if (value !== undefined) {
                cleanParams[key] = value;
              }
            });
            const queryParams = new URLSearchParams(cleanParams);
            fullUrl = `${endpoint.url}?${queryParams.toString()}`;
            console.log('GET URL:', fullUrl);
            
            fetchOptions = {
              method: 'GET',
              headers: {
                'X-API-Key': apiKey,
                'Accept': 'application/json',
                'User-Agent': 'BookingApp/1.0'
              },
              signal: controller.signal
            };
            // GET request configured
          } else {
            console.log('POST body:', JSON.stringify(endpoint.body, null, 2));
            
            fetchOptions = {
              method: 'POST',
              headers: {
                'X-API-Key': apiKey,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'BookingApp/1.0'
              },
              body: JSON.stringify(endpoint.body),
              signal: controller.signal
            };
            // POST request configured
          }
          
          const testResponse = await fetch(fullUrl, fetchOptions);
          clearTimeout(timeoutId);
          
          console.log(`Response from ${endpoint.url}: ${testResponse.status} ${testResponse.statusText}`);
          console.log('Response headers:', Object.fromEntries(testResponse.headers.entries()));
          
          // Check if we got a response (even if not ok)
          if (testResponse.status !== 0) {
            response = testResponse;
            workingEndpoint = fullUrl;
            break;
          }
        } catch (endpointError) {
          console.log(`Endpoint ${endpoint.url} failed:`, endpointError instanceof Error ? endpointError.message : String(endpointError));
        }
      }
      
      if (!response) {
        console.error('All search endpoints failed');
        console.error('No working endpoint found');
        
        // Return fallback data for network errors
        const fallbackHotels = [
          {
            id: 'fallback_1',
            name: `Sample Hotel in ${getCityNameFromCode(input.cityCode)}`,
            location: `${getCityNameFromCode(input.cityCode)}, Sample Location`,
            rating: 4.2,
            reviewCount: 156,
            price: 120,
            originalPrice: 150,
            imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80',
            amenities: ['wifi', 'parking', 'pool'],
            type: 'hotel' as const,
            distance: '1.2 km from center',
            isFavorite: false,
            isPopular: true,
            hasFreeCancellation: true,
            currency: input.currency
          },
          {
            id: 'fallback_2',
            name: `Premium Hotel ${getCityNameFromCode(input.cityCode)}`,
            location: `${getCityNameFromCode(input.cityCode)}, Downtown`,
            rating: 4.5,
            reviewCount: 89,
            price: 180,
            imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&q=80',
            amenities: ['wifi', 'gym', 'spa'],
            type: 'hotel' as const,
            distance: '0.8 km from center',
            isFavorite: false,
            isPopular: false,
            hasFreeCancellation: true,
            currency: input.currency
          },
          {
            id: 'fallback_3',
            name: `Business Hotel ${getCityNameFromCode(input.cityCode)}`,
            location: `${getCityNameFromCode(input.cityCode)}, Business District`,
            rating: 4.0,
            reviewCount: 234,
            price: 95,
            imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&q=80',
            amenities: ['wifi', 'parking', 'breakfast'],
            type: 'hotel' as const,
            distance: '2.1 km from center',
            isFavorite: false,
            isPopular: false,
            hasFreeCancellation: true,
            currency: input.currency
          }
        ];
        
        return {
          success: false,
          message: 'All API endpoints failed. Using sample data.',
          data: {
            hotels: fallbackHotels,
            totalCount: fallbackHotels.length,
            searchParams: {
              ...input,
              occupancies: occupancies
            },
            timestamp: new Date().toISOString(),
            fallback: true,
            debug: {
              networkError: 'All endpoints failed',
              testedEndpoints: searchEndpoints.map(e => `${e.method} ${e.url}`)
            }
          }
        };
      }
      
      // Response received successfully
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Handle response with better error handling
      let responseText: string;
      try {
        // Check if response body is readable
        if (!response.body) {
          console.error('Response body is null or undefined');
          return {
            success: false,
            message: 'API response body is empty',
            data: null,
            debug: {
              responseStatus: response.status,
              hasBody: !!response.body,
              bodyLocked: response.bodyUsed
            }
          };
        }

        // Try to read response as text with timeout
        const textPromise = response.text();
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Response reading timeout')), 15000);
        });
        
        responseText = await Promise.race([textPromise, timeoutPromise]);
        
      } catch (textError) {
        console.error('Error reading response text:', textError);
        
        // Return fallback data instead of failing completely
        const fallbackHotels = [
          {
            id: 'fallback_read_error_1',
            name: `Sample Hotel in ${getCityNameFromCode(input.cityCode)}`,
            location: `${getCityNameFromCode(input.cityCode)}, Sample Location`,
            rating: 4.2,
            reviewCount: 156,
            price: 120,
            originalPrice: 150,
            imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80',
            amenities: ['wifi', 'parking', 'pool'],
            type: 'hotel' as const,
            distance: '1.2 km from center',
            isFavorite: false,
            isPopular: true,
            hasFreeCancellation: true,
            currency: input.currency
          }
        ];
        
        return {
          success: false,
          message: `Failed to read API response: ${textError instanceof Error ? textError.message : 'Unknown error'}. Using sample data.`,
          data: {
            hotels: fallbackHotels,
            totalCount: fallbackHotels.length,
            searchParams: {
              ...input,
              occupancies: occupancies
            },
            timestamp: new Date().toISOString(),
            fallback: true,
            debug: {
              textError: textError instanceof Error ? textError.message : String(textError),
              responseStatus: response.status
            }
          }
        };
      }
      
      console.log('Raw response length:', responseText?.length || 0);
      console.log('Raw response preview:', responseText?.substring(0, 500) || 'No response text');
      
      // Additional validation
      if (typeof responseText !== 'string') {
        console.error('Response is not a string:', typeof responseText);
        return {
          success: false,
          message: 'API response is not valid text',
          data: null,
          debug: {
            responseType: typeof responseText,
            responseValue: String(responseText).substring(0, 100)
          }
        };
      }
      
      if (!response.ok) {
        console.error('HTTP Error:', response.status, response.statusText);
        console.error('Error response body:', responseText);
        
        return {
          success: false,
          message: `API Error ${response.status}: ${response.statusText}`,
          data: null,
          debug: {
            httpStatus: response.status,
            httpStatusText: response.statusText,
            responseBody: responseText.substring(0, 1000),
            workingEndpoint: workingEndpoint
          }
        };
      }
      
      if (!responseText || responseText.trim() === '') {
        console.error('Empty response received from API');
        return {
          success: false,
          message: 'Empty response from LiteAPI',
          data: null,
          debug: {
            responseLength: responseText.length,
            workingEndpoint: workingEndpoint
          }
        };
      }
      
      let data: any;
      try {
        // Better JSON parsing with validation
        const trimmedResponse = responseText.trim();
        
        // Check for common truncation patterns
        if (trimmedResponse.length > 0 && !trimmedResponse.endsWith('}') && !trimmedResponse.endsWith(']')) {
          console.error('Response appears to be truncated');
          console.error('Last 100 chars:', trimmedResponse.slice(-100));
          return {
            success: false,
            message: 'API response appears to be truncated (unexpected end of file)',
            data: null,
            debug: {
              responseLength: trimmedResponse.length,
              lastChars: trimmedResponse.slice(-100),
              startsWithBrace: trimmedResponse.startsWith('{'),
              endsWithBrace: trimmedResponse.endsWith('}'),
              workingEndpoint: workingEndpoint
            }
          };
        }
        
        if (!trimmedResponse.startsWith('{') && !trimmedResponse.startsWith('[')) {
          console.error('Response does not appear to be JSON:', trimmedResponse.substring(0, 200));
          return {
            success: false,
            message: 'API returned non-JSON response',
            data: null,
            debug: {
              responseText: trimmedResponse.substring(0, 1000),
              responseLength: trimmedResponse.length,
              workingEndpoint: workingEndpoint
            }
          };
        }
        
        data = JSON.parse(trimmedResponse);
        console.log('Successfully parsed API response');
        console.log('Response keys:', Object.keys(data));
        
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Failed to parse response:', responseText.substring(0, 500));
        
        return {
          success: false,
          message: `Failed to parse API response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`,
          data: null,
          debug: {
            parseError: parseError instanceof Error ? parseError.message : String(parseError),
            responseText: responseText.substring(0, 1000),
            responseLength: responseText.length,
            lastChars: responseText.slice(-50),
            workingEndpoint: workingEndpoint
          }
        };
      }
      
      // Check for API errors in response
      if (data.error || data.errors) {
        const errorMessage = data.error || (data.errors && data.errors[0]) || 'API returned an error';
        console.error('LiteAPI returned error:', errorMessage);
        return {
          success: false,
          message: `LiteAPI Error: ${errorMessage}`,
          data: null,
          debug: {
            apiError: data.error || data.errors,
            fullResponse: data
          }
        };
      }

      // Extract hotels from response
      let hotels: any[] = [];
      if (data.data && Array.isArray(data.data)) {
        hotels = data.data;
      } else if (Array.isArray(data)) {
        hotels = data;
      } else if (data.hotels && Array.isArray(data.hotels)) {
        hotels = data.hotels;
      } else {
        console.log('Unexpected response structure. Available keys:', Object.keys(data));
        console.log('Full response sample:', JSON.stringify(data, null, 2).substring(0, 1000));
        
        return {
          success: false,
          message: `Unexpected API response structure. Expected array of hotels.`,
          data: null,
          debug: {
            responseKeys: Object.keys(data),
            responseType: typeof data,
            responseSample: JSON.stringify(data, null, 2).substring(0, 500)
          }
        };
      }
      
      console.log(`Found ${hotels.length} hotels in API response`);
      
      // Transform hotels to our format
      const transformedHotels = hotels.map((hotel: any, index: number) => {
        if (!hotel || typeof hotel !== 'object') {
          console.warn(`Invalid hotel data at index ${index}:`, String(hotel).substring(0, 100));
          return null;
        }
        
        return {
          id: hotel.id || hotel.hotelId || hotel.hotel_id || `hotel_${index}`,
          name: hotel.name || hotel.hotelName || hotel.hotel_name || `Hotel ${index + 1}`,
          location: hotel.address ? 
            `${hotel.address.city || ''}, ${hotel.address.country || ''}`.trim().replace(/^,\s*/, '') :
            hotel.location || hotel.city || hotel.destination || 'Location not specified',
          rating: parseFloat(hotel.starRating || hotel.rating || hotel.star_rating || (4.0 + Math.random()).toFixed(1)),
          reviewCount: parseInt(hotel.reviewCount || hotel.review_count || Math.floor(Math.random() * 1000) + 100),
          price: parseFloat(hotel.price || hotel.rate || hotel.amount || Math.floor(Math.random() * 200) + 50),
          originalPrice: hotel.originalPrice || hotel.original_price,
          imageUrl: hotel.images?.[0]?.url || 
            hotel.image || 
            hotel.main_image ||
            `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80`,
          amenities: hotel.amenities || hotel.facilities || hotel.services || ['wifi', 'parking'],
          type: 'hotel' as const,
          distance: hotel.distance || `${(Math.random() * 5).toFixed(1)} km from center`,
          isFavorite: false,
          isPopular: Math.random() > 0.7,
          hasFreeCancellation: hotel.freeCancellation || hotel.free_cancellation || Math.random() > 0.5,
          currency: hotel.currency || input.currency
        };
      }).filter((hotel: any) => hotel !== null);

      console.log(`Successfully transformed ${transformedHotels.length} hotels`);

      return {
        success: true,
        message: `Found ${transformedHotels.length} hotels`,
        data: {
          hotels: transformedHotels,
          totalCount: data.totalCount || data.total || data.count || transformedHotels.length,
          searchParams: {
            ...input,
            occupancies: occupancies
          },
          timestamp: new Date().toISOString(),
          apiResponse: data
        }
      };
    } catch (error) {
      console.error('=== Hotel Search Error ===');
      console.error('Error details:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      
      return {
        success: false,
        message: `Search error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null,
        error: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          type: error instanceof Error ? error.constructor.name : typeof error
        }
      };
    }
  });