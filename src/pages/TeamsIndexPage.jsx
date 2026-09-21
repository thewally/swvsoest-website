import { Link } from 'react-router-dom'
import { SectionHeading } from '../components/svs'
import { TEAMS } from '../lib/teams'

export default function TeamsIndexPage() {
  return (
    <div className="site-section">
      <div className="site-container">
        <SectionHeading label="Teams" title="JO14-teams" />
        <div className="site-grid">
          {TEAMS.map(team => (
            <Link key={team.slug} to={`/teams/${team.slug}`} className="site-team-card">
              <h3>{team.kort}</h3>
              <p>Programma, uitslagen en agenda</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
