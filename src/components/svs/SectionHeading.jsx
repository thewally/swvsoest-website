export default function SectionHeading({ label, title, as: As = 'h2', action }) {
  return (
    <div className="svs-sechead">
      <div>
        {label ? <p className="svs-label svs-sechead-label">{label}</p> : null}
        <As className="svs-sechead-title">{title}</As>
      </div>
      {action || null}
    </div>
  )
}
