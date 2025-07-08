import json

# Load the data
with open('backend/pro/usl_league_one_players_api.json', 'r') as f:
    data = json.load(f)

# Extract unique nationalities and positions
nationalities = set()
positions = set()

# The data has a 'players' array
for player in data['players']:
    if 'profile' in player and 'playerProfile' in player['profile']:
        profile = player['profile']['playerProfile']
        
        # Get nationality
        if 'birthplaceCountry' in profile and profile['birthplaceCountry']:
            nationalities.add(profile['birthplaceCountry'])
        
        # Get position
        if 'playerMainPosition' in profile and profile['playerMainPosition']:
            positions.add(profile['playerMainPosition'])

print("Unique Nationalities:")
for nat in sorted(nationalities):
    print(f"  - {nat}")

print(f"\nTotal unique nationalities: {len(nationalities)}")

print("\nUnique Positions:")
for pos in sorted(positions):
    print(f"  - {pos}")

print(f"\nTotal unique positions: {len(positions)}") 