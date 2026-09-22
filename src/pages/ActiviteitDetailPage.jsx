import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Badge } from '../components/svs'
import { fetchActiviteit } from '../lib/data'
import NotFoundPage from './NotFoundPage'

export default function ActiviteitDetailPage() {
  const { slug } = useParams()
  const [activiteit, setActiviteit] = useState(undefined)

  useEffect(() => {
    let actief = true
    setActiviteit(undefined)
    fetchActiviteit(slug).then(a => actief && setActiviteit(a))
    return () => {
      actief = false
    }
  }, [slug])

  if (activiteit === undefined) {
    return (
      <div className="site-section">
        <div className="site-container">
          <p className="site-loading">Activiteit laden…</p>
        </div>
      </div>
    )
  }

  if (activiteit === null) return <NotFoundPage />

  return (
    <div className="site-section">
      <div className="site-container" style={{ maxWidth: 760 }}>
        {activiteit.label && <Badge tone={activiteit.tone}>{activiteit.label}</Badge>}
        <h1 className="svs-hero-title" style={{ fontSize: 36, margin: '12px 0 4px', color: 'var(--ink)' }}>
          {activiteit.title}
        </h1>
        <p className="svs-meta" style={{ marginBottom: activiteit.herhalingText ? 4 : 24 }}>
          {activiteit.dateDisplay}
        </p>
        {activiteit.herhalingText && (
          <p className="svs-meta" style={{ marginBottom: 24 }}>
            {activiteit.herhalingText}
          </p>
        )}
        {activiteit.image && <img src={activiteit.image} alt="" className="site-article-image" />}
        <div className="site-article" dangerouslySetInnerHTML={{ __html: activiteit.html }} />
      </div>
    </div>
  )
}
