#!/usr/bin/env python3
"""
National League (England 5th Tier) Player Data Scraper using Transfermarkt API
"""

import requests
import json
import time
from typing import Dict, List, Optional
import os

class NationalLeagueAPIScraper:
    def __init__(self):
        self.api_key = "3239a3729emsha33e79a3ad07beep1b4d22jsn57e37ca1df6f"
        self.host = "transfermarkt6.p.rapidapi.com"
        self.season_id = "2024"
        
        # National League configuration
        self.league_config = {
            "id": "CNAT",
            "name": "National League",
            "short_name": "National League"
        }
        
    def _make_api_request(self, endpoint: str) -> dict:
        try:
            url = f"https://{self.host}{endpoint}"
            headers = {
                'x-rapidapi-key': self.api_key,
                'x-rapidapi-host': self.host
            }
            response = requests.get(url, headers=headers, timeout=60)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error making API request to {endpoint}: {e}")
            return {"status": False, "message": str(e)}

    def get_competition_info(self) -> dict:
        endpoint = f"/competitions/info?id={self.league_config['id']}"
        return self._make_api_request(endpoint)

    def get_clubs(self) -> list:
        endpoint = f"/competitions/clubs?id={self.league_config['id']}"
        response = self._make_api_request(endpoint)
        if response.get("status") and "data" in response:
            return response["data"].get("clubs", [])
        return []

    def get_players_performance(self) -> list:
        endpoint = f"/competitions/players-performance?id={self.league_config['id']}&seasonId={self.season_id}"
        response = self._make_api_request(endpoint)
        if response.get("status") and "data" in response:
            return response["data"].get("player", [])
        return []

    def get_player_profile(self, player_id: str) -> dict:
        endpoint = f"/players/profile?id={player_id}"
        data = self._make_api_request(endpoint)
        return data if data else {}

    def get_player_performance_summary(self, player_id: str) -> dict:
        endpoint = f"/players/performance?id={player_id}"
        data = self._make_api_request(endpoint)
        return data if data else {}

    def scrape_national_league_players(self, include_detailed_stats: bool = True) -> list:
        print(f"Starting {self.league_config['name']} player data collection...")
        # Get competition info
        print(f"Getting {self.league_config['name']} competition information...")
        competition_info = self.get_competition_info()
        if not competition_info.get("status"):
            print(f"Failed to get competition info: {competition_info.get('message')}")
            return []
        # Get clubs (will fail, so skip or set to empty)
        print(f"Getting {self.league_config['name']} clubs...")
        clubs = []
        print(f"Found {len(clubs)} clubs in {self.league_config['name']}")
        club_lookup = {}
        # Get all players performance data
        print(f"Getting {self.league_config['name']} players performance data...")
        players_performance = self.get_players_performance()
        print(f"Found {len(players_performance)} players in {self.league_config['name']}")
        all_players = []
        for i, player_perf in enumerate(players_performance):
            player_id = player_perf["id"]
            club_id = player_perf.get("clubID", "")
            print(f"Processing {self.league_config['name']} player {i+1}/{len(players_performance)}: ID {player_id}")
            # Get player profile
            profile_response = self.get_player_profile(player_id)
            player_data = {
                "id": player_id,
                "club_id": club_id,
                "club": club_lookup.get(club_id, {}),
                "performance": player_perf,
                "profile": {},
                "detailed_stats": {},
                "league": "National League"
            }
            if profile_response.get("status") and "data" in profile_response:
                player_data["profile"] = profile_response["data"]
            # Get detailed performance stats if requested
            if include_detailed_stats:
                perf_response = self.get_player_performance_summary(player_id) # Changed to get_player_performance
                if perf_response.get("status") and "data" in perf_response:
                    player_data["detailed_stats"] = perf_response["data"]
            all_players.append(player_data)
            time.sleep(0.1)
        return all_players

    def save(self, data: dict, out_path: str):
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {out_path}")


def main():
    scraper = NationalLeagueAPIScraper()
    data = scraper.scrape_national_league_players() # Changed to scrape_national_league_players
    scraper.save(data, "backend/pro/national_league_players_api.json")
    print(f"Total players in National League: {len(data)}") # Changed to len(data)
    print("National League scraping completed!")

if __name__ == "__main__":
    main() 