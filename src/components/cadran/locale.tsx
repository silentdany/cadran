import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { copy, type Copy, type Locale } from "@/lib/battery/copy";
import seo from "@/lib/seo.json";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Copy;
}>({
  locale: "fr",
  setLocale: () => {},
  t: copy.fr,
});

/**
 * The route picks the starting locale ("/" is French, "/en" is English).
 * Switching language mid-session keeps the session on screen: we swap the
 * copy in place and only rewrite the URL, lang and title, without a router
 * navigation that would remount the app.
 */
export function LocaleProvider({
  locale: initial,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initial);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = seo[locale].title;
  }, [locale]);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.history.replaceState(window.history.state, "", seo[next].path);
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: copy[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function LangSwitch() {
  const { locale, setLocale } = useLocale();
  return (
    <div
      className="flex items-center gap-2 text-sm"
      role="group"
      aria-label={locale === "fr" ? "Langue" : "Language"}
    >
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
            className={
              "uppercase " +
              (locale === code ? "font-semibold text-ink" : "text-muted hover:text-ink")
            }
          >
            {code}
          </button>
        </span>
      ))}
    </div>
  );
}
