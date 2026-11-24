import { describe, expect, it } from "vitest";
import { donutSlices } from "../src/chart";
import { calculateSalary } from "../src/salary";

describe("donutSlices", () => {
  it("výseče pro 40 000 Kč odpovídají rozdělení hrubé mzdy", () => {
    const r = calculateSalary(40_000);
    const s = donutSlices([
      { key: "net", value: r.net },
      { key: "tax", value: r.tax },
      { key: "social", value: r.social },
      { key: "health", value: r.health },
    ]);
    expect(s.map((x) => x.percent)).toEqual([80, 9, 7, 5]);
    expect(s[0].start).toBe(0);
    expect(s[1].start).toBeCloseTo(s[0].length);
    const total = s.reduce((a, x) => a + x.length, 0);
    expect(total).toBeCloseTo(100);
  });

  it("nulová daň má nulovou výseč", () => {
    const s = donutSlices([
      { key: "net", value: 90 },
      { key: "tax", value: 0 },
      { key: "social", value: 10 },
    ]);
    expect(s[1].length).toBe(0);
    expect(s[2].start).toBeCloseTo(90);
  });

  it("při nulové mzdě nevrací NaN", () => {
    const s = donutSlices([
      { key: "net", value: 0 },
      { key: "tax", value: 0 },
    ]);
    expect(s.every((x) => x.length === 0 && x.percent === 0)).toBe(true);
  });
});
