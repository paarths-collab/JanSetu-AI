"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TRANSLATIONS } from "./i18n-dict";

export type Lang =
  | "en"
  | "hi"
  | "mr"
  | "gu"
  | "ta"
  | "kn"
  | "te"
  | "bn"
  | "pa"
  | "ur";

export const LANGUAGES: { code: Lang; label: string; english: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", english: "English", dir: "ltr" },
  { code: "hi", label: "हिन्दी", english: "Hindi", dir: "ltr" },
  { code: "mr", label: "मराठी", english: "Marathi", dir: "ltr" },
  { code: "gu", label: "ગુજરાતી", english: "Gujarati", dir: "ltr" },
  { code: "ta", label: "தமிழ்", english: "Tamil", dir: "ltr" },
  { code: "kn", label: "ಕನ್ನಡ", english: "Kannada", dir: "ltr" },
  { code: "te", label: "తెలుగు", english: "Telugu", dir: "ltr" },
  { code: "bn", label: "বাংলা", english: "Bengali", dir: "ltr" },
  { code: "pa", label: "ਪੰਜਾਬੀ", english: "Punjabi", dir: "ltr" },
  { code: "ur", label: "اردو", english: "Urdu", dir: "rtl" },
];

export const LANG_ENGLISH_NAME: Record<Lang, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.english])
) as Record<Lang, string>;

type LanguageContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("jansetu.lang") as Lang | null;
    if (stored && LANGUAGES.some((l) => l.code === stored)) {
      setLangState(stored);
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("jansetu.lang", l);
  }, []);

  const dir = useMemo<"ltr" | "rtl">(
    () => LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr",
    [lang]
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo(() => ({ lang, setLang, dir }), [lang, setLang, dir]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback so components never crash outside the provider.
    return { lang: "en", setLang: () => {}, dir: "ltr" };
  }
  return ctx;
}

/** Returns a translator: t("key", "English fallback"). */
export function useT(): (key: string, fallback?: string) => string {
  const { lang } = useLang();
  return useCallback(
    (key: string, fallback?: string) =>
      TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en?.[key] ?? fallback ?? key,
    [lang]
  );
}
