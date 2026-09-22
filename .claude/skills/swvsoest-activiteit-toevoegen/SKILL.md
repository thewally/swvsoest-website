---
name: swvsoest-activiteit-toevoegen
description: Voegt een activiteit toe aan de SWV Soest website (repo thewally/swvsoest-website, lokaal /home/arjen/Projects/swvsoest-website) door een markdown-bestand te maken in content/activiteiten/. Ondersteunt zowel eenmalige activiteiten (één datum) als herhalende (wekelijks/tweewekelijks, bv. een vaste training). Gebruik deze skill zodra de gebruiker een activiteit, evenement, toernooi, familiedag, training of andere (terugkerende) clubgebeurtenis op de agenda/site wil zetten — ook als hij het niet expliciet "skill" noemt. Zinnen als "zet deze activiteit op de site", "voeg een evenement toe aan de agenda", "plaats de familiedag op de website", "nieuwe activiteit voor swvsoest", "zet de wekelijkse training erop", "elke dinsdag training JO16-4", of het noemen van een clubgebeurtenis (eenmalig of terugkerend) met een datum/dag activeren deze skill.
---

# Skill: swvsoest-activiteit-toevoegen

## Doel
Een activiteit toevoegen aan de SWV Soest website door een `.md` bestand met frontmatter te
maken in `content/activiteiten/`. Bij een push naar `main` bouwt de GitHub Action de activiteit
automatisch mee in `public/data/activiteiten.json` en verschijnt hij onder "Activiteiten" op de
site, gesorteerd op eerstkomende(-volgende) datum.

Er zijn twee soorten:
- **Eenmalig** (één datum, bv. een familiedag of toernooi) — zodra de datum voorbij is verdwijnt
  hij automatisch van de site (build-time filter) en ruimt een nachtelijke GitHub Action het
  bestand ook echt op uit de repo.
- **Herhalend** (bv. een wekelijkse of tweewekelijkse training) — blijft staan zolang de reeks
  loopt; de eerstvolgende gelegenheid wordt bij elke build opnieuw berekend. Zie
  "Herhalende activiteit" verderop.

In beide gevallen hoeft er verder niets gedaan te worden om een verlopen activiteit weg te halen.

## Repo
`/home/arjen/Projects/swvsoest-website` (GitHub: `thewally/swvsoest-website`)

**Let op:** deze repo wordt ook direct op GitHub.com bewerkt (buiten Claude Code om). Voer altijd
eerst `git fetch origin` uit en vergelijk met `git log origin/main --oneline -5`; als lokaal
achterloopt, doe een `git pull` (of vraag de gebruiker om een hard reset als lokaal is afgeweken)
voordat je een nieuw bestand toevoegt.

## Bepaal eerst: eenmalig of herhalend?

Vraag dit expliciet als het niet duidelijk uit de context blijkt. Signalen voor "herhalend":
woorden als "wekelijks", "elke week", "tweewekelijks", "elke twee weken", "iedere dinsdag",
een vaste trainingsavond, een terugkerend overleg — kortom, iets zonder één specifieke einddatum.

### Benodigde informatie — eenmalige activiteit

`title` en `date` zijn verplicht.

| Veld | Verplicht | Default / uitleg |
|---|---|---|
| `title` | ja | Titel van de activiteit |
| `date` | ja | `JJJJ-MM-DD` — **de datum van de activiteit zelf, niet een publicatiedatum**. Vraag hier altijd expliciet naar als die niet gegeven is |
| `tijd` | aanbevolen | Vrije tekst, bv. `14:00 - 17:00`. Vraag hiernaar als een tijd genoemd is maar niet expliciet als veld gegeven — verschijnt onder de datum, zowel in de lijst als op de detailpagina |
| `locatie` | aanbevolen | Vrije tekst, bv. `Hoofdveld VVZ'49`. Vraag hier altijd expliciet naar als er geen locatie gegeven is — verschijnt onder de titel, zowel in de lijst als op de detailpagina |
| `label` | nee | Korte badge-tekst, bv. "Jeugd", "Senioren", "Clubbreed" |
| `tone` | nee | Kleur van de badge: `groen`, `blauw`, `warning`, `danger`, of leeg voor neutraal grijs |
| `excerpt` | nee | 1–2 zinnen samenvatting die op de activiteitenkaart komt te staan |
| `image` | nee | Pad/URL naar een headerafbeelding (16:9 werkt het best) |
| inhoud | ja | Beschrijving als markdown — aanmeldinstructies etc. |

