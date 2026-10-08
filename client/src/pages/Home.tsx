import { ArrowLeft, ArrowRight, BookOpen, Landmark, Sparkles } from "lucide-react";
import { articles } from "@/data/articles";
import { LanguageToggle, useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { isEnglish } = useLanguage();
  const featured = articles.slice(0, 6);
  return <main className="articles-page ofoq-home" dir={isEnglish ? "ltr" : "rtl"}>
    <header className="articles-header">
      <div className="articles-toolbar"><a href="/" className="articles-back"><Landmark size={16} /> أُفُق | OFOQ</a><LanguageToggle /></div>
      <div className="ofoq-home-signature"><span>إعداد وتقديم</span><strong>أحمد حمدي عبد الونيس جبر</strong><small>رؤية تُقرأ، ومعرفة تُبنى، وأثرٌ يبقى.</small></div>
      <div className="ofoq-home-verses" aria-label="آيات عن القراءة والكتابة والعلم"><div><p>﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾</p><small>سورة العلق · ١</small></div><div><p>﴿الَّذِي عَلَّمَ بِالْقَلَمِ﴾</p><small>سورة العلق · ٤</small></div><div><p>﴿وَقُلْ رَبِّ زِدْنِي عِلْمًا﴾</p><small>سورة طه · ١١٤</small></div><div><p>﴿ن وَالْقَلَمِ وَمَا يَسْطُرُونَ﴾</p><small>سورة القلم · ١</small></div></div>
      <span className="articles-kicker"><Sparkles size={16} /> {isEnglish ? "A wider horizon for knowledge" : "رؤية أوسع · معرفة أعمق"}</span>
      <h1>{isEnglish ? <>Open a wider <em>horizon.</em><br />Read the world differently.</> : <>نفتح أفقًا <em>أوسع.</em><br />لنقرأ العالم بشكل مختلف.</>}</h1>
      <p>{isEnglish ? "OFOQ is a knowledge space for documented articles, stories and ideas. Each topic has its own complete page, giving you a clear path from context to meaning." : "أُفُق مساحة معرفية تجمع المقالات والقصص والأفكار الموثقة. لكل موضوع صفحته الكاملة، حتى تنتقل من السياق إلى المعنى في رحلة واضحة وهادئة."}</p>
      <div className="hero-actions" style={{ marginTop: 28 }}><a className="primary-btn" href="/articles">{isEnglish ? "Explore the articles" : "استكشف المقالات"} <ArrowLeft size={17} /></a><a className="ghost-btn" href="/high-dam">{isEnglish ? "Read the High Dam research" : "اقرأ بحث السد العالي"} <ArrowRight size={17} /></a></div>
    </header>

    <section className="section intro" id="about-ofoq">
      <div className="container intro-grid">
        <aside className="intro-aside"><span className="eyebrow">أُفُق | OFOQ</span><h2 className="display">الاسم وعدٌ بالرؤية.</h2><p>الأفق هو المساحة التي نرى فيها أبعد من اللحظة؛ لذلك نكتب عن التاريخ والماء والحرب والتراث والمستقبل من أكثر من زاوية.</p></aside>
        <div className="intro-copy"><blockquote className="quote"><p>«نفتح أفقًا أوسع للمعرفة، ونحوّل الرؤية إلى أثر.»</p><small>فلسفة الموقع</small></blockquote><p>في أُفُق لا نكتفي بعنوان سريع. نضع كل قصة في صفحة مستقلة، بمقدمة واضحة، ومحتوى متدرج، وصور ومصادر تساعدك على القراءة والتحقق.</p><p>ابدأ من أي موضوع، ثم انتقل بين المقالات لتبني صورتك الكاملة بنفسك.</p></div>
      </div>
    </section>

    <section className="section" id="articles-preview">
      <div className="container"><div className="section-heading"><div><span className="eyebrow"><BookOpen size={15} /> مكتبة أُفُق</span><h2 className="display">كل قصة تستحق صفحة كاملة.</h2></div><p>مقالات مستقلة، بتصميم واحد واضح، ومحتوى يفتح لك نافذة جديدة على الموضوع.</p></div>
        <div className="articles-grid">{featured.map(article => { const Icon = article.icon; const title = isEnglish ? (article.titleEn || article.title) : article.title; const lead = isEnglish ? (article.leadEn || article.lead) : article.lead; return <article className="article-card" key={article.slug}>{<img className="article-card-image" src={article.image || "/assets/aswan-dam.jpg"} alt={article.imageAlt || title} />}<div className="article-card-top"><span className="article-icon"><Icon size={21} /></span><span>{isEnglish ? (article.tagEn || article.tag) : article.tag}</span></div><h2>{title}</h2><p className="article-lead">{lead}</p><a href={`/articles/${article.slug}`}>{isEnglish ? "Read the full article" : "اقرأ المقال كاملًا"} <ArrowLeft size={15} /></a></article>; })}</div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 30 }}><a className="primary-btn" href="/articles">كل المقالات <ArrowLeft size={17} /></a></div>
      </div>
    </section>

    <section className="section" id="high-dam-preview"><div className="container intro-grid"><div className="intro-aside"><span className="eyebrow">المشروع الرئيسي</span><h2 className="display">السد العالي في صفحة مستقلة.</h2></div><div className="intro-copy"><p>للسد العالي مساحة كاملة داخل أُفُق: من الفكرة والهندسة إلى الماء والذاكرة وأسئلة المستقبل.</p><p><a className="text-link" href="/high-dam">افتح صفحة السد العالي <ArrowLeft size={16} /></a></p><a className="text-link" href="/high-dam/articles">مكتبة مقالات السد العالي <ArrowLeft size={16} /></a></div></div></section>
    <footer className="articles-footer"><Landmark size={18} /> أُفُق — نقرأ الذاكرة لنرى المستقبل بوضوح.</footer>
  </main>;
}
