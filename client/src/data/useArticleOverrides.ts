import { useEffect, useState } from "react";
import type { Article } from "./articles";

export type ArticleOverride = Partial<Pick<Article, "title" | "titleEn" | "lead" | "leadEn">> & { status?: "published" | "draft"; seoTitle?: string; seoDescription?: string };

export function useArticleOverrides() {
  const [overrides, setOverrides] = useState<Record<string, ArticleOverride>>({});
  useEffect(() => { fetch("/api/trpc/content-articles").then(response => response.ok ? response.json() : null).then(data => data?.overrides && setOverrides(data.overrides)).catch(() => undefined); }, []);
  return overrides;
}

export function applyArticleOverride(article: Article, overrides: Record<string, ArticleOverride>): Article {
  const override = overrides[article.slug];
  return override ? { ...article, ...override } : article;
}
