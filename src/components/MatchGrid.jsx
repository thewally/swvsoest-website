import { useState } from 'react'
import { Badge } from './svs'
import { groepeerPerDag, formatDagLabel, matchStatus, parseScore, locatieLabel } from '../lib/matchHelpers'

// Witte cirkel achter elk logo, zodat donkere of transparante SportLink-logo's
// altijd goed contrasteren -- en een nette placeholder als de afbeelding
// (bv. een verlopen ondertekende URL) niet laadt. `align` zit op de wrapper
// zodat de mobiele lay-out thuis- en uitlogo apart kan positioneren.
function TeamLogo({ src, align }) {
  const [broken, setBroken] = useState(false)
  const cls = `site-match-logo-wrap site-match-logo-${align}`
  if (!src || broken) {
    return <span className={`${cls} site-match-logo-empty`} aria-hidden="true" />
  }
  return (
    <span className={cls}>
      <img src={src} alt="" className="site-match-logo" onError={() => setBroken(true)} />
    </span>
  )
}

// Teamnaam staat altijd aan de buitenkant, het logo altijd naast de
// uitslag/"vs" in het midden: thuis = naam - logo, uit = logo - naam.
// Naam en logo krijgen elk een eigen align-klasse zodat de mobiele lay-out
// (naam boven, logo's + uitslag op één regel, naam onder) ze onafhankelijk
// van elkaar kan plaatsen via CSS grid-areas.
function TeamCol({ name, logo, align, own }) {
  const naam = <span className={`site-match-name site-match-name-${align}${own ? ' is-own' : ''}`}>{name}</span>
  const logoEl = <TeamLogo src={logo} align={align} />
  return (
    <div className={`site-match-team site-match-team-${align}`}>
      {align === 'home' ? (
        <>
          {naam}
          {logoEl}
        </>
      ) : (
        <>
          {logoEl}
          {naam}
        </>
      )}
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
                      <>
                        <Badge tone="neutral">Uitslag</Badge>
                        <span className="site-match-clock site-match-clock-sub">{w.aanvangstijd || '--:--'}</span>
                      </>
                    ) : (
                      <span className="site-match-clock">{w.aanvangstijd || '--:--'}</span>
                    )}
                  </div>
                  <TeamCol name={w.thuisteam} logo={w.thuisteamlogo} align="home" own={w.thuisteam === w.team?.sportlinkNaam} />
                  <div className="site-match-mid">
                    {status === 'gespeeld' && score ? (
                      <span className="site-match-score">{`${score[0]} – ${score[1]}`}</span>
                    ) : (
                      <span className="svs-meta">vs</span>
                    )}
                  </div>
                  <TeamCol name={w.uitteam} logo={w.uitteamlogo} align="away" own={w.uitteam === w.team?.sportlinkNaam} />
                  <div className="site-match-meta">
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
