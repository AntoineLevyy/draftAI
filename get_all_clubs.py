#!/usr/bin/env python3
import json

def get_unique_clubs(json_file):
    """Extract unique club names from a JSON file."""
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    clubs = set()
    for player in data:
        if 'team' in player and player['team']:
            clubs.add(player['team'].strip())
    
    return clubs

# Get clubs from all three divisions
d1_clubs = get_unique_clubs('backend/pro/chunks/njcaa_d1_players.json')
d2_clubs = get_unique_clubs('backend/pro/chunks/njcaa_d2_players.json')
d3_clubs = get_unique_clubs('backend/pro/chunks/njcaa_d3_players.json')

# Combine all clubs
all_clubs = d1_clubs | d2_clubs | d3_clubs

print(f"NJCAA D1: {len(d1_clubs)} clubs")
print(f"NJCAA D2: {len(d2_clubs)} clubs")
print(f"NJCAA D3: {len(d3_clubs)} clubs")
print(f"Total unique clubs across all divisions: {len(all_clubs)}")

print("\nAll clubs (alphabetical):")
for club in sorted(all_clubs):
    print(f"  - {club}") 