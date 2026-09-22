---
name: swvsoest-activiteit-toevoegen
description: Voegt een activiteit toe aan de SWV Soest website (repo thewally/swvsoest-website, lokaal /home/arjen/Projects/swvsoest-website) door een markdown-bestand te maken in content/activiteiten/. Gebruik deze skill zodra de gebruiker een activiteit, evenement, toernooi, familiedag of andere clubgebeurtenis op de agenda/site wil zetten — ook als hij het niet expliciet "skill" noemt. Zinnen als "zet deze activiteit op de site", "voeg een evenement toe aan de agenda", "plaats de familiedag op de website", "nieuwe activiteit voor swvsoest", of het noemen van een clubgebeurtenis met een datum activeren deze skill.
---

# Skill: swvsoest-activiteit-toevoegen

## Doel
Een activiteit toevoegen aan de SWV Soest website door een `.md` bestand met frontmatter te
maken in `content/activiteiten/`. Bij een push naar `main` bouwt de GitHub Action de activiteit
automatisch mee in `public/data/activiteiten.json` en verschijnt hij onder "Activiteiten" op de
site, gesorteerd op eerstkomende datum. Zodra de datum voorbij is verdwijnt hij automatisch van
de site (build-time filter) en ruimt een nachtelijke GitHub Action het bestand ook echt op uit de
repo — hier hoeft niets voor gedaan te worden.

## Repo
`/home/arjen/Projects/swvsoest-website` (GitHub: `thewally/swvsoest-website`)

**Let op:** deze repo wordt ook direct op GitHub.com bewerkt (buiten Claude Code om). Voer altijd
eerst `git fetch origin` uit en vergelijk met `git log origin/main --oneline -5`; als lokaal
achterloopt, doe een `git pull` (of vraag de gebruiker om een hard reset als lokaal is afgeweken)
voordat je een nieuw bestand toevoegt.

## Benodigde informatie

Haal onderstaande velden uit de context als ze al gegeven zijn; vraag anders naar wat ontbreekt.
`title` en `date` zijn verplicht.

| Veld | Verplicht | Default / uitleg |
|---|---|---|
| `title` | ja | Titel van de activiteit |
| `date` | ja | `JJJJ-MM-DD` — **de datum van de activiteit zelf, niet een publicatiedatum**. Vraag hier altijd expliciet naar als die niet gegeven is |
| `label` | nee | Korte badge-tekst, bv. "Jeugd", "Senioren", "Clubbreed" |
| `tone` | nee | Kleur van de badge: `groen`, `blauw`, `warning`, `danger`, of leeg voor neutraal grijs |
| `excerpt` | nee | 1–2 zinnen samenvatting die op de activiteitenkaart komt te staan |
| `image` | nee | Pad/URL naar een headerafbeelding (16:9 werkt het best) |
| inhoud | ja | Beschrijving als markdown — tijden, locatie, aanmeldinstructies etc. |

## Werkwijze

1. **Sync check** — `git fetch origin` + vergelijk met lokale `main` zoals hierboven beschreven.
2. **Valideer de datum** — als `date` in het verleden ligt (vóór vandaag), waarschuw de gebruiker
   dat de activiteit dan bij de eerstvolgende build direct wordt weggefilterd en nooit zichtbaar
   wordt. Vraag om bevestiging of een correctie voordat je doorgaat.
3. **Bepaal de slug** — leid een URL-vriendelijke slug af van de titel: lowercase, spaties en
   leestekens naar `-`, geen diakritische tekens/apostroffen (bv. "Familiedag JO14!" →
   `familiedag-jo14`).
4. **Bepaal de bestandsnaam** — `content/activiteiten/<date>-<slug>.md`, bv.
   `2026-10-17-familiedag.md`. Check dat dit bestand nog niet bestaat.
5. **Schrijf het bestand** met dit exacte frontmatter-formaat (simpele `key: value` regels,
   geen geneste YAML, geen quotes nodig tenzij de waarde zelf een `:` bevat):
   ```markdown
   ---
   title: <titel>
   date: <JJJJ-MM-DD van de activiteit zelf>
   label: <label of weglaten>
   tone: <groen|blauw|warning|danger of weglaten>
   excerpt: <samenvatting of weglaten>
   image: <pad/URL of weglaten>
   ---

   <beschrijving in markdown — tijden, locatie, aanmelden>
   ```
   Laat een veld helemaal weg (niet leeg laten staan) als er geen waarde voor is.
6. **Toon het resultaat** aan de gebruiker (het volledige bestand) voordat je commit, zodat die
   kan corrigeren.
7. **Commit** met `git add content/activiteiten/<bestand> && git commit -m "Activiteit: <titel>"`.
8. **Vraag expliciet om bevestiging voordat je pusht** — een push naar `main` deployt direct naar
   de live site via de GitHub Actions workflow. Pas na akkoord: `git push`.
9. **Bevestig** aan de gebruiker wat er is toegevoegd, en herinner er kort aan dat de activiteit
   vanzelf verdwijnt zodra de datum voorbij is (geen actie nodig).

## Aandachtspunten
- `content/activiteiten/README.md` staat altijd in deze map en wordt door de build-stap expliciet
  overgeslagen (case-insensitive bestandsnaam-check) — nooit verwijderen of als activiteit
  behandelen.
- Zonder `title` of `date` slaat `scripts/build-activiteiten.mjs` het bestand stilzwijgend over
  (met een console-warning) — zorg dat beide altijd zijn ingevuld.
- Activiteiten worden oplopend op datum gesorteerd (eerstkomende eerst).
- Bestandsnaam-slug wordt alléén gebruikt als er geen expliciete `slug:` in de frontmatter staat
  — laat `slug` weg tenzij de gebruiker een specifieke URL wil.
