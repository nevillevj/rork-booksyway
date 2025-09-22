import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import testLiteApiRoute from "./routes/example/test-lite-api/route";
import { searchHotelsProcedure } from "./routes/example/search-hotels/route";
import { getCitiesProcedure } from "./routes/example/get-cities/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
    testLiteApi: testLiteApiRoute,
    searchHotels: searchHotelsProcedure,
    getCities: getCitiesProcedure,
  }),
});

export type AppRouter = typeof appRouter;