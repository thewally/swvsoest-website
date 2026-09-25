import { formatDagLabel } from '../lib/matchHelpers'
import ActiviteitRow from './ActiviteitRow'

// `item.date` is al een 'JJJJ-MM-DD'-sleutel (zie scripts/build-activiteiten.mjs) en de lijst
// komt al oplopend gesorteerd binnen, dus groeperen is gewoon per date-string bucketen --
// de Map-volgorde blijft vanzelf de juiste sortering.
function groepeerPerDatum(activiteiten) {
  const map = new Map()
  for (const item of activiteiten) {
    if (!map.has(item.date)) map.set(item.date, [])
    map.get(item.date).push(item)
  }
  return map
}

// Toont activiteiten als een lijst, gegroepeerd per dag -- zelfde opzet als
// MatchGrid (Programma/Uitslagen), maar zonder team-kolommen/logo's.
export default function ActiviteitList({ activiteiten, leegTekst = 'Geen activiteiten gevonden.' }) {
  if (activiteiten.length === 0) {
    return <p className="site-empty">{leegTekst}</p>
  }

  const perDag = groepeerPerDatum(activiteiten)

  return (
    <div className="site-stack">
      {[...perDag.entries()].map(([datum, items]) => (
        <div key={datum}>
          <h3 className="svs-label site-day-heading">
            <span>{formatDagLabel(datum)}</span>
          </h3>
          <div className="svs-card site-activiteit-list">
            {items.map(item => (
              <ActiviteitRow key={item.slug} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
