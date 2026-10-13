function reply(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export default async function handler(req: any, res: any) {
  const path = String(req.url || "").split("?")[0];
  if (path.endsWith("/content-articles") || path.includes("/admin-content-articles")) {
    try {
      const { loadArticleOverrides, saveArticleOverrides } = await import("../../server/_core/blobContentStore");
      const overrides = await loadArticleOverrides();
      if (req.method === "GET" && path.endsWith("/content-articles")) return reply(res, 200, { ok: true, overrides: Object.fromEntries(Object.entries(overrides).filter(([, value]) => value.status === "published")) });
      const { authenticateLocalRequest } = await import("../../server/_core/localAuth");
      const user = await authenticateLocalRequest(req as any);
      const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
      if (!user || !(user.role === "admin" || (adminEmail && String(user.email).toLowerCase() === adminEmail))) return reply(res, 403, { ok: false, error: "هذه المنطقة مخصصة للمدير فقط." });
      if (req.method === "GET") return reply(res, 200, { ok: true, overrides });
      if (req.method !== "PUT") return reply(res, 405, { ok: false, error: "Method not allowed" });
      const slug = String(path.split("/").pop() || "").trim();
      if (!/^[a-z0-9-]{2,80}$/.test(slug)) return reply(res, 400, { ok: false, error: "معرّف المقال غير صالح." });
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : undefined;
      overrides[slug] = { slug, title: clean(body.title, 220), titleEn: clean(body.titleEn, 220), lead: clean(body.lead, 600), leadEn: clean(body.leadEn, 600), seoTitle: clean(body.seoTitle, 220), seoDescription: clean(body.seoDescription, 320), status: body.status === "draft" ? "draft" : "published", updatedAt: new Date().toISOString(), updatedBy: user.email };
      await saveArticleOverrides(overrides);
      return reply(res, 200, { ok: true, override: overrides[slug] });
    } catch (error) { console.error("[CMS] request failed", error); return reply(res, 503, { ok: false, error: "تعذر الوصول إلى مخزن المحتوى." }); }
  }
  if (!path.endsWith("/admin-dashboard") && !path.endsWith("/admin/dashboard")) return reply(res, 404, { ok: false, error: "Route not found" });
  if (req.method !== "GET") return reply(res, 405, { ok: false, error: "Method not allowed" });
  try {
    const crypto = await import("node:crypto");
    const sessionCookie = String(req.headers?.cookie || "").split(";").map((item: string) => item.trim()).find((item: string) => item.startsWith("alsadd_session="))?.slice("alsadd_session=".length);
    let user: any = null;
    if (sessionCookie) {
      const token = decodeURIComponent(sessionCookie);
      const separator = token.lastIndexOf(".");
      const encoded = separator > 0 ? token.slice(0, separator) : "";
      const signature = separator > 0 ? token.slice(separator + 1) : "";
      const expected = crypto.createHmac("sha256", process.env.AUTH_SECRET || "alsadd-local-auth-development-only").update(encoded).digest("base64url");
      if (encoded && signature && signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        try {
          const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
          if (payload.userId && Number(payload.exp) > Date.now()) {
            const { loadUsers } = await import("../../server/_core/blobAuthStore");
            user = (await loadUsers()).find(item => Number(item.id) === Number(payload.userId)) ?? null;
          }
        } catch { user = null; }
      }
    }
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
