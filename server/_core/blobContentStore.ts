const STORE_PATH = "ofoq-content/article-overrides.json";

export type ArticleOverride = {
  slug: string;
  title?: string;
  titleEn?: string;
  lead?: string;
  leadEn?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: "published" | "draft";
  updatedAt: string;
  updatedBy: string;
};

export async function loadArticleOverrides(): Promise<Record<string, ArticleOverride>> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return {};
  try {
    const { list, get } = await import("@vercel/blob");
    const result = await list({ prefix: STORE_PATH, token: process.env.BLOB_READ_WRITE_TOKEN });
    if (!result.blobs.find(item => item.pathname === STORE_PATH)) return {};
    const stored = await get(STORE_PATH, { access: "private", useCache: false, token: process.env.BLOB_READ_WRITE_TOKEN });
    if (!stored) return {};
    const value = await new Response(stored.stream).json();
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch (error) {
    console.error("[Content store] read unavailable", error);
    return {};
  }
}

export async function saveArticleOverrides(overrides: Record<string, ArticleOverride>) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  const { put } = await import("@vercel/blob");
  await put(STORE_PATH, JSON.stringify(overrides), { access: "private", addRandomSuffix: false, allowOverwrite: true, token: process.env.BLOB_READ_WRITE_TOKEN, contentType: "application/json; charset=utf-8" });
}
