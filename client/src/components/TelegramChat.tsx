import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, ShieldCheck, X } from "lucide-react";

type TelegramUser = { id: number; first_name?: string; last_name?: string; username?: string; photo_url?: string };
type ChatMessage = { role: "user" | "assistant"; content: string };

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser & Record<string, unknown>) => void;
  }
}

const botUsername = (import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "").replace(/^@/, "");

export default function TelegramChat() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const loginRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/telegram/session").then((response) => response.json()).then((data) => {
      if (data.authenticated) setUser(data.user);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!open || user || !botUsername || !loginRef.current) return;
    loginRef.current.innerHTML = "";
    window.onTelegramAuth = async (telegramUser) => {
      setAuthError("");
      const response = await fetch("/api/telegram/auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(telegramUser) });
      const data = await response.json();
      if (data.ok) setUser(data.user);
      else setAuthError("تعذر التحقق من حساب تيليجرام. حاول مرة أخرى.");
    };
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.dataset.telegramLogin = botUsername;
    script.dataset.size = "large";
    script.dataset.userpic = "false";
    script.dataset.requestAccess = "write";
    script.dataset.onauth = "onTelegramAuth(user)";
    loginRef.current.appendChild(script);
    return () => { window.onTelegramAuth = undefined; };
  }, [open, user]);

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading || !user) return;
    setInput("");
    setMessages((current) => [...current, { role: "user", content: message }]);
    setLoading(true);
    try {
      const response = await fetch("/api/telegram/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "chat failed");
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "حصلت مشكلة مؤقتة. حاول إرسال السؤال مرة أخرى." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="telegram-chat">
      {open && <section className="telegram-panel" aria-label="شات السد العالي">
        <header className="telegram-panel-header">
          <div><strong>شات السد العالي</strong><small>{user ? `مرحبًا ${user.first_name || "بك"}` : "دخول آمن عبر تيليجرام"}</small></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق الشات"><X size={18} /></button>
        </header>
        {!user ? <div className="telegram-login-state">
          <ShieldCheck size={31} />
          <h3>سجّل دخولك للبدء</h3>
          <p>تسجيل الدخول يتم من خلال Telegram فقط، ولا نطلب كلمة مرور أو رمزًا سريًا.</p>
          {botUsername ? <div ref={loginRef} className="telegram-login-widget" /> : <p className="telegram-error">أضف `VITE_TELEGRAM_BOT_USERNAME` في إعدادات النشر لتفعيل الدخول.</p>}
          {authError && <p className="telegram-error">{authError}</p>}
        </div> : <>
          <div className="telegram-messages">
            {messages.length === 0 && <div className="telegram-empty"><MessageCircle size={26} /><p>اسأل عن تاريخ السد، أرقامه، بحيرة ناصر، أبو سمبل أو رؤية 2030.</p></div>}
            {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`telegram-message ${message.role}`}><p>{message.content}</p></div>)}
            {loading && <div className="telegram-message assistant"><p>يكتب الآن…</p></div>}
          </div>
          <form className="telegram-compose" onSubmit={sendMessage}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="اكتب سؤالك…" maxLength={500} aria-label="رسالتك" /><button type="submit" disabled={!input.trim() || loading} aria-label="إرسال"><Send size={17} /></button></form>
        </>}
      </section>}
      <button type="button" className="telegram-fab" onClick={() => setOpen((value) => !value)} aria-label={open ? "إغلاق شات تيليجرام" : "فتح شات تيليجرام"} title="شات تيليجرام"><MessageCircle size={23} /><span>شات</span></button>
    </div>
  );
}
