import { useEffect, useState } from 'react'
import { SectionHeading } from '../components/svs'
import ActiviteitList from '../components/ActiviteitList'
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
        ) : (
          <ActiviteitList activiteiten={activiteiten} leegTekst="Er zijn nog geen activiteiten gepland." />
        )}
      </div>
    </div>
  )
}
