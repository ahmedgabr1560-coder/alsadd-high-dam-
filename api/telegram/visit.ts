type TelegramEvent = "visit" | "leave";

type VisitPayload = {
  event?: TelegramEvent;
  sessionId?: string;
  page?: string;
  referrer?: string;
  language?: string;
  screen?: string;
  timezone?: string;
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function header(req: any, name: string) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function detectBrowser(userAgent: string) {
  if (/Edg\//i.test(userAgent)) return "Microsoft Edge";
  if (/OPR\//i.test(userAgent)) return "Opera";
  if (/SamsungBrowser/i.test(userAgent)) return "Samsung Internet";
  if (/Firefox\//i.test(userAgent)) return "Mozilla Firefox";
  if (/Chrome\//i.test(userAgent) && !/Chromium/i.test(userAgent)) return "Google Chrome";
  if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) return "Safari";
  if (/Chromium\//i.test(userAgent)) return "Chromium";
  return "غير معروف";
}

function detectOperatingSystem(userAgent: string) {
  if (/Windows NT/i.test(userAgent)) return "Windows";
  if (/Android/i.test(userAgent)) return "Android";
  if (/(iPhone|iPad|iPod)/i.test(userAgent)) return "iOS";
  if (/Mac OS X/i.test(userAgent)) return "macOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return "غير معروف";
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return res.status(503).json({ ok: false, error: "Telegram is not configured yet" });
  }

  const body = (req.body || {}) as VisitPayload;
  const event: TelegramEvent = body.event === "leave" ? "leave" : "visit";
  const label = event === "visit" ? "🟢 زائر جديد دخل الموقع" : "⚪ زائر غادر الموقع تقريبًا";
  const now = new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "medium", timeZone: "Africa/Cairo" }).format(new Date());
  const userAgent = String(header(req, "user-agent") || "");
  // Vercel provides these anonymized geo headers; the raw IP is intentionally not collected or sent.
  const country = String(header(req, "x-vercel-ip-country") || "غير معروف");
  const region = String(header(req, "x-vercel-ip-country-region") || "");
  const city = String(header(req, "x-vercel-ip-city") || "");
  const location = [city, region, country].filter(Boolean).join("، ") || "غير معروف";
  const lines = [
    `<b>${label}</b>`,
    `الوقت: ${escapeHtml(now)}`,
    `الموقع التقريبي: ${escapeHtml(location)}`,
    `المتصفح: ${escapeHtml(detectBrowser(userAgent))}`,
    `النظام: ${escapeHtml(detectOperatingSystem(userAgent))}`,
    `اللغة: ${escapeHtml(String(body.language || "غير معروف"))}`,
    `المنطقة الزمنية: ${escapeHtml(String(body.timezone || "غير معروف"))}`,
    `الشاشة: ${escapeHtml(String(body.screen || "غير معروف"))}`,
    `الصفحة: ${escapeHtml(String(body.page || "/"))}`,
    `الجلسة: <code>${escapeHtml(String(body.sessionId || "غير معروف").slice(0, 32))}</code>`,
  ];

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: lines.join("\n"), parse_mode: "HTML", disable_web_page_preview: true }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      console.error("Telegram API error", result);
      return res.status(502).json({ ok: false, error: "Telegram rejected the message" });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Telegram request failed", error);
    return res.status(502).json({ ok: false, error: "Telegram request failed" });
  }
}
