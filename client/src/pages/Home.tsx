import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  BookOpen,
  Droplets,
  Factory,
  Landmark,
  LogIn,
  Menu,
  Mountain,
  Shield,
  Sparkles,
  Waves,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import TelegramChat from "@/components/TelegramChat";

const timeline = [
  { year: "1902", title: "خزان أسوان القديم", text: "بدأت أولى الخطوات العملية لتنظيم مياه النيل بإنشاء خزان أسوان بين عامي 1899 و1902، ثم تعليته في 1912 و1933. ظلت سعته محدودة أمام سنوات الفيضان والشح.", note: "الجذور الأولى لفكرة التخزين" },
  { year: "1948", title: "تصور الخزان العملاق", text: "طرح المهندس أدريان دانينوس تصورًا لخزان عملاق جنوب أسوان. بعد ثورة 23 يوليو 1952 تبنّت الدولة المشروع وأجرت الدراسات الفنية اللازمة.", note: "من فكرة هندسية إلى قرار وطني" },
  { year: "1956", title: "التمويل وتأميم القناة", text: "بعد سحب العرض الغربي لتمويل السد، أعلن جمال عبد الناصر تأميم شركة قناة السويس في 26 يوليو 1956، لتصبح عائدات القناة مصدرًا لتمويل المشروع.", note: "السد كمعركة استقلال" },
  { year: "1960", title: "بدء التنفيذ", text: "بدأ التنفيذ الفعلي في 9 يناير 1960. حُفرت قناة التحويل والأنفاق، وتحول مجرى النيل في 15 مايو 1964 بحضور نيكيتا خروتشوف.", note: "المرحلة الأولى: التحويل والأنفاق" },
  { year: "1971", title: "الافتتاح والسعة التصميمية", text: "اكتمل جسم السد ومحطة التوليد عام 1970، وافتُتح رسميًا في 15 يناير 1971. وبلغت البحيرة سعتها التصميمية نحو عام 1976.", note: "مشروع يغيّر وجه الوادي" },
];

const chapters = [
  { icon: <Factory size={21} />, number: "01", title: "الأهمية الاقتصادية", intro: "كيف انتقلت مصر من رهينة للفيضان إلى إدارة مائية على مدار العام.", detail: "حماية من الفيضان والجفاف، تحويل نحو 700 ألف فدان إلى الري الدائم، توليد كهرباء مائية رخيصة، دعم الملاحة والثروة السمكية — مع إدارة آثار حجز الطمي والتبخر." },
  { icon: <Landmark size={21} />, number: "02", title: "الأهمية السياسية", intro: "من مفاوضات التمويل إلى تأميم قناة السويس وتوازنات الحرب الباردة.", detail: "ارتبط السد بالعدوان الثلاثي عام 1956، ثم بالتعاون مع الاتحاد السوفيتي واتفاقية مياه النيل مع السودان عام 1959، ولا يزال حاضرًا في ملف الأمن المائي." },
  { icon: <Shield size={21} />, number: "03", title: "الأمن الاستراتيجي", intro: "منشأة حيوية تحمي الماء والكهرباء وتحتاج إلى أعلى درجات التأمين.", detail: "أصبح أمن السد يشمل الدفاع الجوي، الإنذار المبكر، حماية نظم التحكم والاتصالات من الهجمات السيبرانية، وإدارة الأزمات — لا مجرد حماية جسم السد." },
  { icon: <Mountain size={21} />, number: "04", title: "الذاكرة والتاريخ", intro: "حين أنقذ المشروع معابد النوبة وفتح فصلًا عالميًا في حماية التراث.", detail: "أطلقت اليونسكو حملة دولية لإنقاذ آثار النوبة، ونُقل معبدا أبو سمبل بين 1964 و1968 إلى موقع أعلى بنحو 200 متر عن النهر." },
  { icon: <Waves size={21} />, number: "05", title: "بحيرة ناصر", intro: "بحيرة صناعية هائلة أعادت رسم جغرافيا الجنوب والاقتصاد المحلي.", detail: "تزيد على 500 كم طولًا، وتبلغ مساحتها السطحية نحو 5,250 كم²، وتجمع بين التخزين المائي والملاحة والصيد والسياحة." },
  { icon: <Sparkles size={21} />, number: "06", title: "رؤية 2030", intro: "ماذا يعني أن ندير إرث السد في زمن الشح والتحول الرقمي؟", detail: "ترشيد المياه، الري الحديث، الطاقة الشمسية في أسوان، الذكاء الاصطناعي للتنبؤ، الأمن السيبراني، وتنمية بحيرة ناصر بصورة مستدامة." },
];

