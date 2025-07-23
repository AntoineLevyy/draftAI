import json
import os

PLAYER_FILE = "male_club_players.json"
COACH_FILE = "coaches_for_players.json"
OUTPUT_FILE = "highschool_players.json"

# Load players
with open(PLAYER_FILE, "r") as f:
    players = json.load(f)

# Load coaches
with open(COACH_FILE, "r") as f:
    coaches = json.load(f)

# Build a lookup for coach info
coach_lookup = {}
for coach in coaches:
    key = (coach["name"].strip().lower(), coach["club"].strip().lower(), str(coach["grad_year"]))
    coach_lookup[key] = coach.get("coach_info")

# Merge coach info into players
for player in players:
    key = (player["name"].strip().lower(), player["club"].strip().lower(), str(player["grad_year"]))
    player["coach_info"] = coach_lookup.get(key, None)

# Write merged output
with open(OUTPUT_FILE, "w") as f:
    json.dump(players, f, indent=2)

print(f"Merged {len(players)} players with coach info into {OUTPUT_FILE}") 