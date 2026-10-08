import { ArrowRight, BookOpen, Landmark } from "lucide-react";
import { articles } from "@/data/articles";
import { LanguageToggle, useLanguage } from "@/contexts/LanguageContext";
import ProfileAvatar from "@/components/ProfileAvatar";

const highDamSlugs = ["water-security", "engineering", "hydropower", "abu-simbel", "critical-infrastructure", "lake-nasser", "1956", "future-2030"];

export default function HighDamArticles() {
  const { isEnglish } = useLanguage();
  const highDamArticles = articles.filter(article => highDamSlugs.includes(article.slug));
  return <main className="articles-page ofoq-home" dir={isEnglish ? "ltr" : "rtl"}>
    <header className="articles-header">
      <div className="articles-toolbar"><a href="/" className="articles-back"><Landmark size={16} /> {isEnglish ? "Back to OFOQ" : "العودة إلى أُفُق"}</a><div className="articles-toolbar-actions"><ProfileAvatar /><LanguageToggle /></div></div>
      <span className="articles-kicker"><BookOpen size={16} /> {isEnglish ? `High Dam · ${highDamArticles.length} researches` : `السد العالي · ${highDamArticles.length} أبحاث`}</span>
      <h1>{isEnglish ? <>One project,<br /><em>many stories.</em></> : <>السد العالي،<br /><em>حكايات متعددة.</em></>}</h1>
      <p>{isEnglish ? "A dedicated collection on water, engineering, energy, heritage, politics and the future of the High Dam." : "مجموعة مستقلة عن المياه والهندسة والطاقة والتراث والسياسة ومستقبل السد العالي، وكل موضوع في صفحة كاملة."}</p>
    </header>
    <div className="articles-grid">{highDamArticles.map(article => { const Icon = article.icon; const title = isEnglish ? (article.titleEn || article.title) : article.title; const lead = isEnglish ? (article.leadEn || article.lead) : article.lead; return <article className="article-card" key={article.slug}><img className="article-card-image" src={article.image || "/assets/aswan-dam.jpg"} alt={article.imageAlt || title} /><div className="article-card-top"><span className="article-icon"><Icon size={21} /></span><span>{isEnglish ? (article.tagEn || article.tag) : article.tag}</span></div><h2>{title}</h2><p className="article-lead">{lead}</p><a href={`/articles/${article.slug}`}>{isEnglish ? "Read the full article" : "اقرأ المقال كاملًا"} <ArrowRight size={15} /></a></article>; })}</div>
    <footer className="articles-footer"><Landmark size={18} /> أُفُق — نقرأ السد العالي من أكثر من زاوية.</footer>
  </main>;
}
