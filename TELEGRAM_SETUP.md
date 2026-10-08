# إعداد تسجيل الدخول وشات Telegram

أضيفت للموقع ثلاثة مسارات API:

- `POST /api/telegram/auth` — يتحقق من بيانات Telegram Login Widget ويضع جلسة HttpOnly موقعة.
- `GET /api/telegram/session` — يعيد حالة الجلسة الحالية.
- `POST /api/telegram/chat` — يسمح للمستخدم المسجل بإرسال سؤال واستقبال رد من قاعدة معلومات السد، ويرسل نسخة للإدارة اختياريًا.

## متغيرات Vercel المطلوبة

```text
TELEGRAM_BOT_TOKEN=توكن البوت من BotFather
TELEGRAM_SESSION_SECRET=قيمة عشوائية طويلة مختلفة عن التوكن
TELEGRAM_ADMIN_CHAT_ID=معرّف محادثة الإدارة (اختياري)
VITE_TELEGRAM_BOT_USERNAME=اسم المستخدم العام للبوت بدون @
```

`TELEGRAM_BOT_TOKEN` و`TELEGRAM_SESSION_SECRET` متغيران سريان ولا يجب وضعهما في كود الواجهة أو GitHub. أما `VITE_TELEGRAM_BOT_USERNAME` فهو اسم عام يظهر في زر الدخول.

## إعداد BotFather

1. من BotFather استخدم `/setdomain` وأضف `alsadd-high-dam.vercel.app`.
2. تأكد أن اسم المستخدم في `VITE_TELEGRAM_BOT_USERNAME` يطابق اسم البوت.
3. أعد النشر بعد حفظ متغيرات البيئة.

## الاختبارات المنفذة

- فحص توقيع Telegram صحيح.
- رفض توقيع غير صحيح.
- إنشاء جلسة HttpOnly وقراءتها.
- رفض الشات بدون جلسة.
- إرسال سؤال مسجل وإرجاع رد عربي مناسب.
- `pnpm check` و`pnpm build:static` و`pnpm test` ناجحة.
