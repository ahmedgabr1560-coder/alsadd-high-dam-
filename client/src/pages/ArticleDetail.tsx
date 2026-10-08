import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowRight, BookOpen, Landmark } from "lucide-react";
import { useRoute } from "wouter";
import { getArticle } from "@/data/articles";

export default function ArticleDetail() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });
  const [, params] = useRoute("/articles/:slug");
  const article = params?.slug ? getArticle(params.slug) : undefined;
  if (loading || !user) return <div className="site-auth-loading" dir="rtl"><span className="login-loader" /><p>جارٍ فتح المقال...</p></div>;
  if (!article) return <main className="articles-page" dir="rtl"><a className="articles-back" href="/articles"><ArrowRight size={16} /> العودة إلى المكتبة</a><h1>المقال غير موجود</h1></main>;
  return <main className="article-detail-page" dir="rtl"><header className="article-detail-header"><a className="articles-back" href="/articles"><ArrowRight size={16} /> العودة إلى مكتبة المقالات</a><span className="articles-kicker"><BookOpen size={16} /> {article.tag}</span><h1>{article.title}</h1><p>{article.lead}</p></header><article className="article-detail-content">{article.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article><footer className="articles-footer"><Landmark size={18} /> السد العالي — معرفة تُبنى من الماء والذاكرة.</footer></main>;
}
