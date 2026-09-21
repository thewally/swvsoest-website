export default function Badge({ tone = 'neutral', children }) {
  return <span className={`svs-badge svs-badge-${tone}`}>{children}</span>
}