const futureItems = [
  ["الأمن المائي", "ترشيد الاستخدام، إعادة الاستخدام، التحلية، والري الحديث وفق الخطة القومية للموارد المائية."],
  ["التوسع الزراعي", "استصلاح أراضٍ جديدة في الدلتا الجديدة وتوشكى مع رفع كفاءة كل قطرة مياه."],
  ["الطاقة", "المزج بين الكهرباء المائية والطاقة الشمسية، ومنها مجمع بنبان في أسوان."],
  ["التحول الرقمي", "الأقمار الصناعية والذكاء الاصطناعي للتنبؤ بالفيضان وإدارة البحيرة وحماية نظم التحكم."],
  ["البيئة والتنمية", "تنمية الثروة السمكية والسياحة المستدامة ومتابعة الأثر البيئي ومعالجة الطمي."],
  ["الدبلوماسية المائية", "التعاون مع دول حوض النيل والتوصل إلى قواعد قانونية ملزمة للملء والتشغيل."],
];

const videos = [
  { id: "Rhwx3rBP1YE", title: "ملحمة إنشاء السد العالي", text: "فيلم تسجيلي عن تاريخ المشروع ومراحل تنفيذه وتحوله إلى رمز وطني." },
  { id: "pVXf66vnvBU", title: "السد العالي وبحيرة ناصر", text: "نظرة على السد والبحيرة ودورهما في تنظيم مياه النيل وحماية الوادي." },
  { id: "YBbtQ72MOI0", title: "السد العالي وإنقاذ المعابد", text: "رحلة بصرية إلى أثر السد في إنقاذ معابد النوبة وأبو سمبل." },
];

