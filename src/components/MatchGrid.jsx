import { groepeerPerDag, formatDagLabel, datumSleutel } from '../lib/matchHelpers'
import MatchRow from './MatchRow'
import ActiviteitRow from './ActiviteitRow'

// Startijd van een activiteit ("18:30 - 19:45") voor de tijd-sortering binnen
// een dag -- zelfde '99:99'-fallback als bij een wedstrijd zonder aanvangstijd.
function activiteitTijd(item) {
  return (item.tijd || '').split('-')[0].trim() || '99:99'
}

// Toont wedstrijden als een lijst, gegroepeerd per speeldag -- en, als
// `activiteiten` is meegegeven (alleen zinvol voor het aankomende programma,
// niet voor uitslagen), gemengd met team-activiteiten uit diezelfde periode,
// op tijd door elkaar binnen elke dag. Elke wedstrijd moet een `team` veld
// hebben (uit lib/teams.js) zodat de eigen-team-markering klopt wanneer
// wedstrijden van meerdere teams gecombineerd worden.
export default function MatchGrid({ wedstrijden, activiteiten = [], gespeeld = false, leegTekst = 'Geen wedstrijden gevonden.' }) {
  const items = [
    ...wedstrijden.map(w => ({ type: 'wedstrijd', data: w })),
    ...(gespeeld ? [] : activiteiten.map(a => ({ type: 'activiteit', data: a }))),
  ]

  if (items.length === 0) {
    return <p className="site-empty">{leegTekst}</p>
  }

  const perDag = groepeerPerDag(items, {
    aflopend: gespeeld,
    datum: it => (it.type === 'wedstrijd' ? it.data.wedstrijddatum && datumSleutel(it.data.wedstrijddatum) : it.data.date),
    tijd: it => (it.type === 'wedstrijd' ? it.data.aanvangstijd || '99:99' : activiteitTijd(it.data)),
  })

  return (
    <div className="site-stack">
      {[...perDag.entries()].map(([sleutel, dagItems]) => (
        <div key={sleutel}>
          <h3 className="svs-label site-day-heading">
            <span>{formatDagLabel(sleutel)}</span>
          </h3>
          <div className="svs-card site-match-list">
            {dagItems.map(it =>
              it.type === 'wedstrijd' ? (
                <MatchRow key={it.data.wedstrijdcode} wedstrijd={it.data} gespeeld={gespeeld} />
              ) : (
                <ActiviteitRow key={it.data.slug} item={it.data} />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
