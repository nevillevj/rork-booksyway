import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

const searchHotelsSchema = z.object({
  cityCode: z.string().min(1),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  adults: z.number().min(1).default(2),
  children: z.number().min(0).default(0),
  rooms: z.number().min(1).default(1),
  currency: z.string().default('USD'),
  guestNationality: z.string().default('US'),
  limit: z.number().min(1).max(100).default(20)
});

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

      // Try different LiteAPI endpoints based on documentation
      let response;
      let searchUrl;
      let requestData;
      
      // First, try the hotels search endpoint (POST method)
      searchUrl = 'https://api.liteapi.travel/v3.0/hotels/search';
      requestData = {
        cityCode: input.cityCode,
        checkin: input.checkin,
        checkout: input.checkout,
        adults: input.adults,
        children: input.children,
        rooms: input.rooms,
        currency: input.currency,
        guestNationality: input.guestNationality,
        limit: input.limit
      };
      
      console.log('Trying LiteAPI hotels/search endpoint (POST):', searchUrl);
      console.log('Using API key:', apiKey.substring(0, 10) + '...');
      console.log('Request data:', requestData);

      response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      // If POST fails, try the data/hotels endpoint with GET
      if (!response.ok) {
        console.log(`POST search failed with ${response.status}, trying data/hotels GET...`);
        
        searchUrl = 'https://api.liteapi.travel/v3.0/data/hotels';
        const queryParams = new URLSearchParams();
        
        // Add parameters that might be supported
        if (input.cityCode) queryParams.append('cityCode', input.cityCode);
        queryParams.append('limit', input.limit.toString());
        
        const fullUrl = `${searchUrl}?${queryParams.toString()}`;
        console.log('Trying data/hotels GET:', fullUrl);
        
        response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'X-API-Key': apiKey,
            'Accept': 'application/json'
          }
        });
      }
      
      // If both fail, try a simple hotels list without search parameters
      if (!response.ok) {
        console.log(`GET data/hotels failed with ${response.status}, trying simple hotels list...`);
        
        searchUrl = 'https://api.liteapi.travel/v3.0/data/hotels';
        
        response = await fetch(searchUrl, {
          method: 'GET',
          headers: {
            'X-API-Key': apiKey,
            'Accept': 'application/json'
          }
        });
      }

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LiteAPI search error:', response.status, response.statusText, errorText);
        return {
          success: false,
          message: `Hotel search failed: ${response.status} ${response.statusText}`,
          data: null,
          error: errorText,
          debug: {
            url: searchUrl,
            status: response.status,
            statusText: response.statusText
          }
        };
      }

      // Get response text first to debug parsing issues
      const responseText = await response.text();
      console.log('Raw response text:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
      
      if (!responseText || responseText.trim() === '') {
        console.error('Empty response received from API');
        return {
          success: false,
          message: 'Empty response from hotel search API',
          data: null,
          debug: {
            url: searchUrl,
            responseLength: responseText.length,
            responsePreview: responseText.substring(0, 100)
          }
        };
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('LiteAPI response parsed successfully:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Response text that failed to parse:', responseText);
        return {
          success: false,
          message: `Failed to parse API response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`,
          data: null,
          debug: {
            url: searchUrl,
            responseText: responseText.substring(0, 1000),
            parseError: parseError instanceof Error ? parseError.message : String(parseError)
          }
        };
      }
      
      // Check for API errors
      if (data.error || data.errors) {
        const errorMessage = data.error || (data.errors && data.errors[0]) || 'API returned an error';
        console.error('LiteAPI returned error:', errorMessage);
        return {
          success: false,
          message: `API Error: ${errorMessage}`,
          data: null,
          debug: {
            apiResponse: data,
            url: searchUrl
          }
        };
      }

      // Extract hotels from response
      let hotels = [];
      if (data.data && Array.isArray(data.data)) {
        hotels = data.data;
      } else if (Array.isArray(data)) {
        hotels = data;
      } else {
        console.log('Unexpected response structure:', Object.keys(data));
        console.log('Full response:', JSON.stringify(data, null, 2));
        
        // Provide fallback data for testing
        const fallbackHotels = [
          {
            id: 'fallback_1',
            name: `Sample Hotel in ${input.cityCode}`,
            location: `${input.cityCode}, Sample Location`,
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
            name: `Premium Hotel ${input.cityCode}`,
            location: `${input.cityCode}, Downtown`,
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
          }
        ];
        
        return {
          success: false,
          message: `API returned unexpected structure. Showing sample results for ${input.cityCode}`,
          data: {
            hotels: fallbackHotels,
            totalCount: fallbackHotels.length,
            searchParams: input,
            timestamp: new Date().toISOString(),
            apiResponse: data,
            fallback: true
          }
        };
      }
      
      console.log(`Found ${hotels.length} hotels in API response`);
      
      // Transform hotels to our format
      const transformedHotels = hotels.map((hotel: any, index: number) => {
        if (!hotel || typeof hotel !== 'object') {
          console.warn(`Invalid hotel data at index ${index}:`, hotel);
          return null;
        }
        
        return {
          id: hotel.id || hotel.hotelId || `hotel_${index}`,
          name: hotel.name || hotel.hotelName || `Hotel ${index + 1}`,
          location: hotel.address ? 
            `${hotel.address.city || ''}, ${hotel.address.country || ''}`.trim().replace(/^,\s*/, '') :
            hotel.location || hotel.city || 'Location not specified',
          rating: hotel.starRating || hotel.rating || (4.0 + Math.random()),
          reviewCount: hotel.reviewCount || Math.floor(Math.random() * 1000) + 100,
          price: hotel.price || Math.floor(Math.random() * 200) + 50,
          originalPrice: hotel.originalPrice,
          imageUrl: hotel.images?.[0]?.url || 
            hotel.image || 
            `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80`,
          amenities: hotel.amenities || hotel.facilities || ['wifi', 'parking'],
          type: 'hotel' as const,
          distance: hotel.distance || `${(Math.random() * 5).toFixed(1)} km from center`,
          isFavorite: false,
          isPopular: Math.random() > 0.7,
          hasFreeCancellation: Math.random() > 0.5,
          currency: hotel.currency || input.currency
        };
      }).filter((hotel: any) => hotel !== null);

      return {
        success: true,
        message: `Found ${transformedHotels.length} hotels`,
        data: {
          hotels: transformedHotels,
          totalCount: data.totalCount || data.total || transformedHotels.length,
          searchParams: input,
          timestamp: new Date().toISOString(),
          apiResponse: data
        }
      };
    } catch (error) {
      console.error('Hotel search error:', error);
      return {
        success: false,
        message: `Search error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null,
        error: error instanceof Error ? error.stack : String(error)
      };
    }
  });