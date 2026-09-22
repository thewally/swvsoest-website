import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { SiteHeader, SiteFooter } from './svs'

const NAV_ITEMS = [
  { label: 'Programma', href: '/programma' },
  { label: 'Uitslagen', href: '/uitslagen' },
  { label: 'Teams', href: '/teams' },
  { label: 'Activiteiten', href: '/activiteiten' },
  { label: 'Nieuws', href: '/nieuws' },
  { label: 'Contact', href: '/contact' },
]

export default function Layout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMenuOpen(false), [location.pathname])

  const items = NAV_ITEMS.map(item => ({
    ...item,
    active: location.pathname === item.href || location.pathname.startsWith(`${item.href}/`),
  }))

  const base = import.meta.env.BASE_URL

  return (
    <>
      <SiteHeader
        logoSrc={`${base}logo-svs.svg`}
        homeHref="/"
        items={items}
        menuSlot={
          <button
            className="site-menu-btn"
            aria-label={menuOpen ? 'Menu sluiten' : 'Menu openen'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        }
      />
      <nav className={`site-mobile-nav${menuOpen ? ' is-open' : ''}`} aria-label="Mobiel hoofdmenu">
        {items.map(item => (
          <Link key={item.href} to={item.href} className={item.active ? 'is-active' : ''}>
            {item.label}
          </Link>
        ))}
      </nav>
      <main className="site-main">
        <Outlet />
      </main>
      <SiteFooter
        logoSrc={`${base}logo-svs.svg`}
        note="Programma, uitslagen en nieuws van alle teams uit de samenwerking tussen VVZ'49 en So Soest."
      />
    </>
  )
}
