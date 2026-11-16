import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "../..");
const EM_DASH = "\u2014";

const SRC_EXT = new Set([".ts", ".tsx", ".json", ".css"]);
const PUBLIC_EXT = new Set([".txt", ".xml", ".json", ".webmanifest", ".svg", ".html"]);
const SCRIPT_EXT = new Set([".mjs", ".js", ".cjs", ".ts", ".tsx"]);

function walk(dir: string, exts: Set<string>): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && exts.has(extname(entry.name).toLowerCase()))
    .map((entry) => relative(root, join(entry.parentPath, entry.name)))
    .sort();
}

function readmeFiles(): string[] {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toUpperCase().startsWith("README"))
    .map((entry) => entry.name)
    .sort();
}

const sources = [
  ...walk(join(root, "src"), SRC_EXT),
  ...readmeFiles(),
  ...walk(join(root, "public"), PUBLIC_EXT),
  ...walk(join(root, "scripts"), SCRIPT_EXT),
];

describe("em dashes", () => {
  it("scans source, README, public text and scripts", () => {
    expect(sources).toContain("src/components/cadran/calc-run.tsx");
    expect(sources).toContain("src/lib/battery/copy.ts");
    expect(sources).toContain("src/lib/seo.json");
    expect(sources).toContain("README.md");
    expect(sources).toContain("public/robots.txt");
    expect(sources).toContain("public/sitemap.xml");
    expect(sources).toContain("public/favicon.svg");
    expect(sources).toContain("scripts/og.mjs");
  });

  it.each(sources)("are absent from %s", (file) => {
    const text = readFileSync(join(root, file), "utf8");
    expect(text).not.toContain(EM_DASH);
  });
});
