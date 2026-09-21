// De zes teams die deze site toont. Moet in sync blijven met TEAMS in
// scripts/sportlink_sync.py (teamnaam = exacte naam bij SportLink).
export const TEAMS = [
  { slug: 'jo14-1', kort: 'JO14-1', sportlinkNaam: "ST SO Soest/VVZ'49 O14-1" },
  { slug: 'jo14-2', kort: 'JO14-2', sportlinkNaam: "ST SO Soest/VVZ'49 O14-2" },
  { slug: 'jo14-3', kort: 'JO14-3', sportlinkNaam: "ST SO Soest/VVZ'49 O14-3" },
  { slug: 'jo14-4', kort: 'JO14-4', sportlinkNaam: "ST SO Soest/VVZ'49 O14-4" },
  { slug: 'jo14-5', kort: 'JO14-5', sportlinkNaam: "ST SO Soest/VVZ'49 O14-5" },
  { slug: 'jo14-6', kort: 'JO14-6', sportlinkNaam: "ST SO Soest/VVZ'49 O14-6" },
]

export function getTeam(slug) {
  return TEAMS.find(t => t.slug === slug) || null
}
