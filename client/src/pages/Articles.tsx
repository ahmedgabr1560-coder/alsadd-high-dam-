import { ArrowLeft, ArrowRight, BookOpen, Landmark } from "lucide-react";
import { articles } from "@/data/articles";
import { LanguageToggle, languageText, useLanguage } from "@/contexts/LanguageContext";
import ProfileAvatar from "@/components/ProfileAvatar";

const independentResearchSlugs = ["october-war-1973", "world-war-ii", "palestine-history-1948", "gaza-war"];

export default function Articles() {
  const { isEnglish } = useLanguage();
  const text = isEnglish ? languageText.en : languageText.ar;
  const researchArticles = articles.filter(article => independentResearchSlugs.includes(article.slug));
  return <main className="articles-page" dir={isEnglish ? "ltr" : "rtl"}>
    <header className="articles-header">
      <div className="articles-toolbar"><a href="/" className="articles-back"><ArrowRight size={16} /> {text.back}</a><div className="articles-toolbar-actions"><ProfileAvatar /><LanguageToggle /></div></div>
      <span className="articles-kicker"><BookOpen size={16} /> {isEnglish ? "Independent research" : "أبحاث مستقلة"} · {researchArticles.length} {isEnglish ? "researches" : "أبحاث"}</span>
      <h1>{isEnglish ? <>Four subjects,<br /><em>four complete pages.</em></> : <>كل بحث في صفحة،<br /><em>وكل موضوع له مساره.</em></>}</h1>
      <p>{isEnglish ? "Independent long-form research on the October War, World War II, Palestine and the Gaza War. Each subject has its own dedicated page." : "أبحاث مستقلة كاملة عن حرب أكتوبر والحرب العالمية الثانية وفلسطين وحرب غزة. لكل بحث صفحته الخاصة المنفصلة."}</p>
    </header>
    <div className="articles-grid">{researchArticles.map(({ slug, icon: Icon, tag, tagEn, title, titleEn, lead, leadEn, image, imageAlt }) => { const cardTitle = isEnglish ? (titleEn || title) : title; return <article className="article-card" key={slug}>{image && <img className="article-card-image" src={image} alt={imageAlt || cardTitle} />}<div className="article-card-top"><span className="article-icon"><Icon size={21} /></span><span>{isEnglish ? (tagEn || tag) : tag}</span></div><h2>{cardTitle}</h2><p className="article-lead">{isEnglish ? (leadEn || lead) : lead}</p><a href={`/articles/${slug}`} aria-label={`${text.read}: ${cardTitle}`}>{text.read} <ArrowLeft size={15} /></a></article>; })}</div>
    <footer className="articles-footer"><Landmark size={18} /> {isEnglish ? "OFOQ — knowledge built from memory and evidence." : "أُفُق — نقرأ الذاكرة لنرى المستقبل بوضوح."}</footer>
  </main>;
}
