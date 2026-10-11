import { useEffect } from "react";

type SeoHeadProps = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
};

const siteName = "أُفُق | OFOQ";
const origin = "https://ofoq-egypt.vercel.app";

function setMeta(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    if (property) element.setAttribute("property", name);
    else element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function SeoHead({ title, description, path, image = "/assets/aswan-dam.jpg", type = "website" }: SeoHeadProps) {
  useEffect(() => {
    const canonical = `${origin}${path}`;
    document.title = title;
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    setMeta("description", description);
    setMeta("robots", "index, follow, max-image-preview:large");
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:site_name", siteName, true);
    setMeta("og:url", canonical, true);
    setMeta("og:type", type, true);
    setMeta("og:image", `${origin}${image.startsWith("/") ? image : `/${image}`}`, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", `${origin}${image.startsWith("/") ? image : `/${image}`}`);

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;

    const schemaId = "ofoq-page-schema";
    document.getElementById(schemaId)?.remove();
    const schema = document.createElement("script");
    schema.id = schemaId;
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": type === "article" ? "Article" : "WebPage",
      name: title,
      headline: title,
      description,
      url: canonical,
      image: `${origin}${image.startsWith("/") ? image : `/${image}`}`,
      inLanguage: "ar",
      isPartOf: { "@type": "WebSite", name: siteName, url: origin },
      publisher: { "@type": "Person", name: "أحمد حمدي عبد الونيس جبر" },
    });
    document.head.appendChild(schema);
    return () => document.getElementById(schemaId)?.remove();
  }, [description, image, path, title, type]);

  return null;
}
