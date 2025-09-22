import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import testLiteApiRoute from "./routes/example/test-lite-api/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
    testLiteApi: testLiteApiRoute,
  }),
});

export type AppRouter = typeof appRouter;