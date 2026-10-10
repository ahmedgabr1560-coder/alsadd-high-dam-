import { BookOpen, Landmark, ArrowUpLeft } from "lucide-react";
import { articles } from "@/data/articles";
import { LanguageToggle, useLanguage } from "@/contexts/LanguageContext";
import ProfileAvatar from "@/components/ProfileAvatar";

const highDamSlugs = ["water-security", "engineering", "hydropower", "abu-simbel", "critical-infrastructure", "lake-nasser", "1956", "future-2030"];

export default function HighDamArticles() {
  const { isEnglish } = useLanguage();
  const highDamArticles = articles.filter(article => highDamSlugs.includes(article.slug));
  return <main id="top" className="articles-page ofoq-home highdam-research-page" dir={isEnglish ? "ltr" : "rtl"}>
    <header className="articles-header">
      <div className="articles-toolbar"><a href="/" className="articles-back"><Landmark size={16} /> {isEnglish ? "Back to OFOQ" : "العودة إلى أُفُق"}</a><div className="articles-toolbar-actions"><ProfileAvatar /><LanguageToggle /></div></div>
      <span className="articles-kicker"><BookOpen size={16} /> {isEnglish ? `High Dam · one complete research · ${highDamArticles.length} chapters` : `السد العالي · بحث واحد متكامل · ${highDamArticles.length} محاور`}</span>
      <h1>{isEnglish ? <>The High Dam,<br /><em>one complete research.</em></> : <>السد العالي،<br /><em>بحث واحد متكامل.</em></>}</h1>
      <p>{isEnglish ? "A single long-form research page combining water security, engineering, hydropower, Nubian heritage, Lake Nasser, the Suez Crisis and the future of the project." : "بحث واحد طويل يجمع كل ما يخص السد العالي: الأمن المائي، الهندسة، الكهرباء، إنقاذ آثار النوبة، بحيرة ناصر، أزمة السويس، والمنشآت الحيوية والمستقبل."}</p>
    </header>

    <article className="highdam-research-content">
      <div className="highdam-research-intro"><span>إعداد وتقديم</span><strong>أحمد حمدي عبد الونيس جبر</strong><p>أُفُق | OFOQ — نقرأ المشروع من الماء إلى الإنسان، ومن التاريخ إلى المستقبل.</p></div>
      {highDamArticles.map((article, index) => {
        const Icon = article.icon;
        const title = isEnglish ? (article.titleEn || article.title) : article.title;
        const lead = isEnglish ? (article.leadEn || article.lead) : article.lead;
        const body = isEnglish ? (article.bodyEn || article.body) : article.body;
        return <section className="highdam-research-section" id={`chapter-${article.slug}`} key={article.slug}>
          <div className="highdam-section-heading"><span className="highdam-section-number">{String(index + 1).padStart(2, "0")}</span><span className="article-icon"><Icon size={22} /></span><div><small>{isEnglish ? (article.tagEn || article.tag) : article.tag}</small><h2>{title}</h2></div></div>
          {article.image && <figure className="highdam-section-image"><img src={article.image} alt={article.imageAlt || title} /><figcaption>{article.imageAlt || "صورة مرجعية من أُفُق"}{article.sourceName ? ` · ${article.sourceName}` : ""}</figcaption></figure>}
          <p className="highdam-section-lead">{lead}</p>
          <div className="highdam-section-body">{body.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</div>
          {article.sources && <div className="highdam-section-sources"><strong>{isEnglish ? "References" : "مصادر هذا المحور"}</strong><ol>{article.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.name}</a></li>)}</ol></div>}
        </section>;
      })}
    </article>
    <a className="highdam-back-top" href="#top" aria-label="العودة إلى بداية البحث"><ArrowUpLeft size={18} /></a>
    <footer className="articles-footer"><Landmark size={18} /> {isEnglish ? "OFOQ — The High Dam, one complete research." : "أُفُق — السد العالي، بحث واحد متكامل."}</footer>
  </main>;
}
