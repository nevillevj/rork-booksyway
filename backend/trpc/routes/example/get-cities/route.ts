import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

const getCitiesSchema = z.object({
  query: z.string().min(1),
  countryCode: z.string().optional(),
  limit: z.number().min(1).max(50).default(10)
});

// Popular cities fallback data
const POPULAR_CITIES = [
  { id: 'NYC', name: 'New York', country: 'United States', countryCode: 'US' },
  { id: 'LON', name: 'London', country: 'United Kingdom', countryCode: 'GB' },
  { id: 'PAR', name: 'Paris', country: 'France', countryCode: 'FR' },
  { id: 'TYO', name: 'Tokyo', country: 'Japan', countryCode: 'JP' },
  { id: 'DXB', name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE' },
  { id: 'SIN', name: 'Singapore', country: 'Singapore', countryCode: 'SG' },
  { id: 'HKG', name: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK' },
  { id: 'BCN', name: 'Barcelona', country: 'Spain', countryCode: 'ES' },
  { id: 'ROM', name: 'Rome', country: 'Italy', countryCode: 'IT' },
  { id: 'AMS', name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL' },
  { id: 'BER', name: 'Berlin', country: 'Germany', countryCode: 'DE' },
  { id: 'MAD', name: 'Madrid', country: 'Spain', countryCode: 'ES' },
  { id: 'IST', name: 'Istanbul', country: 'Turkey', countryCode: 'TR' },
  { id: 'BKK', name: 'Bangkok', country: 'Thailand', countryCode: 'TH' },
  { id: 'SYD', name: 'Sydney', country: 'Australia', countryCode: 'AU' },
  { id: 'MEL', name: 'Melbourne', country: 'Australia', countryCode: 'AU' },
  { id: 'YYZ', name: 'Toronto', country: 'Canada', countryCode: 'CA' },
  { id: 'YVR', name: 'Vancouver', country: 'Canada', countryCode: 'CA' },
  { id: 'LAX', name: 'Los Angeles', country: 'United States', countryCode: 'US' },
  { id: 'CHI', name: 'Chicago', country: 'United States', countryCode: 'US' },
  { id: 'MIA', name: 'Miami', country: 'United States', countryCode: 'US' },
  { id: 'LAS', name: 'Las Vegas', country: 'United States', countryCode: 'US' },
  { id: 'SFO', name: 'San Francisco', country: 'United States', countryCode: 'US' },
  { id: 'BOS', name: 'Boston', country: 'United States', countryCode: 'US' },
  { id: 'WAS', name: 'Washington', country: 'United States', countryCode: 'US' },
  { id: 'SEA', name: 'Seattle', country: 'United States', countryCode: 'US' },
];

export const getCitiesProcedure = publicProcedure
  .input(getCitiesSchema)
  .query(async ({ input }) => {
    try {
      const apiKey = process.env.LiteAPI_Sandbox;
      
      // First, try local search as fallback
      const localMatches = POPULAR_CITIES
        .filter(city => 
          city.name.toLowerCase().includes(input.query.toLowerCase()) ||
          city.country.toLowerCase().includes(input.query.toLowerCase())
        )
        .slice(0, input.limit)
        .map(city => ({
          id: city.id,
          name: city.name,
          code: city.id,
          country: city.country,
          countryCode: city.countryCode,
          displayName: `${city.name}, ${city.country}`
        }));
      
      if (!apiKey) {
        console.log('No API key found, using local fallback cities');
        return {
          success: true,
          message: `Found ${localMatches.length} cities matching "${input.query}" (local search)`,
          data: {
            cities: localMatches,
            query: input.query,
            totalFound: localMatches.length,
            source: 'local',
            timestamp: new Date().toISOString()
          }
        };
      }

      // Try LiteAPI first with search parameter
      let searchParams = new URLSearchParams({
        limit: Math.min(input.limit * 2, 50).toString(), // Get more results to filter
        search: input.query
      });

      if (input.countryCode) {
        searchParams.append('countryCode', input.countryCode);
      }

      console.log('Trying LiteAPI cities search with params:', searchParams.toString());
      console.log('Search query:', input.query);

      let response = await fetch(`https://api.liteapi.travel/v3.0/data/cities?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      // If search parameter doesn't work, try without it
      if (!response.ok) {
        console.log('Search parameter failed, trying without search parameter');
        searchParams = new URLSearchParams({
          limit: '100' // Get more cities to filter locally
        });
        
        if (input.countryCode) {
          searchParams.append('countryCode', input.countryCode);
        }
        
        response = await fetch(`https://api.liteapi.travel/v3.0/data/cities?${searchParams.toString()}`, {
          method: 'GET',
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json'
          }
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LiteAPI cities error:', response.status, errorText);
        console.log('API failed, falling back to local search');
        
        return {
          success: true,
          message: `Found ${localMatches.length} cities matching "${input.query}" (API unavailable, using local search)`,
          data: {
            cities: localMatches,
            query: input.query,
            totalFound: localMatches.length,
            source: 'local_fallback',
            apiError: `${response.status}: ${errorText}`,
            timestamp: new Date().toISOString()
          }
        };
      }

      const data = await response.json();
      console.log('LiteAPI cities response structure:', {
        hasData: !!data.data,
        dataLength: data.data?.length || 0,
        firstCity: data.data?.[0],
        keys: Object.keys(data)
      });
      
      // Transform and filter API response
      const cities = data.data || data || [];
      let transformedCities = cities
        .map((city: any) => {
          // Handle different possible response formats
          const cityName = city.name || city.cityName || city.city_name || '';
          const countryName = city.country || city.countryName || city.country_name || '';
          
          return {
            id: city.id || city.cityId || city.city_id || `${cityName}-${countryName}`,
            name: cityName,
            code: city.code || city.cityCode || city.city_code,
            country: countryName,
            countryCode: city.countryCode || city.country_code,
            displayName: `${cityName}${countryName ? `, ${countryName}` : ''}`
          };
        })
        .filter((city: any) => city.name && city.name.trim() !== '') // Remove empty entries
        .filter((city: any) => 
          city.name.toLowerCase().includes(input.query.toLowerCase()) ||
          city.country.toLowerCase().includes(input.query.toLowerCase())
        ) // Filter by search query if API didn't do it
        .slice(0, input.limit); // Limit results

      // If API didn't return good results, combine with local matches
      if (transformedCities.length < 3 && localMatches.length > 0) {
        console.log('API results insufficient, combining with local matches');
        const combinedResults = [...transformedCities];
        
        // Add local matches that aren't already in API results
        for (const localCity of localMatches) {
          if (!combinedResults.some(apiCity => 
            apiCity.name.toLowerCase() === localCity.name.toLowerCase()
          )) {
            combinedResults.push(localCity);
          }
        }
        
        transformedCities = combinedResults.slice(0, input.limit);
      }

      return {
        success: true,
        message: `Found ${transformedCities.length} cities matching "${input.query}"`,
        debug: {
          rawDataLength: cities.length,
          searchQuery: input.query,
          apiEndpoint: `https://api.liteapi.travel/v3.0/data/cities?${searchParams.toString()}`,
          combinedWithLocal: transformedCities.length > cities.length
        },
        data: {
          cities: transformedCities,
          query: input.query,
          totalFound: transformedCities.length,
          source: 'api',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Cities search error:', error);
      
      // Fallback to local search on any error
      const localMatches = POPULAR_CITIES
        .filter(city => 
          city.name.toLowerCase().includes(input.query.toLowerCase()) ||
          city.country.toLowerCase().includes(input.query.toLowerCase())
        )
        .slice(0, input.limit)
        .map(city => ({
          id: city.id,
          name: city.name,
          code: city.id,
          country: city.country,
          countryCode: city.countryCode,
          displayName: `${city.name}, ${city.country}`
        }));
      
      return {
        success: true,
        message: `Found ${localMatches.length} cities matching "${input.query}" (error fallback)`,
        data: {
          cities: localMatches,
          query: input.query,
          totalFound: localMatches.length,
          source: 'error_fallback',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  });