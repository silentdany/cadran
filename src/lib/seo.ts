import seo from "@/lib/seo.json";
import type { Locale } from "@/lib/battery/copy";

/** Production origin. Every canonical, og:url and og:image is absolute on it. */
export const SITE_URL = seo.siteUrl;

export const LOCALES: Locale[] = ["fr", "en"];

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).href;
}

export function localeFromPath(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fr";
}

/** `<head>` for one locale's page: title, description, canonical, hreflang, Open Graph, Twitter, JSON-LD. */
export function pageHead(locale: Locale) {
  const page = seo[locale];
  const url = absoluteUrl(page.path);
  const image = absoluteUrl(page.ogImage);
  const other = locale === "fr" ? "en" : "fr";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: seo.siteName,
    url,
    description: page.description,
    inLanguage: locale,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };

  return {
    meta: [
      { title: page.title },
      { name: "description", content: page.description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: seo.siteName },
      { property: "og:locale", content: page.ogLocale },
      { property: "og:locale:alternate", content: seo[other].ogLocale },
      { property: "og:url", content: url },
      { property: "og:title", content: page.title },
      { property: "og:description", content: page.description },
      { property: "og:image", content: image },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: page.ogImageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: page.title },
      { name: "twitter:description", content: page.description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: page.ogImageAlt },
    ],
    links: [
      { rel: "canonical", href: url },
      ...LOCALES.map((code) => ({ rel: "alternate", hrefLang: code, href: absoluteUrl(seo[code].path) })),
      { rel: "alternate", hrefLang: "x-default", href: absoluteUrl(seo.fr.path) },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
  };
}
