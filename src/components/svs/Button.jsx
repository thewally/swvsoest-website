import { Link } from 'react-router-dom'

// Poort van swvsoest-huisstijl/components/Button (bundle.js), zelfde markup/classnamen.
// Interne paden (beginnend met '/') gaan via React Router's Link voor SPA-navigatie;
// externe links en downloads blijven gewone <a>.
function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export default function Button({ variant = 'primary', size = 'md', href, className, children, ...rest }) {
  const cls = cx('svs-btn', `svs-btn-${variant}`, `svs-btn-${size}`, className)
  if (href) {
    if (href.startsWith('/') && !rest.download) {
      return (
        <Link to={href} className={cls} {...rest}>
          {children}
        </Link>
      )
    }
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  )
}
