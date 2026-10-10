const RESET_STORE = "ofoq-auth/reset-tokens.json";

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

function reply(res: any, status: number, body: unknown) { res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(body)); }

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return reply(res, 405, { ok: false, error: "Method not allowed" });
  const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) return reply(res, 400, { ok: false, error: "رابط إعادة التعيين غير صالح أو منتهي." });
  if (password.length < 8 || password.length > 128) return reply(res, 400, { ok: false, error: "يجب أن تتكون كلمة المرور من 8 إلى 128 حرفًا." });

  try {
    const crypto = await import("node:crypto");
    const { loadUsers, saveUsers } = await import("../../server/_core/blobAuthStore");
    const tokenHash = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
    const now = Date.now();
    const tokens = await loadTokens();
    const target = tokens.find(item => item.tokenHash === tokenHash(token) && !item.usedAt && Number(item.expiresAt) > now);
    if (!target) return reply(res, 400, { ok: false, error: "رابط إعادة التعيين غير صالح أو منتهي. اطلب رابطًا جديدًا." });

    const users = await loadUsers();
    const userIndex = users.findIndex(item => Number(item.id) === Number(target.userId));
    if (userIndex < 0) return reply(res, 400, { ok: false, error: "تعذر العثور على الحساب. اطلب رابطًا جديدًا." });

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
    const updatedUser = { ...users[userIndex], passwordHash, updatedAt: new Date(now).toISOString() };
    const updatedUsers = users.slice();
    updatedUsers[userIndex] = updatedUser;
    await saveUsers(updatedUsers);
    await saveTokens(tokens.map(item => item.tokenHash === target.tokenHash ? { ...item, usedAt: new Date(now).toISOString() } : item));
    return reply(res, 200, { ok: true, message: "تم تغيير كلمة المرور بنجاح." });
  } catch (error) {
    console.error("[Password reset] update failed", error);
    return reply(res, 503, { ok: false, error: "تعذر تغيير كلمة المرور الآن. حاول بعد قليل." });
  }
}
