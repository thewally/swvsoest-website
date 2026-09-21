#!/usr/bin/env python3
"""
Haalt programma en uitslagen op voor de zes JO14-combinatieteams van
SWV Soest (VVZ'49 x So Soest) via de publieke SportLink Club widget-API
(data.sportlink.com) -- dezelfde API als vvz49-jo14-6-agenda gebruikt.
Geen account of database nodig.

Voor elk team wordt geschreven:
  - public/data/<slug>.json   -- programma + uitslagen, voor de website
  - public/agenda/<slug>.ics  -- agenda-feed om te abonneren

De client_id staat in de GitHub Actions repository secret
SPORTLINK_CLIENT_ID (lokaal: zet 'm in de omgevingsvariabele met
dezelfde naam).

We zoeken elke run opnieuw de teamcode op via de teamnaam (stabieler dan
poulecode, die halverwege het seizoen kan wisselen). Voor de ICS-feed
houden we per team een state-bestand (data/state/<slug>.json) bij zodat
al geziene wedstrijden niet verdwijnen uit de agenda als een fase/poule
wisselt -- zie vvz49-jo14-6-agenda voor dezelfde aanpak op een los team.
"""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
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

UID_NAMESPACE = "swvsoest-website"

# VVZ'49's eigen accommodatie (Sportpark Zonnegloren) -- thuisbasis van de
# combinatieteams. De KNVB noemt de accommodatie "Sportpark Zonnegloren",
# maar Google Maps/Calendar herkent de plek (met foto/kaartje) pas onder de
# officiele clubnaam en het exacte adres.
THUIS_ACCOMMODATIE_KNVB = "Sportpark Zonnegloren"
THUIS_CLUBNAAM = "Sportvereniging Vrienden van Zonnegloren"
THUIS_STRAAT = "Eemweg 2D"
THUIS_PLAATS = "3764 DG Soest"
THUIS_ADRES_VOLLEDIG = f"{THUIS_CLUBNAAM} {THUIS_STRAAT}, {THUIS_PLAATS}, Nederland"

TZ_AMS = ZoneInfo("Europe/Amsterdam")

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "public" / "data"
AGENDA_DIR = ROOT / "public" / "agenda"
STATE_DIR = ROOT / "data" / "state"


def api_get(article: str, **params) -> object:
    params["client_id"] = CLIENT_ID
    url = f"{API_BASE}/{article}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; swvsoest-website/1.0)"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def find_team_record(teams: list[dict], teamnaam: str) -> dict:
    """Zoekt de 'bond'-registratie van dit team op. Geeft bij voorkeur een
    registratie met poulecode terug (nodig voor de stand); zonder poule
    (bv. net na de zomerstop) valt terug op de eerste match."""
    matches = [t for t in teams if t.get("teamnaam") == teamnaam and t.get("teamsoort") == "bond"]
    if not matches:
        raise RuntimeError(f"Team '{teamnaam}' niet gevonden in teams-lijst.")
    with_poule = [t for t in matches if t.get("poulecode")]
    return (with_poule or matches)[0]


def fetch_programma(teamcode: int) -> list[dict]:
    return api_get("programma", teamcode=teamcode, aantaldagen=365, aantalregels=200, eigenwedstrijden="JA")


def fetch_uitslagen(teamcode: int) -> list[dict]:
    return api_get("uitslagen", teamcode=teamcode, eigenwedstrijden="JA")


def fetch_poulestand(poulecode: int) -> list[dict]:
    return api_get("poulestand", poulecode=poulecode)


def fetch_accommodatie(wedstrijdcode: int) -> dict:
    try:
        info = api_get("wedstrijd-informatie", wedstrijdcode=wedstrijdcode)
        return info.get("accommodatie") or {}
    except (urllib.error.URLError, KeyError, ValueError):
        return {}


def display_accommodatie(naam: str) -> str:
    return THUIS_CLUBNAAM if naam == THUIS_ACCOMMODATIE_KNVB else naam


