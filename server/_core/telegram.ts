function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function notifyTelegramAccount(event: "register" | "login", user: { name: string; email: string; birthDate: string; role?: string; profileImage?: string }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const now = new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "medium", timeZone: "Africa/Cairo" }).format(new Date());
  const title = event === "register" ? "🆕 تسجيل حساب جديد" : "🔐 تسجيل دخول جديد";
  const lines = [
    `<b>${title}</b>`,
    `الاسم: ${escapeHtml(String(user.name || "غير معروف"))}`,
    `البريد الإلكتروني: ${escapeHtml(String(user.email || "غير معروف"))}`,
    `تاريخ الميلاد: ${escapeHtml(String(user.birthDate || "غير معروف"))}`,
    `الدور: ${escapeHtml(String(user.role || "user"))}`,
    `الصورة الشخصية: ${user.profileImage ? "موجودة" : "غير موجودة"}`,
    `الوقت: ${escapeHtml(now)}`,
    "<i>لم يتم إرسال كلمة المرور حفاظًا على أمان الحساب.</i>",
  ];

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: lines.join("\n"), parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      console.error("[Telegram] account notification rejected", { status: response.status, description: result.description });
      return false;
    }
    return true;
  } catch (error) {
    console.error("[Telegram] account notification failed", error);
    return false;
  }
}
