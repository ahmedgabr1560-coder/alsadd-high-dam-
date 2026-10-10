import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/auth/request-reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "تعذر إرسال رابط الاستعادة.");
      setMessage(result.message || "إذا كان البريد مسجلًا، سيصلك رابط إعادة التعيين.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "حدث خطأ غير متوقع.");
    } finally { setBusy(false); }
  };

  return <main className="login-page" dir="rtl"><div className="login-orbit login-orbit-one" /><div className="login-orbit login-orbit-two" /><div className="login-shell"><section className="login-story"><a href="/" className="login-brand"><span className="brand-mark"><span /></span><span><strong>أُفُق | OFOQ</strong><small>نفتح أفقًا أوسع، ونحوّل الرؤية إلى أثر.</small></span></a><div className="login-story-content"><span className="login-eyebrow"><KeyRound size={16} /> استعادة الحساب</span><h1>استعد دخولك،<br /><em>بخطوة آمنة.</em></h1><p>أدخل البريد الإلكتروني المرتبط بحسابك، وسنرسل رابطًا مؤقتًا لإعادة تعيين كلمة المرور.</p><div className="login-fact"><span><ShieldCheck size={17} /></span><div><strong>رابط مؤقت وآمن</strong><small>ينتهي الرابط تلقائيًا خلال 15 دقيقة ولا يمكن استخدامه مرة أخرى.</small></div></div></div></section><section className="login-card"><div className="login-card-icon"><KeyRound size={22} /></div><span className="login-kicker"><ShieldCheck size={15} /> نسيت كلمة المرور؟</span><h2>استعادة<br /><strong>حسابك</strong></h2><form onSubmit={submit} className="login-form"><label>البريد الإلكتروني<input required type="email" dir="ltr" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" /></label><button className="login-primary login-button" type="submit" disabled={busy}>{busy ? "جارٍ إرسال الرابط..." : "إرسال رابط الاستعادة"} <KeyRound size={16} /></button>{error && <p className="login-error" role="alert">{error}</p>}{message && <p className="login-success" role="status">{message}</p>}</form><a className="login-secondary" href="/login">العودة إلى تسجيل الدخول</a><a href="/" className="login-back"><ArrowRight size={15} /> متابعة إلى الصفحة الرئيسية</a></section></div></main>;
}
