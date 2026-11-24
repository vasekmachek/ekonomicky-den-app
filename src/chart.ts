// Výpočet výsečí koláčového (donut) grafu „Kam jdou peníze“.
// Čistá funkce bez DOM, ať se dá otestovat.

export interface DonutInput {
  key: string;
  value: number;
}

export interface DonutSlice {
  key: string;
  /** Podíl z celku v procentech (0–100), zaokrouhlený na celá procenta. */
  percent: number;
  /** Délka oblouku v jednotkách obvodu 100. */
  length: number;
  /** Kde oblouk začíná (součet délek předchozích výsečí). */
  start: number;
}

export function donutSlices(items: DonutInput[]): DonutSlice[] {
  const values = items.map((i) => Math.max(i.value, 0));
  const total = values.reduce((a, b) => a + b, 0);
  let start = 0;
  return items.map((item, idx) => {
    const length = total > 0 ? (values[idx] / total) * 100 : 0;
    const slice = { key: item.key, percent: Math.round(length), length, start };
    start += length;
    return slice;
  });
}
