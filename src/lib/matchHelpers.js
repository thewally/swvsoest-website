// wedstrijddatum uit SportLink is ISO 8601, bv. "2026-09-26T09:45:00+0200"
export function parseWedstrijdDatum(wedstrijddatum) {
  return new Date(wedstrijddatum)
}

export function datumSleutel(wedstrijddatum) {
  return parseWedstrijdDatum(wedstrijddatum).toISOString().slice(0, 10)
}

const DUTCH_DAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
const DUTCH_MONTHS = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]
const DUTCH_DAYS_SHORT = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
const DUTCH_MONTHS_SHORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

// "zaterdag 26 september"
export function formatDagLabel(wedstrijddatum) {
  const d = parseWedstrijdDatum(wedstrijddatum)
  return `${DUTCH_DAYS[d.getDay()]} ${d.getDate()} ${DUTCH_MONTHS[d.getMonth()]}`
}

// "Za 26 sep" — voor gebruik in MatchCard
export function formatDatumKort(wedstrijddatum) {
  const d = parseWedstrijdDatum(wedstrijddatum)
  const dag = DUTCH_DAYS_SHORT[d.getDay()]
  return `${dag.charAt(0).toUpperCase()}${dag.slice(1)} ${d.getDate()} ${DUTCH_MONTHS_SHORT[d.getMonth()]}`
}

export function isThuis(wedstrijd, teamnaam) {
  return wedstrijd.thuisteam === teamnaam
}

export function parseScore(uitslag) {
  if (!uitslag) return null
  const delen = uitslag.split('-').map(s => s.trim())
  if (delen.length !== 2) return null
  const [thuis, uit] = delen.map(Number)
  if (Number.isNaN(thuis) || Number.isNaN(uit)) return null
  return [thuis, uit]
}

// Groepeer wedstrijden per dag (yyyy-mm-dd), gesorteerd oplopend; binnen elke dag op aanvangstijd.
export function groepeerPerDag(wedstrijden) {
  const map = new Map()
  for (const w of wedstrijden) {
    if (!w.wedstrijddatum) continue
    const sleutel = datumSleutel(w.wedstrijddatum)
    if (!map.has(sleutel)) map.set(sleutel, [])
    map.get(sleutel).push(w)
  }
  for (const [, items] of map) {
    items.sort((a, b) => (a.aanvangstijd || '99:99').localeCompare(b.aanvangstijd || '99:99'))
  }
  return new Map([...map.entries()].sort())
}

export function sorteerOplopend(wedstrijden) {
  return [...wedstrijden].sort((a, b) => parseWedstrijdDatum(a.wedstrijddatum) - parseWedstrijdDatum(b.wedstrijddatum))
}

export function sorteerAflopend(wedstrijden) {
  return [...wedstrijden].sort((a, b) => parseWedstrijdDatum(b.wedstrijddatum) - parseWedstrijdDatum(a.wedstrijddatum))
}

export function matchStatus(wedstrijd, { gespeeld = false } = {}) {
  const s = (wedstrijd.status || '').toLowerCase()
  if (s.includes('afgelast')) return 'afgelast'
  return gespeeld ? 'gespeeld' : 'gepland'
}

export function locatieLabel(wedstrijd) {
  const parts = [wedstrijd.accommodatie, wedstrijd.plaats].filter(Boolean)
  if (wedstrijd.veld) parts.push(wedstrijd.veld)
  return parts.join(' · ')
}
