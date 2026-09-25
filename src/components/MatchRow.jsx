import { useState } from 'react'
import { Badge } from './svs'
import { matchStatus, parseScore, locatieLabel } from '../lib/matchHelpers'

const BASE = import.meta.env.BASE_URL

// SportLink-logo's komen na de sync als lokaal pad (bv. "logos/BBBZ168.png",
// zie scripts/sportlink_sync.py) en moeten met BASE_URL + 'data/' ervoor
// worden opgehaald -- net als de teamfoto in TeamCard.jsx. Oudere,
// nog-niet-herschreven data (of een club waarvan het logo niet gedownload
// kon worden) heeft soms nog de originele absolute SportLink-URL; die laten
// we ongemoeid.
function resolveLogoSrc(src) {
  if (!src) return null
  return /^https?:\/\//.test(src) ? src : `${BASE}data/${src}`
}

// Witte cirkel achter elk logo, zodat donkere of transparante SportLink-logo's
// altijd goed contrasteren -- en een nette placeholder als de afbeelding
// niet laadt (bv. een club zonder logo, of een enkele keer nog een
// verlopen ondertekende SportLink-URL die niet lokaal gecachet kon worden).
// `align` zit op de wrapper zodat de mobiele lay-out thuis- en uitlogo
// apart kan positioneren.
function TeamLogo({ src, align }) {
  const [broken, setBroken] = useState(false)
  const cls = `site-match-logo-wrap site-match-logo-${align}`
  const resolved = resolveLogoSrc(src)
  if (!resolved || broken) {
    return <span className={`${cls} site-match-logo-empty`} aria-hidden="true" />
  }
  return (
    <span className={cls}>
      <img src={resolved} alt="" className="site-match-logo" onError={() => setBroken(true)} />
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

// Eén wedstrijdrij. Verwacht een `team` veld op `wedstrijd` (uit lib/teams.js)
// zodat de eigen-team-markering klopt wanneer wedstrijden van meerdere teams
// gecombineerd worden.
export default function MatchRow({ wedstrijd, gespeeld = false }) {
  const status = matchStatus(wedstrijd, { gespeeld })
  const score = gespeeld ? parseScore(wedstrijd.uitslag) : null
  return (
    <div className="site-match-row">
      <div className="site-match-row-time">
        {status === 'afgelast' ? (
          <Badge tone="danger">Afgelast</Badge>
        ) : status === 'gespeeld' ? (
          <>
            <Badge tone="neutral">Uitslag</Badge>
            <span className="site-match-clock site-match-clock-sub">{wedstrijd.aanvangstijd || '--:--'}</span>
          </>
        ) : (
          <span className="site-match-clock">{wedstrijd.aanvangstijd || '--:--'}</span>
        )}
      </div>
      <TeamCol name={wedstrijd.thuisteam} logo={wedstrijd.thuisteamlogo} align="home" own={wedstrijd.thuisteam === wedstrijd.team?.sportlinkNaam} />
      <div className="site-match-mid">
        {status === 'gespeeld' && score ? (
          <span className="site-match-score">{`${score[0]} – ${score[1]}`}</span>
        ) : (
          <span className="svs-meta">vs</span>
        )}
      </div>
      <TeamCol name={wedstrijd.uitteam} logo={wedstrijd.uitteamlogo} align="away" own={wedstrijd.uitteam === wedstrijd.team?.sportlinkNaam} />
      <div className="site-match-meta">
        <span className="svs-meta">{locatieLabel(wedstrijd)}</span>
      </div>
    </div>
  )
}
