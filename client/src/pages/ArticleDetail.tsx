import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowRight, BookOpen, Landmark } from "lucide-react";
import { useRoute } from "wouter";
import { getArticle } from "@/data/articles";
import { LanguageToggle, languageText, useLanguage } from "@/contexts/LanguageContext";

export default function ArticleDetail() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });
  const [, params] = useRoute("/articles/:slug");
  const { isEnglish } = useLanguage();
  const text = isEnglish ? languageText.en : languageText.ar;
  const article = params?.slug ? getArticle(params.slug) : undefined;
  if (loading || !user) return <div className="site-auth-loading" dir={isEnglish ? "ltr" : "rtl"}><span className="login-loader" /><p>{isEnglish ? "Opening the article..." : "جارٍ فتح المقال..."}</p></div>;
  if (!article) return <main className="articles-page" dir={isEnglish ? "ltr" : "rtl"}><a className="articles-back" href="/articles"><ArrowRight size={16} /> {isEnglish ? "Back to library" : "العودة إلى المكتبة"}</a><h1>{isEnglish ? "Article not found" : "المقال غير موجود"}</h1></main>;
  const title = isEnglish ? (article.titleEn || article.title) : article.title;
  const lead = isEnglish ? (article.leadEn || article.lead) : article.lead;
  const body = isEnglish ? (article.bodyEn || article.body) : article.body;
  return <main className="article-detail-page" dir={isEnglish ? "ltr" : "rtl"}>
    <header className="article-detail-header"><div className="articles-toolbar"><a className="articles-back" href="/articles"><ArrowRight size={16} /> {isEnglish ? "Back to library" : "العودة إلى مكتبة المقالات"}</a><LanguageToggle /></div><span className="articles-kicker"><BookOpen size={16} /> {isEnglish ? (article.tagEn || article.tag) : article.tag}</span><h1>{title}</h1><p>{lead}</p></header>
    <figure className="article-detail-figure"><img src={article.image || "/assets/aswan-dam.jpg"} alt={article.imageAlt || (isEnglish ? "Aswan High Dam — reference image" : "السد العالي — صورة مرجعية")} /><figcaption>{article.imageAlt || (isEnglish ? "OFOQ reference image" : "صورة مرجعية من أُفُق")}{article.sourceName ? ` · ${text.source}: ${article.sourceName}` : ""}</figcaption></figure>
    <article className="article-detail-content">{body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{article.sourceUrl && <p className="article-source"><strong>{text.source}:</strong> <a href={article.sourceUrl} target="_blank" rel="noreferrer">{article.sourceName || article.sourceUrl}</a></p>}</article>
    <footer className="articles-footer"><Landmark size={18} /> {isEnglish ? "OFOQ — knowledge built from memory and evidence." : "أُفُق — نقرأ الذاكرة لنرى المستقبل بوضوح."}</footer>
  </main>;
}
