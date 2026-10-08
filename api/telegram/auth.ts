import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "alsadd_telegram_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
};

function getHeader(req: any, name: string) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function sessionSecret() {
  return process.env.TELEGRAM_SESSION_SECRET || process.env.TELEGRAM_BOT_TOKEN || "";
}

function serialize(user: TelegramUser, secret: string) {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    username: user.username || "",
    photo_url: user.photo_url || "",
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  })).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function readTelegramSession(req: any): TelegramUser | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const cookieHeader = String(getHeader(req, "cookie") || "");
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  const [payload, signature] = decodeURIComponent(match[1]).split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload, secret);
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed.id || Number(parsed.exp) < Math.floor(Date.now() / 1000)) return null;
    return parsed as TelegramUser;
  } catch {
    return null;
  }
}

function isValidTelegramAuth(data: Record<string, string>, botToken: string) {
  const { hash, ...rest } = data;
  if (!hash) return false;
  const authDate = Number(rest.auth_date);
  if (!Number.isFinite(authDate) || Math.abs(Date.now() / 1000 - authDate) > 86400) return false;
  const checkString = Object.keys(rest).sort().map((key) => `${key}=${rest[key]}`).join("\n");
  const secretKey = createHash("sha256").update(botToken).digest();
  const expected = createHmac("sha256", secretKey).update(checkString).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const secret = sessionSecret();
  if (!botToken || !secret) return res.status(503).json({ ok: false, error: "Telegram authentication is not configured" });

  const body = (req.body || {}) as Record<string, unknown>;
  const data = Object.fromEntries(Object.entries(body).map(([key, value]) => [key, String(value ?? "")])) as Record<string, string>;
  if (!isValidTelegramAuth(data, botToken) || !data.id) return res.status(401).json({ ok: false, error: "Invalid Telegram login" });

  const user: TelegramUser = {
    id: Number(data.id),
    first_name: data.first_name,
    last_name: data.last_name,
    username: data.username,
    photo_url: data.photo_url,
    auth_date: Number(data.auth_date),
  };
  const secure = String(getHeader(req, "x-forwarded-proto") || "https") === "https";
  const cookie = `${COOKIE_NAME}=${encodeURIComponent(serialize(user, secret))}; Max-Age=${SESSION_TTL_SECONDS}; Path=/; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ ok: true, user });
}
