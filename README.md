# Kolik mi zbude z výplaty

Kalkulačka čisté mzdy pro **Ekonomický den na OATGM Kostelec nad Orlicí**.

Aplikaci staví a rozšiřuje AI agent **Claude** (`claude-oatgm[bot]`) podle nápadů studentů. O tom, co se postaví, rozhoduje člověk.

- Co aplikace umí a jak počítá: [SPEC.md](SPEC.md)
- Pravidla pro Clauda: [CLAUDE.md](CLAUDE.md)

## Spuštění

```bash
npm install
npm run dev     # vývojový server
npm test        # testy výpočtu
npm run build   # produkční build do dist/
```

Výpočet je orientační, nejde o daňové poradenství.
