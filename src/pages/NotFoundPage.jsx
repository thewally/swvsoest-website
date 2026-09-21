import { Button } from '../components/svs'

export default function NotFoundPage() {
  return (
    <div className="site-section">
      <div className="site-container" style={{ textAlign: 'center' }}>
        <h1 className="svs-hero-title" style={{ fontSize: 40, color: 'var(--ink)' }}>
          Pagina niet gevonden
        </h1>
        <p className="site-empty">Deze pagina bestaat niet (meer).</p>
        <Button href="/" variant="primary">
          Terug naar de homepage
        </Button>
      </div>
    </div>
  )
}
