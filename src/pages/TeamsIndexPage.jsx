import { useEffect, useState } from 'react'
import { SectionHeading } from '../components/svs'
import TeamCard from '../components/TeamCard'
import { TEAMS } from '../lib/teams'
import { fetchAllTeamsData } from '../lib/data'

export default function TeamsIndexPage() {
  const [teamsData, setTeamsData] = useState(null)

  useEffect(() => {
    let actief = true
    fetchAllTeamsData(TEAMS).then(data => actief && setTeamsData(data))
    return () => {
      actief = false
    }
  }, [])

  return (
    <div className="site-section">
      <div className="site-container">
        <SectionHeading label="Teams" title="JO14-teams" />
        <div className="site-grid">
          {TEAMS.map(team => {
            const foto = teamsData?.find(t => t.team.slug === team.slug)?.data?.foto
            return <TeamCard key={team.slug} team={team} foto={foto} />
          })}
        </div>
      </div>
    </div>
  )
}
