import { Link } from 'react-router-dom'
import Badge from './Badge'

export default function NewsCard({ title, href, image, imageAlt, label, tone = 'groen', excerpt, date }) {
  const media = image ? (
    <img className="svs-news-img" src={image} alt={imageAlt || ''} />
  ) : (
    <div className="svs-news-img svs-news-placeholder" aria-hidden="true" />
  )
  const titleLink = href ? (
    href.startsWith('/') ? (
      <Link to={href} className="svs-news-link">
        {title}
      </Link>
    ) : (
      <a href={href} className="svs-news-link">
        {title}
      </a>
    )
  ) : (
    title
  )
  return (
    <article className="svs-card svs-news">
      {media}
      <div className="svs-news-body">
        {label ? <Badge tone={tone}>{label}</Badge> : null}
        <h3 className="svs-news-title">{titleLink}</h3>
        {excerpt ? <p className="svs-news-excerpt">{excerpt}</p> : null}
        {date ? <p className="svs-meta">{date}</p> : null}
      </div>
    </article>
  )
}
