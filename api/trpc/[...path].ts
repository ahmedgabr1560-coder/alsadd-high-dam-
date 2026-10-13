function reply(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export default async function handler(req: any, res: any) {
  const path = String(req.url || "").split("?")[0];
  if (path.endsWith("/admin-session")) {
    const { authenticateAdminRequest } = await import("../../server/_core/adminAuth");
    const user = await authenticateAdminRequest(req);
    if (!user) return reply(res, 401, { ok: false, user: null });
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return reply(res, 200, { ok: true, user: safeUser });
  }
  if (path.endsWith("/admin-logout")) {
    res.setHeader("Set-Cookie", "ofoq_admin_session=; HttpOnly; Path=/; SameSite=Lax; Secure; Max-Age=0");
    return reply(res, 200, { ok: true });
  }
  if (path.endsWith("/admin-login")) {
    if (req.method !== "POST") return reply(res, 405, { ok: false, error: "Method not allowed" });
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || password.length < 8) return reply(res, 400, { ok: false, error: "أدخل بريد المدير وكلمة المرور." });
    const { adminLogin, createAdminSession } = await import("../../server/_core/adminAuth");
    const user = await adminLogin(email, password);
    if (!user) return reply(res, 401, { ok: false, error: "بيانات دخول المدير غير صحيحة." });
    res.setHeader("Set-Cookie", `ofoq_admin_session=${createAdminSession(user.id)}; HttpOnly; Path=/; SameSite=Lax; Secure; Max-Age=28800`);
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return reply(res, 200, { ok: true, user: safeUser });
  }
  if (path.endsWith("/content-articles") || path.includes("/admin-content-articles")) {
    try {
      const { loadArticleOverrides, saveArticleOverrides } = await import("../../server/_core/blobContentStore");
      const overrides = await loadArticleOverrides();
      if (req.method === "GET" && path.endsWith("/content-articles")) return reply(res, 200, { ok: true, overrides: Object.fromEntries(Object.entries(overrides).filter(([, value]) => value.status === "published")) });
      const { authenticateAdminRequest } = await import("../../server/_core/adminAuth");
      const user = await authenticateAdminRequest(req as any);
      if (!user) return reply(res, 403, { ok: false, error: "هذه المنطقة مخصصة للمدير فقط." });
      if (req.method === "GET") return reply(res, 200, { ok: true, overrides });
      if (req.method !== "PUT") return reply(res, 405, { ok: false, error: "Method not allowed" });
      const slug = String(path.split("/").pop() || "").trim();
      if (!/^[a-z0-9-]{2,80}$/.test(slug)) return reply(res, 400, { ok: false, error: "معرّف المقال غير صالح." });
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : undefined;
      overrides[slug] = { slug, title: clean(body.title, 220), titleEn: clean(body.titleEn, 220), lead: clean(body.lead, 600), leadEn: clean(body.leadEn, 600), seoTitle: clean(body.seoTitle, 220), seoDescription: clean(body.seoDescription, 320), status: body.status === "draft" ? "draft" : "published", updatedAt: new Date().toISOString(), updatedBy: user.email };
      await saveArticleOverrides(overrides);
      return reply(res, 200, { ok: true, override: overrides[slug] });
    } catch (error) { console.error("[CMS] request failed", error); if (req.method === "GET" && path.endsWith("/content-articles")) return reply(res, 200, { ok: true, overrides: {} }); return reply(res, 503, { ok: false, error: "تعذر الوصول إلى مخزن المحتوى." }); }
  }
  if (!path.endsWith("/admin-dashboard") && !path.endsWith("/admin/dashboard")) return reply(res, 404, { ok: false, error: "Route not found" });
  if (req.method !== "GET") return reply(res, 405, { ok: false, error: "Method not allowed" });
  try {
    const { authenticateAdminRequest } = await import("../../server/_core/adminAuth");
    const user = await authenticateAdminRequest(req);
    if (!user) return reply(res, 401, { ok: false, code: "UNAUTHORIZED", error: "يجب تسجيل دخول المدير أولًا." });

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
