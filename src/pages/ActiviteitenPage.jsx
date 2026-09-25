import { useEffect, useState } from 'react'
import { SectionHeading } from '../components/svs'
import ActiviteitRow from '../components/ActiviteitRow'
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
              <ActiviteitRow key={item.slug} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
