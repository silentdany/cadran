import { describe, expect, it } from "vitest";
import { MATRICES, SUITES, type Mark } from "@/lib/battery/marks";

// Design rules for figures drawn in the 0-100 viewBox.
const MIN_SHAPE = 12;
const MIN_SIZE_GAP = 10;

function allMarks(groups: (Mark[] | null)[]): Mark[] {
  return groups.flatMap((group) => group ?? []);
}

describe("SUITES figures", () => {
  for (const item of SUITES) {
    const marks = allMarks([...item.frames, ...item.options]);

    it(`${item.id}: every shape is at least ${MIN_SHAPE} units`, () => {
      for (const m of marks) expect(m.s).toBeGreaterThanOrEqual(MIN_SHAPE);
    });

    it(`${item.id}: two sizes of the same shape differ by ${MIN_SIZE_GAP}+ units`, () => {
      const sizesByKind = new Map<string, Set<number>>();
      for (const m of marks) {
        const sizes = sizesByKind.get(m.kind) ?? new Set<number>();
        sizes.add(m.s);
        sizesByKind.set(m.kind, sizes);
      }
      for (const sizes of sizesByKind.values()) {
        const sorted = [...sizes].sort((a, b) => a - b);
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i]! - sorted[i - 1]!).toBeGreaterThanOrEqual(MIN_SIZE_GAP);
        }
      }
    });
  }
});

describe("MATRICES figures", () => {
  for (const item of MATRICES) {
    it(`${item.id}: every shape is at least ${MIN_SHAPE} units`, () => {
      for (const m of allMarks([...item.cells, ...item.options])) {
        expect(m.s).toBeGreaterThanOrEqual(MIN_SHAPE);
      }
    });
  }
});

describe("suite q4", () => {
  const q4 = SUITES.find((item) => item.id === "q4")!;

  it("grows by 10 units per step", () => {
    expect(q4.frames.map((frame) => frame[0]!.s)).toEqual([14, 24, 34, 44]);
  });

  it("keeps the answer at index 3: the 54-unit square", () => {
    expect(q4.answer).toBe(3);
    expect(q4.options[q4.answer]).toEqual([expect.objectContaining({ kind: "square", s: 54 })]);
    expect(q4.options.map((o) => `${o[0]!.kind} ${o[0]!.s}`)).toEqual([
      "square 44",
      "square 34",
      "circle 54",
      "square 54",
    ]);
  });
});
