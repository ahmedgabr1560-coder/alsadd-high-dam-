async function loadUsers() {
  const { list } = await import("@vercel/blob");
  const result = await list({ prefix: "ofoq-auth/users.json" });
  const blob = result.blobs.find((item: any) => item.pathname === "ofoq-auth/users.json") ?? result.blobs[0];
  if (!blob) return [];
  const response = await fetch(blob.url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Blob read failed: ${response.status}`);
  const value = await response.json();
  return Array.isArray(value) ? value : [];
}
async function saveUsers(users: any[]) {
  const { put } = await import("@vercel/blob");
  await put("ofoq-auth/users.json", JSON.stringify(users), { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json; charset=utf-8" });
}

export default async function handler(req: any, res: any) {
  const reply = (status: number, body: unknown) => { res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(body)); };
  if (req.method !== "POST") return reply(405, { ok: false, error: "Method not allowed" });
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128) return reply(400, { ok: false, error: "أدخل بريدًا إلكترونيًا وكلمة مرور صحيحة." });
  try {
    const crypto = await import("node:crypto");
    const users = await loadUsers();
    const user = users.find(item => item.email === email);
    if (!user?.passwordHash) return reply(401, { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
    const [salt, expectedHex] = String(user.passwordHash).split(":");
    const actual = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, "hex");
    if (!salt || !expectedHex || expected.length !== actual.length || !crypto.timingSafeEqual(actual, expected)) return reply(401, { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
    const now = new Date().toISOString();
    const role = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase() ? "admin" : user.role;
    const updated = { ...user, role, lastSignedIn: now, updatedAt: now };
    await saveUsers(users.map(item => item.id === user.id ? updated : item));
    const encoded = Buffer.from(JSON.stringify({ userId: user.id, exp: Date.now() + 2592000000 })).toString("base64url");
    const signature = crypto.createHmac("sha256", process.env.AUTH_SECRET || "alsadd-local-auth-development-only").update(encoded).digest("base64url");
    res.setHeader("Set-Cookie", `alsadd_session=${encodeURIComponent(`${encoded}.${signature}`)}; Max-Age=2592000; Path=/; HttpOnly; Secure; SameSite=None`);
    const { passwordHash: _passwordHash, ...safeUser } = updated;
    return reply(200, { ok: true, user: safeUser });
  } catch (error) { console.error("[login]", error); return reply(500, { ok: false, error: "تعذر تسجيل الدخول الآن. تحقق من اتصال Vercel Blob." }); }
}
