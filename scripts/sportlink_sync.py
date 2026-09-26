#!/usr/bin/env python3
"""
Haalt programma en uitslagen op voor de zes JO14-combinatieteams van
SWV Soest (VVZ'49 x So Soest) via de publieke SportLink Club widget-API
(data.sportlink.com) -- dezelfde API als vvz49-jo14-6-agenda gebruikt.
Geen account of database nodig.

Voor elk team wordt geschreven:
  - public/data/<slug>.json        -- programma + uitslagen + stand + foto-pad, voor de website
  - public/data/photos/<slug>.jpg  -- teamfoto (indien SportLink er een heeft), gedecodeerd uit base64
  - public/data/logos/<clubrelatiecode>.<ext> -- clublogo's, lokaal gecachet (zie cache_club_logo)

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

Club logo's die SportLink teruggeeft (thuisteamlogo/uitteamlogo/clublogo)
zijn ondertekende binaries.sportlink.com-URL's met een `expires`-parameter
die maar een paar uur in de toekomst ligt -- ruim binnen de 12 uur tussen
twee cron-runs. Zonder ingrijpen staan er dus een deel van elke dag kapotte
logo's op de site bij Programma en Uitslagen, en oude archief-wedstrijden
(die niet meer in elke run worden ververst) blijven voor altijd een
verlopen URL houden. We downloaden elk logo daarom één keer, gecachet op
het stabiele clubrelatiecode (zie cache_club_logo), en herschrijven alle
programma-/uitslagen-/stand-velden naar dat lokale pad.
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

# Handmatige sync-trigger: wijziging in dit bestand start de workflow.
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
LOGOS_DIR = ROOT / "public" / "data" / "logos"

LOGO_CONTENT_TYPES = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/svg+xml": "svg",
    "image/gif": "gif",
    "image/webp": "webp",
}


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


def _logo_extension(content_type: str | None, url: str) -> str:
    if content_type:
        ct = content_type.split(";")[0].strip().lower()
        if ct in LOGO_CONTENT_TYPES:
            return LOGO_CONTENT_TYPES[ct]
    gegokt = os.path.splitext(urllib.parse.urlparse(url).path)[1].lstrip(".")
    return gegokt or "png"


def _is_remote_url(value: object) -> str | None:
    return value if isinstance(value, str) and value.startswith("http") else None


def cache_club_logo(code: str | None, url: object, logo_cache: dict[str, str]) -> str | None:
    """Downloadt en cachet een clublogo lokaal onder public/data/logos/<code>.<ext>,
    op het stabiele clubrelatiecode in plaats van op SportLink's kortlevende
    ondertekende binaries-URL (zie de module-docstring). Eenmaal gecachet
    wordt een club nooit opnieuw gedownload -- ook niet als een latere
    aanroep geen (geldige) URL meer meegeeft, zoals bij een archief-
    wedstrijd waarvan de club dit keer niet vers is opgehaald."""
    if not code:
        return None
    if code in logo_cache:
        return logo_cache[code]

    if LOGOS_DIR.exists():
        bestaand = next(iter(LOGOS_DIR.glob(f"{code}.*")), None)
        if bestaand:
            logo_cache[code] = f"logos/{bestaand.name}"
            return logo_cache[code]

    remote_url = _is_remote_url(url)
    if not remote_url:
        return None
    try:
        req = urllib.request.Request(
            remote_url, headers={"User-Agent": "Mozilla/5.0 (compatible; swvsoest-website/1.0)"}
        )
        with urllib.request.urlopen(req, timeout=20) as resp:
            content = resp.read()
            ext = _logo_extension(resp.headers.get("Content-Type"), remote_url)
    except urllib.error.URLError as exc:
        print(f"[logo] kon logo voor {code} niet ophalen: {exc}", file=sys.stderr)
        return None

    LOGOS_DIR.mkdir(parents=True, exist_ok=True)
    bestand = LOGOS_DIR / f"{code}.{ext}"
    bestand.write_bytes(content)
    logo_cache[code] = f"logos/{bestand.name}"
    return logo_cache[code]


# Sommige tegenstanders (met name bij oefenwedstrijden) hebben geen
# clubrelatiecode in de SportLink-data -- cache_club_logo kan dan niets
# downloaden. Voor die gevallen een handmatige fallback op (een deel van)
# de teamnaam, logo's handmatig gedownload naar public/data/logos/.
HANDMATIGE_LOGOS = {
    "HBOK": "logos/HBOK.png",
}


def _handmatig_logo(teamnaam: str | None) -> str | None:
    if not teamnaam:
        return None
    for naam, pad in HANDMATIGE_LOGOS.items():
        if naam in teamnaam:
            return pad
    return None


def cache_logos_in_matches(matches: list[dict], logo_cache: dict[str, str]) -> None:
    for m in matches:
        lokaal_thuis = cache_club_logo(m.get("thuisteamclubrelatiecode"), m.get("thuisteamlogo"), logo_cache)
        m["thuisteamlogo"] = lokaal_thuis or _handmatig_logo(m.get("thuisteam")) or m.get("thuisteamlogo")
        lokaal_uit = cache_club_logo(m.get("uitteamclubrelatiecode"), m.get("uitteamlogo"), logo_cache)
        m["uitteamlogo"] = lokaal_uit or _handmatig_logo(m.get("uitteam")) or m.get("uitteamlogo")


def cache_logos_in_stand(stand: list[dict], logo_cache: dict[str, str]) -> None:
    for r in stand:
        lokaal = cache_club_logo(r.get("clubrelatiecode"), r.get("clublogo"), logo_cache)
        if lokaal:
            r["clublogo"] = lokaal


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


def sync_team(slug: str, teamnaam: str, teams: list[dict], now: datetime, logo_cache: dict[str, str]) -> dict:
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

    # Logo's cachen terwijl de door SportLink meegegeven URL's nog vers zijn
    # (net opgehaald) en de velden herschrijven naar het lokale pad.
    cache_logos_in_matches(programma, logo_cache)
    cache_logos_in_matches(laatste_speelronde, logo_cache)
    cache_logos_in_stand(stand, logo_cache)

    results_path = RESULTS_STATE_DIR / f"{slug}.json"
    results_state = load_json(results_path)
    results_state = merge_results(results_state, laatste_speelronde, now.isoformat())
    # Archief-wedstrijden die dit keer niet vers zijn opgehaald alsnog naar
    # het lokale logopad wijzen, voor zover hun club inmiddels gecachet is
    # (bv. omdat die club elders in deze of een eerdere run wél vers
    # voorkwam).
    cache_logos_in_matches(list(results_state.values()), logo_cache)
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
    logo_cache: dict[str, str] = {}
    resultaten = []
    fouten = 0
    for slug, teamnaam in TEAMS.items():
        try:
            resultaten.append(sync_team(slug, teamnaam, teams, now, logo_cache))
        except (urllib.error.URLError, RuntimeError) as exc:
            fouten += 1
            print(f"[{slug}] kon niet worden bijgewerkt: {exc}", file=sys.stderr)

    save_json(DATA_DIR / "index.json", {"updated_at": now.isoformat(), "teams": resultaten})

    if fouten == len(TEAMS):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
