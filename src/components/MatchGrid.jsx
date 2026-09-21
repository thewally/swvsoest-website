import { Badge } from './svs'
import { groepeerPerDag, formatDagLabel, matchStatus, parseScore, locatieLabel } from '../lib/matchHelpers'

function TeamCol({ name, logo, align, own }) {
  return (
    <div className={`site-match-team site-match-team-${align}${own ? ' is-own' : ''}`}>
      {logo ? (
        <img src={logo} alt="" className="site-match-logo" />
      ) : (
        <span className="site-match-logo site-match-logo-empty" aria-hidden="true" />
      )}
      <span>{name}</span>
    </div>
  )
}

// Toont wedstrijden als een lijst, gegroepeerd per speeldag. Elke wedstrijd
// moet een `team` veld hebben (uit lib/teams.js) zodat de categorie-badge en
// de eigen-team-markering kloppen wanneer wedstrijden van meerdere teams
// gecombineerd worden.
export default function MatchGrid({ wedstrijden, gespeeld = false, leegTekst = 'Geen wedstrijden gevonden.' }) {
  if (wedstrijden.length === 0) {
    return <p className="site-empty">{leegTekst}</p>
  }

  const perDag = groepeerPerDag(wedstrijden)

  return (
    <div className="site-stack">
      {[...perDag.entries()].map(([sleutel, items]) => (
        <div key={sleutel}>
          <h3 className="svs-label site-day-heading">
            <span>{formatDagLabel(items[0].wedstrijddatum)}</span>
          </h3>
          <div className="svs-card site-match-list">
            {items.map(w => {
              const status = matchStatus(w, { gespeeld })
              const score = gespeeld ? parseScore(w.uitslag) : null
              return (
                <div key={w.wedstrijdcode} className="site-match-row">
                  <div className="site-match-row-time">
                    {status === 'afgelast' ? (
                      <Badge tone="danger">Afgelast</Badge>
                    ) : status === 'gespeeld' ? (
                      <Badge tone="neutral">Uitslag</Badge>
                    ) : (
                      <span className="site-match-clock">{w.aanvangstijd || '--:--'}</span>
                    )}
                  </div>
                  <TeamCol name={w.thuisteam} logo={w.thuisteamlogo} align="home" own={w.thuisteam === w.team?.sportlinkNaam} />
                  <div className="site-match-mid">
                    {status === 'gespeeld' && score ? (
                      <span className="site-match-score">{`${score[0]} – ${score[1]}`}</span>
                    ) : (
                      <span className="svs-meta">vs</span>
                    )}
                  </div>
                  <TeamCol name={w.uitteam} logo={w.uitteamlogo} align="away" own={w.uitteam === w.team?.sportlinkNaam} />
                  <div className="site-match-meta">
                    {w.team?.kort && <span className="svs-label site-match-cat">{w.team.kort}</span>}
                    <span className="svs-meta">{locatieLabel(w)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
