import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { registerLocalAuthRoutes } from "../server/_core/localAuth";
import visitHandler from "./analytics/visit";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Vercel passes the catch-all function path through to the handler. Normalize it
// so the same route table works locally and in production.
app.use((req, _res, next) => {
  if (req.url.startsWith("/api/")) req.url = req.url.slice(4) || "/";
  next();
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.post("/analytics/visit", visitHandler);
// The catch-all function strips `/api`; register routes relative to the normalized path.
registerLocalAuthRoutes(app, "");
app.get("/admin/dashboard", async (req, res) => {
  try {
    const { authenticateLocalRequest } = await import("../server/_core/localAuth");
    const user = await authenticateLocalRequest(req as any);
    const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const isAdmin = Boolean(user && (user.role === "admin" || (adminEmail && String(user.email).toLowerCase() === adminEmail)));
    if (!user) return res.status(401).json({ ok: false, code: "UNAUTHORIZED", error: "يجب تسجيل الدخول أولًا." });
    if (!isAdmin) return res.status(403).json({ ok: false, code: "FORBIDDEN", error: "هذه المنطقة مخصصة للمدير فقط." });
    const url = new URL(req.originalUrl || req.url || "/admin/dashboard", "https://ofoq-egypt.vercel.app");
    const rawDays = Number(url.searchParams.get("days") || 30);
    const days = Number.isInteger(rawDays) ? Math.min(Math.max(rawDays, 1), 90) : 30;
    const rawEventType = url.searchParams.get("eventType") || undefined;
    const eventType = rawEventType === "visit" || rawEventType === "leave" ? rawEventType : undefined;
    const [{ getBlobVisitorDashboard, getBlobAdminSummary }] = await Promise.all([import("../server/_core/blobAnalyticsStore")]);
    const [dashboard, summary] = await Promise.all([
      getBlobVisitorDashboard({ days, eventType, country: url.searchParams.get("country") || undefined, browser: url.searchParams.get("browser") || undefined }),
      getBlobAdminSummary(),
    ]);
    return res.status(200).json({ ok: true, dashboard, ...summary });
  } catch (error) {
    console.error("[Admin dashboard] request failed", error);
    return res.status(503).json({ ok: false, code: "SERVICE_UNAVAILABLE", error: "تعذر تحميل بيانات لوحة المدير من مخزن البيانات." });
  }
});
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }) => createContext({ req, res } as any),
  }),
);

export default app;
