import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, ArrowRight, CheckCircle2, ImagePlus, Landmark, LogIn, LogOut, ShieldCheck, UserPlus, Waves } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";

async function compressProfileImage(file: File) {
  const source = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
  const size = 320;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("تعذر تجهيز الصورة");
  const scale = Math.max(size / source.width, size / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  context.drawImage(source, (size - width) / 2, (size - height) / 2, width, height);
  URL.revokeObjectURL(source.src);
  return canvas.toDataURL("image/jpeg", 0.72);
}

export default function Login() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("اختر ملف صورة صالحًا.");
    try {
      setError("");
      setProfileImage(await compressProfileImage(file));
      setImageName(file.name);
    } catch {
      setError("تعذر قراءة الصورة. جرّب صورة أخرى.");
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload = mode === "register" ? { name, email, password, birthDate, profileImage } : { email, password };
      const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "تعذر تنفيذ الطلب");
      window.location.href = "/";
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "حدث خطأ غير متوقع");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login-page" dir="rtl">
      <div className="login-orbit login-orbit-one" /><div className="login-orbit login-orbit-two" />
      <div className="login-shell">
        <section className="login-story">
          <a href="/" className="login-brand" aria-label="العودة إلى الموقع"><span className="brand-mark"><span /></span><span><strong>أُفُق | OFOQ</strong><small>أفقٌ أوسع، ومعرفةٌ تصنع الأثر.</small></span></a>
          <div className="login-story-content"><span className="login-eyebrow"><Waves size={16} /> بوابة الزائر المستقلة</span><h1>ادخل إلى الحكاية،<br /><em>واترك أثرًا في الماء.</em></h1><p>أنشئ حسابك بالبريد الإلكتروني، وأضف صورتك وتاريخ ميلادك لتبدأ رحلة خاصة داخل موقع السد العالي.</p><div className="login-fact"><span><Landmark size={17} /></span><div><strong>بياناتك للموقع فقط</strong><small>لا نعتمد على حساب Manus ولا نطلب كلمة مرور من أي جهة أخرى.</small></div></div></div>
          <div className="login-story-foot"><span>© أُفُق | OFOQ | أحمد حمدي</span><span>جلسات آمنة ومشفّرة</span></div>
        </section>

        <section className="login-card" aria-labelledby="login-title">
          <div className="login-card-icon">{mode === "register" ? <UserPlus size={22} /> : <LogIn size={22} />}</div>
          {loading ? <div className="login-card-state"><div className="login-loader" /><p>جارٍ التحقق من الحساب...</p></div> : isAuthenticated ? (
            <><span className="login-kicker"><CheckCircle2 size={15} /> تم تسجيل الدخول</span><h2 id="login-title">مرحبًا بك،<br /><strong>{user?.name || "زائر الموقع"}</strong></h2><p className="login-card-copy">حسابك جاهز. يمكنك العودة إلى الموقع أو فتح لوحة الإدارة إذا كان حسابك مصرحًا له.</p><div className="login-actions"><a className="login-primary" href="/"><ArrowRight size={17} /> العودة إلى الموقع</a><a className="login-secondary" href="/admin">فتح لوحة الإدارة <ArrowLeft size={16} /></a></div><button type="button" className="login-logout" onClick={() => logout().catch(() => undefined)}><LogOut size={15} /> تسجيل الخروج</button></>
          ) : (
            <><span className="login-kicker"><ShieldCheck size={15} /> دخول مستقل وآمن</span><h2 id="login-title">{mode === "register" ? <>أنشئ حسابك في<br /><strong>بوابة أُفُق</strong></> : <>مرحبًا بك في<br /><strong>بوابة أُفُق</strong></>}</h2><div className="login-mode-switch"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>تسجيل الدخول</button><button type="button" className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>حساب جديد</button></div><form onSubmit={submit} className="login-form">
              {mode === "register" && <><label>الاسم الكامل<input required value={name} onChange={e => setName(e.target.value)} placeholder="اكتب اسمك" /></label><div className="login-form-row"><label>تاريخ الميلاد<input required type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} /></label><label className="profile-upload-label">صورة الملف الشخصي<input required type="file" accept="image/*" onChange={handleImage} /><span className="profile-upload-box">{profileImage ? <img src={profileImage} alt="معاينة الصورة الشخصية" /> : <ImagePlus size={20} />}<small>{imageName || "اختر صورة"}</small></span></label></div></>}
              <label>البريد الإلكتروني<input required type="email" dir="ltr" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" /></label><label>كلمة المرور<input required minLength={8} type="password" dir="ltr" value={password} onChange={e => setPassword(e.target.value)} placeholder="8 أحرف على الأقل" /></label><button className="login-primary login-button" type="submit" disabled={busy}>{busy ? "جارٍ التنفيذ..." : mode === "register" ? "إنشاء الحساب" : "تسجيل الدخول"} <ArrowLeft size={16} /></button>{error && <p className="login-error" role="alert">{error}</p>}</form><p className="login-note">بتسجيل الحساب، ستُحفظ صورة الملف الشخصي وتاريخ الميلاد ضمن ملفك الخاص بالموقع.</p><a href="/" className="login-back"><ArrowRight size={15} /> متابعة إلى الصفحة الرئيسية</a></>
          )}
        </section>
      </div>
    </main>
  );
}
