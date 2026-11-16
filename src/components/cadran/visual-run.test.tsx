import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TILE_SIZE_CLASS, VIEWBOX } from "@/components/cadran/glyphs";
import { VisualRun } from "@/components/cadran/visual-run";
import { MATRICES, SUITES } from "@/lib/battery/marks";

const TILE = /<div data-tile="" class="([^"]+)"/g;

function tileClasses(html: string) {
  return [...html.matchAll(TILE)].map((m) => m[1]!);
}

function render(mode: "suite" | "matrix") {
  const html = renderToStaticMarkup(
    <VisualRun
      items={mode === "suite" ? SUITES : MATRICES}
      seed={7}
      mode={mode}
      kicker="k"
      title="t"
      lead="l"
      progress={0}
      onDone={() => {}}
    />,
  );
  const options = [...html.matchAll(/<button[^>]*aria-pressed[^>]*>([\s\S]*?)<\/button>/g)];
  return {
    tiles: tileClasses(html),
    optionTiles: options.flatMap((m) => tileClasses(m[1]!)),
    viewBoxes: [...html.matchAll(/viewBox="([^"]+)"/g)].map((m) => m[1]!),
  };
}

describe.each(["suite", "matrix"] as const)("%s tiles", (mode) => {
  const { tiles, optionTiles: options, viewBoxes } = render(mode);

  it("renders the question cells and the four options", () => {
    expect(options).toHaveLength(4);
    expect(tiles.length).toBeGreaterThan(options.length);
  });

  it("gives option tiles exactly the same px size as series tiles", () => {
    for (const cls of [...tiles, ...options]) expect(cls).toContain(TILE_SIZE_CLASS);
    expect(TILE_SIZE_CLASS).toBe("size-[72px] sm:size-[88px]");
  });

  it("draws every figure in the same viewBox, with no inner scaling", () => {
    expect(viewBoxes.length).toBeGreaterThan(0);
    for (const box of viewBoxes) expect(box).toBe(VIEWBOX);
    for (const cls of tiles) expect(cls).not.toMatch(/\b(w|h)-\[?\d+%/);
  });
});
