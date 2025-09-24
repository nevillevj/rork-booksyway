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
      
      // Build occupancies array according to LiteAPI format
      const occupancies = [];
      for (let i = 0; i < input.rooms; i++) {
        occupancies.push({
          adults: Math.ceil(input.adults / input.rooms),
          children: i === 0 ? input.children : 0
        });
      }

      console.log('Generated occupancies:', occupancies);

      // First test basic API connectivity
      console.log('Testing basic API connectivity first...');
      try {
        const testResponse = await fetch('https://api.liteapi.travel/v3.0/data/countries', {
          method: 'GET',
          headers: {
            'X-API-Key': apiKey,
            'Accept': 'application/json'
          }
        });
        console.log('Basic API test response:', testResponse.status, testResponse.statusText);
        if (testResponse.ok) {
          const testData = await testResponse.text();
          console.log('Basic API test data length:', testData.length);
          console.log('Basic API test data preview:', testData.substring(0, 200));
        }
      } catch (testError) {
        console.error('Basic API test failed:', testError);
      }
      
      // Try different LiteAPI hotel search endpoints with simpler request format
      const searchEndpoints = [
        {
          url: 'https://api.liteapi.travel/v3.0/hotels/search',
          method: 'POST' as const,
          body: {
            checkin: input.checkin,
            checkout: input.checkout,
            currency: input.currency,
            guestNationality: input.guestNationality,
            occupancies: occupancies,
            cityName: getCityNameFromCode(input.cityCode)
          }
        },
        {
          url: 'https://api.liteapi.travel/v2.0/hotels/search',
          method: 'POST' as const,
          body: {
            checkin: input.checkin,
            checkout: input.checkout,
            currency: input.currency,
            guestNationality: input.guestNationality,
            occupancies: occupancies,
            cityName: getCityNameFromCode(input.cityCode)
          }
        }
      ];
      
      console.log('Trying multiple search endpoints:', searchEndpoints.map(e => e.url));
      
      let response: Response | null = null;
      let workingEndpoint = '';
      
      // Try each endpoint until one works
      for (const searchEndpoint of searchEndpoints) {
        try {
          console.log(`\nTrying: ${searchEndpoint.url}`);
          console.log('Request body:', JSON.stringify(searchEndpoint.body, null, 2));
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout per endpoint
          
          const testResponse = await fetch(searchEndpoint.url, {
            method: 'POST',
            headers: {
              'X-API-Key': apiKey,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'User-Agent': 'BookingApp/1.0'
            },
            body: JSON.stringify(searchEndpoint.body),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          console.log(`Response from ${searchEndpoint.url}: ${testResponse.status} ${testResponse.statusText}`);
          console.log('Response headers:', Object.fromEntries(testResponse.headers.entries()));
          
          // Accept any response (even errors) to debug
          response = testResponse;
          workingEndpoint = searchEndpoint.url;
          break;
          
        } catch (endpointError) {
          console.error(`Endpoint ${searchEndpoint.url} failed:`, endpointError instanceof Error ? endpointError.message : String(endpointError));
        }
      }
      
      if (!response) {
        console.error('All search endpoints failed');
        
        // Return fallback data for network errors
        const fallbackHotels = [
          {
            id: 'fallback_network_1',
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
          message: 'All search endpoints failed. Using sample data.',
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
              testedEndpoints: searchEndpoints.map(e => e.url)
            }
          }
        };
      }

      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Handle response
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, response.statusText);
        console.error('Error response body:', errorText);
        
        return {
          success: false,
          message: `API Error ${response.status}: ${response.statusText}`,
          data: null,
          debug: {
            httpStatus: response.status,
            httpStatusText: response.statusText,
            responseBody: errorText.substring(0, 1000)
          }
        };
      }
      
      let responseText: string;
      try {
        responseText = await response.text();
      } catch (textError) {
        console.error('Error reading response text:', textError);
        return {
          success: false,
          message: `Failed to read API response: ${textError instanceof Error ? textError.message : 'Unknown error'}`,
          data: null,
          debug: {
            textError: textError instanceof Error ? textError.message : String(textError),
            responseStatus: response.status
          }
        };
      }
      
      console.log('Raw response length:', responseText?.length || 0);
      console.log('Raw response preview:', responseText?.substring(0, 500) || 'No response text');
      
      if (!responseText || responseText.trim() === '') {
        console.error('Empty response received from API');
        return {
          success: false,
          message: 'Empty response from LiteAPI',
          data: null,
          debug: {
            responseLength: responseText?.length || 0
          }
        };
      }
      
      let data: any;
      try {
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
              endsWithBrace: trimmedResponse.endsWith('}')
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
              responseLength: trimmedResponse.length
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
            lastChars: responseText.slice(-50)
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

      // Extract hotels from response - LiteAPI typically returns data in 'data' field
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
        
        // Return fallback data instead of failing
        const fallbackHotels = [
          {
            id: 'fallback_structure_1',
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
          message: `Unexpected API response structure. Using sample data.`,
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
              responseKeys: Object.keys(data),
              responseType: typeof data,
              responseSample: JSON.stringify(data, null, 2).substring(0, 500)
            }
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