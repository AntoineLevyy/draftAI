import json

FILES = [
    ("backend/pro/national_league_players_api.json", "National League"),
    ("backend/pro/league_two_players_api.json", "League Two"),
    ("backend/pro/national_league_north_players_api.json", "National League North"),
    ("backend/pro/national_league_south_players_api.json", "National League South"),
]

def clean_file(path, default_league_name):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    # If data is a dict with 'players', use that; else assume it's a list
    players = data.get('players', data) if isinstance(data, dict) else data
    for player in players:
        # Try to copy from nested field if present
        league = (
            player.get('profile', {})
                  .get('playerProfile', {})
                  .get('league')
        )
        player['league'] = league if league else default_league_name
    # Save cleaned file (overwrite original)
    if isinstance(data, dict):
        data['players'] = players
        out = data
    else:
        out = players
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"Cleaned {len(players)} players in {path}")

for path, league in FILES:
    clean_file(path, league) 