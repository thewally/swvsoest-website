import { MatchCard } from './svs'
import { groepeerPerDag, formatDagLabel, formatDatumKort, matchStatus, parseScore, locatieLabel } from '../lib/matchHelpers'

// Toont een lijst wedstrijden gegroepeerd per speeldag. Elke wedstrijd moet
// een `team` veld hebben (uit lib/teams.js) zodat de categorie-badge klopt
// wanneer wedstrijden van meerdere teams gecombineerd worden.
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
          <div className="site-grid">
            {items.map(w => (
              <MatchCard
                key={w.wedstrijdcode}
                category={w.team?.kort}
                home={{ name: w.thuisteam, logo: w.thuisteamlogo }}
                away={{ name: w.uitteam, logo: w.uitteamlogo }}
                date={formatDatumKort(w.wedstrijddatum)}
                time={w.aanvangstijd}
                location={locatieLabel(w)}
                status={matchStatus(w, { gespeeld })}
                score={gespeeld ? parseScore(w.uitslag) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
