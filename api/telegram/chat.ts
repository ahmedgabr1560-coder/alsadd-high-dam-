import { readTelegramSession } from "./auth";

type ChatRequest = { message?: string };

function answerFor(message: string) {
  const text = message.toLowerCase();
  if (/^(مرحبا|اهلا|أهلا|hello|hi|السلام)/i.test(text)) return "أهلًا بك في موقع السد العالي. اسألني عن التاريخ أو الهندسة أو بحيرة ناصر أو رؤية 2030.";
  if (/تاريخ|متى|افتتاح|1960|1971/.test(text)) return "بدأ تنفيذ السد العالي عام 1960، واكتمل جسم السد ومحطة التوليد عام 1970، وافتُتح رسميًا في 15 يناير 1971.";
  if (/ارتفاع|طول|سعة|قدرة|توربين|رقم/.test(text)) return "ارتفاع السد 111 مترًا، وطوله عند القمة 3,830 مترًا، وسعة بحيرة ناصر نحو 162 مليار م³، والقدرة المركبة 2,100 ميجاوات عبر 12 وحدة.";
  if (/بحيرة ناصر|ناصر|توشكى|صيد/.test(text)) return "تمتد بحيرة ناصر لأكثر من 500 كم، ويبلغ أقصى عرض لها نحو 35 كم، ويصل التخزين الحي إلى نحو 90 مليار م³.";
  if (/أبو سمبل|فيلة|اليونسكو|آثار|نوبة/.test(text)) return "أنقذت حملة اليونسكو آثار النوبة؛ نُقل معبدا أبو سمبل بين 1964 و1968 إلى موقع أعلى بنحو 200 متر عن النهر.";
  if (/مستقبل|2030|مياه|طاقة|رقمي/.test(text)) return "يركز المستقبل على ترشيد المياه، والري الحديث، والطاقة الشمسية، والتنبؤ بالفيضان، والأمن السيبراني، والتنمية المستدامة لبحيرة ناصر.";
  if (/مساعدة|help|أوامر|اسأل/.test(text)) return "يمكنك سؤالي عن: تاريخ السد، أرقامه الهندسية، بحيرة ناصر، إنقاذ آثار النوبة، أو رؤية مصر 2030.";
  return "لم أجد إجابة جاهزة لذلك. جرّب السؤال عن تاريخ السد أو أرقامه أو بحيرة ناصر أو أبو سمبل أو رؤية 2030.";
}

async function notifyAdmin(token: string | undefined, chatId: string | undefined, user: any, message: string) {
  if (!token || !chatId) return;
  const label = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || String(user.id);
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: `رسالة من شات الموقع\nالمستخدم: ${label}\n\n${message}` }),
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  const user = readTelegramSession(req);
  if (!user) return res.status(401).json({ ok: false, error: "Telegram login required" });
  const message = String((req.body as ChatRequest | undefined)?.message || "").trim().slice(0, 500);
  if (!message) return res.status(400).json({ ok: false, error: "Message is required" });

  try {
    await notifyAdmin(process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID, user, message);
  } catch (error) {
    console.error("Telegram admin notification failed", error);
  }
  return res.status(200).json({ ok: true, reply: answerFor(message) });
}
