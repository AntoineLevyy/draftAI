import json

INPUT = 'backend/pro/efbet_liga_players_api.json'
OUTPUT = 'backend/pro/efbet_liga_players_api.json'

with open(INPUT, 'r', encoding='utf-8') as f:
    data = json.load(f)

players = data.get('players', [])
for player in players:
    # Set top-level league field
    player['league'] = 'Efbet Liga'
    # Remove nested league object if present
    if 'league' in player and isinstance(player['league'], dict):
        del player['league']
        player['league'] = 'Efbet Liga'

# Save cleaned file (overwrite original)
with open(OUTPUT, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Cleaned {len(players)} players in {OUTPUT}") 