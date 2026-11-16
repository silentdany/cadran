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
    <div className="flex items-center gap-2 text-sm" role="group" aria-label={locale === "fr" ? "Langue" : "Language"}>
      {(["fr", "en"] as const).map((code, i) => (
        <span key={code} className="flex items-center gap-2">
          {i > 0 && (
            <span className="text-line" aria-hidden="true">
              ·
            </span>
          )}
          <button
            type="button"
            lang={code}
            onClick={() => setLocale(code)}
            aria-pressed={locale === code}
            className={"uppercase " + (locale === code ? "font-semibold text-ink" : "text-muted hover:text-ink")}
          >
            {code}
          </button>
        </span>
      ))}
    </div>
  );
}
