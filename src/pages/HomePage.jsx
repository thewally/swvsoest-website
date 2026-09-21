import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Hero, Button, SectionHeading, NewsCard } from '../components/svs'
import MatchGrid from '../components/MatchGrid'
import { TEAMS } from '../lib/teams'
import { fetchAllTeamsData, fetchNieuws } from '../lib/data'
import { sorteerOplopend, datumSleutel } from '../lib/matchHelpers'

export default function HomePage() {
  const [eerstvolgende, setEerstvolgende] = useState([])
  const [nieuws, setNieuws] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let actief = true
    async function laad() {
      const [teamsData, nieuwsData] = await Promise.all([fetchAllTeamsData(TEAMS), fetchNieuws()])
      if (!actief) return

      const vandaag = datumSleutel(new Date().toISOString())
      const alleToekomstig = teamsData.flatMap(({ team, data }) =>
        (data?.programma || [])
          .filter(w => w.wedstrijddatum && datumSleutel(w.wedstrijddatum) >= vandaag)
          .map(w => ({ ...w, team }))
      )
      const gesorteerd = sorteerOplopend(alleToekomstig)
      // Eerstvolgende speeldag: alle wedstrijden op de eerst gevonden datum.
      const eersteDatum = gesorteerd[0] ? datumSleutel(gesorteerd[0].wedstrijddatum) : null
      const speeldag = eersteDatum ? gesorteerd.filter(w => datumSleutel(w.wedstrijddatum) === eersteDatum) : []

      setEerstvolgende(speeldag)
      setNieuws(nieuwsData.slice(0, 3))
      setLoading(false)
    }
    laad()
    return () => {
      actief = false
    }
  }, [])

  const base = import.meta.env.BASE_URL

  return (
    <>
      <Hero
        title={
          <>
            <span className="site-hero-lead">Samenwerking Voetbalverenigingen</span>
            <span className="site-hero-soest">Soest</span>
            <span className="site-hero-tail">van VVZ'49 en So Soest</span>
          </>
        }
        markSrc={`${base}logo-svs.svg`}
        actions={
          <>
            <Button href="/programma" variant="primary">
              Bekijk het programma
            </Button>
            <Button href="/teams" variant="quiet">
              Bekijk de teams
            </Button>
          </>
        }
      />

      <section className="site-section">
        <div className="site-container">
          <SectionHeading
            label="Nieuws"
            title="Laatste nieuws"
            action={
              <Button href="/nieuws" variant="quiet" size="sm">
                Al het nieuws
              </Button>
            }
          />
          {nieuws.length === 0 ? (
            <p className="site-empty">Er is nog geen nieuws geplaatst.</p>
          ) : (
            <div className="site-grid">
              {nieuws.map(item => (
                <NewsCard
                  key={item.slug}
                  title={item.title}
                  href={`/nieuws/${item.slug}`}
                  image={item.image}
                  label={item.label}
                  tone={item.tone}
                  excerpt={item.excerpt}
                  date={item.dateDisplay}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="site-section site-section-alt">
        <div className="site-container">
          <SectionHeading label="Wedstrijddag" title="Eerstvolgende wedstrijden" />
          {loading ? (
            <p className="site-loading">Programma laden…</p>
          ) : (
            <MatchGrid wedstrijden={eerstvolgende} leegTekst="Er zijn geen komende wedstrijden bekend." />
          )}
        </div>
      </section>

      <section className="site-section">
        <div className="site-container">
          <SectionHeading label="Teams" title="Onze zes JO14-teams" />
          <div className="site-grid">
            {TEAMS.map(team => (
              <Link key={team.slug} to={`/teams/${team.slug}`} className="site-team-card">
                <h3>{team.kort}</h3>
                <p>Programma, uitslagen en agenda</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
