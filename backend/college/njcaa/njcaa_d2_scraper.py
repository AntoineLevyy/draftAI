import requests
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

NJCAA_D2_JSON_URL = "https://prestosports-downloads.s3.us-west-2.amazonaws.com/playersData/2z2f9p1u4jstfy8j.json"
OUTPUT_FILE = "njcaa_d2_players.json"


def fetch_njcaa_d2_players():
    logger.info(f"Downloading NJCAA D2 players JSON from {NJCAA_D2_JSON_URL}")
    resp = requests.get(NJCAA_D2_JSON_URL)
    resp.raise_for_status()
    data = resp.json()
    players = data.get("individuals", [])
    logger.info(f"Found {len(players)} D2 players.")
    results = []
    for p in players:
        player = {
            "firstName": p.get("firstName"),
            "lastName": p.get("lastName"),
            "fullName": p.get("fullName"),
            "team": p.get("team"),
            "teamId": p.get("teamId"),
            "playerId": p.get("playerId"),
            "position": p.get("position"),
            "positionAbbreviation": p.get("positionAbbreviation"),
            "year": p.get("year"),
            "stats": p.get("stats", {}),
            "statsConference": p.get("statsConference", {}),
            "dataMap": p.get("dataMap", {}),
            "uniform": p.get("uniform"),
            "region": p.get("region"),
            "conference": p.get("conference"),
            "dob": p.get("dob"),
            "active": p.get("active"),
            "playerStatus": p.get("playerStatus", {}),
            "eventCount": p.get("eventCount"),
            "lastUpdated": p.get("lastUpdated"),
        }
        results.append(player)
    logger.info(f"Saving {len(results)} D2 players to {OUTPUT_FILE}")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    logger.info("Done.")

if __name__ == "__main__":
    fetch_njcaa_d2_players() 