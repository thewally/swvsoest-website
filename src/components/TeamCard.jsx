import { Link } from 'react-router-dom'

// Generieke grijze silhouet-placeholder voor teams zonder teamfoto in SportLink.
function TeamPhotoPlaceholder() {
  return (
    <div className="site-team-photo site-team-photo-placeholder" aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="24" r="9" fill="currentColor" />
        <circle cx="44" cy="26" r="7" fill="currentColor" />
        <path
          d="M6 54c0-10 8-17 18-17s18 7 18 17M38 54c1-8 7-13 15-13s13 5 14 13"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  )
}

export default function TeamCard({ team, foto }) {
  const base = import.meta.env.BASE_URL
  return (
    <Link to={`/teams/${team.slug}`} className="site-team-card">
      {foto ? <img src={`${base}data/${foto}`} alt="" className="site-team-photo" /> : <TeamPhotoPlaceholder />}
      <h3>{team.kort}</h3>
    </Link>
  )
}
