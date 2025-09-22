import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

const getCitiesSchema = z.object({
  query: z.string().min(1),
  countryCode: z.string().optional(),
  limit: z.number().min(1).max(50).default(10)
});

export const getCitiesProcedure = publicProcedure
  .input(getCitiesSchema)
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

      // LiteAPI cities search endpoint
      const searchParams = new URLSearchParams({
        limit: input.limit.toString()
      });

      if (input.countryCode) {
        searchParams.append('countryCode', input.countryCode);
      }

      console.log('Searching cities with params:', searchParams.toString());

      const response = await fetch(`https://api.liteapi.travel/v3.0/data/cities?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LiteAPI cities error:', response.status, errorText);
        return {
          success: false,
          message: `Cities search failed with status: ${response.status}`,
          data: null,
          error: errorText
        };
      }

      const data = await response.json();
      console.log('LiteAPI cities response:', JSON.stringify(data, null, 2));
      
      // Filter cities by query and transform response
      const cities = data.data || data || [];
      const filteredCities = cities
        .filter((city: any) => 
          city.name?.toLowerCase().includes(input.query.toLowerCase()) ||
          city.cityName?.toLowerCase().includes(input.query.toLowerCase())
        )
        .map((city: any) => ({
          id: city.id || city.cityId,
          name: city.name || city.cityName,
          code: city.code || city.cityCode,
          country: city.country || city.countryName,
          countryCode: city.countryCode,
          displayName: `${city.name || city.cityName}, ${city.country || city.countryName}`
        }));

      return {
        success: true,
        message: `Found ${filteredCities.length} cities`,
        data: {
          cities: filteredCities,
          query: input.query,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Cities search error:', error);
      return {
        success: false,
        message: `Search error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null
      };
    }
  });