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

const DUTCH_WEEKDAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
const DUTCH_WEEKDAYS_SHORT = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']

// Alle datumberekening hier gebeurt bewust in UTC (i.p.v. lokale tijd + toISOString,
// wat in UTC+1/+2 -- onze tijdzone -- een dag terug kan schuiven) zodat "JJJJ-MM-DD"
// altijd exact hetzelfde blijft, ongeacht waar dit script draait.
function toUTCDate(isoDate) {
  const [jaar, maand, dag] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(jaar, maand - 1, dag))
}

function fromUTCDate(date) {
  return date.toISOString().slice(0, 10)
}

export function weekdayName(isoDate) {
  return DUTCH_WEEKDAYS[toUTCDate(isoDate).getUTCDay()]
}

export function weekdayAbbrev(isoDate) {
  return DUTCH_WEEKDAYS_SHORT[toUTCDate(isoDate).getUTCDay()]
}

export function addDays(isoDate, days) {
  const date = toUTCDate(isoDate)
  date.setUTCDate(date.getUTCDate() + days)
  return fromUTCDate(date)
}

// Berekent de eerstvolgende datum (JJJJ-MM-DD) op of na `vandaag` van een reeks die
// begint op `vanaf` en zich elke `intervalDays` dagen herhaalt. Als de reeks nog niet
// begonnen is, wordt `vanaf` zelf teruggegeven.
export function nextOccurrence(vanaf, intervalDays, vandaag) {
  const anchor = toUTCDate(vanaf)
  const today = toUTCDate(vandaag)
  const diffDays = Math.round((today - anchor) / 86400000)
  if (diffDays < 0) return vanaf
  const stepsPassed = Math.floor(diffDays / intervalDays)
  const candidate = new Date(anchor)
  candidate.setUTCDate(candidate.getUTCDate() + stepsPassed * intervalDays)
  if (candidate < today) candidate.setUTCDate(candidate.getUTCDate() + intervalDays)
  return fromUTCDate(candidate)
}

export function herhalingLabel(data) {
  // Altijd de weekdag van 'vanaf' gebruiken voor de weergave (nooit 'dag'), zodat een
  // fout ingevulde 'dag' nooit een verkeerde tekst laat zien terwijl de echte planning
  // (die uitsluitend op 'vanaf' rekent) daar niet mee verandert.
  const dagNaam = weekdayName(data.vanaf)
  const freq = data.herhaling === 'tweewekelijks' ? 'Elke 2 weken op' : 'Elke'
  let label = `${freq} ${dagNaam}`
  if (data.tijd) label += `, ${data.tijd}`
  return label
}
