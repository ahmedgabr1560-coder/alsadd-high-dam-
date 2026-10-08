import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { ArrowLeft, ArrowRight, CheckCircle2, Landmark, LogIn, LogOut, ShieldCheck, Waves } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [loginError, setLoginError] = useState("");

  const handleLogin = () => {
    setLoginError("");
    try {
      startLogin();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "تعذر بدء تسجيل الدخول الآن");
    }
  };

  return (
    <main className="login-page" dir="rtl">
      <div className="login-orbit login-orbit-one" />
      <div className="login-orbit login-orbit-two" />
      <div className="login-shell">
        <section className="login-story">
          <a href="/" className="login-brand" aria-label="العودة إلى الموقع"><span className="brand-mark"><span /></span><span><strong>السد العالي</strong><small>قصة وطن وماء</small></span></a>
          <div className="login-story-content">
            <span className="login-eyebrow"><Waves size={16} /> بوابة الزائر</span>
            <h1>ادخل إلى الحكاية،<br /><em>واترك أثرًا في الماء.</em></h1>
            <p>سجّل دخولك بحساب Manus لتصل إلى تجربة الزائر ولوحة المتابعة الخاصة بك. الموقع العام يظل مفتوحًا للقراءة دون تسجيل.</p>
            <div className="login-fact"><span><Landmark size={17} /></span><div><strong>من أسوان إلى كل شاشة</strong><small>بحث بصري عربي عن مشروع غيّر وجه الوادي.</small></div></div>
          </div>
          <div className="login-story-foot"><span>© السد العالي | أحمد حمدي</span><span>بيانات مجهولة ومحترمة</span></div>
        </section>

        <section className="login-card" aria-labelledby="login-title">
          <div className="login-card-icon"><LogIn size={22} /></div>
          {loading ? <div className="login-card-state"><div className="login-loader" /><p>جارٍ التحقق من الحساب...</p></div> : isAuthenticated ? (
            <>
              <span className="login-kicker"><CheckCircle2 size={15} /> تم تسجيل الدخول</span>
              <h2 id="login-title">مرحبًا بك،<br /><strong>{user?.name || "زائر الموقع"}</strong></h2>
              <p className="login-card-copy">أنت مسجل الآن ويمكنك العودة للموقع أو فتح لوحة متابعة الزوار.</p>
              <div className="login-actions"><a className="login-primary" href="/"><ArrowRight size={17} /> العودة إلى الموقع</a><a className="login-secondary" href="/dashboard">فتح لوحة الزوار <ArrowLeft size={16} /></a></div>
              <button type="button" className="login-logout" onClick={() => logout().catch(() => undefined)}><LogOut size={15} /> تسجيل الخروج</button>
            </>
          ) : (
            <>
              <span className="login-kicker"><ShieldCheck size={15} /> دخول آمن</span>
              <h2 id="login-title">مرحبًا بك في<br /><strong>بوابة السد العالي</strong></h2>
              <p className="login-card-copy">استخدم حساب Manus الخاص بك لتسجيل الدخول. لا نطلب كلمة مرور جديدة ولا نحتفظ بكلمة مرورك.</p>
              <button type="button" className="login-primary login-button" onClick={handleLogin}><LogIn size={18} /> تسجيل الدخول بحساب Manus <ArrowLeft size={16} /></button>
              {loginError && <p className="login-error" role="alert">{loginError}</p>}
              <p className="login-note">بتسجيل الدخول، تظل بيانات الزيارة إحصائية ومجهولة ولا يتم تخزين عنوان IP الخام.</p>
              <a href="/" className="login-back"><ArrowRight size={15} /> متابعة القراءة دون تسجيل</a>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
