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

export default function ArticleDetail() {
  const [, params] = useRoute("/articles/:slug");
  const { isEnglish } = useLanguage();
  const text = isEnglish ? languageText.en : languageText.ar;
  const article = params?.slug ? getArticle(params.slug) : undefined;
  if (!article) return <main className="articles-page" dir={isEnglish ? "ltr" : "rtl"}><a className="articles-back" href="/articles"><ArrowRight size={16} /> {isEnglish ? "Back to library" : "العودة إلى المكتبة"}</a><h1>{isEnglish ? "Article not found" : "المقال غير موجود"}</h1></main>;
  const title = isEnglish ? (article.titleEn || article.title) : article.title;
  const lead = isEnglish ? (article.leadEn || article.lead) : article.lead;
  const body = isEnglish ? (article.bodyEn || article.body) : article.body;
  const verses = verseSets[article.slug] || verseSets["water-security"];
  return <main className="article-detail-page" dir={isEnglish ? "ltr" : "rtl"}>
    <header className="article-detail-header"><div className="articles-toolbar"><a className="articles-back" href="/articles"><ArrowRight size={16} /> {isEnglish ? "Back to library" : "العودة إلى مكتبة المقالات"}</a><LanguageToggle /></div><div className="article-author"><span>إعداد وتقديم</span><strong>أحمد حمدي عبد الونيس جبر</strong><small>أُفُق | OFOQ · معرفة تُقرأ وأثرٌ يبقى</small></div><div className="article-verses">{verses.map(([verse, reference]) => <div key={reference + verse}><p>{verse}</p><small>{reference}</small></div>)}</div><span className="articles-kicker"><BookOpen size={16} /> {isEnglish ? (article.tagEn || article.tag) : article.tag}</span><h1>{title}</h1><p>{lead}</p></header>
    <figure className="article-detail-figure"><img src={article.image || "/assets/aswan-dam.jpg"} alt={article.imageAlt || (isEnglish ? "Aswan High Dam — reference image" : "السد العالي — صورة مرجعية")} /><figcaption>{article.imageAlt || (isEnglish ? "OFOQ reference image" : "صورة مرجعية من أُفُق")}{article.sourceName ? ` · ${text.source}: ${article.sourceName}` : ""}</figcaption></figure>
    <article className="article-detail-content">{body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{article.sourceUrl && <p className="article-source"><strong>{text.source}:</strong> <a href={article.sourceUrl} target="_blank" rel="noreferrer">{article.sourceName || article.sourceUrl}</a></p>}</article>
    <footer className="articles-footer"><Landmark size={18} /> {isEnglish ? "OFOQ — knowledge built from memory and evidence." : "أُفُق — نقرأ الذاكرة لنرى المستقبل بوضوح."}</footer>
  </main>;
}
