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
  let connection: any;
  try {
    const crypto = await import("node:crypto");
    const mysqlModule = await import("mysql2/promise");
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
    const mysql = (mysqlModule as any).default ?? mysqlModule;
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    const [existing] = await connection.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if ((existing as any[]).length) return reply(409, { ok: false, error: "هذا البريد مسجل بالفعل. استخدم تسجيل الدخول." });
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
    const openId = `local_${crypto.randomBytes(16).toString("hex")}`;
    const role = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase() ? "admin" : "user";
    const [result] = await connection.execute("INSERT INTO users (openId, name, email, passwordHash, profileImage, birthDate, loginMethod, role, lastSignedIn) VALUES (?, ?, ?, ?, ?, ?, 'email', ?, NOW())", [openId, name, email, passwordHash, profileImage, birthDate, role]);
    const [rows] = await connection.execute("SELECT id, openId, name, email, profileImage, birthDate, loginMethod, role, createdAt, updatedAt, lastSignedIn FROM users WHERE id = ? LIMIT 1", [(result as any).insertId]);
    const user = (rows as any[])[0];
    const encoded = Buffer.from(JSON.stringify({ userId: Number(user.id), exp: Date.now() + 2592000000 })).toString("base64url");
    const signature = crypto.createHmac("sha256", process.env.AUTH_SECRET || "alsadd-local-auth-development-only").update(encoded).digest("base64url");
    res.setHeader("Set-Cookie", `alsadd_session=${encodeURIComponent(`${encoded}.${signature}`)}; Max-Age=2592000; Path=/; HttpOnly; Secure; SameSite=None`);
    return reply(201, { ok: true, user });
  } catch (error) { console.error("[register]", error); return reply(500, { ok: false, error: "تعذر إنشاء الحساب الآن. تأكد من إعداد قاعدة البيانات." }); }
  finally { await connection?.end().catch(() => undefined); }
}
