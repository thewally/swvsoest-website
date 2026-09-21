export default function StandTable({ stand, poule }) {
  if (!stand || stand.length === 0) {
    return <p className="site-empty">Geen stand beschikbaar voor deze competitie.</p>
  }

  return (
    <div>
      {poule && (poule.klasse || poule.poule) && (
        <p className="svs-meta" style={{ marginBottom: 12 }}>
          {[poule.klasse, poule.poule ? `poule ${poule.poule}` : null].filter(Boolean).join(' · ')}
        </p>
      )}
      <div className="svs-card site-stand-table">
        <div className="site-stand-row site-stand-head">
          <span>#</span>
          <span>Team</span>
          <span>G</span>
          <span>W</span>
          <span>G</span>
          <span>V</span>
          <span>Pt</span>
        </div>
        {stand.map(rij => (
          <div key={rij.positie} className={`site-stand-row${rij.eigenteam === 'true' ? ' is-own' : ''}`}>
            <span>{rij.positie}</span>
            <span className="site-stand-team">{rij.teamnaam}</span>
            <span>{rij.gespeeldewedstrijden}</span>
            <span>{rij.gewonnen}</span>
            <span>{rij.gelijk}</span>
            <span>{rij.verloren}</span>
            <span className="site-stand-points">{rij.punten}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
