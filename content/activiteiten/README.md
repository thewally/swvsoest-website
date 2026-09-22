# Activiteiten toevoegen

Voeg een `.md` bestand toe in deze map, bijvoorbeeld `2026-10-17-familiedag.md`:

```markdown
---
title: Familiedag JO14
date: 2026-10-17
label: Jeugd
tone: groen
excerpt: Alle JO14-teams samen een middag op het sportpark, met een klein toernooitje en patat.
image:
---

Tekst van de activiteit, in **markdown**. Zet hier tijden, locatie en
eventuele aanmeldinstructies in.
```

| Veld | Verplicht | Uitleg |
|---|---|---|
| `title` | ja | Titel van de activiteit |
| `date` | ja | `JJJJ-MM-DD` -- de datum van de activiteit zelf (niet een publicatiedatum) |
| `label` | nee | Badge-tekst, bv. "Jeugd", "Senioren", "Clubbreed" |
| `tone` | nee | `groen`, `blauw` of `neutral` (kleur van de badge) |
| `excerpt` | nee | Korte samenvatting op de kaart |
| `image` | nee | Pad of URL naar een headerfoto (16:9) |

## Wat gebeurt er automatisch

- Committen naar `main` (bv. rechtstreeks op GitHub) triggert een nieuwe build; de activiteit
  verschijnt dan onder **Activiteiten** in het menu, gesorteerd op eerstkomende datum.
- Zodra de datum van een activiteit voorbij is, verdwijnt hij meteen uit de lijst op de site
  (dat filtert `scripts/build-activiteiten.mjs` bij elke build).
- Elke nacht ruimt de GitHub Action **Cleanup verlopen activiteiten**
  (`.github/workflows/cleanup-activiteiten.yml`) de bestanden van afgelopen activiteiten ook
  echt op uit deze map, zodat die niet blijven ophopen.
