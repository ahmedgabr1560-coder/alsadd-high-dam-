async function loadUsers() {
  const { list, get } = await import("@vercel/blob");
  const result = await list({ prefix: "ofoq-auth/users.json" });
  const blob = result.blobs.find((item: any) => item.pathname === "ofoq-auth/users.json") ?? result.blobs[0];
  if (!blob) return [];
  const stored = await get("ofoq-auth/users.json", { access: "private", useCache: false });
  if (!stored) return [];
  const value = await new Response(stored.stream).json();
  return Array.isArray(value) ? value : [];
}

async function getSession(req: any) {
  const raw = String(req.headers?.cookie || "").split(";").map((item: string) => item.trim()).find((item: string) => item.startsWith("alsadd_session="))?.slice("alsadd_session=".length);
  if (!raw) return null;
  try {
    const crypto = await import("node:crypto");
    const token = decodeURIComponent(raw);
    const dot = token.lastIndexOf(".");
    if (dot < 1) return null;
    const encoded = token.slice(0, dot);
    const signature = token.slice(dot + 1);
    const expected = crypto.createHmac("sha256", process.env.AUTH_SECRET || "alsadd-local-auth-development-only").update(encoded).digest("base64url");
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const session = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    return session.userId && Number(session.exp) >= Date.now() ? Number(session.userId) : null;
  } catch { return null; }
}

export default async function handler(req: any, res: any) {
  const reply = (status: number, body: unknown) => { res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(body)); };
  if (req.method !== "POST") return reply(405, { ok: false, error: "Method not allowed" });
  try {
    const userId = await getSession(req);
    if (!userId) return reply(401, { ok: false, error: "يجب تسجيل الدخول بالحساب الإداري." });
    const users = await loadUsers();
    const admin = users.find((user: any) => Number(user.id) === userId);
    if (!admin || (admin.role !== "admin" && String(admin.email).toLowerCase() !== String(process.env.ADMIN_EMAIL || "").toLowerCase())) return reply(403, { ok: false, error: "هذه العملية للمدير فقط." });
    const { notifyTelegramAccount } = await import("../../server/_core/telegram");
    let sent = 0;
    for (const user of users.slice(0, 100)) {
      if (await notifyTelegramAccount("register", user)) sent += 1;
    }
    return reply(200, { ok: true, total: Math.min(users.length, 100), sent });
  } catch (error) { console.error("[notify-users]", error); return reply(500, { ok: false, error: "تعذر مزامنة الحسابات الحالية." }); }
}
