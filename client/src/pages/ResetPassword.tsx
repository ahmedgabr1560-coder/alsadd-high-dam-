import { ArrowRight, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

export default function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (!token) return setError("رابط إعادة التعيين غير صالح أو ناقص.");
    if (password.length < 8) return setError("يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.");
    if (password !== confirm) return setError("كلمتا المرور غير متطابقتين.");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "تعذر تغيير كلمة المرور.");
      setDone(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "حدث خطأ غير متوقع."); }
    finally { setBusy(false); }
  };

  return <main className="login-page" dir="rtl"><div className="login-orbit login-orbit-one" /><div className="login-orbit login-orbit-two" /><div className="login-shell"><section className="login-story"><a href="/" className="login-brand"><span className="brand-mark"><span /></span><span><strong>أُفُق | OFOQ</strong><small>نفتح أفقًا أوسع، ونحوّل الرؤية إلى أثر.</small></span></a><div className="login-story-content"><span className="login-eyebrow"><KeyRound size={16} /> كلمة مرور جديدة</span><h1>خطوتك الأخيرة،<br /><em>وافتح أفقك.</em></h1><p>اختر كلمة مرور قوية جديدة، ثم استخدمها لتسجيل الدخول إلى حسابك بشكل مستقل وآمن.</p><div className="login-fact"><span><ShieldCheck size={17} /></span><div><strong>حماية مستقلة</strong><small>لا نعرض كلمة المرور ولا نخزنها بصورتها الأصلية.</small></div></div></div></section><section className="login-card"><div className="login-card-icon"><KeyRound size={22} /></div>{done ? <><span className="login-kicker"><CheckCircle2 size={15} /> تم التحديث</span><h2>تم تغيير<br /><strong>كلمة المرور</strong></h2><p className="login-card-copy">يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.</p><a className="login-primary login-button" href="/login">الذهاب إلى تسجيل الدخول <ArrowRight size={16} /></a></> : <><span className="login-kicker"><ShieldCheck size={15} /> إعادة تعيين آمنة</span><h2>أنشئ كلمة<br /><strong>مرور جديدة</strong></h2><form onSubmit={submit} className="login-form"><label>كلمة المرور الجديدة<input required minLength={8} type="password" dir="ltr" value={password} onChange={event => setPassword(event.target.value)} placeholder="8 أحرف على الأقل" /></label><label>تأكيد كلمة المرور<input required minLength={8} type="password" dir="ltr" value={confirm} onChange={event => setConfirm(event.target.value)} placeholder="أعد كتابة كلمة المرور" /></label><button className="login-primary login-button" type="submit" disabled={busy}>{busy ? "جارٍ الحفظ..." : "حفظ كلمة المرور"} <KeyRound size={16} /></button>{error && <p className="login-error" role="alert">{error}</p>}</form><a href="/login" className="login-back"><ArrowRight size={15} /> العودة إلى تسجيل الدخول</a></>}</section></div></main>;
}
