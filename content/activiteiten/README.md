# Activiteiten toevoegen

Er zijn twee soorten activiteiten: **eenmalig** (een activiteit met één datum) en
**herhalend** (bv. een wekelijkse training).

## Eenmalige activiteit

Voeg een `.md` bestand toe in deze map, bijvoorbeeld `2026-10-17-familiedag.md`:

```markdown
---
title: Familiedag JO14
date: 2026-10-17
tijd: 14:00 - 17:00
locatie: Hoofdveld VVZ'49
label: Jeugd
tone: groen
excerpt: Alle JO14-teams samen een middag op het sportpark, met een klein toernooitje en patat.
image:
---

Tekst van de activiteit, in **markdown**. Zet hier eventuele
aanmeldinstructies in.
```

| Veld | Verplicht | Uitleg |
|---|---|---|
| `title` | ja | Titel van de activiteit |
| `date` | ja | `JJJJ-MM-DD` -- de datum van de activiteit zelf (niet een publicatiedatum) |
| `tijd` | nee | Vrije tekst, bv. `14:00 - 17:00` -- verschijnt onder de datum, zowel in de lijst als op de detailpagina |
| `locatie` | nee | Vrije tekst, bv. `Hoofdveld VVZ'49` -- verschijnt onder de titel, zowel in de lijst als op de detailpagina |
| `label` | nee | Badge-tekst, bv. "Jeugd", "Senioren", "Clubbreed" |
| `tone` | nee | `groen`, `blauw` of `neutral` (kleur van de badge) |
| `excerpt` | nee | Korte samenvatting op de kaart |
| `image` | nee | Pad of URL naar een headerfoto (16:9) |
| `teams` | nee | Komma-gescheiden team-slugs uit `src/lib/teams.js`, bv. `jo14-1, jo14-2` -- laat de activiteit ook verschijnen onder "Activiteiten" op de betreffende teampagina('s). Weglaten = alleen op de algemene Activiteiten-pagina |

## Herhalende activiteit (bv. wekelijkse training)

Gebruik `herhaling` in plaats van `date`. Bestandsnaam heeft geen datumprefix nodig, bv.
`training-jo16-4.md`:

```markdown
---
title: Training JO16-4
herhaling: wekelijks
dag: dinsdag
vanaf: 2026-09-01
tijd: 18:30 - 19:45
locatie: Hoofdveld VVZ'49
label: Jeugd
tone: blauw
excerpt: Wekelijkse training voor JO16-4.
---

Training op het hoofdveld. Verzamelen om 18:15 uur.
```

| Veld | Verplicht | Uitleg |
|---|---|---|
| `title` | ja | Titel van de activiteit |
| `herhaling` | ja | `wekelijks` of `tweewekelijks` |
| `vanaf` | ja | `JJJJ-MM-DD` -- eerste keer dat de reeks plaatsvindt. Moet zelf op de juiste weekdag vallen |
| `dag` | nee | `maandag` t/m `zondag`, alleen ter controle -- moet overeenkomen met de weekdag van `vanaf` (anders komt er een waarschuwing in de build-log, en is `vanaf` leidend) |
| `tijd` | nee | Vrije tekst, bv. `18:30 - 19:45` -- verschijnt onder de (eerstvolgende) datum, zowel in de lijst als op de detailpagina |
| `locatie` | nee | Vrije tekst, bv. `Hoofdveld VVZ'49` -- verschijnt onder de titel, zowel in de lijst als op de detailpagina |
| `tot` | nee | `JJJJ-MM-DD` -- laatste datum dat de reeks nog loopt. Zonder `tot` loopt de reeks door totdat het bestand handmatig verwijderd wordt |
| `label`, `tone`, `excerpt`, `image`, `teams` | nee | Zelfde als bij een eenmalige activiteit |

Op de site verschijnt de eerstvolgende datum van de reeks (schuift automatisch door bij elke
build); op de detailpagina staat daaronder ook het herhalingspatroon, bv. "Elke dinsdag,
18:30 - 19:45".

Voor `tweewekelijks` bepaalt `vanaf` ook welke week de "aan"-week is -- de reeks valt op `vanaf`,
`vanaf` + 2 weken, + 4 weken, enzovoort.

## Activiteit aan een team koppelen

Vul `teams` in (komma-gescheiden team-slugs, bv. `teams: jo14-6` of `teams: jo14-1, jo14-2` voor
een gecombineerde training) om de activiteit óók te tonen onder "Activiteiten" op de teampagina('s)
van die team(s) -- naast de algemene Activiteiten-pagina, niet in plaats daarvan. Zonder `teams`
verschijnt een activiteit alleen op de algemene Activiteiten-pagina.

## Wat gebeurt er automatisch

- Committen naar `main` (bv. rechtstreeks op GitHub) triggert een nieuwe build; de activiteit
  verschijnt dan onder **Activiteiten** in het menu, gesorteerd op eerstkomende(-volgende) datum.
- Bij een eenmalige activiteit: zodra de datum voorbij is, verdwijnt hij meteen uit de lijst op de
  site (dat filtert `scripts/build-activiteiten.mjs` bij elke build), en ruimt de nachtelijke
  GitHub Action **Cleanup verlopen activiteiten**
  (`.github/workflows/cleanup-activiteiten.yml`) het bestand ook echt op uit deze map.
- Bij een herhalende activiteit: die blijft gewoon staan (en het bestand blijft bestaan) zolang de
  reeks loopt. Alleen als `tot` is ingevuld én die datum voorbij is, verdwijnt hij van de site en
  ruimt dezelfde nachtelijke Action het bestand op.
