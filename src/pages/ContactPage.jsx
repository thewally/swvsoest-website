import { SectionHeading } from '../components/svs'

// In stukjes opgebouwd zodat het adres nooit als aaneengesloten tekst in de
// broncode/bundle staat -- dat houdt de simpele scrapers tegen die enkel de
// afgeleverde bestanden doorzoeken op een @-patroon, zonder de pagina echt
// te renderen (verreweg de meeste e-mail-harvesters werken zo).
const EMAIL_GEBRUIKER = 'arjen.vanderwal'
const EMAIL_DOMEIN = 'gmail.com'

export default function ContactPage() {
  const email = `${EMAIL_GEBRUIKER}@${EMAIL_DOMEIN}`

  return (
    <div className="site-section">
      <div className="site-container" style={{ maxWidth: 760 }}>
        <SectionHeading label="Contact" title="Contact" />
        <p className="body" style={{ margin: 0 }}>
          Vragen of opmerkingen over deze website? Neem contact op met Arjen van der Wal via{' '}
          <a href={`mailto:${email}`} style={{ color: 'var(--blauw-actie)', textDecoration: 'underline' }}>
            {email}
          </a>
          .
        </p>
      </div>
    </div>
  )
}
