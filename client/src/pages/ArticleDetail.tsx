import { ArrowRight, BookOpen, Landmark } from "lucide-react";
import { useRoute } from "wouter";
import { getArticle } from "@/data/articles";
import { LanguageToggle, languageText, useLanguage } from "@/contexts/LanguageContext";

const verseSets: Record<string, Array<[string, string]>> = {
  "water-security": [["﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ﴾", "الأنبياء · ٣٠"], ["﴿وَأَنزَلْنَا مِنَ السَّمَاءِ مَاءً بِقَدَرٍ﴾", "المؤمنون · ١٨"], ["﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ﴾", "الأنبياء · ٣٠"], ["﴿وَاللَّهُ أَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَحْيَا بِهِ الْأَرْضَ﴾", "النحل · ٦٥"]],
  "engineering": [["﴿وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ﴾", "الذاريات · ٤٧"], ["﴿وَأَنزَلْنَا مِنَ السَّمَاءِ مَاءً بِقَدَرٍ﴾", "المؤمنون · ١٨"], ["﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ﴾", "الأنبياء · ٣٠"], ["﴿وَفِي الْأَرْضِ آيَاتٌ لِّلْمُوقِنِينَ﴾", "الذاريات · ٢٠"]],
  "hydropower": [["﴿وَأَنزَلْنَا مِنَ السَّمَاءِ مَاءً طَهُورًا﴾", "الفرقان · ٤٨"], ["﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ﴾", "الأنبياء · ٣٠"], ["﴿وَاللَّهُ أَنزَلَ مِنَ السَّمَاءِ مَاءً﴾", "النحل · ٦٥"], ["﴿وَجَعَلْنَا سِرَاجًا وَهَّاجًا﴾", "النبأ · ١٣"]],
  "abu-simbel": [["﴿فَانظُرْ إِلَىٰ آثَارِ رَحْمَتِ اللَّهِ﴾", "الروم · ٥٠"], ["﴿وَفِي الْأَرْضِ آيَاتٌ لِّلْمُوقِنِينَ﴾", "الذاريات · ٢٠"], ["﴿وَلَا تَبْخَسُوا النَّاسَ أَشْيَاءَهُمْ﴾", "الأعراف · ٨٥"], ["﴿إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ﴾", "التوبة · ١٢٠"]],
  "critical-infrastructure": [["﴿وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ﴾", "الأنفال · ٦٠"], ["﴿إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ﴾", "النساء · ٥٨"], ["﴿وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا﴾", "الأعراف · ٥٦"], ["﴿وَلَا تَهِنُوا وَلَا تَحْزَنُوا﴾", "آل عمران · ١٣٩"]],
  "lake-nasser": [["﴿وَأَنزَلْنَا مِنَ السَّمَاءِ مَاءً فَأَنبَتْنَا بِهِ حَدَائِقَ﴾", "النمل · ٦٠"], ["﴿وَكُلُوا وَاشْرَبُوا وَلَا تُسْرِفُوا﴾", "الأعراف · ٣١"], ["﴿كُلُوا مِن ثَمَرِهِ إِذَا أَثْمَرَ﴾", "الأنعام · ١٤١"], ["﴿وَلَا تُفْسِدُوا فِي الْأَرْضِ﴾", "البقرة · ٦٠"]],
  "1956": [["﴿وَلَا تَنَازَعُوا فَتَفْشَلُوا وَتَذْهَبَ رِيحُكُمْ﴾", "الأنفال · ٤٦"], ["﴿وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ﴾", "الشورى · ٣٨"], ["﴿وَلَا تَهِنُوا وَلَا تَحْزَنُوا﴾", "آل عمران · ١٣٩"], ["﴿وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ﴾", "التوبة · ١٠٥"]],
  "future-2030": [["﴿إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ﴾", "الرعد · ١١"], ["﴿وَلَا تُسْرِفُوا إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ﴾", "الأنعام · ١٤١"], ["﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾", "طه · ١١٤"], ["﴿وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ﴾", "النجم · ٣٩"]],
  "october-war-1973": [["﴿وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ﴾", "الأنفال · ٦٠"], ["﴿وَلَا تَهِنُوا وَلَا تَحْزَنُوا﴾", "آل عمران · ١٣٩"], ["﴿إِن يَنصُرْكُمُ اللَّهُ فَلَا غَالِبَ لَكُمْ﴾", "آل عمران · ١٦٠"], ["﴿وَالصُّلْحُ خَيْرٌ﴾", "النساء · ١٢٨"]],
  "world-war-ii": [["﴿وَلَا تَعْتَدُوا إِنَّ اللَّهَ لَا يُحِبُّ الْمُعْتَدِينَ﴾", "البقرة · ١٩٠"], ["﴿وَلَا تَنَازَعُوا فَتَفْشَلُوا﴾", "الأنفال · ٤٦"], ["﴿وَإِن جَنَحُوا لِلسَّلْمِ فَاجْنَحْ لَهَا﴾", "الأنفال · ٦١"], ["﴿مِنْ أَجْلِ ذَٰلِكَ كَتَبْنَا﴾", "المائدة · ٣٢"]],
  "palestine-history-1948": [["﴿وَلَا تَعْتَدُوا إِنَّ اللَّهَ لَا يُحِبُّ الْمُعْتَدِينَ﴾", "البقرة · ١٩٠"], ["﴿وَلَا تَبْخَسُوا النَّاسَ أَشْيَاءَهُمْ﴾", "الأعراف · ٨٥"], ["﴿إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ﴾", "النحل · ٩٠"], ["﴿وَلَا تَهِنُوا وَلَا تَحْزَنُوا﴾", "آل عمران · ١٣٩"]]
};
const highDamSlugs = ["water-security", "engineering", "hydropower", "abu-simbel", "critical-infrastructure", "lake-nasser", "1956", "future-2030"];
const warTimelines: Record<string, Array<[string, string]>> = {
  "1956": [["1869", "افتتاح قناة السويس وبداية دورها الدولي في الملاحة."], ["1954", "اتفاق بريطانيا على الانسحاب من منطقة القناة."], ["26 يوليو 1956", "إعلان تأميم شركة قناة السويس."], ["29 أكتوبر 1956", "بدء الهجوم الإسرائيلي على سيناء ضمن العدوان الثلاثي."], ["نوفمبر–ديسمبر 1956", "الإنزال البريطاني الفرنسي وتدخل الأمم المتحدة."], ["مارس–أبريل 1957", "اكتمال الانسحاب وإعادة فتح القناة للملاحة."]],
  "october-war-1973": [["1967–1973", "حرب الاستنزاف والجهود السياسية لكسر جمود الاحتلال."], ["6 أكتوبر 1973", "عبور القوات المصرية قناة السويس وبدء الهجوم المتزامن على الجولان."], ["8–10 أكتوبر", "صد الهجمات الإسرائيلية الأولى وتثبيت رؤوس الكباري شرق القناة."], ["14–22 أكتوبر", "تطورات ميدانية وتدخل دولي متصاعد لوقف القتال."], ["22 و25 أكتوبر", "القراران 338 و340 وإنشاء قوة الطوارئ الثانية."], ["1974–1975", "اتفاقات فصل القوات وعودة التفاوض حول سيناء."]],
  "world-war-ii": [["1 سبتمبر 1939", "غزو بولندا وبداية الحرب الأوروبية."], ["يونيو 1940", "إيطاليا تدخل الحرب وفتح جبهة شمال أفريقيا."], ["سبتمبر 1940", "الهجوم الإيطالي من ليبيا باتجاه مصر."], ["فبراير 1941", "وصول فيلق أفريقيا الألماني بقيادة رومل."], ["أكتوبر–نوفمبر 1942", "معركة العلمين الثانية وتحول المبادرة للحلفاء."], ["مايو 1943", "استسلام قوات المحور في تونس وإغلاق المسرح الشمال أفريقي."], ["1944–1945", "تقدم الحلفاء في أوروبا ونهاية الحرب عام 1945."]],
  "palestine-history-1948": [["1917", "وعد بلفور وبداية الإطار السياسي الجديد لفلسطين."], ["1920–1922", "إقرار الانتداب البريطاني وإدارة البلاد تحت عصبة الأمم."], ["1936–1939", "الثورة الفلسطينية الكبرى وتصاعد الصراع حول الهجرة والاستقلال."], ["29 نوفمبر 1947", "قرار التقسيم 181 وتصاعد القتال الداخلي."], ["15 مايو 1948", "نهاية الانتداب واندلاع الحرب والنكبة والتهجير."], ["يونيو 1967", "احتلال الضفة الغربية وقطاع غزة والقدس الشرقية."], ["1987–1993", "الانتفاضة الأولى ثم اتفاق أوسلو والمرحلة الانتقالية."], ["2012–2024", "صفة الدولة المراقب ورأي محكمة العدل الدولية الاستشاري."]]
};

