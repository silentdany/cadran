import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { copy, type Copy, type Locale } from "@/lib/battery/copy";

const KEY = "cadran-locale";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Copy;
}>({
  locale: "fr",
  setLocale: () => {},
  t: copy.fr,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === "en" || saved === "fr") setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem(KEY, next);
  }

  return <LocaleContext.Provider value={{ locale, setLocale, t: copy[locale] }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function LangSwitch() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="inline-flex shrink-0 rounded-full border border-line bg-sheet p-0.5 text-xs font-medium" role="group" aria-label={locale === "fr" ? "Langue" : "Language"}>
      {(["fr", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={"rounded-full px-2.5 py-1 uppercase " + (locale === code ? "bg-ink text-paper" : "text-muted")}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
