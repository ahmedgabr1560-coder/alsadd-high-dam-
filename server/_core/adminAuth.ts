import { createHmac, timingSafeEqual } from "node:crypto";
import { parse as parseCookie } from "cookie";
import { loadUsers, type StoredUser } from "./blobAuthStore";
import { verifyPassword } from "./localAuth";

export const ADMIN_COOKIE_NAME = "ofoq_admin_session";
const TTL = 1000 * 60 * 60 * 8;
const secret = () => `${process.env.AUTH_SECRET || "development"}:admin`;
const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

export function createAdminSession(userId: number) {
  const encoded = Buffer.from(JSON.stringify({ userId, exp: Date.now() + TTL })).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export async function authenticateAdminRequest(req: any): Promise<StoredUser | null> {
  const token = parseCookie(req.headers?.cookie || "")[ADMIN_COOKIE_NAME];
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const a = Buffer.from(signature); const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!payload.userId || Number(payload.exp) < Date.now()) return null;
    const user = (await loadUsers()).find(item => Number(item.id) === Number(payload.userId)) || null;
    const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    return user && (user.role === "admin" || (adminEmail && user.email.toLowerCase() === adminEmail)) ? user : null;
  } catch { return null; }
}

export async function adminLogin(email: string, password: string) {
  const user = (await loadUsers()).find(item => item.email.toLowerCase() === email.trim().toLowerCase());
  const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) return null;
  if (user.role !== "admin" && (!adminEmail || user.email.toLowerCase() !== adminEmail)) return null;
  return user;
}
