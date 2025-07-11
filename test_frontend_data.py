#!/usr/bin/env python3
"""
Test script to verify the cleaned JSON structure and simulate frontend data reading.
"""

import json
import requests

def test_api_response():
    """Test the API response to ensure it returns the cleaned structure."""
    try:
        response = requests.get('http://localhost:5001/api/players')
        if response.status_code == 200:
            data = response.json()
            players = data.get('players', [])
            
            if players:
                # Test the first player to ensure it has the correct structure
                first_player = players[0]
                print("✅ API is responding correctly")
                print(f"Total players: {len(players)}")
                print(f"First player structure:")
                print(f"  name: {first_player.get('name')}")
                print(f"  team: {first_player.get('team')}")
                print(f"  league: {first_player.get('league')}")
                print(f"  position: {first_player.get('position')}")
                print(f"  year: {first_player.get('year')}")
                print(f"  height: {first_player.get('height')}")
                print(f"  weight: {first_player.get('weight')}")
                print(f"  hometown: {first_player.get('hometown')}")
                print(f"  photo_url: {first_player.get('photo_url')}")
                print(f"  goals: {first_player.get('goals')}")
                print(f"  assists: {first_player.get('assists')}")
                print(f"  points: {first_player.get('points')}")
                print(f"  games: {first_player.get('games')}")
                print(f"  games_started: {first_player.get('games_started')}")
                print(f"  minutes: {first_player.get('minutes')}")
                
                # Check for NJCAA players specifically
                njcaa_players = [p for p in players if p.get('league', '').startswith('NJCAA')]
                print(f"\n✅ Found {len(njcaa_players)} NJCAA players")
                
                # Check for Juan Jose Montoya specifically
                juan_jose = next((p for p in njcaa_players if p.get('name') == 'Juan Jose Montoya'), None)
                if juan_jose:
                    print(f"✅ Found Juan Jose Montoya:")
                    print(f"  photo_url: {juan_jose.get('photo_url')}")
                    print(f"  hometown: {juan_jose.get('hometown')}")
                else:
                    print("❌ Juan Jose Montoya not found in NJCAA players")
                
                return True
            else:
                print("❌ No players found in API response")
                return False
        else:
            print(f"❌ API returned status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing API: {e}")
        return False

def test_college_json_files():
    """Test the cleaned college JSON files directly."""
    files = [
        'backend/college/njcaa/njcaa_d1_players.json',
        'backend/college/njcaa/njcaa_d2_players.json',
        'backend/college/njcaa/njcaa_d3_players.json'
    ]
    
    for file_path in files:
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            if data and len(data) > 0:
                first_player = data[0]
                print(f"\n✅ {file_path}:")
                print(f"  Players: {len(data)}")
                print(f"  Sample player fields: {list(first_player.keys())}")
                
                # Check if all required fields are present
                required_fields = ['name', 'team', 'league', 'position', 'year', 'height', 'weight', 'hometown', 'photo_url', 'goals', 'assists', 'points', 'games', 'games_started', 'minutes']
                missing_fields = [field for field in required_fields if field not in first_player]
                
                if missing_fields:
                    print(f"  ❌ Missing fields: {missing_fields}")
                else:
                    print(f"  ✅ All required fields present")
                    
            else:
                print(f"❌ {file_path}: No data found")
                
        except Exception as e:
            print(f"❌ Error reading {file_path}: {e}")

if __name__ == "__main__":
    print("Testing cleaned JSON structure and API response...")
    print("=" * 50)
    
    test_college_json_files()
    print("\n" + "=" * 50)
    test_api_response() 