import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "../..");
const EM_DASH = "\u2014";

const sources = [
  "src/lib/battery/copy.ts",
  "src/lib/battery/items-en.ts",
  "src/lib/battery/marks.ts",
  "src/lib/seo.json",
  "src/lib/seo.ts",
];

describe("em dashes", () => {
  it.each(sources)("are absent from strings in %s", (file) => {
    const text = readFileSync(join(root, file), "utf8");
    expect(text).not.toContain(EM_DASH);
  });
});
