// Kleine frontmatter-parser voor de markdown-content (content/nieuws/,
// content/activiteiten/) -- geen gray-matter-dependency nodig voor dit
// simpele key:value-formaat.
export function parseFrontmatter(raw) {
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

export function slugFromFilename(filename) {
  const base = filename.replace(/\.md$/, '')
  return base.replace(/^\d{4}-\d{2}-\d{2}-/, '')
}

const DUTCH_MONTHS = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]

export function formatDateDisplay(isoDate) {
  const [jaar, maand, dag] = isoDate.split('-').map(Number)
  return `${dag} ${DUTCH_MONTHS[maand - 1]} ${jaar}`
}
