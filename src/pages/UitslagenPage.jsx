import { useEffect, useState } from 'react'
import { SectionHeading } from '../components/svs'
import MatchGrid from '../components/MatchGrid'
import { TEAMS } from '../lib/teams'
import { fetchAllTeamsData } from '../lib/data'
import { sorteerAflopend, datumSleutel } from '../lib/matchHelpers'

const WEKEN_TERUG = 4

export default function UitslagenPage() {
  const [wedstrijden, setWedstrijden] = useState(null)
  const [filter, setFilter] = useState('alles')

  useEffect(() => {
    let actief = true
    fetchAllTeamsData(TEAMS).then(teamsData => {
      if (!actief) return
      const grens = new Date()
      grens.setDate(grens.getDate() - WEKEN_TERUG * 7)
      const grensSleutel = datumSleutel(grens.toISOString())
      const alle = teamsData.flatMap(({ team, data }) =>
        (data?.uitslagen || [])
          .filter(w => w.wedstrijddatum && datumSleutel(w.wedstrijddatum) >= grensSleutel)
          .map(w => ({ ...w, team }))
      )
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
          <MatchGrid wedstrijden={gefilterd} gespeeld leegTekst="Geen uitslagen in de afgelopen 4 weken." />
        )}
      </div>
    </div>
  )
}
