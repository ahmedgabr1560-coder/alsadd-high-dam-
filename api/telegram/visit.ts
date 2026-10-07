type TelegramEvent = "visit" | "leave";

type VisitPayload = {
  event?: TelegramEvent;
  sessionId?: string;
  page?: string;
  referrer?: string;
  language?: string;
  screen?: string;
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
  const lines = [
    `<b>${label}</b>`,
    `الوقت: ${escapeHtml(now)}`,
    `الصفحة: ${escapeHtml(String(body.page || "/"))}`,
    `اللغة: ${escapeHtml(String(body.language || "غير معروف"))}`,
    `الشاشة: ${escapeHtml(String(body.screen || "غير معروف"))}`,
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
