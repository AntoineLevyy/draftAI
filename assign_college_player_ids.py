import json
import os
import random

# 1. Collect all pro player IDs
pro_files = [
    "backend/pro/cpl_players_api.json",
    "backend/pro/liga_mx_players_api.json",
    "backend/pro/mls_next_pro_players_api.json",
    "backend/pro/usl_championship_players_api.json",
    "backend/pro/andorra_players_api.json"
]
pro_ids = set()
for pro_file in pro_files:
    if not os.path.exists(pro_file):
        continue
    with open(pro_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        players = data.get("players", data)  # Some files may be a list, some a dict
        for player in players:
            # Try common id fields
            for key in ["id", "playerId", "playerID"]:
                pid = player.get(key)
                if pid:
                    pro_ids.add(str(pid))

# 2. Collect all existing college player IDs
college_files = [
    "backend/college/njcaa/njcaa_d1_players.json",
    "backend/college/njcaa/njcaa_d2_players.json",
    "backend/college/njcaa/njcaa_d3_players.json"
]
college_ids = set()
for college_file in college_files:
    if not os.path.exists(college_file):
        continue
    with open(college_file, "r", encoding="utf-8") as f:
        players = json.load(f)
        for player in players:
            pid = player.get("playerId")
            if pid:
                college_ids.add(str(pid))

# 3. Assign unique random IDs to college players missing them
def generate_unique_id():
    while True:
        new_id = str(random.randint(1000000, 9999999))
        if new_id not in pro_ids and new_id not in college_ids:
            college_ids.add(new_id)
            return new_id

for college_file in college_files:
    if not os.path.exists(college_file):
        continue
    with open(college_file, "r", encoding="utf-8") as f:
        players = json.load(f)
    changed = False
    for player in players:
        if not player.get("playerId"):
            player["playerId"] = generate_unique_id()
            changed = True
    if changed:
        with open(college_file, "w", encoding="utf-8") as f:
            json.dump(players, f, indent=2, ensure_ascii=False)
        print(f"Updated {college_file} with new unique playerIds.")

print("Done assigning unique playerIds to college players.") 