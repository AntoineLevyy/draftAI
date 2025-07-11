import json
import os
from pathlib import Path

def clean_player_data(player, league_name):
    """Clean player data to only include essential fields, restoring hometown from dataMap if present."""
    # Try to get hometown from top-level, then from dataMap, else N/A
    hometown = player.get("hometown")
    if not hometown or hometown in ("", "N/A"):
        hometown = player.get("dataMap", {}).get("hometown", "")
    if not hometown or hometown in ("", "N/A"):
        hometown = "N/A"

    cleaned = {
        # Basics
        "name": player.get("fullName", player.get("name", "")),
        "team": player.get("team", ""),
        "league": league_name,
        "position": player.get("position", ""),
        "year": player.get("year", ""),
        "height": player.get("height", player.get("dataMap", {}).get("height", "")),
        "weight": player.get("weight", player.get("dataMap", {}).get("weight", "")),
        "hometown": hometown,
        "photo_url": player.get("photo_url", ""),
        # Season stats
        "goals": player.get("stats", {}).get("gol", player.get("goals", "0")),
        "assists": player.get("stats", {}).get("ast", player.get("assists", "0")),
        "points": player.get("stats", {}).get("pts", player.get("points", "0")),
        "games": player.get("stats", {}).get("gp", player.get("games", "0")),
        "games_started": player.get("stats", {}).get("gs", player.get("games_started", "0")),
        "minutes": player.get("stats", {}).get("min", player.get("minutes", "0")),
    }
    return cleaned

def clean_json_file(file_path, league_name):
    """Clean a single JSON file"""
    print(f"Cleaning {file_path}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if isinstance(data, list):
            cleaned_data = [clean_player_data(player, league_name) for player in data]
        else:
            cleaned_data = clean_player_data(data, league_name)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(cleaned_data, f, indent=2, ensure_ascii=False)
        print(f"✓ Cleaned {file_path} - {len(cleaned_data) if isinstance(cleaned_data, list) else 1} players")
    except Exception as e:
        print(f"✗ Error cleaning {file_path}: {e}")

def main():
    json_files = [
        ("backend/college/njcaa/njcaa_d1_players.json", "NJCAA D1"),
        ("backend/college/njcaa/njcaa_d2_players.json", "NJCAA D2"),
        ("backend/college/njcaa/njcaa_d3_players.json", "NJCAA D3"),
    ]
    print("Cleaning JSON files to include only essential fields and restore hometown...")
    print("Essential fields: name, team, league, position, year, height, weight, hometown, photo_url")
    print("Stats: goals, assists, points, games, games_started, minutes")
    print()
    for file_path, league_name in json_files:
        if os.path.exists(file_path):
            clean_json_file(file_path, league_name)
        else:
            print(f"⚠ File not found: {file_path}")
    print("\n✅ All JSON files cleaned!")

if __name__ == "__main__":
    main() 