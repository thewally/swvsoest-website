#!/usr/bin/env python3
"""
Haalt programma en uitslagen op voor de zes JO14-combinatieteams van
SWV Soest (VVZ'49 x So Soest) via de publieke SportLink Club widget-API
(data.sportlink.com) -- dezelfde API als vvz49-jo14-6-agenda gebruikt.
Geen account of database nodig.

Voor elk team wordt geschreven:
  - public/data/<slug>.json        -- programma + uitslagen + stand + foto-pad, voor de website
  - public/data/photos/<slug>.jpg  -- teamfoto (indien SportLink er een heeft), gedecodeerd uit base64

De agenda-feeds (.ics) worden NIET meer hier gegenereerd -- elk team heeft
een eigen los repo (vvz49-jo14-<n>-agenda, zelfde opzet als
github.com/thewally/vvz49-jo14-6-agenda) dat dat zelf doet en host. Deze
site linkt er alleen naartoe (zie src/lib/teams.js, veld `agendaUrl`).

De client_id staat in de GitHub Actions repository secret
SPORTLINK_CLIENT_ID (lokaal: zet 'm in de omgevingsvariabele met
dezelfde naam).

We zoeken elke run opnieuw de teamcode op via de teamnaam (stabieler dan
poulecode, die halverwege het seizoen kan wisselen).

Belangrijke beperking van de publieke `uitslagen`-article: die geeft altijd
alleen de laatst gespeelde speelronde terug, ongeacht `aantaldagen` of
andere parameters (uitgeprobeerd; geen van de aannemelijke parameternamen
had effect) -- er is geen manier om er in één keer de hele seizoenshistorie
uit te halen. Daarom bouwen we zelf een archief op: elke run wordt de net
opgehaalde speelronde gemerged in data/state/results/<slug>.json (op
wedstrijdcode). De site's "uitslagen" komen uit dat archief, dat na verloop
van weken vanzelf het hele seizoen bevat. Wedstrijden van vóór de
allereerste keer dat dit script draaide, kunnen niet met terugwerkende
kracht opgehaald worden.
"""
import base64
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

API_BASE = "https://data.sportlink.com"
CLIENT_ID = os.environ.get("SPORTLINK_CLIENT_ID")

TEAMS = {
    "jo14-1": "ST SO Soest/VVZ'49 O14-1",
    "jo14-2": "ST SO Soest/VVZ'49 O14-2",
    "jo14-3": "ST SO Soest/VVZ'49 O14-3",
    "jo14-4": "ST SO Soest/VVZ'49 O14-4",
    "jo14-5": "ST SO Soest/VVZ'49 O14-5",
    "jo14-6": "ST SO Soest/VVZ'49 O14-6",
}

TZ_AMS = ZoneInfo("Europe/Amsterdam")

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "public" / "data"
RESULTS_STATE_DIR = ROOT / "data" / "state" / "results"
PHOTOS_DIR = ROOT / "public" / "data" / "photos"


def api_get(article: str, **params) -> object:
    params["client_id"] = CLIENT_ID
    url = f"{API_BASE}/{article}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; swvsoest-website/1.0)"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def find_teamcode(teams: list[dict], teamnaam: str) -> int:
    matches = [t for t in teams if t.get("teamnaam") == teamnaam and t.get("teamsoort") == "bond"]
    if not matches:
        raise RuntimeError(f"Team '{teamnaam}' niet gevonden in teams-lijst.")
    return matches[0]["teamcode"]


def kies_poule(teams: list[dict], teamcode: int, programma: list[dict]) -> dict | None:
    """Kiest de juiste poule-registratie voor de stand -- zelfde aanpak als
    vvz-toolbox (src/services/wedstrijdenHelpers.js: kiesPouleViaWedstrijd /
    kiesPouleFallback). Een team kan meerdere keren met poulecode in de
    teams-lijst staan (bv. bij een fase-wissel, of naast een bekercompetitie);
    zonder disambiguatie kan dan de verkeerde (bv. een afgelopen of nog niet
    actieve) poule gekozen worden, met een lege of onlogische stand tot gevolg.
    We matchen daarom bij voorkeur op de competitienaam van de eerstvolgende
    wedstrijd, en vallen anders terug op de reguliere competitie-inschrijving."""
    kandidaten = [t for t in teams if t.get("teamcode") == teamcode and t.get("poulecode")]
    if not kandidaten:
        return None
    if len(kandidaten) == 1:
        return kandidaten[0]

    aankomend = sorted(
        (m for m in programma if m.get("wedstrijddatum")),
        key=lambda m: m["wedstrijddatum"],
    )
    if aankomend:
        comp_naam = (aankomend[0].get("competitie") or "").strip().lower()
        if comp_naam:
            for p in kandidaten:
                poule_naam = (p.get("competitienaam") or "").strip().lower()
                if poule_naam and (poule_naam == comp_naam or poule_naam in comp_naam or comp_naam in poule_naam):
                    return p

    regulier = [p for p in kandidaten if p.get("competitiesoort") == "regulier"]
    return (regulier or kandidaten)[0]


