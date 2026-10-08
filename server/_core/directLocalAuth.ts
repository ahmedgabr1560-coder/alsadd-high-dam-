import { randomBytes } from "node:crypto";
import { z } from "zod";
import { createLocalUser, getUserByEmail, getUserById, upsertUser } from "../db";
import { ENV } from "./env";
import { createSession, hashPassword, verifyPassword, LOCAL_COOKIE_NAME } from "./localAuth";

const emailSchema = z.string().trim().email().max(320);
const passwordSchema = z.string().min(8).max(128);
const nameSchema = z.string().trim().min(2).max(120);
const birthDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function publicUser(user: any) {
  if (!user) return null;
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

function setSession(res: any, userId: number) {
  const token = encodeURIComponent(createSession(userId));
  res.setHeader("Set-Cookie", `${LOCAL_COOKIE_NAME}=${token}; Max-Age=2592000; Path=/; HttpOnly; Secure; SameSite=None`);
}

function json(res: any, status: number, payload: unknown) {
  res.status(status).json(payload);
}

export async function registerHandler(req: any, res: any) {
  const parsed = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    birthDate: birthDateSchema,
    profileImage: z.string().min(1).max(200_000),
  }).safeParse(req.body ?? {});
  if (!parsed.success) return json(res, 400, { ok: false, error: "تحقق من الاسم والبريد وكلمة المرور وتاريخ الميلاد وصورة الملف الشخصي." });

  const email = parsed.data.email.toLowerCase();
  try {
    if (await getUserByEmail(email)) return json(res, 409, { ok: false, error: "هذا البريد مسجل بالفعل. استخدم تسجيل الدخول." });
    const user = await createLocalUser({
      openId: `local_${randomBytes(16).toString("hex")}`,
      name: parsed.data.name,
      email,
      passwordHash: hashPassword(parsed.data.password),
      profileImage: parsed.data.profileImage,
      birthDate: parsed.data.birthDate,
      loginMethod: "email",
      lastSignedIn: new Date(),
      role: ENV.adminEmail && email === ENV.adminEmail.toLowerCase() ? "admin" : "user",
    });
    if (!user) return json(res, 500, { ok: false, error: "تعذر إنشاء الحساب." });
    setSession(res, user.id);
    return json(res, 201, { ok: true, user: publicUser(user) });
  } catch (error) {
    console.error("[DirectLocalAuth] Register failed", error);
    return json(res, 500, { ok: false, error: "تعذر إنشاء الحساب الآن." });
  }
}

export async function loginHandler(req: any, res: any) {
  const parsed = z.object({ email: emailSchema, password: passwordSchema }).safeParse(req.body ?? {});
  if (!parsed.success) return json(res, 400, { ok: false, error: "أدخل بريدًا إلكترونيًا وكلمة مرور صحيحة." });
  try {
    const user = await getUserByEmail(parsed.data.email.toLowerCase());
    if (!user?.passwordHash || !verifyPassword(parsed.data.password, user.passwordHash)) return json(res, 401, { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
    await upsertUser({ openId: user.openId, lastSignedIn: new Date(), role: ENV.adminEmail && user.email === ENV.adminEmail.toLowerCase() ? "admin" : undefined });
    const freshUser = await getUserById(user.id);
    setSession(res, user.id);
    return json(res, 200, { ok: true, user: publicUser(freshUser) });
  } catch (error) {
    console.error("[DirectLocalAuth] Login failed", error);
    return json(res, 500, { ok: false, error: "تعذر تسجيل الدخول الآن." });
  }
}

export function logoutHandler(_req: any, res: any) {
  res.setHeader("Set-Cookie", `${LOCAL_COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=None`);
  return json(res, 200, { ok: true });
}
