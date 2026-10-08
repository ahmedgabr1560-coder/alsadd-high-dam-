import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getVisitorDashboard } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  visitors: router({
    dashboard: protectedProcedure
      .input(
        z.object({
          days: z.number().int().min(1).max(90).default(30),
          eventType: z.enum(["visit", "leave"]).optional(),
          country: z.string().trim().min(1).max(64).optional(),
          browser: z.string().trim().min(1).max(64).optional(),
        }),
      )
      .query(({ input }) => getVisitorDashboard(input)),
  }),
});

export type AppRouter = typeof appRouter;
