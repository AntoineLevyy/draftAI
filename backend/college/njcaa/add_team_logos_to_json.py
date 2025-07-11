#!/usr/bin/env python3
"""
Add team logos to existing player JSON files
"""

import json
import os

def add_team_logos_to_json():
    # Load team logos mapping
    with open('team_logos.json', 'r') as f:
        team_logos = json.load(f)
    
    # Process each division
    divisions = ['njcaa_d1_players.json', 'njcaa_d2_players.json', 'njcaa_d3_players.json']
    
    for filename in divisions:
        if os.path.exists(filename):
            print(f"Processing {filename}...")
            
            # Load player data
            with open(filename, 'r') as f:
                players = json.load(f)
            
            # Add team_logo field to each player
            updated_count = 0
            for player in players:
                team_name = player.get('team')
                if team_name:
                    player['team_logo'] = team_logos.get(team_name)
                    updated_count += 1
                else:
                    player['team_logo'] = None
            
            # Save updated data
            with open(filename, 'w') as f:
                json.dump(players, f, indent=2, ensure_ascii=False)
            
            print(f"Updated {updated_count} players in {filename}")
        else:
            print(f"File {filename} not found")

if __name__ == "__main__":
    add_team_logos_to_json() 