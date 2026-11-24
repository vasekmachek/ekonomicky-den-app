// Výpočet čisté mzdy zaměstnance v ČR (hlavní pracovní poměr, měsíční mzda).
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
};

export interface SalaryOptions {
  /** Podepsané prohlášení poplatníka: uplatní se sleva na poplatníka. */
  signedDeclaration: boolean;
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

  const social = roundUpToCrown(gross * p.socialRate);
  const health = roundUpToCrown(gross * p.healthRate);

  const taxBase = taxBaseFor(gross);
  const lowPart = Math.min(taxBase, p.highTaxThresholdMonthly);
  const highPart = Math.max(0, taxBase - p.highTaxThresholdMonthly);
  const taxBeforeCredit = roundUpToCrown(lowPart * p.taxRate + highPart * p.taxRateHigh);

  const credit = options.signedDeclaration ? Math.min(p.taxpayerCredit, taxBeforeCredit) : 0;
  const tax = taxBeforeCredit - credit;

  const net = gross - social - health - tax;

  const employerSocial = roundUpToCrown(gross * p.employerSocialRate);
  const employerHealth = roundUpToCrown(gross * p.employerHealthRate);

  return {
    gross,
    social,
    health,
    taxBase,
    taxBeforeCredit,
    credit,
    tax,
    net,
    employerSocial,
    employerHealth,
    employerCost: gross + employerSocial + employerHealth,
  };
}