### Benodigde informatie — herhalende activiteit

`title`, `herhaling` en `vanaf` zijn verplicht. Er is geen `date` veld.

| Veld | Verplicht | Default / uitleg |
|---|---|---|
| `title` | ja | Titel van de activiteit, bv. "Training JO16-4" |
| `herhaling` | ja | `wekelijks` of `tweewekelijks` |
| `vanaf` | ja | `JJJJ-MM-DD` — eerste keer dat de reeks plaatsvindt. **Moet zelf op de juiste weekdag vallen** (bv. als de gebruiker "elke dinsdag vanaf begin oktober" zegt, reken zelf de eerste dinsdag op/na die datum uit) |
| `dag` | aanbevolen | `maandag` t/m `zondag` — puur ter controle/documentatie, moet overeenkomen met de weekdag van `vanaf`. Het bouwscript waarschuwt (maar faalt niet) bij een mismatch en gebruikt dan `vanaf` als waarheid |
| `tijd` | aanbevolen | Vrije tekst, bv. `18:30 - 19:45`. Vraag hiernaar als tijden genoemd zijn maar niet expliciet als veld gegeven |
| `locatie` | aanbevolen | Vrije tekst, bv. `Hoofdveld VVZ'49`. Vraag hier altijd expliciet naar als er geen locatie gegeven is — verschijnt onder de titel, zowel in de lijst als op de detailpagina |
| `tot` | nee | `JJJJ-MM-DD` — laatste datum dat de reeks nog loopt, bv. einde van een seizoen. Zonder `tot` loopt de reeks door totdat iemand het bestand handmatig verwijdert |
| `label`, `tone`, `excerpt`, `image` | nee | Zelfde als bij een eenmalige activiteit |
| inhoud | ja | Beschrijving als markdown — verzameltijd, aanmeldinstructies etc. |

Op de site verschijnt automatisch de eerstvolgende datum van de reeks (schuift vanzelf door bij
elke build); op de detailpagina staat daaronder ook het herhalingspatroon, bv. "Elke dinsdag,
18:30 - 19:45".

## Werkwijze

1. **Sync check** — `git fetch origin` + vergelijk met lokale `main` zoals hierboven beschreven.
2. **Bepaal eenmalig of herhalend** zoals hierboven, en verzamel de bijbehorende velden.
   - Eenmalig: **valideer de datum** — als `date` in het verleden ligt (vóór vandaag), waarschuw
     de gebruiker dat de activiteit dan bij de eerstvolgende build direct wordt weggefilterd en
     nooit zichtbaar wordt. Vraag om bevestiging of een correctie voordat je doorgaat.
   - Herhalend: **reken `vanaf` zelf goed uit** — het moet een concrete datum zijn die op de
     genoemde weekdag valt (bv. gebruiker zegt "elke dinsdag vanaf begin oktober" → zoek de eerste
     dinsdag op of na 1 oktober op). Vul ook `dag` in ter controle.
3. **Bepaal de slug** — leid een URL-vriendelijke slug af van de titel: lowercase, spaties en
   leestekens naar `-`, geen diakritische tekens/apostroffen (bv. "Familiedag JO14!" →
   `familiedag-jo14`).
4. **Bepaal de bestandsnaam**:
   - Eenmalig: `content/activiteiten/<date>-<slug>.md`, bv. `2026-10-17-familiedag.md`.
   - Herhalend: `content/activiteiten/<herhaling>-<slug>.md`, bv.
     `wekelijks-training-jo16-4.md` (geen datumprefix, want er is geen vaste datum).
   Check dat dit bestand nog niet bestaat.
