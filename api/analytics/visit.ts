type VisitPayload = { event?: "visit" | "leave"; sessionId?: string; page?: string; referrer?: string; language?: string; screen?: string; timezone?: string };
function header(req: any, name: string) { const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()]; return Array.isArray(value) ? value[0] : value; }
function escapeHtml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function limit(value: string, length: number) { return value.slice(0, length); }
function detectBrowser(ua: string) { if (/Edg\//i.test(ua)) return "Microsoft Edge"; if (/OPR\//i.test(ua)) return "Opera"; if (/SamsungBrowser/i.test(ua)) return "Samsung Internet"; if (/Firefox\//i.test(ua)) return "Mozilla Firefox"; if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return "Google Chrome"; if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari"; if (/Chromium\//i.test(ua)) return "Chromium"; return "غير معروف"; }
function detectOperatingSystem(ua: string) { if (/Windows NT/i.test(ua)) return "Windows"; if (/Android/i.test(ua)) return "Android"; if (/(iPhone|iPad|iPod)/i.test(ua)) return "iOS"; if (/Mac OS X/i.test(ua)) return "macOS"; if (/Linux/i.test(ua)) return "Linux"; return "غير معروف"; }
function countryName(value: string) { const raw = value.trim(); if (!/^[a-z]{2}$/i.test(raw)) return raw || "غير معروف"; try { return new Intl.DisplayNames(["ar"], { type: "region" }).of(raw.toUpperCase()) || raw.toUpperCase(); } catch { return raw.toUpperCase(); } }

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  const body = (req.body || {}) as VisitPayload;
  const event = body.event === "leave" ? "leave" : "visit";
  const ua = String(header(req, "user-agent") || "");
  const country = countryName(String(header(req, "x-vercel-ip-country") || "غير معروف"));
  const region = limit(String(header(req, "x-vercel-ip-country-region") || ""), 128);
  const city = limit(String(header(req, "x-vercel-ip-city") || ""), 128);
  const browser = detectBrowser(ua);
  const operatingSystem = detectOperatingSystem(ua);
  const sessionId = limit(String(body.sessionId || "غير معروف"), 64);
  const page = limit(String(body.page || "/"), 255);

  // Persist to the managed SQL database when configured, but never let a missing
  // database stop the Telegram notification from reaching the owner.
  let stored = false;
  if (process.env.DATABASE_URL) {
    try {
      const { insertVisitorEvent } = await import("../../server/db");
      await insertVisitorEvent({ eventType: event, sessionId, page, referrer: body.referrer ? limit(String(body.referrer), 512) : null, language: body.language ? limit(String(body.language), 64) : null, timezone: body.timezone ? limit(String(body.timezone), 128) : null, screen: body.screen ? limit(String(body.screen), 32) : null, country: limit(country, 64), region: region || null, city: city || null, browser, operatingSystem });
      stored = true;
    } catch (error) { console.error("[Visitor analytics] database unavailable", error); }
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return res.status(503).json({ ok: false, stored, telegram: false, error: "Telegram environment variables are missing" });
  const label = event === "visit" ? "🟢 زائر جديد دخل الموقع" : "⚪ زائر غادر الموقع تقريبًا";
  const now = new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "medium", timeZone: "Africa/Cairo" }).format(new Date());
  const location = [city, region, country].filter(Boolean).join("، ") || "غير معروف";
  const lines = [`<b>${label}</b>`, `الوقت: ${escapeHtml(now)}`, `الموقع التقريبي: ${escapeHtml(location)}`, `المتصفح: ${escapeHtml(browser)}`, `النظام: ${escapeHtml(operatingSystem)}`, `اللغة: ${escapeHtml(String(body.language || "غير معروف"))}`, `المنطقة الزمنية: ${escapeHtml(String(body.timezone || "غير معروف"))}`, `الشاشة: ${escapeHtml(String(body.screen || "غير معروف"))}`, `الصفحة: ${escapeHtml(page)}`, `الجلسة: <code>${escapeHtml(sessionId.slice(0, 32))}</code>`];
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text: lines.join("\n"), parse_mode: "HTML", disable_web_page_preview: true }), signal: AbortSignal.timeout(8000) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) { console.error("[Telegram] rejected visitor event", { status: response.status, description: result.description }); return res.status(502).json({ ok: false, stored, telegram: false, error: "Telegram rejected the message" }); }
    return res.status(200).json({ ok: true, stored, telegram: true });
  } catch (error) { console.error("[Telegram] request failed", error); return res.status(502).json({ ok: false, stored, telegram: false, error: "Telegram request failed" }); }
}
