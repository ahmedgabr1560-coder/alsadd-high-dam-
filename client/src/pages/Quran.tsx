import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookMarked, ChevronLeft, ChevronRight, ExternalLink, Headphones, Search } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { LanguageToggle, useLanguage } from "@/contexts/LanguageContext";

type Chapter = { id: number; name: string; transliteration: string; translation: string; type: "meccan" | "medinan"; total_verses: number };
type Verse = { id: number; text: string };
type QuranChapter = { id: number; verses: Verse[] };
type Reciter = { name: string; nameEn: string; source: string; url?: string; external?: string };

const reciters: Reciter[] = [
  { name: "محمد صديق المنشاوي", nameEn: "Muhammad Siddiq Al-Minshawi", source: "MP3Quran", url: "https://cdn.mp3quran.net/audio/muhammad-minshawi/r1/" },
  { name: "محمود خليل الحصري", nameEn: "Mahmoud Khalil Al-Husary", source: "MP3Quran", url: "https://cdn.mp3quran.net/audio/mahmoud-husary/r1/" },
  { name: "مشاري راشد العفاسي", nameEn: "Mishary Rashid Alafasy", source: "MP3Quran", url: "https://cdn.mp3quran.net/audio/mishary-alafasy/r1/" },
  { name: "عبدالرحمن الشحات", nameEn: "Abdulrahman Al-Shahat", source: "MP3Quran", url: "https://cdn.mp3quran.net/audio/abdulrahman-shahat/r1/" },
  { name: "شحات محمد أنور", nameEn: "Shahat Muhammad Anwar", source: "QuranCentral", external: "https://qurancentral.com/audio/muhammad-anwar-shahat" },
  { name: "محمد ماهر الشناوي", nameEn: "Muhammad Maher Al-Shanawi", source: "استماع خارجي", external: "https://www.youtube.com/results?search_query=%D9%85%D8%AD%D9%85%D8%AF+%D9%85%D8%A7%D9%87%D8%B1+%D8%A7%D9%84%D8%B4%D9%86%D8%A7%D9%88%D9%8A+%D8%AA%D9%84%D8%A7%D9%88%D8%A9" },
];

