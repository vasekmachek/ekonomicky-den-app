export type Theme = "light" | "dark";

/** Výchozí vzhled podle nastavení systému. */
export function initialTheme(systemPrefersDark: boolean): Theme {
  return systemPrefersDark ? "dark" : "light";
}

/** Přepínač střídá světlý a tmavý vzhled. */
export function nextTheme(current: Theme): Theme {
  return current === "dark" ? "light" : "dark";
}

/** Text tlačítka říká, na co se přepne. */
export function toggleLabel(current: Theme): string {
  return current === "dark" ? "☀️ Světlý režim" : "🌙 Tmavý režim";
}
