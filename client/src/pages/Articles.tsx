import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, ArrowRight, BookOpen, Landmark } from "lucide-react";
import { articles } from "@/data/articles";

export default function Articles() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });
  if (loading || !user) return <div className="site-auth-loading" dir="rtl"><span className="login-loader" /><p>جارٍ فتح مكتبة المقالات...</p></div>;
  return <main className="articles-page" dir="rtl"><header className="articles-header"><a href="/" className="articles-back"><ArrowRight size={16} /> العودة للموقع</a><span className="articles-kicker"><BookOpen size={16} /> مكتبة السد العالي · {articles.length} مقالات</span><h1>مقالات تفتح <em>نوافذ جديدة</em><br />على قصة الماء.</h1><p>قراءات متعددة الصفحات تكمل البحث الرئيسي، وتربط بين السد والهندسة والمجتمع والبيئة والمستقبل.</p></header><div className="articles-grid">{articles.map(({ slug, icon: Icon, tag, title, lead }) => <article className="article-card" key={slug}><div className="article-card-top"><span className="article-icon"><Icon size={21} /></span><span>{tag}</span></div><h2>{title}</h2><p className="article-lead">{lead}</p><a href={`/articles/${slug}`} aria-label={`قراءة ${title}`}>قراءة المقال كاملًا <ArrowLeft size={15} /></a></article>)}</div><footer className="articles-footer"><Landmark size={18} /> السد العالي — معرفة تُبنى من الماء والذاكرة.</footer></main>;
}
