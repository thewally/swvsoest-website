import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionHeading, Badge } from '../components/svs'
import { fetchActiviteiten } from '../lib/data'

export default function ActiviteitenPage() {
  const [activiteiten, setActiviteiten] = useState(null)

  useEffect(() => {
    let actief = true
    fetchActiviteiten().then(data => actief && setActiviteiten(data))
    return () => {
      actief = false
    }
  }, [])

  return (
    <div className="site-section">
      <div className="site-container">
        <SectionHeading label="Activiteiten" title="Activiteiten" />
        {activiteiten === null ? (
          <p className="site-loading">Activiteiten laden…</p>
        ) : activiteiten.length === 0 ? (
          <p className="site-empty">Er zijn nog geen activiteiten gepland.</p>
        ) : (
          <div className="site-activiteit-list">
            {activiteiten.map(item => (
              <Link key={item.slug} to={`/activiteiten/${item.slug}`} className="site-activiteit-row">
                {item.weekdayAbbrev && (
                  <div className="site-activiteit-row-weekday-col">
                    <p className="site-activiteit-row-weekday">{item.weekdayAbbrev}</p>
                  </div>
                )}
                <div className="site-activiteit-row-date-col">
                  <p className="site-activiteit-row-date">{item.dateDisplay}</p>
                  {item.tijd && <p className="site-activiteit-row-time">{item.tijd}</p>}
                  {item.locatie && <p className="site-activiteit-row-location">{item.locatie}</p>}
                </div>
                <div className="site-activiteit-row-body">
                  {item.label && <Badge tone={item.tone}>{item.label}</Badge>}
                  <h3 className="site-activiteit-row-title">{item.title}</h3>
                  {item.excerpt && <p className="site-activiteit-row-excerpt">{item.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
