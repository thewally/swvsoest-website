import { useEffect, useState } from 'react'
import { SectionHeading, NewsCard } from '../components/svs'
import { fetchNieuws } from '../lib/data'

export default function NieuwsPage() {
  const [nieuws, setNieuws] = useState(null)

  useEffect(() => {
    let actief = true
    fetchNieuws().then(data => actief && setNieuws(data))
    return () => {
      actief = false
    }
  }, [])

  return (
    <div className="site-section">
      <div className="site-container">
        <SectionHeading label="Nieuws" title="Nieuws" />
        {nieuws === null ? (
          <p className="site-loading">Nieuws laden…</p>
        ) : nieuws.length === 0 ? (
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
    </div>
  )
}
