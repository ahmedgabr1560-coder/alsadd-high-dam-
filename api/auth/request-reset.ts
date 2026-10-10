const RESET_STORE = "ofoq-auth/reset-tokens.json";
const RESET_TTL_MS = 15 * 60 * 1000;

async function loadTokens(): Promise<any[]> {
  const { list, get } = await import("@vercel/blob");
  const result = await list({ prefix: RESET_STORE });
  const blob = result.blobs.find(item => item.pathname === RESET_STORE) ?? result.blobs[0];
  if (!blob) return [];
  const stored = await get(RESET_STORE, { access: "private", useCache: false });
  if (!stored) return [];
  const value = await new Response(stored.stream).json();
  return Array.isArray(value) ? value : [];
}

async function saveTokens(tokens: any[]) {
  const { put } = await import("@vercel/blob");
  await put(RESET_STORE, JSON.stringify(tokens), { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json; charset=utf-8" });
}

function reply(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return reply(res, 405, { ok: false, error: "Method not allowed" });
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) return reply(res, 400, { ok: false, error: "أدخل بريدًا إلكترونيًا صحيحًا." });

  const genericMessage = "إذا كان البريد مسجلًا، سيصلك رابط إعادة التعيين خلال دقائق.";
  try {
    const crypto = await import("node:crypto");
    const { loadUsers } = await import("../../server/_core/blobAuthStore");
    const tokenHash = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
    const users = await loadUsers();
    const user = users.find(item => item.email === email);
    if (!user) return reply(res, 200, { ok: true, message: genericMessage });

    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL || "أُفُق | OFOQ <onboarding@resend.dev>";
    if (!resendKey) {
      console.error("[Password reset] RESEND_API_KEY is missing");
      return reply(res, 503, { ok: false, error: "خدمة البريد غير مهيأة بعد. أضف RESEND_API_KEY في Vercel ثم أعد المحاولة." });
    }

    const rawToken = crypto.randomBytes(32).toString("base64url");
    const now = Date.now();
    const tokens = (await loadTokens()).filter(item => Number(item.expiresAt) > now && item.userId !== user.id);
    tokens.push({ tokenHash: tokenHash(rawToken), userId: user.id, email, expiresAt: now + RESET_TTL_MS, createdAt: new Date(now).toISOString() });
    await saveTokens(tokens.slice(-1000));

    const appUrl = (process.env.APP_URL || "https://ofoq-egypt.vercel.app").replace(/\/$/, "");
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
    const html = `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#f4f7f5;padding:32px;font-family:Arial,sans-serif;color:#17384a"><div style="max-width:560px;margin:auto;background:#fff;border:1px solid #dfeae6;border-radius:18px;padding:32px"><p style="color:#178f85;font-weight:bold">أُفُق | OFOQ</p><h1 style="font-size:26px">إعادة تعيين كلمة المرور</h1><p style="line-height:1.9">تلقينا طلبًا لتغيير كلمة مرور حسابك. اضغط الزر التالي لإكمال العملية. الرابط صالح لمدة 15 دقيقة ويستخدم مرة واحدة فقط.</p><p><a href="${resetUrl}" style="display:inline-block;background:#178f85;color:#fff;text-decoration:none;border-radius:10px;padding:13px 22px">إعادة تعيين كلمة المرور</a></p><p style="font-size:13px;color:#6b7d84;line-height:1.8">إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة. لا تشارك هذا الرابط مع أي شخص.</p></div></body></html>`;
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [email], subject: "إعادة تعيين كلمة المرور | أُفُق", html }), signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[Password reset] Resend rejected email", response.status, detail.slice(0, 500));
      return reply(res, 502, { ok: false, error: "تعذر إرسال رسالة الاستعادة. تحقق من إعدادات Resend واسم المرسل في Vercel." });
    }
    return reply(res, 200, { ok: true, message: genericMessage });
  } catch (error) {
    console.error("[Password reset] request failed", error);
    return reply(res, 503, { ok: false, error: "تعذر تجهيز رابط الاستعادة الآن. حاول بعد قليل." });
  }
}
