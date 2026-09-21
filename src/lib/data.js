const BASE = import.meta.env.BASE_URL

// GitHub Pages zet caching-headers op statische bestanden; zonder 'no-store'
// kan de browser een oude data.json (bv. van vóór een SportLink-sync) langer
// laten staan dan de gebruiker verwacht.
async function fetchJson(path) {
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store' })
  return res
}

export async function fetchTeamData(slug) {
  const res = await fetchJson(`data/${slug}.json`)
  if (!res.ok) throw new Error(`Kon gegevens voor ${slug} niet laden (HTTP ${res.status})`)
  return res.json()
}

export async function fetchAllTeamsData(teams) {
  const results = await Promise.allSettled(teams.map(t => fetchTeamData(t.slug)))
  return teams.map((team, i) => ({
    team,
    data: results[i].status === 'fulfilled' ? results[i].value : null,
  }))
}

export async function fetchNieuws() {
  const res = await fetchJson('data/nieuws.json')
  if (!res.ok) return []
  return res.json()
}

export async function fetchNieuwsArtikel(slug) {
  const items = await fetchNieuws()
  return items.find(item => item.slug === slug) || null
}
