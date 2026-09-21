# SWV Soest — JO14

Website van Samenwerking Voetbalverenigingen Soest (VVZ'49 x So Soest) voor de
zes JO14-teams (JO14-1 t/m JO14-6): programma, uitslagen, teampagina's en nieuws.

- **Huisstijl**: [swvsoest-huisstijl](https://github.com/thewally/swvsoest-huisstijl) (logo, design tokens, componenten), lokaal geport naar React in `src/components/svs/`.
- **Menu/opzet**: geïnspireerd op [vvz-toolbox](https://github.com/thewally/vvz-toolbox) (React + Vite + React Router, GitHub Pages).
- **Wedstrijddata**: rechtstreeks van de publieke SportLink Club widget-API (`data.sportlink.com`).
- **Agenda's (.ics)**: elk team heeft een eigen los repo (`vvz49-jo14-1-agenda` t/m `vvz49-jo14-6-agenda`), zelfde opzet als [vvz49-jo14-6-agenda](https://github.com/thewally/vvz49-jo14-6-agenda). Deze site linkt er alleen naartoe (zie `src/lib/teams.js`, veld `agendaUrl`); de feed zelf wordt niet hier gegenereerd.
- **Geen database**: alle data staat als statische JSON-bestanden in de repo, bijgewerkt door een geplande GitHub Action.

## Architectuur

```
content/nieuws/*.md        Nieuwsartikelen (frontmatter + markdown)
scripts/build-news.mjs     Zet content/nieuws/*.md om naar public/data/nieuws.json (bij elke build)
scripts/sportlink_sync.py  Haalt programma/uitslagen/stand/teamfoto op bij SportLink, schrijft:
                              public/data/<team>.json        (programma + uitslagen + stand + foto-pad)
                              public/data/photos/<team>.jpg  (teamfoto, indien aanwezig)
                              data/state/results/<team>.json (archief van alle ooit geziene uitslagen)
src/                        React-app (Vite), leest de public/data/*.json bestanden
```

Twee GitHub Actions:

- **Sync SportLink data** (`.github/workflows/sync-sportlink.yml`) — draait 2x per dag, haalt de
  nieuwste programma's/uitslagen op en commit de gewijzigde bestanden naar `main`.
- **Deploy to GitHub Pages** (`.github/workflows/deploy.yml`) — bouwt de site en publiceert 'm bij
  elke push naar `main` (dus ook na elke sync-commit).

## Nieuws toevoegen

Voeg een bestand toe in `content/nieuws/`, bijvoorbeeld `2026-10-05-uitje-jo14.md`:

```markdown
---
title: Gezamenlijk uitje voor alle JO14-teams
date: 2026-10-05
label: Jeugd
tone: groen
excerpt: Op zaterdag 17 oktober gaan alle zes JO14-teams samen op stap.
image:
---

Tekst van het bericht, in **markdown**.
```

| Veld | Verplicht | Uitleg |
|---|---|---|
| `title` | ja | Titel van het bericht |
| `date` | ja | `JJJJ-MM-DD` |
| `label` | nee | Badge-tekst, bv. "Jeugd", "Clubnieuws" |
| `tone` | nee | `groen`, `blauw` of `neutral` (kleur van de badge) |
| `excerpt` | nee | Korte samenvatting op de kaart |
| `image` | nee | Pad of URL naar een foto (16:9) |

Committen naar `main` (bv. rechtstreeks op GitHub) triggert automatisch een nieuwe build.

## Teams bijwerken

De zes teamnamen staan op twee plekken (moeten synchroon blijven):

- `src/lib/teams.js` (frontend, incl. `agendaUrl` per team)
- `scripts/sportlink_sync.py` → `TEAMS` (data-sync)

## Lokaal ontwikkelen

```bash
npm install
export SPORTLINK_CLIENT_ID=...   # alleen nodig om scripts/sportlink_sync.py te draaien
npm run dev
```

```bash
python3 scripts/sportlink_sync.py   # ververst public/data/*.json en public/data/photos/*.jpg
```

## Live

- **Website**: https://thewally.github.io/swvsoest-website/
- **Agenda's**: https://github.com/thewally/vvz49-jo14-1-agenda t/m `-6-agenda` (elk met eigen `matches.ics` en instructiepagina)
