#!/usr/bin/env node
// Leest content/nieuws/*.md (frontmatter + markdown) en schrijft public/data/nieuws.json.
// Nieuws toevoegen = een .md bestand toevoegen in content/nieuws/ via GitHub; de eerstvolgende
// build (bij push naar main) neemt het artikel automatisch op.
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const NIEUWS_DIR = path.join(ROOT, 'content', 'nieuws')
const OUT_FILE = path.join(ROOT, 'public', 'data', 'nieuws.json')

const DUTCH_MONTHS = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]

function formatDateDisplay(isoDate) {
  const [jaar, maand, dag] = isoDate.split('-').map(Number)
  return `${dag} ${DUTCH_MONTHS[maand - 1]} ${jaar}`
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: raw }
  const [, frontmatter, body] = match
  const data = {}
  for (const line of frontmatter.split(/\r?\n/)) {
    if (!line.trim()) continue
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    value = value.replace(/^["']|["']$/g, '')
    data[key] = value
  }
  return { data, body }
}

function slugFromFilename(filename) {
  const base = filename.replace(/\.md$/, '')
  return base.replace(/^\d{4}-\d{2}-\d{2}-/, '')
}

async function main() {
  let files = []
  try {
    files = (await readdir(NIEUWS_DIR)).filter(f => f.endsWith('.md'))
  } catch {
    files = []
  }

  const artikelen = []
  for (const filename of files) {
    const raw = await readFile(path.join(NIEUWS_DIR, filename), 'utf-8')
    const { data, body } = parseFrontmatter(raw)
    if (!data.title || !data.date) {
      console.warn(`[build-news] ${filename}: mist 'title' of 'date' in frontmatter, overgeslagen`)
      continue
    }
    artikelen.push({
      slug: data.slug || slugFromFilename(filename),
      title: data.title,
      date: data.date,
      dateDisplay: formatDateDisplay(data.date),
      label: data.label || null,
      tone: data.tone || 'neutral',
      excerpt: data.excerpt || '',
      image: data.image || null,
      html: marked.parse(body.trim()),
    })
  }

  artikelen.sort((a, b) => b.date.localeCompare(a.date))

  await mkdir(path.dirname(OUT_FILE), { recursive: true })
  await writeFile(OUT_FILE, JSON.stringify(artikelen, null, 2) + '\n')
  console.log(`[build-news] ${artikelen.length} artikel(en) geschreven naar ${path.relative(ROOT, OUT_FILE)}`)
}

main()
