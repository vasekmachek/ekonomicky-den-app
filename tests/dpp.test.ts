import { describe, expect, it } from "vitest";
import { calculateSalary, PARAMS_2026 } from "../src/salary";

describe("DPP (dohoda o provedení práce, 2026)", () => {
  it("10 000 Kč bez prohlášení → 15% srážková daň, zbude 8 500 Kč", () => {
    const r = calculateSalary(10_000, { signedDeclaration: false, contract: "dpp" });
    expect(r.insured).toBe(false);
    expect(r.social).toBe(0);
    expect(r.health).toBe(0);
    expect(r.withholdingTax).toBe(true);
    expect(r.credit).toBe(0);
    expect(r.tax).toBe(1_500);
    expect(r.net).toBe(8_500);
    expect(r.employerCost).toBe(10_000);
  });

  it("10 000 Kč s prohlášením → sleva pokryje daň, zbude celých 10 000 Kč", () => {
    const r = calculateSalary(10_000, { signedDeclaration: true, contract: "dpp" });
    expect(r.withholdingTax).toBe(false);
    expect(r.taxBeforeCredit).toBe(1_500);
    expect(r.tax).toBe(0);
    expect(r.net).toBe(10_000);
  });

  it("srážková daň se zaokrouhluje na koruny dolů", () => {
    const r = calculateSalary(9_999, { signedDeclaration: false, contract: "dpp" });
    expect(r.tax).toBe(1_499); // 1 499,85 → 1 499
    expect(r.net).toBe(8_500);
  });

  it("těsně pod limitem se pojištění neplatí, od limitu ano", () => {
    expect(PARAMS_2026.dppInsuranceLimit).toBe(12_000);
    const below = calculateSalary(11_999, { signedDeclaration: true, contract: "dpp" });
    expect(below.insured).toBe(false);
    expect(below.social + below.health).toBe(0);

    const at = calculateSalary(12_000, { signedDeclaration: false, contract: "dpp" });
    expect(at.insured).toBe(true);
    expect(at.social).toBe(852);
    expect(at.health).toBe(540);
    expect(at.withholdingTax).toBe(false); // nad limitem zálohová daň
    expect(at.tax).toBe(1_800);
    expect(at.net).toBe(8_808);
  });

  it("nad limitem se počítá jako hlavní pracovní poměr", () => {
    const dpp = calculateSalary(15_000, { signedDeclaration: true, contract: "dpp" });
    const hpp = calculateSalary(15_000, { signedDeclaration: true });
    expect(dpp).toEqual(hpp);
    expect(dpp.net).toBe(13_260);
    expect(dpp.employerCost).toBe(20_070);
  });

  it("bez zadaného typu úvazku se počítá hlavní pracovní poměr", () => {
    const r = calculateSalary(10_000, { signedDeclaration: false });
    expect(r.insured).toBe(true);
    expect(r.withholdingTax).toBe(false);
    expect(r.social).toBe(710);
    expect(r.health).toBe(450);
  });
});
