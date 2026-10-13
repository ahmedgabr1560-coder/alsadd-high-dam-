import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authenticateLocalRequest } from "../../server/_core/localAuth";
import { loadArticleOverrides, saveArticleOverrides } from "../../server/_core/blobContentStore";

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const overrides = await loadArticleOverrides();
      const user = await authenticateLocalRequest(req as any);
      const isAdmin = user?.role === "admin";
      return res.status(200).json({ ok: true, overrides: isAdmin ? overrides : Object.fromEntries(Object.entries(overrides).filter(([, value]) => value.status === "published")) });
    }
    if (req.method !== "PUT") return res.status(405).json({ ok: false, error: "الطريقة غير مدعومة." });
    const user = await authenticateLocalRequest(req as any);
    if (!user || user.role !== "admin") return res.status(403).json({ ok: false, error: "هذه المنطقة مخصصة للمدير فقط." });
    const slug = String(req.query.slug || req.body?.slug || "").trim();
    if (!/^[a-z0-9-]{2,80}$/.test(slug)) return res.status(400).json({ ok: false, error: "معرّف المقال غير صالح." });
    const body = req.body || {};
    const overrides = await loadArticleOverrides();
    overrides[slug] = { slug, title: clean(body.title, 220), titleEn: clean(body.titleEn, 220), lead: clean(body.lead, 600), leadEn: clean(body.leadEn, 600), seoTitle: clean(body.seoTitle, 220), seoDescription: clean(body.seoDescription, 320), status: body.status === "draft" ? "draft" : "published", updatedAt: new Date().toISOString(), updatedBy: user.email };
    await saveArticleOverrides(overrides);
    return res.status(200).json({ ok: true, override: overrides[slug] });
  } catch (error) {
    console.error("[Content articles] request failed", error);
    return res.status(503).json({ ok: false, error: "تعذر الوصول إلى مخزن المحتوى." });
  }
}
