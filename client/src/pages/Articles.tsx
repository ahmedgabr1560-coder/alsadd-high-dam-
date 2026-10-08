import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, ArrowRight, BookOpen, Landmark } from "lucide-react";
import { articles } from "@/data/articles";
import { LanguageToggle, languageText, useLanguage } from "@/contexts/LanguageContext";

export default function Articles() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });
  const { isEnglish } = useLanguage();
  const text = isEnglish ? languageText.en : languageText.ar;
  if (loading || !user) return <div className="site-auth-loading" dir={isEnglish ? "ltr" : "rtl"}><span className="login-loader" /><p>{isEnglish ? "Opening the article library..." : "جارٍ فتح مكتبة المقالات..."}</p></div>;
  return <main className="articles-page" dir={isEnglish ? "ltr" : "rtl"}>
    <header className="articles-header">
      <div className="articles-toolbar"><a href="/" className="articles-back"><ArrowRight size={16} /> {text.back}</a><LanguageToggle /></div>
      <span className="articles-kicker"><BookOpen size={16} /> {text.library} · {articles.length} {isEnglish ? "articles" : "مقالات"}</span>
      <h1>{isEnglish ? <>Articles that open <em>new windows</em><br />onto history.</> : <>مقالات تفتح <em>نوافذ جديدة</em><br />على قصة الماء والتاريخ.</>}</h1>
      <p>{isEnglish ? "Long-form readings on the dam, October War, World War II and Palestine, with sources and open images." : "قراءات متعددة الصفحات تكمل البحث الرئيسي، وتضم السد وحرب أكتوبر والحرب العالمية الثانية وفلسطين، مع مراجع وصور مفتوحة."}</p>
    </header>
    <div className="articles-grid">{articles.map(({ slug, icon: Icon, tag, tagEn, title, titleEn, lead, leadEn, image, imageAlt }) => { const cardTitle = isEnglish ? (titleEn || title) : title; return <article className="article-card" key={slug}>{image && <img className="article-card-image" src={image} alt={imageAlt || cardTitle} />}<div className="article-card-top"><span className="article-icon"><Icon size={21} /></span><span>{isEnglish ? (tagEn || tag) : tag}</span></div><h2>{cardTitle}</h2><p className="article-lead">{isEnglish ? (leadEn || lead) : lead}</p><a href={`/articles/${slug}`} aria-label={`${text.read}: ${cardTitle}`}>{text.read} <ArrowLeft size={15} /></a></article>; })}</div>
    <footer className="articles-footer"><Landmark size={18} /> {isEnglish ? "Nibras — knowledge built from memory and evidence." : "نبراس — معرفة تُبنى من الماء والذاكرة."}</footer>
  </main>;
}
