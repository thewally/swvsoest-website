// De zes teams die deze site toont. Moet in sync blijven met TEAMS in
// scripts/sportlink_sync.py (teamnaam = exacte naam bij SportLink).
// Elk team heeft een eigen agenda-repo (zelfde opzet als
// github.com/thewally/vvz49-jo14-6-agenda) die de .ics-feed genereert en
// een landingspagina met abonneer-instructies host.
export const TEAMS = [
  { slug: 'jo14-1', kort: 'JO14-1', sportlinkNaam: "ST SO Soest/VVZ'49 O14-1", agendaUrl: 'https://thewally.github.io/vvz49-jo14-1-agenda/' },
  { slug: 'jo14-2', kort: 'JO14-2', sportlinkNaam: "ST SO Soest/VVZ'49 O14-2", agendaUrl: 'https://thewally.github.io/vvz49-jo14-2-agenda/' },
  { slug: 'jo14-3', kort: 'JO14-3', sportlinkNaam: "ST SO Soest/VVZ'49 O14-3", agendaUrl: 'https://thewally.github.io/vvz49-jo14-3-agenda/' },
  { slug: 'jo14-4', kort: 'JO14-4', sportlinkNaam: "ST SO Soest/VVZ'49 O14-4", agendaUrl: 'https://thewally.github.io/vvz49-jo14-4-agenda/' },
  { slug: 'jo14-5', kort: 'JO14-5', sportlinkNaam: "ST SO Soest/VVZ'49 O14-5", agendaUrl: 'https://thewally.github.io/vvz49-jo14-5-agenda/' },
  { slug: 'jo14-6', kort: 'JO14-6', sportlinkNaam: "ST SO Soest/VVZ'49 O14-6", agendaUrl: 'https://thewally.github.io/vvz49-jo14-6-agenda/' },
]

export function getTeam(slug) {
  return TEAMS.find(t => t.slug === slug) || null
}
