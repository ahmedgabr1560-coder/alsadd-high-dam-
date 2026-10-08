export default async function handler(req: any, res: any) {
  const reply = (status: number, body: unknown) => { res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(body)); };
  if (req.method !== "POST") return reply(405, { ok: false, error: "Method not allowed" });
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128) return reply(400, { ok: false, error: "أدخل بريدًا إلكترونيًا وكلمة مرور صحيحة." });
  let connection: any;
  try {
    const crypto = await import("node:crypto");
    const mysqlModule = await import("mysql2/promise");
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
    const mysql = (mysqlModule as any).default ?? mysqlModule;
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    const [rows] = await connection.execute("SELECT id, openId, name, email, passwordHash, profileImage, birthDate, loginMethod, role, createdAt, updatedAt, lastSignedIn FROM users WHERE email = ? LIMIT 1", [email]);
    const user = (rows as any[])[0];
    if (!user?.passwordHash) return reply(401, { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
    const [salt, expectedHex] = String(user.passwordHash).split(":");
    const actual = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, "hex");
    if (!salt || !expectedHex || expected.length !== actual.length || !crypto.timingSafeEqual(actual, expected)) return reply(401, { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
    const role = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase() ? "admin" : user.role;
    await connection.execute("UPDATE users SET lastSignedIn = NOW(), role = ? WHERE id = ?", [role, user.id]);
    const encoded = Buffer.from(JSON.stringify({ userId: Number(user.id), exp: Date.now() + 2592000000 })).toString("base64url");
    const signature = crypto.createHmac("sha256", process.env.AUTH_SECRET || "alsadd-local-auth-development-only").update(encoded).digest("base64url");
    res.setHeader("Set-Cookie", `alsadd_session=${encodeURIComponent(`${encoded}.${signature}`)}; Max-Age=2592000; Path=/; HttpOnly; Secure; SameSite=None`);
    const { passwordHash: _passwordHash, ...safeUser } = { ...user, role, lastSignedIn: new Date() };
    return reply(200, { ok: true, user: safeUser });
  } catch (error) { console.error("[login]", error); return reply(500, { ok: false, error: "تعذر تسجيل الدخول الآن. تأكد من إعداد قاعدة البيانات." }); }
  finally { await connection?.end().catch(() => undefined); }
}