export default function ArticleDetail() {
  const [, params] = useRoute("/articles/:slug");
  const { isEnglish } = useLanguage();
  const text = isEnglish ? languageText.en : languageText.ar;
  const article = params?.slug ? getArticle(params.slug) : undefined;
  if (!article) return <main className="articles-page" dir={isEnglish ? "ltr" : "rtl"}><a className="articles-back" href="/articles"><ArrowRight size={16} /> {isEnglish ? "Back to articles" : "العودة إلى المقالات"}</a><h1>{isEnglish ? "Article not found" : "المقال غير موجود"}</h1></main>;
  const title = isEnglish ? (article.titleEn || article.title) : article.title;
  const lead = isEnglish ? (article.leadEn || article.lead) : article.lead;
  const body = isEnglish ? (article.bodyEn || article.body) : article.body;
  const verses = verseSets[article.slug] || verseSets["water-security"];
  const libraryPath = highDamSlugs.includes(article.slug) ? "/high-dam/articles" : "/articles";
  const timeline = warTimelines[article.slug];
  return <main className="article-detail-page" dir={isEnglish ? "ltr" : "rtl"}>
    <header className="article-detail-header"><div className="articles-toolbar"><a className="articles-back" href={libraryPath}><ArrowRight size={16} /> {isEnglish ? "Back to articles" : "العودة إلى المقالات"}</a><LanguageToggle /></div><div className="article-author"><span>إعداد وتقديم</span><strong>أحمد حمدي عبد الونيس جبر</strong><small>أُفُق | OFOQ · معرفة تُقرأ وأثرٌ يبقى</small></div><div className="article-verses">{verses.map(([verse, reference]) => <div key={reference + verse}><p>{verse}</p><small>{reference}</small></div>)}</div><span className="articles-kicker"><BookOpen size={16} /> {isEnglish ? (article.tagEn || article.tag) : article.tag}</span><h1>{title}</h1><p>{lead}</p></header>
    {timeline && <section className="article-timeline"><h2>{isEnglish ? "Timeline from the beginning" : "الخط الزمني من البداية"}</h2><div>{timeline.map(([date, event]) => <article key={date}><strong>{date}</strong><p>{event}</p></article>)}</div></section>}
    <figure className="article-detail-figure"><img src={article.image || "/assets/aswan-dam.jpg"} alt={article.imageAlt || (isEnglish ? "OFOQ reference image" : "صورة مرجعية من أُفُق")} /><figcaption>{article.imageAlt || (isEnglish ? "OFOQ reference image" : "صورة مرجعية من أُفُق")}{article.sourceName ? ` · ${text.source}: ${article.sourceName}` : ""}</figcaption></figure>
    {article.gallery && <section className="article-gallery"><h2>{isEnglish ? "Historical images and sources" : "صور تاريخية موثقة"}</h2><div>{article.gallery.map(image => <figure key={image.src}><img src={image.src} alt={image.caption} /><figcaption>{image.caption} · <a href={image.url} target="_blank" rel="noreferrer">{image.source}</a></figcaption></figure>)}</div></section>}
    <article className="article-detail-content">{body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{article.sourceUrl && !article.sources && <p className="article-source"><strong>{text.source}:</strong> <a href={article.sourceUrl} target="_blank" rel="noreferrer">{article.sourceName || article.sourceUrl}</a></p>}{article.sources && <section className="article-sources"><h2>{isEnglish ? "References" : "المصادر والمراجع"}</h2><ol>{article.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.name}</a></li>)}</ol></section>}</article>
    <footer className="articles-footer"><Landmark size={18} /> {isEnglish ? "OFOQ — knowledge built from memory and evidence." : "أُفُق — نقرأ الذاكرة لنرى المستقبل بوضوح."}</footer>
  </main>;
}
