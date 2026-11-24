import { describe, expect, it } from "vitest";
import { calculateSalary, taxBaseFor } from "../src/salary";

describe("calculateSalary (2026)", () => {
  it("40 000 Kč s prohlášením → 31 930 Kč čistého", () => {
    const r = calculateSalary(40_000);
    expect(r.social).toBe(2_840);
    expect(r.health).toBe(1_800);
    expect(r.taxBeforeCredit).toBe(6_000);
    expect(r.credit).toBe(2_570);
    expect(r.tax).toBe(3_430);
    expect(r.net).toBe(31_930);
  });

  it("bez podepsaného prohlášení se sleva neuplatní", () => {
    const r = calculateSalary(40_000, { signedDeclaration: false });
    expect(r.credit).toBe(0);
    expect(r.tax).toBe(6_000);
    expect(r.net).toBe(29_360);
  });

  it("pojistné se zaokrouhluje nahoru na koruny, základ daně na stokoruny", () => {
    const r = calculateSalary(33_333);
    expect(r.social).toBe(2_367); // 2 366,64 → 2 367
    expect(r.health).toBe(1_500); // 1 499,99 → 1 500
    expect(r.taxBase).toBe(33_400);
    expect(r.tax).toBe(2_440); // 5 010 − 2 570
    expect(r.net).toBe(27_026);
  });

  it("sleva nevytvoří zápornou daň (nízká mzda)", () => {
    const r = calculateSalary(10_000);
    expect(r.taxBeforeCredit).toBe(1_500);
    expect(r.credit).toBe(1_500);
    expect(r.tax).toBe(0);
    expect(r.net).toBe(8_840);
  });

  it("nad 146 901 Kč se část základu daní 23 %", () => {
    const r = calculateSalary(200_000);
    // 146 901 × 15 % + 53 099 × 23 % = 34 247,92 → 34 248
    expect(r.taxBeforeCredit).toBe(34_248);
    expect(r.tax).toBe(31_678);
    expect(r.net).toBe(145_122);
  });

  it("cena práce = hrubá mzda + odvody zaměstnavatele", () => {
    const r = calculateSalary(40_000);
    expect(r.employerSocial).toBe(9_920);
    expect(r.employerHealth).toBe(3_600);
    expect(r.employerCost).toBe(53_520);
  });

  it("odmítne zápornou nebo neplatnou mzdu", () => {
    expect(() => calculateSalary(-1)).toThrow(RangeError);
    expect(() => calculateSalary(Number.NaN)).toThrow(RangeError);
  });
});

describe("taxBaseFor", () => {
  it("zaokrouhlí na stokoruny nahoru", () => {
    expect(taxBaseFor(40_000)).toBe(40_000);
    expect(taxBaseFor(40_001)).toBe(40_100);
    expect(taxBaseFor(99)).toBe(99);
  });
});
