import type { Express, Request, Response } from "express";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { parse as parseCookie } from "cookie";
import { z } from "zod";
import * as db from "../db";
import { loadUsers } from "./blobAuthStore";
import { ENV } from "./env";

export const LOCAL_COOKIE_NAME = "alsadd_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const emailSchema = z.string().trim().email().max(320);
const passwordSchema = z.string().min(8).max(128);
const nameSchema = z.string().trim().min(2).max(120);
const birthDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const secret = () => process.env.AUTH_SECRET || "alsadd-local-auth-development-only";

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}

export function createSession(userId: number) {
  const payload = JSON.stringify({ userId, exp: Date.now() + SESSION_TTL_MS });
  const encoded = encode(payload);
  return `${encoded}.${sign(encoded)}`;
}

function readSession(req: Request) {
  const token = parseCookie(req.headers.cookie ?? "")[LOCAL_COOKIE_NAME];
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(decode(encoded)) as { userId?: number; exp?: number };
    if (!payload.userId || !payload.exp || payload.exp < Date.now()) return null;
    return payload.userId;
  } catch {
    return null;
  }
}

export async function authenticateLocalRequest(req: Request) {
  const userId = readSession(req);
  if (!userId) return null;
  try {
    const users = await loadUsers();
    return users.find(user => Number(user.id) === userId) ?? null;
  } catch {
    return null;
  }
}

function cookieOptions() {
  return { httpOnly: true, path: "/", sameSite: "none" as const, secure: true, maxAge: SESSION_TTL_MS };
}

function publicUser(user: any) {
  if (!user) return null;
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export function registerLocalAuthRoutes(app: Express, routePrefix = "/api") {
  const authPath = (path: string) => `${routePrefix}/auth/${path}`.replace(/\/+/g, "/");

  app.post(authPath("register"), async (req: Request, res: Response) => {
    const parsed = z.object({
      name: nameSchema,
      email: emailSchema,
      password: passwordSchema,
      birthDate: birthDateSchema,
      profileImage: z.string().min(1).max(200_000),
    }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: "تحقق من الاسم والبريد وكلمة المرور وتاريخ الميلاد وصورة الملف الشخصي." });

    const email = parsed.data.email.toLowerCase();
    try {
      if (await db.getUserByEmail(email)) return res.status(409).json({ ok: false, error: "هذا البريد مسجل بالفعل. استخدم تسجيل الدخول." });
      const user = await db.createLocalUser({
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
      if (!user) return res.status(500).json({ ok: false, error: "تعذر إنشاء الحساب." });
      res.cookie(LOCAL_COOKIE_NAME, createSession(user.id), cookieOptions());
      return res.status(201).json({ ok: true, user: publicUser(user) });
    } catch (error) {
      console.error("[LocalAuth] Register failed", error);
      return res.status(500).json({ ok: false, error: "تعذر إنشاء الحساب الآن." });
    }
  });

  app.post(authPath("login"), async (req: Request, res: Response) => {
    const parsed = z.object({ email: emailSchema, password: passwordSchema }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: "أدخل بريدًا إلكترونيًا وكلمة مرور صحيحة." });
    try {
      const user = await db.getUserByEmail(parsed.data.email.toLowerCase());
      if (!user?.passwordHash || !verifyPassword(parsed.data.password, user.passwordHash)) return res.status(401).json({ ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
      await db.upsertUser({ openId: user.openId, lastSignedIn: new Date(), role: ENV.adminEmail && user.email === ENV.adminEmail.toLowerCase() ? "admin" : undefined });
      const freshUser = await db.getUserById(user.id);
      res.cookie(LOCAL_COOKIE_NAME, createSession(user.id), cookieOptions());
      return res.json({ ok: true, user: publicUser(freshUser) });
    } catch (error) {
      console.error("[LocalAuth] Login failed", error);
      return res.status(500).json({ ok: false, error: "تعذر تسجيل الدخول الآن." });
    }
  });

  app.post(authPath("logout"), (_req: Request, res: Response) => {
    res.clearCookie(LOCAL_COOKIE_NAME, { ...cookieOptions(), maxAge: 0 });
    return res.json({ ok: true });
  });

  app.post(authPath("delete"), async (req: Request, res: Response) => {
    const user = await authenticateLocalRequest(req);
    if (!user) return res.status(401).json({ ok: false, error: "يجب تسجيل الدخول أولًا." });
    try {
      await db.deleteUserById(user.id);
      res.clearCookie(LOCAL_COOKIE_NAME, { ...cookieOptions(), maxAge: 0 });
      return res.json({ ok: true });
    } catch (error) {
      console.error("[LocalAuth] Delete account failed", error);
      return res.status(500).json({ ok: false, error: "تعذر حذف الحساب الآن." });
    }
  });
}
