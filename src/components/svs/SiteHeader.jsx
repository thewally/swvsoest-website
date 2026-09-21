import { Link } from 'react-router-dom'
import Button from './Button'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export default function SiteHeader({ logoSrc, homeHref = '/', items = [], cta, menuSlot }) {
  return (
    <header className="svs-header">
      <div className="svs-header-inner">
        <Link className="svs-header-brand" to={homeHref}>
          {logoSrc ? <img src={logoSrc} alt="" className="svs-header-logo" /> : null}
          <span className="svs-header-name">
            <span className="svs-header-town">SWV Soest</span>
          </span>
        </Link>
        <nav className="svs-header-nav" aria-label="Hoofdmenu">
          {items.map((it, i) => (
            <Link
              key={i}
              to={it.href}
              className={cx('svs-navlink', it.active && 'is-active')}
              aria-current={it.active ? 'page' : undefined}
            >
              {it.label}
            </Link>
          ))}
        </nav>
        {cta ? (
          <Button href={cta.href} variant="primary" size="sm">
            {cta.label}
          </Button>
        ) : null}
        {menuSlot}
      </div>
    </header>
  )
}
