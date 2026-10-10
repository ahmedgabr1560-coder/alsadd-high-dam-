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
async function saveUsers(users: any[]) {
  const { put } = await import("@vercel/blob");
  await put("ofoq-auth/users.json", JSON.stringify(users), { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json; charset=utf-8" });
}

export default async function handler(req: any, res: any) {
  const reply = (status: number, body: unknown) => { res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(body)); };
  if (req.method !== "POST") return reply(405, { ok: false, error: "Method not allowed" });
  const body = req.body ?? {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const birthDate = typeof body.birthDate === "string" ? body.birthDate.trim() : "";
  const profileImage = typeof body.profileImage === "string" ? body.profileImage : "";
  if (name.length < 2 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128 || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || profileImage.length < 1 || profileImage.length > 200_000) return reply(400, { ok: false, error: "تحقق من الاسم والبريد وكلمة المرور وتاريخ الميلاد وصورة الملف الشخصي." });
  try {
    const crypto = await import("node:crypto");
    const users = await loadUsers();
    if (users.some(user => user.email === email)) return reply(409, { ok: false, error: "هذا البريد مسجل بالفعل. استخدم تسجيل الدخول." });
    const now = new Date().toISOString();
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
    const user = { id: users.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1, openId: `local_${crypto.randomBytes(16).toString("hex")}`, name, email, passwordHash, profileImage, birthDate, loginMethod: "email", role: process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase() ? "admin" : "user", createdAt: now, updatedAt: now, lastSignedIn: now };
    await saveUsers([...users, user]);
    try { const { notifyTelegramAccount } = await import("../../server/_core/telegram"); await notifyTelegramAccount("register", user); } catch (notificationError) { console.error("[Telegram] registration notification skipped", notificationError); }
    const encoded = Buffer.from(JSON.stringify({ userId: user.id, exp: Date.now() + 2592000000 })).toString("base64url");
    const signature = crypto.createHmac("sha256", process.env.AUTH_SECRET || "alsadd-local-auth-development-only").update(encoded).digest("base64url");
    res.setHeader("Set-Cookie", `alsadd_session=${encodeURIComponent(`${encoded}.${signature}`)}; Max-Age=2592000; Path=/; HttpOnly; Secure; SameSite=None`);
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return reply(201, { ok: true, user: safeUser });
  } catch (error) { console.error("[register]", error); return reply(500, { ok: false, error: "تعذر إنشاء الحساب الآن. تحقق من اتصال Vercel Blob." }); }
}
