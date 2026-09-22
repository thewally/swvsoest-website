import { useEffect, useState } from 'react'
import { SectionHeading, NewsCard } from '../components/svs'
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
          <div className="site-grid">
            {activiteiten.map(item => (
              <NewsCard
                key={item.slug}
                title={item.title}
                href={`/activiteiten/${item.slug}`}
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
    </div>
  )
}
