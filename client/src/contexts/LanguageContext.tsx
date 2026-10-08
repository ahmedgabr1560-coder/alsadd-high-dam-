import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Language = "ar" | "en";
type LanguageContextValue = { language: Language; isEnglish: boolean; toggleLanguage: () => void };

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("nibras-language") as Language) || "ar");
  useEffect(() => {
    localStorage.setItem("nibras-language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);
  const value = useMemo(() => ({ language, isEnglish: language === "en", toggleLanguage: () => setLanguage(value => value === "ar" ? "en" : "ar") }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { isEnglish, toggleLanguage } = useLanguage();
  return <button type="button" className={`language-toggle ${className}`} onClick={toggleLanguage} aria-label={isEnglish ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}>{isEnglish ? "عربي" : "EN"}</button>;
}

export const languageText = {
  ar: { brand: "نبراس", subtitle: "معرفة تُضيء الطريق", articles: "المقالات", profile: "ملفي", login: "دخول الزائر", back: "العودة للموقع", read: "قراءة المقال كاملًا", library: "مكتبة نبراس", source: "المصدر" },
  en: { brand: "Nibras", subtitle: "Knowledge that lights the way", articles: "Articles", profile: "Profile", login: "Visitor login", back: "Back to site", read: "Read full article", library: "Nibras Library", source: "Source" },
} as const;
