import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { SectionHeading } from '../components/svs'
import MatchGrid from '../components/MatchGrid'
import StandTable from '../components/StandTable'
import { getTeam } from '../lib/teams'
import { fetchTeamData } from '../lib/data'
import { sorteerOplopend, sorteerAflopend, datumSleutel } from '../lib/matchHelpers'
import NotFoundPage from './NotFoundPage'

export default function TeamPage() {
  const { slug } = useParams()
  const team = getTeam(slug)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!team) return
    let actief = true
    setData(null)
    setError(null)
    fetchTeamData(team.slug)
      .then(d => actief && setData(d))
      .catch(e => actief && setError(e.message))
    return () => {
      actief = false
    }
  }, [team])

  if (!team) return <NotFoundPage />

  const base = import.meta.env.BASE_URL
  const icsPath = `${base}agenda/${team.slug}.ics`
  const icsUrl = new URL(icsPath, window.location.href).href
  const webcalUrl = icsUrl.replace(/^https?:\/\//, 'webcal://')

  const vandaag = datumSleutel(new Date().toISOString())
  const programma = data
    ? sorteerOplopend((data.programma || []).map(w => ({ ...w, team })).filter(w => datumSleutel(w.wedstrijddatum) >= vandaag))
    : []
  const uitslagen = data ? sorteerAflopend((data.uitslagen || []).map(w => ({ ...w, team }))) : []

  return (
    <div className="site-section">
      <div className="site-container">
        <SectionHeading label="Team" title={team.kort} />

        <section className="site-section-tight">
          <h2 className="svs-sechead-title" style={{ fontSize: 20, marginBottom: 12 }}>
            Abonneer op de agenda
          </h2>
          <div className="site-subscribe">
            <a className="svs-btn svs-btn-quiet svs-btn-sm" href={webcalUrl}>
              Apple / Outlook
            </a>
            <a className="svs-btn svs-btn-quiet svs-btn-sm" href={icsUrl} target="_blank" rel="noreferrer">
              Google Agenda / .ics-link
            </a>
            <a className="svs-btn svs-btn-quiet svs-btn-sm" href={icsUrl} download>
              Download .ics
            </a>
          </div>
        </section>

        {error && <p className="site-error">Kon gegevens niet laden: {error}</p>}

        <section className="site-section-tight">
          <h2 className="svs-sechead-title" style={{ fontSize: 20, marginBottom: 12 }}>
            Programma
          </h2>
          {!data && !error ? (
            <p className="site-loading">Programma laden…</p>
          ) : (
            <MatchGrid wedstrijden={programma} leegTekst="Geen komende wedstrijden." />
          )}
        </section>

        <section className="site-section-tight">
          <h2 className="svs-sechead-title" style={{ fontSize: 20, marginBottom: 12 }}>
            Uitslagen
          </h2>
          {!data && !error ? (
            <p className="site-loading">Uitslagen laden…</p>
          ) : (
            <MatchGrid wedstrijden={uitslagen} gespeeld leegTekst="Nog geen uitslagen bekend." />
          )}
        </section>

        <section className="site-section-tight">
          <h2 className="svs-sechead-title" style={{ fontSize: 20, marginBottom: 12 }}>
            Stand
          </h2>
          {!data && !error ? (
            <p className="site-loading">Stand laden…</p>
          ) : (
            <StandTable stand={data?.stand} poule={data?.poule} />
          )}
        </section>
      </div>
    </div>
  )
}
