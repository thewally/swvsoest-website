#!/usr/bin/env node
// Verwijdert content/activiteiten/*.md bestanden waarvan de activiteit-datum
// al voorbij is. Draait 's nachts via .github/workflows/cleanup-activiteiten.yml.
// build-activiteiten.mjs filtert verlopen activiteiten ook al uit de website
// zelf (zodat ze nooit te zien zijn, ongeacht of deze job al gedraaid heeft),
// maar dit script ruimt de bestanden ook echt op uit de repo.
import { readdir, readFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseFrontmatter } from './lib/frontmatter.mjs'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const ACTIVITEITEN_DIR = path.join(ROOT, 'content', 'activiteiten')

async function main() {
  let files = []
  try {
    files = (await readdir(ACTIVITEITEN_DIR)).filter(f => f.endsWith('.md') && f.toLowerCase() !== 'readme.md')
  } catch {
    console.log('[cleanup-activiteiten] content/activiteiten bestaat niet, niets te doen.')
    return
  }

  const vandaag = new Date().toISOString().slice(0, 10)
  let verwijderd = 0
  for (const filename of files) {
    const filePath = path.join(ACTIVITEITEN_DIR, filename)
    const raw = await readFile(filePath, 'utf-8')
    const { data } = parseFrontmatter(raw)
    if (data.date && data.date < vandaag) {
      await unlink(filePath)
      console.log(`[cleanup-activiteiten] verwijderd (was op ${data.date}): ${filename}`)
      verwijderd++
    }
  }
  console.log(`[cleanup-activiteiten] klaar, ${verwijderd} van ${files.length} bestand(en) verwijderd.`)
}

main()