export default function Quran() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });
  const { isEnglish } = useLanguage();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [quran, setQuran] = useState<QuranChapter[]>([]);
  const [selectedId, setSelectedId] = useState(1);
  const [query, setQuery] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const [reciter, setReciter] = useState(reciters[0]);

  useEffect(() => {
    Promise.all([fetch("/data/quran/chapters.json").then(r => r.json()), fetch("/data/quran/quran.json").then(r => r.json())])
      .then(([chapterData, quranData]) => { setChapters(chapterData); setQuran(quranData); })
      .catch(() => undefined)
      .finally(() => setDataLoading(false));
  }, []);

  const selected = chapters.find(chapter => chapter.id === selectedId);
  const selectedQuran = quran.find(chapter => chapter.id === selectedId);
  const filteredChapters = useMemo(() => chapters.filter(chapter => `${chapter.name} ${chapter.transliteration} ${chapter.translation}`.toLowerCase().includes(query.trim().toLowerCase())), [chapters, query]);
  const choose = (id: number) => { setSelectedId(id); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const prev = selectedId > 1 ? selectedId - 1 : 114;
  const next = selectedId < 114 ? selectedId + 1 : 1;
  const audioUrl = reciter.url ? `${reciter.url}${String(selectedId).padStart(3, "0")}.mp3` : undefined;

  if (loading || !user || dataLoading) return <div className="site-auth-loading" dir={isEnglish ? "ltr" : "rtl"}><span className="login-loader" /><p>{isEnglish ? "Opening the Holy Quran..." : "جارٍ فتح القرآن الكريم..."}</p></div>;

  return <main className="quran-page" dir={isEnglish ? "ltr" : "rtl"}>
    <header className="quran-header">
      <div className="quran-toolbar"><a href="/" className="articles-back"><ArrowRight size={16} /> {isEnglish ? "Back to OFOQ" : "العودة إلى أُفُق | OFOQ"}</a><LanguageToggle /></div>
      <span className="articles-kicker"><BookMarked size={16} /> {isEnglish ? "The Holy Quran" : "القرآن الكريم"}</span>
      <h1>{isEnglish ? <>Read with <em>calm and presence.</em></> : <>القرآن الكريم<br /><em>قراءة بهدوء وحضور.</em></>}</h1>
      <p>{isEnglish ? "A carefully organized reader in Uthmani script, arranged by the 114 surahs of the Mushaf." : "قارئ منظم بالرسم العثماني، مرتب على سور المصحف الشريف الأربع عشرة بعد المائة."}</p>
    </header>

    <section className="quran-reader-shell">
      <aside className="quran-index" aria-label={isEnglish ? "Surah index" : "فهرس السور"}>
        <div className="quran-index-title"><strong>{isEnglish ? "Surah index" : "فهرس السور"}</strong><span>114</span></div>
        <label className="quran-search"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={isEnglish ? "Search surah..." : "ابحث عن سورة..."} /></label>
        <div className="quran-chapter-list">{filteredChapters.map(chapter => <button key={chapter.id} className={`quran-chapter-item ${chapter.id === selectedId ? "active" : ""}`} onClick={() => choose(chapter.id)}><span className="quran-chapter-number">{chapter.id}</span><span className="quran-chapter-name"><b>{isEnglish ? chapter.transliteration : chapter.name}</b><small>{isEnglish ? chapter.name : chapter.transliteration}</small></span><small>{chapter.total_verses} {isEnglish ? "verses" : "آيات"}</small></button>)}</div>
      </aside>

      <article className="quran-mushaf" aria-label={selected ? (isEnglish ? selected.transliteration : selected.name) : ""}>
        <div className="quran-surah-head"><span>{selected?.type === "meccan" ? (isEnglish ? "Meccan" : "مكية") : (isEnglish ? "Medinan" : "مدنية")}</span><div className="quran-surah-ornament">۞</div><h2>{isEnglish ? selected?.transliteration : selected?.name}</h2><p>{selected?.translation} · {selected?.total_verses} {isEnglish ? "verses" : "آية"}</p></div>
        <div className="quran-audio-box"><div className="quran-audio-title"><Headphones size={17} /><strong>{isEnglish ? "Listen to this surah" : "استمع إلى السورة"}</strong><select value={reciter.name} onChange={event => setReciter(reciters.find(item => item.name === event.target.value) || reciters[0])}>{reciters.map(item => <option value={item.name} key={item.name}>{isEnglish ? item.nameEn : item.name}</option>)}</select></div>{audioUrl ? <audio controls preload="none" src={audioUrl} aria-label={`${reciter.name} — ${selected?.name}`} /> : <a className="quran-external-audio" href={reciter.external} target="_blank" rel="noreferrer"><ExternalLink size={15} /> {isEnglish ? `Open ${reciter.source} listening page` : `فتح صفحة الاستماع عبر ${reciter.source}`}</a>}<small>{isEnglish ? `Audio source: ${reciter.source}` : `مصدر التلاوة: ${reciter.source}`}</small></div>
        <div className="quran-verses">{selectedQuran?.verses.map(verse => <p className="quran-verse" key={verse.id}><span className="ayah-number">{verse.id}</span><span>{verse.text}</span></p>)}</div>
        <div className="quran-pager"><button onClick={() => choose(prev)} aria-label={isEnglish ? "Previous surah" : "السورة السابقة"}><ChevronRight size={18} /> {isEnglish ? "Previous" : "السابقة"}</button><span>{selectedId} / 114</span><button onClick={() => choose(next)} aria-label={isEnglish ? "Next surah" : "السورة التالية"}>{isEnglish ? "Next" : "التالية"} <ChevronLeft size={18} /></button></div>
      </article>
    </section>
    <footer className="quran-attribution">{isEnglish ? "Uthmani text sourced from the Tanzil Project, based on the Medina Mushaf. The text is reproduced verbatim." : "النص بالرسم العثماني من مشروع تنزيل، وهو ترميز Unicode لمصحف المدينة. أُدرج النص كما هو دون تغيير."} · <a href="https://tanzil.net" target="_blank" rel="noreferrer">tanzil.net</a></footer>
  </main>;
}
