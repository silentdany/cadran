import { describe, expect, it } from "vitest";
import { mulberry32, shuffleOptions } from "@/lib/battery/marks";

describe("shuffleOptions", () => {
  it("moves the answer index along with the right option", () => {
    const options = ["a", "b", "c", "d"];
    for (let seed = 1; seed <= 50; seed++) {
      const shuffled = shuffleOptions(options, 2, mulberry32(seed));
      expect(shuffled.options[shuffled.answer]).toBe("c");
      expect([...shuffled.options].sort()).toEqual(options);
    }
  });
});
