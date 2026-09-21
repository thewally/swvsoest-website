export default function SiteFooter({ logoSrc, note, clubs = [] }) {
  return (
    <footer className="svs-footer">
      <div className="svs-footer-inner">
        <div className="svs-footer-brand">
          {logoSrc ? <img src={logoSrc} alt="Samenwerking Voetbalverenigingen Soest" className="svs-footer-logo" /> : null}
          {note ? <p className="svs-footer-note">{note}</p> : null}
        </div>
        {clubs.length > 0 ? (
          <div className="svs-footer-clubs">
            <p className="svs-label">Een samenwerking van</p>
            <div className="svs-footer-clublist">
              {clubs.map((c, i) => (
                <a key={i} href={c.href} className="svs-footer-club">
                  {c.logoSrc ? <img src={c.logoSrc} alt="" /> : null}
                  <span>{c.name}</span>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="svs-footer-band" aria-hidden="true" />
    </footer>
  )
}
