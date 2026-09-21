import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Badge } from '../components/svs'
import { fetchNieuwsArtikel } from '../lib/data'
import NotFoundPage from './NotFoundPage'

export default function NieuwsDetailPage() {
  const { slug } = useParams()
  const [artikel, setArtikel] = useState(undefined)

  useEffect(() => {
    let actief = true
    setArtikel(undefined)
    fetchNieuwsArtikel(slug).then(a => actief && setArtikel(a))
    return () => {
      actief = false
    }
  }, [slug])

  if (artikel === undefined) {
    return (
      <div className="site-section">
        <div className="site-container">
          <p className="site-loading">Artikel laden…</p>
        </div>
      </div>
    )
  }

  if (artikel === null) return <NotFoundPage />

  return (
    <div className="site-section">
      <div className="site-container" style={{ maxWidth: 760 }}>
        {artikel.label && <Badge tone={artikel.tone}>{artikel.label}</Badge>}
        <h1 className="svs-hero-title" style={{ fontSize: 36, margin: '12px 0 4px', color: 'var(--ink)' }}>
          {artikel.title}
        </h1>
        <p className="svs-meta" style={{ marginBottom: 24 }}>
          {artikel.dateDisplay}
        </p>
        {artikel.image && (
          <img
            src={artikel.image}
            alt=""
            style={{ width: '100%', borderRadius: 'var(--radius-lg)', marginBottom: 24 }}
          />
        )}
        <div className="site-article" dangerouslySetInnerHTML={{ __html: artikel.html }} />
      </div>
    </div>
  )
}
