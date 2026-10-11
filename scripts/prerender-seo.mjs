import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist", "public");
const origin = "https://ofoq-egypt.vercel.app";

const pages = [
  { path: "/articles", title: "أبحاث أُفُق | حرب أكتوبر وفلسطين وغزة", description: "استكشف أبحاث أُفُق الكاملة عن حرب أكتوبر والحرب العالمية الثانية وفلسطين وحرب غزة، مع الخطوط الزمنية والصور والمصادر الموثوقة.", heading: "أبحاث أُفُق المستقلة", body: "أبحاث تاريخية موثقة عن حرب أكتوبر والحرب العالمية الثانية وفلسطين وحرب غزة، لكل موضوع منها صفحة كاملة ومصادر للقراءة والتحقق." },
  { path: "/high-dam/articles", title: "السد العالي وتاريخه | بحث شامل من أُفُق", description: "بحث شامل عن السد العالي في مصر وبحيرة ناصر والأمن المائي والكهرباء المائية وإنقاذ آثار النوبة وأزمة السويس ومستقبل المشروع.", heading: "السد العالي وتاريخه", body: "بحث متكامل يتتبع نشأة السد العالي ومراحله الهندسية وأثره في الأمن المائي والطاقة وبحيرة ناصر وتراث النوبة ومستقبل المشروع." },
  { path: "/articles/october-war-1973", title: "حرب أكتوبر 1973 | بحث تاريخي موثق | أُفُق", description: "بحث موثق في حرب أكتوبر 1973: أسباب الحرب، عبور قناة السويس، الخط الزمني، النتائج والمصادر التاريخية.", heading: "حرب أكتوبر 1973: عبور واستعادة المبادرة", body: "بحث تاريخي كامل يتناول خلفية حرب أكتوبر 1973 وعبور قناة السويس وتطور العمليات والنتائج السياسية والعسكرية." },
  { path: "/articles/world-war-ii", title: "الحرب العالمية الثانية في الشرق الأوسط | أُفُق", description: "بحث تاريخي عن الحرب العالمية الثانية وشمال أفريقيا ومصر ومعركة العلمين والتحولات التي أعادت تشكيل الشرق الأوسط.", heading: "الحرب العالمية الثانية: حرب عالمية وشرق أوسط متغير", body: "دراسة في الحرب العالمية الثانية على جبهة شمال أفريقيا ودور مصر ومعركة العلمين وآثار الحرب على المنطقة." },
  { path: "/articles/palestine-history-1948", title: "تاريخ فلسطين من الانتداب إلى النكبة | أُفُق", description: "بحث موثق في تاريخ فلسطين من الانتداب البريطاني ووعد بلفور إلى قرار التقسيم والنكبة ومسارات القضية الفلسطينية.", heading: "فلسطين من الانتداب إلى النكبة ومسارات القضية", body: "بحث تاريخي يتتبع التحولات السياسية والاجتماعية في فلسطين من الانتداب البريطاني إلى النكبة وما بعدها." },
  { path: "/articles/gaza-war", title: "حرب غزة 2023–2026 | بحث إنساني وتاريخي موثق | أُفُق", description: "بحث محدث عن حرب غزة 2023–2026، الهدنة الهشة، الوضع الإنساني، المساعدات والمصادر الأممية والحقوقية.", heading: "حرب غزة 2023–2026: الحرب والهدنة الهشة والإنسان", body: "بحث محدث يتناول تسلسل حرب غزة، آثارها الإنسانية، الهدنة، المساعدات، حماية المدنيين والمصادر الأممية والحقوقية." },
];

const escape = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

for (const page of pages) {
  const url = `${origin}${page.path}`;
  const meta = `<meta name="description" content="${escape(page.description)}" />\n    <meta name="robots" content="index, follow, max-image-preview:large" />\n    <meta property="og:title" content="${escape(page.title)}" />\n    <meta property="og:description" content="${escape(page.description)}" />\n    <meta property="og:url" content="${url}" />\n    <link rel="canonical" href="${url}" />`;
  const schema = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: page.title, description: page.description, url, inLanguage: "ar", author: { "@type": "Person", name: "أحمد حمدي عبد الونيس جبر" }, publisher: { "@type": "Organization", name: "أُفُق | OFOQ" } })}</script>`;
  const content = `<main lang="ar" dir="rtl"><article><p>أُفُق | OFOQ · إعداد وتقديم أحمد حمدي عبد الونيس جبر</p><h1>${escape(page.heading)}</h1><p>${escape(page.body)}</p><nav aria-label="روابط البحث"><a href="/">الصفحة الرئيسية</a> · <a href="/articles">كل الأبحاث</a></nav></article></main>`;
  const html = template.replace(/<title>[^<]*<\/title>/, `<title>${escape(page.title)}</title>`).replace(/\s*<meta name="description"[^>]*\/>/, `\n    ${meta}`).replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${content}</div>`).replace("</head>", `${schema}\n  </head>`);
  const output = path.join(dist, page.path.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, html);
}
console.log(`Prerendered ${pages.length} SEO pages.`);
