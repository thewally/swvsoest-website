import { SectionHeading } from '../components/svs'

const EMAIL = 'arjen.vanderwal@gmail.com'

export default function ContactPage() {
  return (
    <div className="site-section">
      <div className="site-container" style={{ maxWidth: 760 }}>
        <SectionHeading label="Contact" title="Contact" />
        <p className="body" style={{ margin: 0 }}>
          Vragen of opmerkingen over deze website? Neem contact op met Arjen van der Wal via{' '}
          <a href={`mailto:${EMAIL}`} style={{ color: 'var(--blauw-actie)', textDecoration: 'underline' }}>
            {EMAIL}
          </a>
          .
        </p>
      </div>
    </div>
  )
}
