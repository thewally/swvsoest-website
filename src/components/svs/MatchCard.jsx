import Badge from './Badge'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

function Team({ name, logo }, side) {
  return (
    <div className={`svs-team svs-team-${side}`}>
      {logo ? (
        <img className="svs-team-logo" src={logo} alt="" />
      ) : (
        <span className="svs-team-logo svs-team-nologo" aria-hidden="true" />
      )}
      <span className="svs-team-name">{name}</span>
    </div>
  )
}

export default function MatchCard({ home, away, category, date, time, location, status = 'gepland', score }) {
  const middle =
    status === 'gespeeld' && score ? (
      <span className="svs-score">
        {score[0]}
        {' – '}
        {score[1]}
      </span>
    ) : (
      <span className={cx('svs-score', 'svs-score-time', status === 'afgelast' && 'svs-score-off')}>{time || ''}</span>
    )
  return (
    <article className="svs-card svs-match">
      <div className="svs-match-top">
        <span className="svs-label svs-match-cat">{category || ''}</span>
        {status === 'afgelast' ? (
          <Badge tone="danger">Afgelast</Badge>
        ) : status === 'gespeeld' ? (
          <Badge tone="neutral">Uitslag</Badge>
        ) : (
          <span className="svs-meta">{date || ''}</span>
        )}
      </div>
      <div className="svs-match-row">
        {Team(home, 'home')}
        {middle}
        {Team(away, 'away')}
      </div>
      {location ? <p className="svs-meta svs-match-loc">{location}</p> : null}
    </article>
  )
}
