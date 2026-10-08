import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { getAdminSummary, getVisitorDashboard } from "./db";

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
    dashboard: adminProcedure
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
  admin: router({
    summary: adminProcedure.query(() => getAdminSummary()),
  }),
});

export type AppRouter = typeof appRouter;
