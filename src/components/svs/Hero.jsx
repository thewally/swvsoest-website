export default function Hero({ label, title, intro, actions, markSrc }) {
  return (
    <section className="svs-hero">
      <div className="svs-hero-inner">
        <div className="svs-hero-text">
          {label ? <p className="svs-label svs-hero-label">{label}</p> : null}
          <h1 className="svs-hero-title">{title}</h1>
          {intro ? <p className="svs-hero-intro">{intro}</p> : null}
          {actions ? <div className="svs-hero-actions">{actions}</div> : null}
        </div>
        {markSrc ? <img className="svs-hero-mark" src={markSrc} alt="" /> : null}
      </div>
    </section>
  )
}
