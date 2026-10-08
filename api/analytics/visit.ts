import { insertVisitorEvent } from "../../server/db";

type VisitPayload = { event?: "visit" | "leave"; sessionId?: string; page?: string; referrer?: string; language?: string; screen?: string; timezone?: string };
function header(req: any, name: string) { const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()]; return Array.isArray(value) ? value[0] : value; }
function detectBrowser(ua: string) { if (/Edg\//i.test(ua)) return "Microsoft Edge"; if (/OPR\//i.test(ua)) return "Opera"; if (/SamsungBrowser/i.test(ua)) return "Samsung Internet"; if (/Firefox\//i.test(ua)) return "Mozilla Firefox"; if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return "Google Chrome"; if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari"; if (/Chromium\//i.test(ua)) return "Chromium"; return "غير معروف"; }
function detectOperatingSystem(ua: string) { if (/Windows NT/i.test(ua)) return "Windows"; if (/Android/i.test(ua)) return "Android"; if (/(iPhone|iPad|iPod)/i.test(ua)) return "iOS"; if (/Mac OS X/i.test(ua)) return "macOS"; if (/Linux/i.test(ua)) return "Linux"; return "غير معروف"; }
function countryName(value: string) { const raw = value.trim(); if (!/^[a-z]{2}$/i.test(raw)) return raw; try { return new Intl.DisplayNames(["ar"], { type: "region" }).of(raw.toUpperCase()) || raw.toUpperCase(); } catch { return raw.toUpperCase(); } }
function limit(value: string, length: number) { return value.slice(0, length); }

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  const body = (req.body || {}) as VisitPayload;
  const event = body.event === "leave" ? "leave" : "visit";
  const ua = String(header(req, "user-agent") || "");
  const country = countryName(String(header(req, "x-vercel-ip-country") || "غير معروف"));
  const region = String(header(req, "x-vercel-ip-country-region") || "");
  const city = String(header(req, "x-vercel-ip-city") || "");
  const sessionId = limit(String(body.sessionId || "غير معروف"), 64);
  try {
    await insertVisitorEvent({ eventType: event, sessionId, page: limit(String(body.page || "/"), 255), referrer: body.referrer ? limit(String(body.referrer), 512) : null, language: body.language ? limit(String(body.language), 64) : null, timezone: body.timezone ? limit(String(body.timezone), 128) : null, screen: body.screen ? limit(String(body.screen), 32) : null, country: limit(country, 64), region: region ? limit(region, 128) : null, city: city ? limit(city, 128) : null, browser: detectBrowser(ua), operatingSystem: detectOperatingSystem(ua) });
    return res.status(200).json({ ok: true, stored: true });
  } catch (error) {
    console.error("[Visitor analytics] Failed to save event", error);
    return res.status(503).json({ ok: false, error: "Analytics database unavailable" });
  }
}
