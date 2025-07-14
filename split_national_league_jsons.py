import json

INPUT = 'backend/pro/national_league_players_api.json'
OUTPUTS = {
    'National League': 'backend/pro/national_league_players_api.json',
    'National League South': 'backend/pro/national_league_south_players_api.json',
    'National League North': 'backend/pro/national_league_north_players_api.json',
}

with open(INPUT, 'r', encoding='utf-8') as f:
    players = json.load(f)

split = {k: [] for k in OUTPUTS}
for player in players:
    # Use nested league value if available
    league = (
        player.get('profile', {})
              .get('playerProfile', {})
              .get('league', '')
              .strip()
    )
    if league in split:
        player['league'] = league  # set top-level league string
        split[league].append(player)

# Write each league to its own file
for league, path in OUTPUTS.items():
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(split[league], f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(split[league])} players to {path}") 