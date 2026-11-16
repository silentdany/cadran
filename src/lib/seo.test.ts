import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { localeFromPath, pageHead, SITE_URL } from "@/lib/seo";

const root = join(__dirname, "../..");

function meta(head: ReturnType<typeof pageHead>, key: string) {
  const tag = head.meta.find(
    (m) => ("property" in m && m.property === key) || ("name" in m && m.name === key),
  );
  return tag && "content" in tag ? tag.content : undefined;
}

describe.each(["fr", "en"] as const)("%s page head", (locale) => {
  const head = pageHead(locale);

  it("has a title and a description", () => {
    expect(head.meta[0]).toHaveProperty("title");
    expect(meta(head, "description")!.length).toBeGreaterThan(50);
  });

  it("uses absolute https URLs on the production origin", () => {
    expect(SITE_URL).toBe("https://cadran.cura.dev");
    const canonical = head.links.find((l) => l.rel === "canonical")!.href;
    expect(canonical).toBe(
      locale === "fr" ? "https://cadran.cura.dev/" : "https://cadran.cura.dev/en",
    );
    expect(meta(head, "og:url")).toBe(canonical);
    expect(meta(head, "og:image")).toBe(`https://cadran.cura.dev/og-${locale}.png`);
    expect(meta(head, "twitter:image")).toBe(meta(head, "og:image"));
  });

  it("declares a large Twitter card and the Open Graph basics", () => {
    expect(meta(head, "twitter:card")).toBe("summary_large_image");
    expect(meta(head, "og:type")).toBe("website");
    expect(meta(head, "og:site_name")).toBe("Cadran");
  });

  it(`ships og-${locale}.png at 1200x630 under 200 KB`, () => {
    const file = join(root, "public", `og-${locale}.png`);
    const png = readFileSync(file);
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
    expect(statSync(file).size).toBeLessThan(200 * 1024);
  });
});

describe("localeFromPath", () => {
  it("maps / to fr and /en to en", () => {
    expect(localeFromPath("/")).toBe("fr");
    expect(localeFromPath("/en")).toBe("en");
    expect(localeFromPath("/english")).toBe("fr");
  });
});
