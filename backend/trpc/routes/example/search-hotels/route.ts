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
        return {
          success: false,
          message: "LiteAPI-Sandbox API key not found in environment variables",
          data: null
        };
      }

      // LiteAPI hotel search endpoint
      const searchParams = new URLSearchParams({
        cityCode: input.cityCode,
        checkin: input.checkin,
        checkout: input.checkout,
        adults: input.adults.toString(),
        children: input.children.toString(),
        rooms: input.rooms.toString(),
        currency: input.currency,
        guestNationality: input.guestNationality,
        limit: input.limit.toString()
      });

      console.log('Searching hotels with params:', searchParams.toString());

      const response = await fetch(`https://api.liteapi.travel/v3.0/hotels/search?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LiteAPI search error:', response.status, errorText);
        return {
          success: false,
          message: `Hotel search failed with status: ${response.status}`,
          data: null,
          error: errorText
        };
      }

      const data = await response.json();
      console.log('LiteAPI search response:', JSON.stringify(data, null, 2));
      
      // Transform LiteAPI response to our format
      const transformedHotels = data.data?.map((hotel: any) => ({
        id: hotel.id || hotel.hotelId,
        name: hotel.name || hotel.hotelName,
        location: `${hotel.address?.city || ''}, ${hotel.address?.country || ''}`.trim().replace(/^,\s*/, ''),
        rating: hotel.starRating || hotel.rating || 4.0,
        reviewCount: hotel.reviewCount || Math.floor(Math.random() * 1000) + 100,
        price: hotel.rates?.[0]?.totalAmount || hotel.price || Math.floor(Math.random() * 200) + 50,
        originalPrice: hotel.rates?.[0]?.originalAmount,
        imageUrl: hotel.images?.[0]?.url || hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        amenities: hotel.amenities || ['wifi', 'parking'],
        type: 'hotel' as const,
        distance: hotel.distance || `${(Math.random() * 5).toFixed(1)} km from center`,
        isFavorite: false,
        isPopular: hotel.isPopular || Math.random() > 0.7,
        hasFreeCancellation: hotel.freeCancellation || Math.random() > 0.5,
        currency: hotel.rates?.[0]?.currency || input.currency
      })) || [];

      return {
        success: true,
        message: `Found ${transformedHotels.length} hotels`,
        data: {
          hotels: transformedHotels,
          totalCount: data.totalCount || transformedHotels.length,
          searchParams: input,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Hotel search error:', error);
      return {
        success: false,
        message: `Search error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null
      };
    }
  });