async function loadUsers() {
  const { list, get } = await import("@vercel/blob");
  const result = await list({ prefix: "ofoq-auth/users.json", token: process.env.BLOB_READ_WRITE_TOKEN });
  const blob = result.blobs.find((item: any) => item.pathname === "ofoq-auth/users.json") ?? result.blobs[0];
  if (!blob) return [];
  const stored = await get("ofoq-auth/users.json", { access: "private", useCache: false, token: process.env.BLOB_READ_WRITE_TOKEN });
  if (!stored) return [];
  const value = await new Response(stored.stream).json();
  return Array.isArray(value) ? value : [];
}

async function saveUsers(users: any[]) {
  const { put } = await import("@vercel/blob");
  await put("ofoq-auth/users.json", JSON.stringify(users), { access: "private", addRandomSuffix: false, allowOverwrite: true, token: process.env.BLOB_READ_WRITE_TOKEN, contentType: "application/json; charset=utf-8" });
}

export default async function handler(req: any, res: any) {
  const reply = (status: number, body: unknown) => { res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(body)); };
  if (req.method !== "POST") return reply(405, { ok: false, error: "Method not allowed" });
  try {
    const crypto = await import("node:crypto");
    const raw = String(req.headers?.cookie || "").split(";").map((item: string) => item.trim()).find((item: string) => item.startsWith("alsadd_session="))?.slice("alsadd_session=".length);
    if (!raw) return reply(401, { ok: false, error: "يجب تسجيل الدخول أولًا." });
    const token = decodeURIComponent(raw);
    const dot = token.lastIndexOf(".");
    if (dot < 1) return reply(401, { ok: false, error: "جلسة غير صالحة." });
    const encoded = token.slice(0, dot);
    const signature = token.slice(dot + 1);
    const expected = crypto.createHmac("sha256", process.env.AUTH_SECRET || "alsadd-local-auth-development-only").update(encoded).digest("base64url");
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return reply(401, { ok: false, error: "جلسة غير صالحة." });
    const session = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!session.userId || Number(session.exp) < Date.now()) return reply(401, { ok: false, error: "انتهت الجلسة. سجّل الدخول مرة أخرى." });
    const users = await loadUsers();
    const exists = users.some(item => item.id === Number(session.userId));
    if (!exists) return reply(404, { ok: false, error: "الحساب غير موجود." });
    await saveUsers(users.filter(item => item.id !== Number(session.userId)));
    res.setHeader("Set-Cookie", "alsadd_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=None");
    return reply(200, { ok: true });
  } catch (error) {
    console.error("[delete-account]", error);
    return reply(500, { ok: false, error: "تعذر حذف الحساب الآن." });
  }
}
