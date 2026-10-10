function reply(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return reply(res, 405, { ok: false, error: "Method not allowed" });
  try {
    const { authenticateLocalRequest } = await import("../../server/_core/localAuth");
    const user = await authenticateLocalRequest(req);
    const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const isAdmin = Boolean(user && (user.role === "admin" || (adminEmail && String(user.email).toLowerCase() === adminEmail)));
    if (!user) return reply(res, 401, { ok: false, code: "UNAUTHORIZED", error: "يجب تسجيل الدخول أولًا." });
    if (!isAdmin) return reply(res, 403, { ok: false, code: "FORBIDDEN", error: "هذه المنطقة مخصصة للمدير فقط." });

    const url = new URL(req.url || "/api/admin/dashboard", "https://ofoq-egypt.vercel.app");
    const daysValue = Number(url.searchParams.get("days") || 30);
    const days = Number.isInteger(daysValue) ? Math.min(Math.max(daysValue, 1), 90) : 30;
    const eventTypeValue = url.searchParams.get("eventType") || undefined;
    const eventType = eventTypeValue === "visit" || eventTypeValue === "leave" ? eventTypeValue : undefined;
    const country = url.searchParams.get("country") || undefined;
    const browser = url.searchParams.get("browser") || undefined;
    const [{ getBlobVisitorDashboard, getBlobAdminSummary }] = await Promise.all([
      import("../../server/_core/blobAnalyticsStore"),
    ]);
    const [dashboard, summary] = await Promise.all([
      getBlobVisitorDashboard({ days, eventType, country, browser }),
      getBlobAdminSummary(),
    ]);
    return reply(res, 200, { ok: true, dashboard, ...summary });
  } catch (error) {
    console.error("[Admin dashboard] request failed", error);
    return reply(res, 503, { ok: false, code: "SERVICE_UNAVAILABLE", error: "تعذر تحميل بيانات لوحة المدير من مخزن البيانات." });
  }
}
