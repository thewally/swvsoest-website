import { useState } from 'react'
import { Badge } from './svs'

// Knop + uitklapbare "ballon" met uitleg over de speelagenda (.ics) van een
// team. Blijft standaard dicht; de knop toggelt 'm open/dicht. Alles gebeurt
// op de teampagina zelf (geen doorverwijzing naar de losse agendarepo) --
// alleen het klikken op Google/Outlook/Apple stuurt je logischerwijs naar
// die eigen instellingenpagina om de agenda daar toe te voegen.
export default function AgendaBalloon({ team }) {
  const [open, setOpen] = useState(false)
  const [gekopieerd, setGekopieerd] = useState(false)

  const icsUrl = `${team.agendaUrl}matches.ics`
  const webcalUrl = icsUrl.replace(/^https?:\/\//, 'webcal://')

  async function kopieerLink() {
    try {
      await navigator.clipboard.writeText(icsUrl)
      setGekopieerd(true)
      setTimeout(() => setGekopieerd(false), 2500)
    } catch {
      // Klembord-API niet beschikbaar/geweigerd: laat de link zien om met de hand te kopiëren.
      window.prompt('Kopieer deze link:', icsUrl)
    }
  }

  return (
    <div>
      <button
        type="button"
        className="svs-btn svs-btn-primary svs-btn-sm"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        Importeer programma (met instructies)
      </button>

      {open && (
        <div className="site-balloon">
          <div className="site-balloon-warning">
            <Badge tone="warning">Alleen op computer of Mac</Badge>
            <span>Op een telefoon lukt het toevoegen via een link meestal niet.</span>
          </div>

          <p className="site-balloon-lead">
            Werkt met <strong>Google Calendar</strong>, <strong>Outlook</strong> en <strong>Apple Agenda</strong>.
            Bevat alle wedstrijden van {team.kort}: tegenstander, aanvangstijd, verzameltijd en locatie.
          </p>

          <ol className="site-balloon-steps">
            <li>Open deze pagina op je computer of Mac.</li>
            <li>
              <div className="site-balloon-copyrow">
                <code className="site-balloon-url">{icsUrl}</code>
                <button type="button" className="svs-btn svs-btn-quiet svs-btn-sm" onClick={kopieerLink}>
                  {gekopieerd ? '✓ Gekopieerd!' : 'Kopieer link'}
                </button>
              </div>
            </li>
            <li>
              Ga naar je agenda-app en voeg de link toe als agenda-abonnement:
              <div className="site-balloon-apps">
                <a href="https://calendar.google.com/calendar/r/settings/addbyurl" target="_blank" rel="noreferrer">
                  Google Calendar
                </a>
                <a href="https://outlook.live.com/calendar/" target="_blank" rel="noreferrer">
                  Outlook
                </a>
                <a href={webcalUrl}>Apple Agenda</a>
              </div>
            </li>
          </ol>
        </div>
      )}
    </div>
  )
}