5. **Schrijf het bestand** met dit exacte frontmatter-formaat (simpele `key: value` regels,
   geen geneste YAML, geen quotes nodig tenzij de waarde zelf een `:` bevat):

   Eenmalig:
   ```markdown
   ---
   title: <titel>
   date: <JJJJ-MM-DD van de activiteit zelf>
   tijd: <bv. 14:00 - 17:00, of weglaten>
   locatie: <bv. Hoofdveld VVZ'49, of weglaten>
   label: <label of weglaten>
   tone: <groen|blauw|warning|danger of weglaten>
   excerpt: <samenvatting of weglaten>
   image: <pad/URL of weglaten>
   ---

   <beschrijving in markdown — aanmelden>
   ```

   Herhalend:
   ```markdown
   ---
   title: <titel>
   herhaling: <wekelijks|tweewekelijks>
   dag: <maandag t/m zondag>
   vanaf: <JJJJ-MM-DD, eerste keer, op de juiste weekdag>
   tijd: <bv. 18:30 - 19:45, of weglaten>
   locatie: <bv. Hoofdveld VVZ'49, of weglaten>
   tot: <JJJJ-MM-DD, of weglaten voor een doorlopende reeks>
   label: <label of weglaten>
   tone: <groen|blauw|warning|danger of weglaten>
   excerpt: <samenvatting of weglaten>
   image: <pad/URL of weglaten>
   ---

   <beschrijving in markdown — verzameltijd, aanmelden>
   ```
   Laat een veld helemaal weg (niet leeg laten staan) als er geen waarde voor is.
6. **Toon het resultaat** aan de gebruiker (het volledige bestand) voordat je commit, zodat die
   kan corrigeren. Laat bij een herhalende activiteit ook zien wat de berekende eerstvolgende
   datum wordt (reken dit zelf na, of draai lokaal `node scripts/build-activiteiten.mjs` en kijk
   in `public/data/activiteiten.json`) zodat de gebruiker de planning kan controleren.
7. **Commit** met `git add content/activiteiten/<bestand> && git commit -m "Activiteit: <titel>"`.
8. **Vraag expliciet om bevestiging voordat je pusht** — een push naar `main` deployt direct naar
   de live site via de GitHub Actions workflow. Pas na akkoord: `git push`.
9. **Bevestig** aan de gebruiker wat er is toegevoegd. Bij eenmalig: herinner er kort aan dat de
   activiteit vanzelf verdwijnt zodra de datum voorbij is. Bij herhalend: herinner eraan dat de
   reeks blijft doorlopen totdat `tot` bereikt is of iemand het bestand handmatig verwijdert.

## Aandachtspunten
- `content/activiteiten/README.md` staat altijd in deze map en wordt door de build-stap expliciet
  overgeslagen (case-insensitive bestandsnaam-check) — nooit verwijderen of als activiteit
  behandelen.
- Zonder `title` slaat `scripts/build-activiteiten.mjs` het bestand stilzwijgend over (met een
  console-warning); zonder `date` (eenmalig) of zonder `herhaling`/`vanaf` (herhalend) geldt
  hetzelfde — zorg dat de verplichte velden voor het gekozen type altijd zijn ingevuld.
- Activiteiten worden oplopend gesorteerd op (eerstvolgende) datum.
- Bestandsnaam-slug wordt alléén gebruikt als er geen expliciete `slug:` in de frontmatter staat
  — laat `slug` weg tenzij de gebruiker een specifieke URL wil.
- Bij een herhalende activiteit wordt de weergegeven weekdag altijd berekend uit `vanaf`, nooit
  uit `dag` — `dag` is puur een controleveld. Als ze niet overeenkomen faalt de build niet, maar
  komt er wel een waarschuwing in de build-log; corrigeer dat liever meteen dan het te laten staan.
- Voor `tweewekelijks` bepaalt `vanaf` ook welke week de "aan"-week is (de reeks valt op `vanaf`,
  `vanaf` + 2 weken, + 4 weken, enz.) — kies dus bewust de eerste échte gelegenheid als `vanaf`,
  niet zomaar een willekeurige datum in het verleden.
