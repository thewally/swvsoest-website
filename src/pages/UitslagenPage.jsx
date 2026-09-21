import { useEffect, useState } from 'react'
import { SectionHeading } from '../components/svs'
import MatchGrid from '../components/MatchGrid'
import { TEAMS } from '../lib/teams'
import { fetchAllTeamsData } from '../lib/data'
import { sorteerAflopend } from '../lib/matchHelpers'

export default function UitslagenPage() {
  const [wedstrijden, setWedstrijden] = useState(null)
  const [filter, setFilter] = useState('alles')

  useEffect(() => {
    let actief = true
    fetchAllTeamsData(TEAMS).then(teamsData => {
      if (!actief) return
      const alle = teamsData.flatMap(({ team, data }) => (data?.uitslagen || []).map(w => ({ ...w, team })))
      setWedstrijden(sorteerAflopend(alle))
    })
    return () => {
      actief = false
    }
  }, [])

  const gefilterd = wedstrijden ? wedstrijden.filter(w => filter === 'alles' || w.team.slug === filter) : []

  return (
    <div className="site-section">
      <div className="site-container">
        <SectionHeading label="Wedstrijdinformatie" title="Uitslagen" />

        <div className="site-filters">
          <button className={`site-pill${filter === 'alles' ? ' is-active' : ''}`} onClick={() => setFilter('alles')}>
            Alle teams
          </button>
          {TEAMS.map(team => (
            <button
              key={team.slug}
              className={`site-pill${filter === team.slug ? ' is-active' : ''}`}
              onClick={() => setFilter(team.slug)}
            >
              {team.kort}
            </button>
          ))}
        </div>

        {wedstrijden === null ? (
          <p className="site-loading">Uitslagen laden…</p>
        ) : (
          <MatchGrid wedstrijden={gefilterd} gespeeld leegTekst="Nog geen uitslagen bekend." />
        )}
      </div>
    </div>
  )
}