const tahyaMasrVideoId = "KiqqxNh6-Jo";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });
  const [menuOpen, setMenuOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState(2);
  const selected = timeline[activeTimeline];

  useEffect(() => {
    if (!user) return;
    const key = "alsadd-visit-session";
    const sessionId = sessionStorage.getItem(key) || crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
    const details = { sessionId, page: window.location.pathname, referrer: document.referrer, language: navigator.language, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, screen: `${window.innerWidth}x${window.innerHeight}` };
    fetch("/api/telegram/visit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...details, event: "visit" }), keepalive: true }).catch(() => undefined);
    const notifyLeave = () => {
      const body = JSON.stringify({ ...details, event: "leave" });
      if (navigator.sendBeacon) navigator.sendBeacon("/api/telegram/visit", new Blob([body], { type: "application/json" }));
    };
    window.addEventListener("pagehide", notifyLeave);
    return () => window.removeEventListener("pagehide", notifyLeave);
  }, [user]);

  if (loading || !user) {
    return <div className="site-auth-loading" dir="rtl"><span className="login-loader" /><p>جارٍ تجهيز بوابة الموقع...</p></div>;
  }

  const toggleMusic = () => {
    setMusicOn((value) => !value);
  };

  const go = (id: string) => {
    setMenuOpen(false);
    scrollToId(id);
  };

  return (
    <div className="site-shell" dir="rtl">
      <header className="site-header">
        <div className="container nav-inner">
          <a className="brand" href="#top" aria-label="العودة إلى بداية الموقع" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark"><span /></span>
            <span className="brand-copy"><strong>السد العالي</strong><small>قصة وطن وماء</small></span>
          </a>
          <nav className={`nav-links ${menuOpen ? "open" : ""}`} aria-label="التنقل الرئيسي">
            <a href="#story" onClick={() => setMenuOpen(false)}>الحكاية</a>
            <a href="#engineering" onClick={() => setMenuOpen(false)}>الهندسة</a>
            <a href="#impact" onClick={() => setMenuOpen(false)}>الأثر</a>
            <a href="#heritage" onClick={() => setMenuOpen(false)}>الذاكرة</a>
            <a href="#videos" onClick={() => setMenuOpen(false)}>فيديوهات</a>
            <a href="#future" onClick={() => setMenuOpen(false)}>2030</a>
            <a className="nav-login" href="/login" onClick={() => setMenuOpen(false)}><LogIn size={14} /> دخول الزائر</a>
            <a className="nav-cta" href="#sources" onClick={() => setMenuOpen(false)}>المراجع <ArrowLeft size={15} /></a>
          </nav>
          <button className="music-btn" type="button" onClick={toggleMusic} aria-label={musicOn ? "إيقاف أغنية تحيا مصر" : "تشغيل أغنية تحيا مصر"} title={musicOn ? "إيقاف أغنية تحيا مصر" : "تشغيل أغنية تحيا مصر"}>
            {musicOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button className="menu-btn" type="button" aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"} onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <main id="top">
        {musicOn && <iframe className="music-frame" src={`https://www.youtube.com/embed/${tahyaMasrVideoId}?autoplay=1&loop=1&playlist=${tahyaMasrVideoId}&controls=0&modestbranding=1&rel=0`} title="أغنية تحيا مصر الرسمية" allow="autoplay; encrypted-media" />}
        <section className="hero">
          <div className="hero-inner">
            <div className="quran-hero-verse" aria-label="آيات قرآنية عن الماء">
              <div className="quran-hero-item"><p>﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ﴾ <span>٣٠</span></p><small>سورة الأنبياء</small></div>
              <span className="quran-hero-divider" aria-hidden="true">۞</span>
              <div className="quran-hero-item"><p>﴿وَأَنزَلْنَا مِنَ السَّمَاءِ مَاءً طَهُورًا﴾ <span>٤٨</span></p><small>سورة الفرقان</small></div>
            </div>
            <div className="student-signature" aria-label="اسم الطالب">
              <span>إعداد الطالب</span>
              <strong>أحـمد حـمدي عـبد الونـيس جـبر</strong>
              <small>Ahmed Hamdy Abd Elwennes Gabr</small>
            </div>
            <div className="institution-strip" aria-label="الجهات المشرفة على البحث">
              <div className="institution-logo"><img src="/assets/logo-defense.png" alt="شعار الدفاع الشعبي والعسكري" /><span>الدفاع الشعبي والعسكري</span><small className="institution-subtitle">التربية العسكرية</small></div>
              <div className="institution-logo"><img src="/assets/logo-education.png" alt="شعار وزارة التعليم العالي والبحث العلمي والمعهد العالي للحاسبات والمعلومات والتكنولوجيا إدارة-طنطا" /><strong>وزارة التعليم العالي والبحث العلمي</strong><span>المعهد العالي للحاسبات والمعلومات والتكنولوجيا إدارة-طنطا</span></div>
              <div className="institution-logo"><img src="/assets/logo-armed-forces.jpg" alt="شعار القوات المسلحة المصرية" /><span>القوات المسلحة المصرية</span></div>
            </div>
            <div className="hero-kicker"><span /> بحث بصري في مشروع غيّر مصر</div>
            <h1 className="display">مشروع واحد،<br /><em>وادي كامل يتنفس.</em></h1>
            <p className="hero-lede">من فكرة لتنظيم الفيضان إلى رصيد استراتيجي يحمي الماء والكهرباء والذاكرة. تعرّف إلى السد العالي من الداخل — بالأرقام، وبالحكايات التي صنعت أثره.</p>
            <div className="hero-actions">
              <a className="primary-btn" href="#story">ابدأ الرحلة <ArrowDownLeft size={18} /></a>
              <a className="ghost-btn" href="#engineering">استكشف الأرقام <ArrowLeft size={17} /></a>
            </div>
            <div className="hero-foot">
              <div><strong>1960 — 1971</strong> سنوات التنفيذ والافتتاح</div>
              <span className="divider" />
              <div><strong>أسوان</strong> بوابة الجنوب ومجرى النيل</div>
              <span className="divider" />
              <div><strong>2030</strong> إرث يتطلب إدارة جديدة</div>
            </div>
          </div>
        </section>

        <section className="section intro" id="story">
          <div className="container intro-grid">
            <aside className="intro-aside">
              <span className="eyebrow">لماذا السد العالي؟</span>
              <h2 className="display">حين يصبح الماء قرارًا استراتيجيًا.</h2>
              <p>السد ليس مجرد جدار يحجز مياه النيل؛ إنه قرار أعاد تشكيل الاقتصاد والسياسة والجغرافيا والذاكرة المصرية.</p>
            </aside>
            <div className="intro-copy">
              <blockquote className="quote"><p>«لم يكن السد العالي مشروعًا هندسيًا فحسب، بل كان إعلانًا عن قدرة الدولة على أن تصنع مستقبلها بيديها.»</p><small>مدخل إلى البحث</small></blockquote>
              <p>ارتبطت حياة المصريين منذ فجر التاريخ بنهر النيل. كان الفيضان العالي يغرق القرى والحقول، والمنخفض يهدد المحاصيل. ومع خزان أسوان القديم بدأت محاولات التنظيم، لكن سعة التخزين لم تعد تكفي أمام سنوات الشح والفيضان.</p>
              <p>جاء السد العالي ليمنح الدولة قدرة جديدة: <strong>تخزين مياه عدة سنوات، وتوزيعها على مدار العام، وتوليد كهرباء، وحماية الوادي</strong>، مع فتح أسئلة لا تقل أهمية عن الطمي والتهجير والأثر البيئي. لذلك نقرأه هنا كمشروع متعدد الأبعاد، لا كرقم منفرد.</p>
            </div>
          </div>
        </section>

        <section className="stats-band" aria-label="أرقام أساسية عن السد العالي">
          <div className="container stats-grid">
            <div className="stat"><div className="stat-value">111 م</div><div className="stat-label">ارتفاع السد</div><div className="stat-note">سد ركامي بقلب طيني كتيم</div></div>
            <div className="stat"><div className="stat-value">3,830 م</div><div className="stat-label">طول السد عند القمة</div><div className="stat-note">امتداد يعادل تقريبًا 38 ملعبًا</div></div>
            <div className="stat"><div className="stat-value">162 مليار</div><div className="stat-label">م³ سعة بحيرة ناصر</div><div className="stat-note">التقدير المتداول عند منسوب 182 م</div></div>
            <div className="stat"><div className="stat-value">2,100 MW</div><div className="stat-label">القدرة المركبة</div><div className="stat-note">12 وحدة توليد × 175 ميجاوات</div></div>
          </div>
        </section>

        <section className="section timeline-section" id="timeline">
          <div className="container">
            <div className="section-heading"><div><span className="eyebrow">الزمن كخريطة</span><h2 className="display">من خزان صغير إلى مشروع يملأ الأفق.</h2></div><p>اضغط على أي محطة لتتبع انتقال الفكرة من احتياج مائي إلى قرار سياسي وتنفيذ هندسي واسع.</p></div>
            <div className="timeline-wrap">
              <div className="timeline-list" role="tablist" aria-label="مراحل بناء السد العالي">
                {timeline.map((item, index) => <button key={item.year} className={`timeline-item ${index === activeTimeline ? "active" : ""}`} type="button" role="tab" aria-selected={index === activeTimeline} onClick={() => setActiveTimeline(index)}><span className="timeline-year">{item.year}</span><span className="timeline-title">{item.title}</span></button>)}
              </div>
              <article className="timeline-detail" data-year={selected.year}>
                <span className="eyebrow">المحطة {activeTimeline + 1} / 5</span>
                <h3 className="display">{selected.title}</h3>
                <p>{selected.text}</p>
                <span className="detail-note"><Droplets size={16} /> {selected.note}</span>
              </article>
            </div>
          </div>
        </section>

        <section className="section engineering" id="engineering">
          <div className="container">
            <div className="section-heading"><div><span className="eyebrow">الفصل الأول · الهندسة</span><h2 className="display">ليس سدًا فقط، بل منظومة مائية كاملة.</h2></div><p>قناة تحويل، أنفاق، مفيض، بحيرة، ومحطة كهرباء — يعمل كل جزء داخل منظومة واحدة.</p></div>
            <div className="engineering-grid">
              <div className="feature-image"><img src="/assets/aswan-dam.jpg" alt="منشآت محطة السد العالي والمياه المتدفقة" /><div className="image-caption"><strong>السد العالي في أسوان</strong> صورة مرجعية: Wikimedia Commons · Aswan High Dam-1</div></div>
              <div>
                <p className="intro-copy" style={{ margin: 0 }}>يقع السد جنوب مدينة أسوان، وهو سد ركامي يتكون من الصخور والرمال، بقلب طيني يمنع تسرب المياه، وستارة حقن أسمنتي في طبقات الأساس الصخرية.</p>
                <div className="spec-list">
                  <div className="spec"><strong>43 مليون م³</strong><span>حجم مواد الإنشاء تقريبًا</span></div>
                  <div className="spec"><strong>40 م</strong><span>عرض القمة</span></div>
                  <div className="spec"><strong>980 م</strong><span>عرض القاعدة</span></div>
                  <div className="spec"><strong>12 وحدة</strong><span>توربينات فرنسيس</span></div>
                </div>
                <a className="text-link" href="#comparison">شاهد المقارنة مع خزان أسوان القديم <ArrowLeft size={16} /></a>
              </div>
            </div>
          </div>
        </section>

        <section className="section nasser" id="lake">
          <div className="container">
            <div className="section-heading"><div><span className="eyebrow">بحيرة ناصر</span><h2 className="display">المخزون الذي منح الوادي وقتًا.</h2></div><p>خلف جسم السد تمددت واحدة من أكبر البحيرات الصناعية في العالم، لتصبح مخزونًا مائيًا واقتصاديًا وبيئيًا.</p></div>
            <div className="nasser-grid">
              <div className="nasser-copy"><p>تزيد البحيرة على 500 كم طولًا، منها نحو 350 كم داخل مصر ونحو 150 كم داخل السودان حيث تُعرف ببحيرة النوبة. تصل مساحتها السطحية إلى نحو 5,250 كم²، وتنقسم سعتها إلى تخزين ميت لاستيعاب الطمي، وتخزين حي لتلبية احتياجات الري والشرب والكهرباء، وتخزين للفيضان.</p><div className="lake-facts"><div className="lake-fact"><span>الطول الإجمالي</span><strong>أكثر من 500 كم</strong></div><div className="lake-fact"><span>أقصى عرض</span><strong>نحو 35 كم</strong></div><div className="lake-fact"><span>التخزين الحي</span><strong>نحو 90 مليار م³</strong></div><div className="lake-fact"><span>مفيض توشكى</span><strong>تصريف الزيادة عند الحاجة</strong></div></div></div>
              <div className="lake-image"><img src="/assets/lake-nasser.jpg" alt="منظر جوي لبحيرة ناصر والجزر الصخرية" /></div>
            </div>
          </div>
        </section>

        <section className="section chapters" id="impact">
          <div className="container">
            <div className="section-heading"><div><span className="eyebrow">فصول الأثر</span><h2 className="display">أكثر من وظيفة، وأبعد من زمن.</h2></div><p>افتح أي فصل لتقرأ خلاصة المحور وتفاصيله الأساسية دون مغادرة الصفحة.</p></div>
            <div className="chapters-grid">
              {chapters.map((chapter) => <article className="chapter-card" key={chapter.number}><div className="chapter-num"><span>{chapter.number}</span><span className="chapter-icon">{chapter.icon}</span></div><h3>{chapter.title}</h3><p>{chapter.intro}</p><details><summary>قراءة الخلاصة</summary><p>{chapter.detail}</p></details></article>)}
            </div>
          </div>
        </section>

        <section className="section comparison" id="comparison">
          <div className="container">
            <div className="section-heading"><div><span className="eyebrow">قراءة بالأرقام</span><h2 className="display">لماذا احتاجت مصر إلى سد أكبر؟</h2></div><p>المقارنة لا تلغي قيمة الخزان القديم؛ إنها تشرح اختلاف الوظيفة والحجم والقدرة على مواجهة تقلبات النهر.</p></div>
            <div className="comparison-grid">
              <table className="comparison-table"><thead><tr><th>وجه المقارنة</th><th>خزان أسوان القديم</th><th>السد العالي</th></tr></thead><tbody><tr><td>فترة الإنشاء</td><td>1899 — 1902</td><td>1960 — 1970</td></tr><tr><td>النوع</td><td>سد حجري بأكتاف وبوابات</td><td>سد ركامي بقلب طيني</td></tr><tr><td>الارتفاع</td><td>36 مترًا</td><td>111 مترًا</td></tr><tr><td>الطول</td><td>1,950 مترًا</td><td>3,830 مترًا</td></tr><tr><td>السعة التخزينية</td><td>5.5 مليار م³</td><td>162 مليار م³</td></tr><tr><td>الدور الرئيسي</td><td>تنظيم موسمي محدود</td><td>تخزين يغطي عدة سنوات</td></tr></tbody></table>
              <aside className="callout"><h3>نحو 30 ضعفًا</h3><p>تبلغ سعة السد العالي نحو ثلاثين ضعف سعة الخزان القديم، وهو ما يفسر قدرته على تخزين مياه عدة سنوات. ولا يزال الخزان القديم يعمل بجواره، ويضم محطتي أسوان 1 وأسوان 2.</p><a href="#future">إلى أسئلة المستقبل <ArrowLeft size={16} /></a></aside>
            </div>
          </div>
        </section>

        <section className="section heritage" id="heritage">
          <div className="container">
            <div className="section-heading"><div><span className="eyebrow">الفصل الخامس · الذاكرة</span><h2 className="display">حين أنقذ السد ما لا يُقدّر بثمن.</h2></div><p>لم تكن البحيرة ستغمر الماء فقط؛ كانت ستغمر عشرات المواقع الأثرية. جاءت حملة اليونسكو لتكتب فصلًا عالميًا في إنقاذ التراث.</p></div>
            <div className="heritage-grid">
              <article className="heritage-card"><img src="/assets/abu-simbel.jpg" alt="الواجهة الأمامية للمعبد الكبير في أبو سمبل" /><div className="heritage-content"><span className="eyebrow">1964 — 1968</span><h3>أبو سمبل<br />في موقع جديد</h3><p>قُطّع المعبدان إلى 1,036 كتلة حجرية، ثم أعيد تركيبهما أعلى بنحو 200 متر عن النهر داخل جبل صناعي.</p><span className="heritage-note"><Landmark size={15} /> حفظت العملية ظاهرة تعامد الشمس</span></div></article>
              <article className="heritage-card"><img src="/assets/lake-nasser.jpg" alt="بحيرة ناصر في محيط آثار النوبة" /><div className="heritage-content"><span className="eyebrow">حملة دولية</span><h3>من أبو سمبل<br />إلى فيلة</h3><p>شاركت أكثر من 50 دولة في حملة اليونسكو التي مهدت لإقرار اتفاقية حماية التراث العالمي عام 1972.</p><span className="heritage-note"><BookOpen size={15} /> ذاكرة النوبة بين المكان والإنسان</span></div></article>
            </div>
          </div>
        </section>

        <section className="section video-gallery" id="videos">
          <div className="container">
            <div className="section-heading"><div><span className="eyebrow">شاهد القصة</span><h2 className="display">السد العالي في ثلاث حكايات مصوّرة.</h2></div><p>مختارات مرئية تساعدك على فهم تاريخ المشروع، وبحيرة ناصر، وإنقاذ آثار النوبة.</p></div>
            <div className="video-grid">
              {videos.map((video) => <article className="video-card" key={video.id}><div className="video-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${video.id}`} title={video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><div className="video-content"><span className="eyebrow">فيديو مختار</span><h3>{video.title}</h3><p>{video.text}</p><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer">فتح الفيديو على YouTube <ArrowLeft size={15} /></a></div></article>)}
            </div>
          </div>
        </section>

        <section className="section future" id="future">
          <div className="container">
            <div className="future-grid">
              <div className="future-intro"><span className="eyebrow">رؤية مصر 2030</span><h2 className="display">الإرث ليس ما نحتفظ به، بل ما نحسن إدارته.</h2><p>يظل السد أصلًا استراتيجيًا، لكن التحدي يتغير: ماء أقل يقينًا، طلب أكبر، وتقنيات تمنحنا أدوات جديدة للحماية والتنبؤ.</p></div>
              <div className="future-list">{futureItems.map(([title, text], index) => <article className="future-item" key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
            </div>
            <div className="recommendations"><div><h3>توصيات البحث</h3><ul><li>الحفاظ على منظومة حماية السد بأحدث وسائل الدفاع والأمن السيبراني.</li><li>رفع كفاءة الري وترشيد استهلاك المياه لتعويض الفجوة بين الموارد والاحتياجات.</li><li>تعزيز التعاون الفني مع دول حوض النيل وتبادل البيانات الهيدرولوجية.</li><li>توعية الشباب بقيمة المشروع وقصته بوصفه نموذجًا للإرادة الوطنية.</li></ul></div><div><h3>الخلاصة</h3><p>السد العالي ليس ماضيًا نتذكره فقط، بل رصيد استراتيجي ينبغي أن نحسن إدارته وحمايته للأجيال القادمة.</p><a className="text-link" href="#top">العودة إلى البداية <ArrowUpLeft size={16} /></a></div></div>
          </div>
        </section>
      </main>

      <footer className="sources" id="sources">
        <div className="container">
          <div className="sources-grid"><div><span className="eyebrow">اقرأ وتحقق</span><h2 className="display">الماء قصة تحتاج إلى مصادر.</h2><p>هذا الموقع يعيد تنظيم مادة البحث في صيغة بصرية. يُنصح بمراجعة الأرقام مع أحدث إصدارات الجهات الرسمية، فقد تختلف التقديرات بحسب المنسوب والتعريف.</p></div><div><ol><li>وزارة الموارد المائية والري المصرية — <a href="https://www.mwri.gov.eg" target="_blank" rel="noreferrer">mwri.gov.eg</a></li><li>الهيئة العامة للاستعلامات — <a href="https://www.sis.gov.eg" target="_blank" rel="noreferrer">ملف السد العالي</a></li><li>اليونسكو — <a href="https://www.unesco.org/en/list/88" target="_blank" rel="noreferrer">آثار النوبة من أبو سمبل إلى فيلة</a></li><li>البنك الدولي — <a href="https://www.worldbank.org/en/country/egypt" target="_blank" rel="noreferrer">بيانات مصر وقطاع المياه والزراعة</a></li><li>منظمة الأغذية والزراعة — <a href="https://www.fao.org/aquastat" target="_blank" rel="noreferrer">قاعدة بيانات أكواستات</a></li><li>موسوعة بريتانيكا — <a href="https://www.britannica.com/topic/Aswan-High-Dam" target="_blank" rel="noreferrer">Aswan High Dam</a></li><li>مبادرة حوض النيل — <a href="https://nilebasin.org" target="_blank" rel="noreferrer">معلومات الحوض والتعاون</a></li><li>وزارة الكهرباء والطاقة المتجددة المصرية — <a href="https://www.moee.gov.eg" target="_blank" rel="noreferrer">moee.gov.eg</a></li><li>Waterbury, J. (1979). Hydropolitics of the Nile Valley.</li><li>Fahim, H. M. (1981). Dams, People and Development.</li></ol></div></div>
          <div className="footer-bottom"><span>© السد العالي | قصة وطن وماء · بحث التربية العسكرية · 2026 / 2027</span><span>الصور: Wikimedia Commons · <a href="https://commons.wikimedia.org/wiki/Category:Aswan_High_Dam" target="_blank" rel="noreferrer">المصدر</a></span></div>
        </div>
      </footer>
      <TelegramChat />
    </div>
  );
}
