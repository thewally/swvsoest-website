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

// "zaterdag 26 september"
export function formatDagLabel(wedstrijddatum) {
  const d = parseWedstrijdDatum(wedstrijddatum)
  return `${DUTCH_DAYS[d.getDay()]} ${d.getDate()} ${DUTCH_MONTHS[d.getMonth()]}`
}

export function parseScore(uitslag) {
  if (!uitslag) return null
  const delen = uitslag.split('-').map(s => s.trim())
  if (delen.length !== 2) return null
  const [thuis, uit] = delen.map(Number)
  if (Number.isNaN(thuis) || Number.isNaN(uit)) return null
  return [thuis, uit]
}

// Groepeer items (standaard: wedstrijden) per dag (yyyy-mm-dd); binnen elke dag
// op tijd. De dagen zelf staan oplopend (eerstvolgende eerst) tenzij `aflopend`
// is gezet -- gebruikt voor uitslagen, waar de meest recente speeldag bovenaan
// moet staan. `datum`/`tijd` zijn te overschrijven zodat MatchGrid ook een
// gemengde lijst van wedstrijden + activiteiten (elk met hun eigen datumveld)
// in dezelfde dag-indeling kan groeperen.
export function groepeerPerDag(
  items,
  { aflopend = false, datum = w => w.wedstrijddatum && datumSleutel(w.wedstrijddatum), tijd = w => w.aanvangstijd || '99:99' } = {}
) {
  const map = new Map()
  for (const item of items) {
    const sleutel = datum(item)
    if (!sleutel) continue
    if (!map.has(sleutel)) map.set(sleutel, [])
    map.get(sleutel).push(item)
  }
  for (const [, groep] of map) {
    groep.sort((a, b) => tijd(a).localeCompare(tijd(b)))
  }
  const dagen = [...map.entries()].sort((a, b) => aflopend ? b[0].localeCompare(a[0]) : a[0].localeCompare(b[0]))
  return new Map(dagen)
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
