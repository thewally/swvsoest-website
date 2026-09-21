const BASE = import.meta.env.BASE_URL

export async function fetchTeamData(slug) {
  const res = await fetch(`${BASE}data/${slug}.json`)
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
  const res = await fetch(`${BASE}data/nieuws.json`)
  if (!res.ok) return []
  return res.json()
}

export async function fetchNieuwsArtikel(slug) {
  const items = await fetchNieuws()
  return items.find(item => item.slug === slug) || null
}
