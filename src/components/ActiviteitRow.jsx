import { Link } from 'react-router-dom'
import { Badge } from './svs'

export default function ActiviteitRow({ item }) {
  return (
    <Link to={`/activiteiten/${item.slug}`} className="site-activiteit-row">
      <div className="site-activiteit-row-time">
        {item.tijd && <span className="site-match-clock">{item.tijd}</span>}
      </div>
      <div className="site-activiteit-row-body">
        {item.label && <Badge tone={item.tone}>{item.label}</Badge>}
        <h3 className="site-activiteit-row-title">{item.title}</h3>
        {item.excerpt && <p className="site-activiteit-row-excerpt">{item.excerpt}</p>}
      </div>
      <div className="site-activiteit-row-meta">
        {item.locatie && <span className="svs-meta">{item.locatie}</span>}
      </div>
    </Link>
  )
}
