function reply(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export default async function handler(req: any, res: any) {
  const path = String(req.url || "").split("?")[0];
  if (!path.endsWith("/admin-dashboard")) return reply(res, 404, { ok: false, error: "Route not found" });
  if (req.method !== "GET") return reply(res, 405, { ok: false, error: "Method not allowed" });
  try {
    const { authenticateLocalRequest } = await import("../../server/_core/localAuth");
    const user = await authenticateLocalRequest(req);
    const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const isAdmin = Boolean(user && (user.role === "admin" || (adminEmail && String(user.email).toLowerCase() === adminEmail)));
    if (!user) return reply(res, 401, { ok: false, code: "UNAUTHORIZED", error: "يجب تسجيل الدخول أولًا." });
    if (!isAdmin) return reply(res, 403, { ok: false, code: "FORBIDDEN", error: "هذه المنطقة مخصصة للمدير فقط." });

    const url = new URL(req.url || "/api/trpc/admin-dashboard", "https://ofoq-egypt.vercel.app");
    const rawDays = Number(url.searchParams.get("days") || 30);
    const days = Number.isInteger(rawDays) ? Math.min(Math.max(rawDays, 1), 90) : 30;
    const rawEventType = url.searchParams.get("eventType") || undefined;
    const eventType = rawEventType === "visit" || rawEventType === "leave" ? rawEventType : undefined;
    const [{ getBlobVisitorDashboard, getBlobAdminSummary }] = await Promise.all([import("../../server/_core/blobAnalyticsStore")]);
    const [dashboard, summary] = await Promise.all([
      getBlobVisitorDashboard({ days, eventType, country: url.searchParams.get("country") || undefined, browser: url.searchParams.get("browser") || undefined }),
      getBlobAdminSummary(),
    ]);
    return reply(res, 200, { ok: true, dashboard, ...summary });
  } catch (error) {
    console.error("[Admin dashboard] request failed", error);
    return reply(res, 503, { ok: false, code: "SERVICE_UNAVAILABLE", error: "تعذر تحميل بيانات لوحة المدير من مخزن البيانات." });
  }
}