def maps_url(naam: str, straat: str, plaats: str) -> str:
    query = ", ".join(p for p in [straat, plaats] if p) or naam
    if not query:
        return ""
    return "https://www.google.com/maps/search/?api=1&query=" + urllib.parse.quote(query)


THUIS_MAPS_URL = maps_url(THUIS_CLUBNAAM, THUIS_STRAAT, THUIS_PLAATS)


def load_json(pad: Path) -> dict:
    if pad.exists():
        return json.loads(pad.read_text())
    return {}


def save_json(pad: Path, data) -> None:
    pad.parent.mkdir(parents=True, exist_ok=True)
    pad.write_text(json.dumps(data, indent=2, ensure_ascii=False, sort_keys=True) + "\n")


def merge_state(state: dict, matches: list[dict], now_iso: str, teamnaam: str) -> dict:
    """Houdt per wedstrijdcode de laatst bekende gegevens bij, zodat een
    wedstrijd niet uit de agenda verdwijnt als hij (tijdelijk) buiten het
    programma-venster valt, bv. bij een fase/poulewissel."""
    for m in matches:
        uid = str(m["wedstrijdcode"])
        accommodatie = fetch_accommodatie(m["wedstrijdcode"])
        entry = state.get(uid, {})
        entry.update(
            {
                "wedstrijddatum": m["wedstrijddatum"],
                "thuisteam": m["thuisteam"],
                "uitteam": m["uitteam"],
                "accommodatie": m.get("accommodatie") or "",
                "veld": m.get("veld") or "",
                "plaats": m.get("plaats") or "",
                "straat": accommodatie.get("straat") or "",
                "adresplaats": accommodatie.get("plaats") or "",
                "status": m.get("status") or "",
                "wedstrijdnummer": m.get("wedstrijdnummer") or "",
                "verzameltijd": m.get("verzameltijd") or "",
                "vertrektijd": m.get("vertrektijd") or "",
                "scheidsrechter": m.get("scheidsrechter") or "",
                "eigenteam": teamnaam,
            }
        )
        entry["last_seen"] = now_iso
        entry.setdefault("first_seen", now_iso)
        state[uid] = entry
    return state


def ics_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace(",", "\\,").replace(";", "\\;").replace("\n", "\\n")


def ics_moment(prop: str, value: datetime) -> str:
    return f"{prop}:{value.astimezone(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"


def vevent(uid: str, dtstamp: str, start: datetime, end: datetime, summary: str, location: str = "",
           description: str = "", url: str = "", cancelled: bool = False) -> list[str]:
    lines = [
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{dtstamp}",
        ics_moment("DTSTART", start),
        ics_moment("DTEND", end),
        f"SUMMARY:{ics_escape(summary)}",
    ]
    if location:
        lines.append(f"LOCATION:{ics_escape(location)}")
    if description:
        lines.append(f"DESCRIPTION:{ics_escape(description)}")
    if url:
        lines.append(f"URL:{url}")
    if cancelled:
        lines.append("STATUS:CANCELLED")
    lines.append("END:VEVENT")
    return lines


