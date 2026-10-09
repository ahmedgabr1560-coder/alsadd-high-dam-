import { ArrowLeft, ArrowRight, BookMarked, BookOpen, Landmark, Sparkles } from "lucide-react";
import { articles } from "@/data/articles";
import { LanguageToggle, useLanguage } from "@/contexts/LanguageContext";
import ProfileAvatar from "@/components/ProfileAvatar";

const independentResearchSlugs = ["october-war-1973", "world-war-ii", "palestine-history-1948"];

export default function Home() {
  const { isEnglish } = useLanguage();
  const independentResearch = articles.filter(article => independentResearchSlugs.includes(article.slug));
  return <main className="articles-page ofoq-home" dir={isEnglish ? "ltr" : "rtl"}>
    <header className="articles-header">
      <div className="articles-toolbar"><a href="/" className="articles-back"><Landmark size={16} /> أُفُق | OFOQ</a><div className="articles-toolbar-actions"><a className="quran-nav-icon" href="/quran" aria-label="القرآن الكريم" title="القرآن الكريم"><BookMarked size={18} /></a><ProfileAvatar /><LanguageToggle /></div></div>
      <div className="ofoq-home-signature"><span>إعداد وتقديم</span><strong>أحمد حمدي عبد الونيس جبر</strong><small>رؤية تُقرأ، ومعرفة تُبنى، وأثرٌ يبقى.</small></div>
      <div className="ofoq-home-verses" aria-label="آيات عن القراءة والكتابة والعلم"><div><p>﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾</p><small>سورة العلق · ١</small></div><div><p>﴿الَّذِي عَلَّمَ بِالْقَلَمِ﴾</p><small>سورة العلق · ٤</small></div><div><p>﴿وَقُلْ رَبِّ زِدْنِي عِلْمًا﴾</p><small>سورة طه · ١١٤</small></div><div><p>﴿ن وَالْقَلَمِ وَمَا يَسْطُرُونَ﴾</p><small>سورة القلم · ١</small></div></div>
      <span className="articles-kicker"><Sparkles size={16} /> {isEnglish ? "A wider horizon for knowledge" : "رؤية أوسع · معرفة أعمق"}</span>
      <h1>{isEnglish ? <>Open a wider <em>horizon.</em><br />Read the world differently.</> : <>نفتح أفقًا <em>أوسع.</em><br />لنقرأ العالم بشكل مختلف.</>}</h1>
      <p>{isEnglish ? "OFOQ is a knowledge space for documented articles, stories and ideas. Each topic has its own complete page, giving you a clear path from context to meaning." : "أُفُق مساحة معرفية تجمع المقالات والقصص والأفكار الموثقة. لكل موضوع صفحته الكاملة، حتى تنتقل من السياق إلى المعنى في رحلة واضحة وهادئة."}</p>
      <div className="hero-actions" style={{ marginTop: 28 }}><a className="primary-btn" href="/articles">{isEnglish ? "Explore the articles" : "استكشف المقالات"} <ArrowLeft size={17} /></a><a className="ghost-btn" href="#topics">{isEnglish ? "Explore the subjects" : "استكشف الموضوعات"} <ArrowRight size={17} /></a></div>
    </header>

    <section className="section intro" id="about-ofoq">
      <div className="container intro-grid">
        <aside className="intro-aside"><span className="eyebrow">أُفُق | OFOQ</span><h2 className="display">الاسم وعدٌ بالرؤية.</h2><p>الأفق هو المساحة التي نرى فيها أبعد من اللحظة؛ لذلك نكتب عن التاريخ والماء والحرب والتراث والمستقبل من أكثر من زاوية.</p></aside>
        <div className="intro-copy"><blockquote className="quote"><p>«نفتح أفقًا أوسع للمعرفة، ونحوّل الرؤية إلى أثر.»</p><small>فلسفة الموقع</small></blockquote><p>في أُفُق لا نكتفي بعنوان سريع. نضع كل قصة في صفحة مستقلة، بمقدمة واضحة، ومحتوى متدرج، وصور ومصادر تساعدك على القراءة والتحقق.</p><p>ابدأ من أي موضوع، ثم انتقل بين المقالات لتبني صورتك الكاملة بنفسك.</p></div>
      </div>
    </section>

    <section className="section" id="topics">
      <div className="container"><div className="section-heading"><div><span className="eyebrow"><BookOpen size={15} /> أبواب أُفُق</span><h2 className="display">اختر موضوعًا، وافتح صفحته.</h2></div><p>لا نعرض المقال كاملًا هنا؛ كل موضوع له أيقونة ورابط يقودان إلى صفحة مستقلة مخصصة له.</p></div>
        <div className="topic-links-special"><a className="topic-link-card topic-link-featured" href="/high-dam/articles"><span className="topic-link-icon"><Landmark size={25} /></span><span><strong>السد العالي وتاريخه</strong><small>بحث واحد شامل · {isEnglish ? "one complete research" : "كل المحاور في صفحة واحدة"}</small></span><ArrowLeft size={17} /></a></div>
        <div className="topic-links">{independentResearch.map(article => { const Icon = article.icon; const title = isEnglish ? (article.titleEn || article.title) : article.title; return <a className="topic-link-card" href={`/articles/${article.slug}`} key={article.slug}><span className="topic-link-icon"><Icon size={25} /></span><span><strong>{title}</strong><small>{isEnglish ? (article.tagEn || article.tag) : article.tag} · صفحة مستقلة</small></span><ArrowLeft size={17} /></a>; })}<a className="topic-link-card" href="/quran"><span className="topic-link-icon"><BookMarked size={25} /></span><span><strong>{isEnglish ? "The Holy Quran" : "القرآن الكريم"}</strong><small>{isEnglish ? "Uthmani Mushaf · separate page" : "المصحف الشريف · صفحة مستقلة"}</small></span><ArrowLeft size={17} /></a></div>
      </div>
    </section>

    <footer className="articles-footer"><Landmark size={18} /> أُفُق — نقرأ الذاكرة لنرى المستقبل بوضوح.</footer>
  </main>;
}
