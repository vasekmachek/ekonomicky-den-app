# Kolik mi zbude z výplaty – specifikace

## Pro koho a proč

Webová kalkulačka pro studenty Obchodní akademie T. G. Masaryka. Na mobilu ukáže, kolik z hrubé mzdy zbude na účet, kam jdou zbylé peníze a kolik zaměstnanec stojí firmu. Aplikaci během Ekonomického dne rozšiřuje AI agent Claude podle nápadů studentů.

## Co aplikace umí (verze 0.1)

1. Zadání hrubé měsíční mzdy v Kč (výchozí 40 000 Kč).
2. Přepínač „Podepsal(a) jsem prohlášení poplatníka“ (sleva na poplatníka).
3. Výsledek se přepočítává při psaní:
   - čistá mzda,
   - barevný pruh a tabulka: čistá mzda, daň, sociální a zdravotní pojištění (Kč i % z hrubé),
   - cena práce: hrubá mzda + odvody zaměstnavatele.
4. Srozumitelná chyba u neplatného vstupu.
5. Koláčový (donut) graf „Kam jdou peníze z výplaty“: podíl čisté mzdy, daně, sociálního a zdravotního pojištění, uprostřed kolik procent zbude tobě.

## Pravidla výpočtu (rok 2026, hlavní pracovní poměr)

| Položka | Pravidlo |
|---|---|
| Sociální pojištění zaměstnance | 7,1 % z hrubé mzdy, zaokrouhleno na koruny nahoru |
| Zdravotní pojištění zaměstnance | 4,5 % z hrubé mzdy, zaokrouhleno na koruny nahoru |
| Základ daně | hrubá mzda zaokrouhlená na celé stokoruny nahoru |
| Daň | 15 % do 146 901 Kč měsíčně, 23 % z části nad touto hranicí; zaokrouhleno na koruny nahoru |
| Sleva na poplatníka | 2 570 Kč měsíčně, jen s podepsaným prohlášením; daň nesmí klesnout pod nulu |
| Odvody zaměstnavatele | 24,8 % sociální + 9 % zdravotní, zaokrouhleno na koruny nahoru |

Kontrolní příklad: 40 000 Kč s prohlášením → sociální 2 840, zdravotní 1 800, daň 3 430, **čistá mzda 31 930 Kč**, cena práce 53 520 Kč.

Všechny sazby jsou v `src/salary.ts` v objektu `PARAMS_2026`.

### Co výpočet zatím nezahrnuje

- děti a další slevy (student, invalidita), daňový bonus,
- roční strop sociálního pojištění,
- minimální vyměřovací základ zdravotního pojištění,
- DPP, DPČ a OSVČ.

To jsou dobří kandidáti na nápady od studentů.

## Mimo rozsah

- Ukládání osobních údajů. Aplikace nic neukládá ani neodesílá.
- Přihlašování uživatelů.

## Technika

- Vite + TypeScript bez frameworku, testy ve Vitestu.
- Mobil na prvním místě, světlý i tmavý režim podle systému.
- Výpočty jsou čisté funkce v `src/salary.ts`, UI v `src/main.ts`.
