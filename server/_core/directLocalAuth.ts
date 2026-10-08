import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const LOCAL_COOKIE_NAME = "alsadd_session";
const secret = () => process.env.AUTH_SECRET || "alsadd-local-auth-development-only";
function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function validEmail(value: string) { return value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function validPassword(value: string) { return value.length >= 8 && value.length <= 128; }
function hashPassword(password: string, salt = randomBytes(16).toString("hex")) { return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`; }
function verifyPassword(password: string, stored: string) {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}
function createSession(userId: number) {
  const encoded = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 })).toString("base64url");
  return `${encoded}.${createHmac("sha256", secret()).update(encoded).digest("base64url")}`;
}
function publicUser(user: any) {
  if (!user) return null;
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
function json(res: any, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}
function setSession(res: any, userId: number) {
  res.setHeader("Set-Cookie", `${LOCAL_COOKIE_NAME}=${encodeURIComponent(createSession(userId))}; Max-Age=2592000; Path=/; HttpOnly; Secure; SameSite=None`);
}
async function openDb() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  const module = await import("mysql2/promise");
  const mysql = (module as any).default ?? module;
  return mysql.createConnection(process.env.DATABASE_URL);
}
async function getUser(connection: any, email: string) {
  const [rows] = await connection.execute("SELECT id, openId, name, email, passwordHash, profileImage, birthDate, loginMethod, role, createdAt, updatedAt, lastSignedIn FROM users WHERE email = ? LIMIT 1", [email]);
  return (rows as any[])[0] ?? null;
}

export async function registerHandler(req: any, res: any) {
  const body = req.body ?? {};
  const name = text(body.name);
  const email = text(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const birthDate = text(body.birthDate);
  const profileImage = typeof body.profileImage === "string" ? body.profileImage : "";
  if (name.length < 2 || name.length > 120 || !validEmail(email) || !validPassword(password) || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || profileImage.length < 1 || profileImage.length > 200_000) {
    return json(res, 400, { ok: false, error: "تحقق من الاسم والبريد وكلمة المرور وتاريخ الميلاد وصورة الملف الشخصي." });
  }
  let connection: any;
  try {
    connection = await openDb();
    if (await getUser(connection, email)) return json(res, 409, { ok: false, error: "هذا البريد مسجل بالفعل. استخدم تسجيل الدخول." });
    const openId = `local_${randomBytes(16).toString("hex")}`;
    const role = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase() ? "admin" : "user";
    const [result] = await connection.execute("INSERT INTO users (openId, name, email, passwordHash, profileImage, birthDate, loginMethod, role, lastSignedIn) VALUES (?, ?, ?, ?, ?, ?, 'email', ?, NOW())", [openId, name, email, hashPassword(password), profileImage, birthDate, role]);
    const user = await getUser(connection, email);
    if (!(result as any).insertId || !user) return json(res, 500, { ok: false, error: "تعذر إنشاء الحساب." });
    setSession(res, Number((result as any).insertId));
    return json(res, 201, { ok: true, user: publicUser(user) });
  } catch (error) {
    console.error("[DirectLocalAuth] Register failed", error);
    return json(res, 500, { ok: false, error: "تعذر إنشاء الحساب الآن. تأكد من إعداد قاعدة البيانات." });
  } finally {
    await connection?.end().catch(() => undefined);
  }
}

export async function loginHandler(req: any, res: any) {
  const email = text(req.body?.email).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!validEmail(email) || !validPassword(password)) return json(res, 400, { ok: false, error: "أدخل بريدًا إلكترونيًا وكلمة مرور صحيحة." });
  let connection: any;
  try {
    connection = await openDb();
    const user = await getUser(connection, email);
    if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) return json(res, 401, { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
    const role = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase() ? "admin" : user.role;
    await connection.execute("UPDATE users SET lastSignedIn = NOW(), role = ? WHERE id = ?", [role, user.id]);
    setSession(res, Number(user.id));
    return json(res, 200, { ok: true, user: publicUser({ ...user, role, lastSignedIn: new Date() }) });
  } catch (error) {
    console.error("[DirectLocalAuth] Login failed", error);
    return json(res, 500, { ok: false, error: "تعذر تسجيل الدخول الآن. تأكد من إعداد قاعدة البيانات." });
  } finally {
    await connection?.end().catch(() => undefined);
  }
}

export function logoutHandler(_req: any, res: any) {
  res.setHeader("Set-Cookie", `${LOCAL_COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=None`);
  return json(res, 200, { ok: true });
}