def build_ics(slug: str, teamnaam: str, state: dict, now: datetime) -> str:
    cutoff = (now - timedelta(days=60)).date()
    dtstamp = now.astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        f"PRODID:-//swvsoest-website//{slug}//NL",
        "CALSCALE:GREGORIAN",
        f"X-WR-CALNAME:{teamnaam}",
    ]
    for uid, entry in sorted(state.items(), key=lambda kv: kv[1]["wedstrijddatum"]):
        kickoff = datetime.fromisoformat(entry["wedstrijddatum"]).astimezone(TZ_AMS)
        if kickoff.date() < cutoff:
            continue

        cancelled = bool(entry["status"]) and "afgelast" in entry["status"].lower()
        accommodatie_display = display_accommodatie(entry["accommodatie"])
        is_thuis_accommodatie = accommodatie_display == THUIS_CLUBNAAM
        if is_thuis_accommodatie:
            location = THUIS_ADRES_VOLLEDIG
            match_maps_url = THUIS_MAPS_URL
        else:
            location = accommodatie_display
            match_maps_url = maps_url(accommodatie_display, entry["straat"], entry["adresplaats"])

        is_thuis = entry["thuisteam"] == teamnaam
        richting = "THUIS" if is_thuis else "UIT"
        tegenstander = entry["uitteam"] if is_thuis else entry["thuisteam"]
        summary = f"[{richting}] {tegenstander}"
        if cancelled:
            summary = f"AFGELAST: {summary}"

        desc_parts = [
            f"Status: {entry['status']}" if entry["status"] else "",
            f"Veld: {entry['veld']}" if entry["veld"] else "",
            f"Plaats: {entry['plaats']}" if entry["plaats"] else "",
            f"Scheidsrechter: {entry['scheidsrechter']}" if entry["scheidsrechter"] else "",
            f"Wedstrijdnummer: {entry['wedstrijdnummer']}" if entry["wedstrijdnummer"] else "",
            f"Route: {match_maps_url}" if match_maps_url else "",
        ]
        description = "\n".join(p for p in desc_parts if p)

        gather_time = entry["verzameltijd"] if is_thuis else entry["vertrektijd"]
        if gather_time and not cancelled:
            vh, vm = (int(x) for x in gather_time.split(":"))
            gather_start = kickoff.replace(hour=vh, minute=vm, second=0, microsecond=0)
            if gather_start < kickoff:
                sublocatie = "kleedkamer" if is_thuis else "parkeerplaats"
                lines += vevent(
                    uid=f"{uid}-verzamelen@{UID_NAMESPACE}",
                    dtstamp=dtstamp,
                    start=gather_start,
                    end=kickoff,
                    summary=f"Verzamelen ({sublocatie}): [{richting}] {tegenstander}",
                    location=THUIS_ADRES_VOLLEDIG,
                    url=THUIS_MAPS_URL,
                )

        lines += vevent(
            uid=f"{uid}@{UID_NAMESPACE}",
            dtstamp=dtstamp,
            start=kickoff,
            end=kickoff + timedelta(minutes=90),
            summary=summary,
            location=location,
            description=description,
            url=match_maps_url,
            cancelled=cancelled,
        )

    lines.append("END:VCALENDAR")
    return "\r\n".join(lines) + "\r\n"


def sync_team(slug: str, teamnaam: str, teams: list[dict], now: datetime) -> dict:
    record = find_team_record(teams, teamnaam)
    teamcode = record["teamcode"]
    poulecode = record.get("poulecode")
    stand = fetch_poulestand(poulecode) if poulecode else []
    poule = {
        "poulecode": poulecode,
        "competitienaam": record.get("competitienaam"),
        "klasse": record.get("klasse"),
        "poule": record.get("poule"),
        "klassepoule": record.get("klassepoule"),
    } if poulecode else None

    programma = fetch_programma(teamcode)
    uitslagen = fetch_uitslagen(teamcode)
    print(f"[{slug}] teamcode {teamcode}: {len(programma)} programma, {len(uitslagen)} uitslagen, "
          f"stand {len(stand)} team(s)")

    save_json(DATA_DIR / f"{slug}.json", {
        "slug": slug,
        "teamnaam": teamnaam,
        "teamcode": teamcode,
        "updated_at": now.isoformat(),
        "programma": programma,
        "uitslagen": uitslagen,
        "poule": poule,
        "stand": stand,
    })

    state_path = STATE_DIR / f"{slug}.json"
    state = load_json(state_path)
    state = merge_state(state, programma, now.isoformat(), teamnaam)
    save_json(state_path, state)

    ics = build_ics(slug, teamnaam, state, now)
    ics_path = AGENDA_DIR / f"{slug}.ics"
    ics_path.parent.mkdir(parents=True, exist_ok=True)
    ics_path.write_text(ics)

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
