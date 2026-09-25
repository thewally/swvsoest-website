#!/usr/bin/env node
// Leest content/activiteiten/*.md (frontmatter + markdown) en schrijft public/data/activiteiten.json.
// Activiteit toevoegen = een .md bestand toevoegen in content/activiteiten/ via GitHub. `date` is
// de datum van de activiteit zelf (niet een publicatiedatum): activiteiten die al geweest zijn
// worden hier uit de lijst gefilterd, en een nachtelijke GitHub Action (cleanup-activiteiten.yml)
// verwijdert de bijbehorende bestanden ook echt uit de repo (zie scripts/cleanup-activiteiten.mjs).
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'
import {
  parseFrontmatter,
  slugFromFilename,
  formatDateDisplay,
  weekdayName,
  nextOccurrence,
  addDays,
  herhalingLabel,
} from './lib/frontmatter.mjs'

const HERHALING_INTERVAL_DAYS = { wekelijks: 7, tweewekelijks: 14 }
// Herhalende activiteiten laten we niet met één losse eerstvolgende datum zien, maar met
// alle gelegenheden die binnen de eerstvolgende LOOKAHEAD_DAYS dagen vallen (vandaag zelf
// meegeteld als dag 1, dus bv. 25 september -> t/m 8 oktober). Dat geeft meestal 2 rijen
// voor wekelijkse activiteiten en 1 voor tweewekelijkse. De allereerstvolgende gelegenheid
// wordt altijd getoond, ook als een reeks pas later start en die datum buiten dit venster valt.
const LOOKAHEAD_DAYS = 14

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const ACTIVITEITEN_DIR = path.join(ROOT, 'content', 'activiteiten')
const OUT_FILE = path.join(ROOT, 'public', 'data', 'activiteiten.json')

async function main() {
  let files = []
  try {
    files = (await readdir(ACTIVITEITEN_DIR)).filter(f => f.endsWith('.md') && f.toLowerCase() !== 'readme.md')
  } catch {
    files = []
  }

  const vandaag = new Date().toISOString().slice(0, 10)
  const activiteiten = []
  for (const filename of files) {
    const raw = await readFile(path.join(ACTIVITEITEN_DIR, filename), 'utf-8')
    const { data, body } = parseFrontmatter(raw)
    if (!data.title) {
      console.warn(`[build-activiteiten] ${filename}: mist 'title' in frontmatter, overgeslagen`)
      continue
    }

    let dates
    let herhalingText = null
    if (data.herhaling) {
      const intervalDays = HERHALING_INTERVAL_DAYS[data.herhaling]
      if (!intervalDays) {
        console.warn(`[build-activiteiten] ${filename}: onbekende 'herhaling' waarde "${data.herhaling}" (verwacht wekelijks of tweewekelijks), overgeslagen`)
        continue
      }
      if (!data.vanaf) {
        console.warn(`[build-activiteiten] ${filename}: mist 'vanaf' (startdatum van de reeks), overgeslagen`)
        continue
      }
      if (data.dag && data.dag !== weekdayName(data.vanaf)) {
        console.warn(`[build-activiteiten] ${filename}: 'dag' (${data.dag}) komt niet overeen met de weekdag van 'vanaf' (${data.vanaf} is een ${weekdayName(data.vanaf)}) -- 'vanaf' is leidend`)
      }
      if (data.tot && data.tot < vandaag) {
        // Reeks is definitief afgelopen: niet meer tonen. De nachtelijke cleanup-job
        // verwijdert het bestand zelf.
        continue
      }
      const eerstvolgende = nextOccurrence(data.vanaf, intervalDays, vandaag)
      if (data.tot && eerstvolgende > data.tot) {
        // Eerstvolgende gelegenheid zou na het einde van de reeks vallen.
        continue
      }
      // Toon niet alleen de eerstvolgende datum, maar alle gelegenheden die binnen het
      // LOOKAHEAD_DAYS-venster vallen (de eerstvolgende gelegenheid altijd, ook als die
      // zelf al buiten het venster ligt -- bv. een reeks die nog moet beginnen).
      dates = [eerstvolgende]
      const horizon = addDays(vandaag, LOOKAHEAD_DAYS - 1)
      let volgende = eerstvolgende
      while (true) {
        volgende = addDays(volgende, intervalDays)
        if (volgende > horizon) break
        if (data.tot && volgende > data.tot) break
        dates.push(volgende)
      }
      herhalingText = herhalingLabel(data)
    } else {
      if (!data.date) {
        console.warn(`[build-activiteiten] ${filename}: mist 'date' in frontmatter, overgeslagen`)
        continue
      }
      if (data.date < vandaag) {
        // Al geweest: niet meer tonen. De nachtelijke cleanup-job verwijdert het bestand zelf.
        continue
      }
      dates = [data.date]
    }

    const baseSlug = data.slug || slugFromFilename(filename)
    // Optioneel: komma-gescheiden team-slugs (zie src/lib/teams.js), bv. "jo14-1, jo14-2"
    // voor een gecombineerde training. Alleen gebruikt om de activiteit ook op de
    // betreffende teampagina('s) te tonen -- geen invloed op de Activiteiten-lijst zelf.
    const teams = data.teams
      ? data.teams.split(',').map(s => s.trim()).filter(Boolean)
      : null

    dates.forEach((date, i) => {
      activiteiten.push({
        slug: i === 0 ? baseSlug : `${baseSlug}-${date}`,
        title: data.title,
        date,
        dateDisplay: formatDateDisplay(date),
        tijd: data.tijd || null,
        locatie: data.locatie || null,
        herhalingText,
        label: data.label || null,
        tone: data.tone || 'neutral',
        excerpt: data.excerpt || '',
        image: data.image || null,
        teams,
        html: marked.parse(body.trim()),
      })
    })
  }

  activiteiten.sort((a, b) => a.date.localeCompare(b.date))

  await mkdir(path.dirname(OUT_FILE), { recursive: true })
  await writeFile(OUT_FILE, JSON.stringify(activiteiten, null, 2) + '\n')
  console.log(`[build-activiteiten] ${activiteiten.length} activiteit(en) geschreven naar ${path.relative(ROOT, OUT_FILE)}`)
}

main()
