import { useState } from 'react'

// Knop + uitklapbare "ballon" met uitleg over de speelagenda (.ics) van een
// team. Blijft standaard dicht; de knop toggelt 'm open/dicht. Alles gebeurt
// op de teampagina zelf (geen doorverwijzing naar de losse agendarepo) --
// alleen het klikken op Google/Outlook/Apple stuurt je logischerwijs naar
// die eigen instellingenpagina om de agenda daar toe te voegen.
//
// Let op: Google Calendar en Outlook bieden "toevoegen via URL" alleen aan
// op hun desktop-website (de Google Calendar-app heeft dit zelfs helemaal
// niet). Apple Agenda is anders: een webcal-link opent op een iPhone/iPad
// direct het abonneer-scherm in de Agenda-app -- dat werkt op de telefoon
// juist net zo makkelijk (of makkelijker) als op een Mac. De waarschuwing
// hieronder is daarom bewust specifiek per app, niet "werkt niet op telefoon".
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
            <svg
              className="site-balloon-warning-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="7.5" x2="12" y2="13" />
              <line x1="12" y1="16.5" x2="12" y2="16.5" />
            </svg>
            <div>
              <strong>Google Calendar en Outlook: gebruik een computer of Mac.</strong>
              <p>
                Toevoegen via deze link lukt bij die twee meestal niet op een telefoon. Apple Agenda werkt wél
                gewoon op een iPhone of iPad: tik daar simpelweg op de link hieronder.
              </p>
            </div>
          </div>

          <p className="site-balloon-lead">
            Werkt met <strong>Google Calendar</strong>, <strong>Outlook</strong> en <strong>Apple Agenda</strong>.
            Bevat alle wedstrijden van {team.kort}: tegenstander, aanvangstijd, verzameltijd en locatie.
          </p>

          <div className="site-balloon-steps">
            <div className="site-balloon-step">
              <span className="site-balloon-step-num">1</span>
              <span className="site-balloon-step-text">
                Open deze pagina op je computer of Mac.
                <br />
                Gebruik je een iPhone of iPad? Ga dan direct naar stap 3 en tik op Apple Agenda.
              </span>
            </div>
            <div className="site-balloon-step">
              <span className="site-balloon-step-num">2</span>
              <span className="site-balloon-step-text">
                <div className="site-balloon-copyrow">
                  <code className="site-balloon-url">{icsUrl}</code>
                  <button type="button" className="svs-btn svs-btn-quiet svs-btn-sm" onClick={kopieerLink}>
                    {gekopieerd ? '✓ Gekopieerd!' : 'Kopieer link'}
                  </button>
                </div>
              </span>
            </div>
            <div className="site-balloon-step">
              <span className="site-balloon-step-num">3</span>
              <span className="site-balloon-step-text">
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
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