def fetch_programma(teamcode: int) -> list[dict]:
    return api_get("programma", teamcode=teamcode, aantaldagen=365, aantalregels=200, eigenwedstrijden="JA")


def fetch_uitslagen(teamcode: int) -> list[dict]:
    return api_get("uitslagen", teamcode=teamcode, eigenwedstrijden="JA")


def fetch_teamfoto_base64(teamcode: int) -> str | None:
    try:
        info = api_get("team-gegevens", teamcode=teamcode, lokaleteamcode=-1)
        return (info.get("team") or {}).get("teamfoto") or None
    except (urllib.error.URLError, KeyError, ValueError):
        return None


def sync_teamfoto(slug: str, teamcode: int) -> str | None:
    """Slaat de teamfoto (indien aanwezig in SportLink) op als los JPEG-bestand
    in public/data/photos/, en geeft het relatieve pad (t.o.v. public/data/)
    terug -- of None als er geen foto is. Een oude foto wordt opgeruimd zodra
    het team er geen meer heeft."""
    photo_path = PHOTOS_DIR / f"{slug}.jpg"
    base64_data = fetch_teamfoto_base64(teamcode)
    if not base64_data:
        photo_path.unlink(missing_ok=True)
        return None
    PHOTOS_DIR.mkdir(parents=True, exist_ok=True)
    photo_path.write_bytes(base64.b64decode(base64_data))
    return f"photos/{slug}.jpg"


def fetch_poulestand(poulecode: int) -> list[dict]:
    return api_get("poulestand", poulecode=poulecode)


def load_json(pad: Path) -> dict:
    if pad.exists():
        return json.loads(pad.read_text())
    return {}


def save_json(pad: Path, data) -> None:
    pad.parent.mkdir(parents=True, exist_ok=True)
    pad.write_text(json.dumps(data, indent=2, ensure_ascii=False, sort_keys=True) + "\n")


def merge_results(results_state: dict, uitslagen: list[dict], now_iso: str) -> dict:
    """De publieke `uitslagen`-article geeft altijd alleen de laatst
    gespeelde speelronde terug. Door elke run te mergen op wedstrijdcode
    bouwen we zelf een archief op van alle uitslagen die we ooit gezien
    hebben, zodat de site niet beperkt blijft tot de vorige speeldag."""
    for m in uitslagen:
        uid = str(m["wedstrijdcode"])
        entry = results_state.get(uid, {})
        entry.update(m)
        entry["last_seen"] = now_iso
        entry.setdefault("first_seen", now_iso)
        results_state[uid] = entry
    return results_state


def sync_team(slug: str, teamnaam: str, teams: list[dict], now: datetime) -> dict:
    teamcode = find_teamcode(teams, teamnaam)
    programma = fetch_programma(teamcode)

    poule_record = kies_poule(teams, teamcode, programma)
    poulecode = poule_record.get("poulecode") if poule_record else None
    stand = fetch_poulestand(poulecode) if poulecode else []
    poule = {
        "poulecode": poulecode,
        "competitienaam": poule_record.get("competitienaam"),
        "klasse": poule_record.get("klasse"),
        "poule": poule_record.get("poule"),
        "klassepoule": poule_record.get("klassepoule"),
    } if poule_record else None

    laatste_speelronde = fetch_uitslagen(teamcode)

    results_path = RESULTS_STATE_DIR / f"{slug}.json"
    results_state = load_json(results_path)
    results_state = merge_results(results_state, laatste_speelronde, now.isoformat())
    save_json(results_path, results_state)
    uitslagen = sorted(
        (dict(v) for v in results_state.values()),
        key=lambda r: r["wedstrijddatum"],
        reverse=True,
    )

    foto = sync_teamfoto(slug, teamcode)

    print(f"[{slug}] teamcode {teamcode}: {len(programma)} programma, "
          f"{len(laatste_speelronde)} nieuw in laatste speelronde, {len(uitslagen)} uitslagen totaal in archief, "
          f"stand {len(stand)} team(s), foto {'aanwezig' if foto else 'geen'}")

    save_json(DATA_DIR / f"{slug}.json", {
        "slug": slug,
        "teamnaam": teamnaam,
        "teamcode": teamcode,
        "updated_at": now.isoformat(),
        "programma": programma,
        "uitslagen": uitslagen,
        "poule": poule,
        "stand": stand,
        "foto": foto,
    })

    return {"slug": slug, "teamnaam": teamnaam, "teamcode": teamcode}


def main() -> int:
    if not CLIENT_ID:
        print("SPORTLINK_CLIENT_ID ontbreekt (zet 'm als env var of repository secret).", file=sys.stderr)
        return 1

    now = datetime.now(TZ_AMS)
    teams = api_get("teams")
    resultaten = []
    fouten = 0
    for slug, teamnaam in TEAMS.items():
        try:
            resultaten.append(sync_team(slug, teamnaam, teams, now))
        except (urllib.error.URLError, RuntimeError) as exc:
            fouten += 1
            print(f"[{slug}] kon niet worden bijgewerkt: {exc}", file=sys.stderr)

    save_json(DATA_DIR / "index.json", {"updated_at": now.isoformat(), "teams": resultaten})

    if fouten == len(TEAMS):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
