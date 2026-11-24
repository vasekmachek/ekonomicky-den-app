// Výpočet čisté mzdy zaměstnance v ČR (hlavní pracovní poměr nebo DPP, měsíční mzda).
// Všechny sazby a částky jsou v PARAMS_2026, ať se dají jedním místem aktualizovat.

export interface SalaryParams {
  year: number;
  /** Sociální pojištění zaměstnance (6,5 % důchodové + 0,6 % nemocenské). */
  socialRate: number;
  /** Zdravotní pojištění zaměstnance. */
  healthRate: number;
  /** Sociální pojištění placené zaměstnavatelem. */
  employerSocialRate: number;
  /** Zdravotní pojištění placené zaměstnavatelem. */
  employerHealthRate: number;
  /** Základní sazba daně z příjmu. */
  taxRate: number;
  /** Zvýšená sazba daně nad měsíční hranicí. */
  taxRateHigh: number;
  /** Měsíční hranice pro 23 % (3násobek průměrné mzdy). */
  highTaxThresholdMonthly: number;
  /** Měsíční sleva na poplatníka. */
  taxpayerCredit: number;
  /** DPP: od této měsíční odměny se platí sociální a zdravotní pojištění. */
  dppInsuranceLimit: number;
  /** DPP pod limitem bez prohlášení: sazba srážkové daně. */
  withholdingTaxRate: number;
}

export const PARAMS_2026: SalaryParams = {
  year: 2026,
  socialRate: 0.071,
  healthRate: 0.045,
  employerSocialRate: 0.248,
  employerHealthRate: 0.09,
  taxRate: 0.15,
  taxRateHigh: 0.23,
  highTaxThresholdMonthly: 146_901, // 3 × průměrná mzda 48 967 Kč
  taxpayerCredit: 2_570,
  dppInsuranceLimit: 12_000, // 25 % průměrné mzdy, pro rok 2026
  withholdingTaxRate: 0.15,
};

/** Typ úvazku: hlavní pracovní poměr nebo dohoda o provedení práce. */
export type ContractType = "hpp" | "dpp";

export interface SalaryOptions {
  /** Podepsané prohlášení poplatníka: uplatní se sleva na poplatníka. */
  signedDeclaration: boolean;
  /** Typ úvazku, výchozí je hlavní pracovní poměr. */
  contract?: ContractType;
}

export interface SalaryResult {
  gross: number;
  social: number;
  health: number;
  /** Základ daně: hrubá mzda zaokrouhlená na celé stokoruny nahoru. */
  taxBase: number;
  taxBeforeCredit: number;
  credit: number;
  tax: number;
  /** Daň je srážková (DPP pod limitem bez prohlášení), ne zálohová. */
  withholdingTax: boolean;
  /** Platí se sociální a zdravotní pojištění (u DPP jen od limitu). */
  insured: boolean;
  net: number;
  employerSocial: number;
  employerHealth: number;
  /** Kolik zaměstnance stojí firmu (hrubá mzda + odvody zaměstnavatele). */
  employerCost: number;
}

/** Zaokrouhlí nahoru na celé koruny a ignoruje drobné chyby plovoucí čárky. */
export function roundUpToCrown(value: number): number {
  return Math.ceil(Math.round(value * 100) / 100);
}

/** Základ daně se zaokrouhluje na celé stokoruny nahoru (u částek nad 100 Kč). */
export function taxBaseFor(gross: number): number {
  if (gross <= 100) return roundUpToCrown(gross);
  return Math.ceil(gross / 100) * 100;
}

export function calculateSalary(
  gross: number,
  options: SalaryOptions = { signedDeclaration: true },
  p: SalaryParams = PARAMS_2026,
): SalaryResult {
  if (!Number.isFinite(gross) || gross < 0) {
    throw new RangeError("Hrubá mzda musí být nezáporné číslo.");
  }

  const isDpp = options.contract === "dpp";
  // DPP pod limitem: žádné pojištění zaměstnance ani zaměstnavatele.
  const insured = !isDpp || gross >= p.dppInsuranceLimit;
  // DPP pod limitem bez prohlášení: 15% srážková daň, bez slevy.
  const withholdingTax = isDpp && !insured && !options.signedDeclaration;

  const social = insured ? roundUpToCrown(gross * p.socialRate) : 0;
  const health = insured ? roundUpToCrown(gross * p.healthRate) : 0;

  let taxBase: number;
  let taxBeforeCredit: number;
  if (withholdingTax) {
    // Srážková daň: základ i daň se zaokrouhlují na celé koruny dolů.
    taxBase = Math.floor(gross);
    taxBeforeCredit = Math.floor(Math.round(taxBase * p.withholdingTaxRate * 100) / 100);
  } else {
    taxBase = taxBaseFor(gross);
    const lowPart = Math.min(taxBase, p.highTaxThresholdMonthly);
    const highPart = Math.max(0, taxBase - p.highTaxThresholdMonthly);
    taxBeforeCredit = roundUpToCrown(lowPart * p.taxRate + highPart * p.taxRateHigh);
  }

  const credit =
    options.signedDeclaration && !withholdingTax ? Math.min(p.taxpayerCredit, taxBeforeCredit) : 0;
  const tax = taxBeforeCredit - credit;

  const net = gross - social - health - tax;

  const employerSocial = insured ? roundUpToCrown(gross * p.employerSocialRate) : 0;
  const employerHealth = insured ? roundUpToCrown(gross * p.employerHealthRate) : 0;

  return {
    gross,
    social,
    health,
    taxBase,
    taxBeforeCredit,
    credit,
    tax,
    withholdingTax,
    insured,
    net,
    employerSocial,
    employerHealth,
    employerCost: gross + employerSocial + employerHealth,
  };
}
