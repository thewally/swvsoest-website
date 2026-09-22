---
name: swvsoest-nieuws-toevoegen
description: Voegt een nieuwsbericht toe aan de SWV Soest website (repo thewally/swvsoest-website, lokaal /home/arjen/Projects/swvsoest-website) door een markdown-bestand te maken in content/nieuws/. Gebruik deze skill zodra de gebruiker een nieuwsbericht, artikel of update wil plaatsen op de swvsoest website — ook als hij het niet expliciet "skill" noemt. Zinnen als "zet dit nieuws op de site", "voeg een nieuwsbericht toe", "plaats dit artikel", "nieuw bericht voor swvsoest", "publiceer dit nieuws", of het geven van een nieuwstekst met de bedoeling die op de site te krijgen activeren deze skill.
---

# Skill: swvsoest-nieuws-toevoegen

## Doel
Een nieuwsbericht toevoegen aan de SWV Soest website door een `.md` bestand met frontmatter
te maken in `content/nieuws/`. Bij een push naar `main` bouwt de GitHub Action het bericht
automatisch mee in `public/data/nieuws.json` en verschijnt het op de site.

## Repo
`/home/arjen/Projects/swvsoest-website` (GitHub: `thewally/swvsoest-website`)

**Let op:** deze repo wordt ook direct op GitHub.com bewerkt (buiten Claude Code om). Voer altijd
eerst `git fetch origin` uit en vergelijk met `git log origin/main --oneline -5`; als lokaal
achterloopt, doe een `git pull` (of vraag de gebruiker om een hard reset als lokaal is afgeweken)
voordat je een nieuw bestand toevoegt.

## Benodigde informatie

Haal onderstaande velden uit de context als ze al gegeven zijn; vraag anders alleen naar wat
ontbreekt. Alleen `title` is echt verplicht — de rest heeft een redelijke default.

| Veld | Verplicht | Default / uitleg |
|---|---|---|
| `title` | ja | Titel van het bericht |
| `date` | nee | `JJJJ-MM-DD`, publicatiedatum — default: vandaag |
| `label` | nee | Korte badge-tekst, bv. "Clubnieuws", "Wedstrijdverslag", "Mededeling" |
| `tone` | nee | Kleur van de badge: `groen`, `blauw`, `warning`, `danger`, of leeg voor neutraal grijs |
| `excerpt` | nee | 1–2 zinnen samenvatting die op de nieuwskaart komt te staan |
| `image` | nee | Pad/URL naar een headerafbeelding (16:9 werkt het best; anders wordt hij "ingelijst") |
| inhoud | ja | De berichttekst zelf, als markdown (koppen, opsommingen etc. mogen) |

## Werkwijze

1. **Sync check** — `git fetch origin` + vergelijk met lokale `main` zoals hierboven beschreven.
2. **Bepaal de slug** — leid een URL-vriendelijke slug af van de titel: lowercase, spaties en
   leestekens naar `-`, geen diakritische tekens/apostroffen (bv. "Welkom op de website!" →
   `welkom-op-de-website`).
3. **Bepaal de bestandsnaam** — `content/nieuws/<date>-<slug>.md`, bv.
   `2026-10-03-nieuwe-hoofdsponsor.md`. Check dat dit bestand nog niet bestaat.
4. **Schrijf het bestand** met dit exacte frontmatter-formaat (simpele `key: value` regels,
   geen geneste YAML, geen quotes nodig tenzij de waarde zelf een `:` bevat):
   ```markdown
   ---
   title: <titel>
   date: <JJJJ-MM-DD>
   label: <label of weglaten>
   tone: <groen|blauw|warning|danger of weglaten>
   excerpt: <samenvatting of weglaten>
   image: <pad/URL of weglaten>
   ---

   <berichttekst in markdown>
   ```
   Laat een veld helemaal weg (niet leeg laten staan) als er geen waarde voor is — de build-
   parser (`scripts/lib/frontmatter.mjs`) verwacht geen lege regels.
5. **Toon het resultaat** aan de gebruiker (het volledige bestand) voordat je commit, zodat die
   kan corrigeren.
6. **Commit** met `git add content/nieuws/<bestand> && git commit -m "Nieuwsbericht: <titel>"`.
7. **Vraag expliciet om bevestiging voordat je pusht** — een push naar `main` deployt direct naar
   de live site via de GitHub Actions workflow. Pas na akkoord: `git push`.
8. **Bevestig** aan de gebruiker wat er is toegevoegd en dat de site over enkele minuten (na de
   GitHub Actions build) is bijgewerkt.

## Aandachtspunten
- `date` mist verplicht `title` óf de build-stap (`scripts/build-news.mjs`) slaat het bestand
  gewoon over (met een warning) — zorg dus dat beide altijd zijn ingevuld.
- Nieuwsberichten worden op datum aflopend gesorteerd (nieuwste eerst) — geen handmatige
  volgorde nodig.
- Gebruik geen Tailwind-classes of eigen HTML-opmaak in de body; gewoon markdown, `marked`
  rendert dit naar HTML.
- Bestandsnaam-slug wordt alléén gebruikt als er geen expliciete `slug:` in de frontmatter staat
  — dat is voor dit type content niet nodig, dus laat `slug` weg tenzij de gebruiker een specifieke
  URL wil.
