#!/usr/bin/env python3
"""
MLS Next Pro Player Data Scraper using Transfermarkt API
"""

import requests
import json
import time
from typing import Dict, List, Optional
import os

class MLSNextProAPIScraper:
    def __init__(self):
        self.api_key = "3239a3729emsha33e79a3ad07beep1b4d22jsn57e37ca1df6f"
        self.host = "transfermarkt6.p.rapidapi.com"
        self.competition_id = "MNP3"  # MLS Next Pro
        self.season_id = "2024"
        
    def _make_api_request(self, endpoint: str) -> Dict:
        """Make an API request to Transfermarkt"""
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
    
    def get_competition_info(self) -> Dict:
        """Get MLS Next Pro competition information"""
        endpoint = f"/competitions/info?id={self.competition_id}"
        return self._make_api_request(endpoint)
    
    def get_clubs(self) -> List[Dict]:
        """Get all clubs in MLS Next Pro"""
        endpoint = f"/competitions/clubs?id={self.competition_id}"
        response = self._make_api_request(endpoint)
        
        if response.get("status") and "data" in response:
            return response["data"].get("clubs", [])
        return []
    
    def get_players_performance(self) -> List[Dict]:
        """Get all players' performance data for the current season"""
        endpoint = f"/competitions/players-performance?id={self.competition_id}&seasonId={self.season_id}"
        response = self._make_api_request(endpoint)
        
        if response.get("status") and "data" in response:
            return response["data"].get("player", [])
        return []
    
    def get_player_profile(self, player_id: str) -> Dict:
        """Get detailed player profile information"""
        endpoint = f"/players/profile?id={player_id}"
        return self._make_api_request(endpoint)
    
    def get_player_performance_summary(self, player_id: str) -> Dict:
        """Get overall performance summary for a player"""
        endpoint = f"/players/performance?id={player_id}"
        return self._make_api_request(endpoint)
    
    def save_progressive_data(self, players: List[Dict], filename: str = "mls_next_pro_players_api.json"):
        """Save player data progressively to JSON file"""
        data = {
            "metadata": {
                "competition": "MLS Next Pro",
                "competition_id": self.competition_id,
                "season": self.season_id,
                "total_players": len(players),
                "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "status": "in_progress"
            },
            "players": players
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"Progressive save: {len(players)} players saved to {filename}")
    
    def scrape_all_players(self, include_detailed_stats: bool = True) -> List[Dict]:
        """
        Scrape comprehensive data for all MLS Next Pro players
        
        Args:
            include_detailed_stats: Whether to include detailed performance stats
        
        Returns:
            List of player data dictionaries
        """
        print("Starting MLS Next Pro player data collection...")
        
        # Get competition info
        print("Getting competition information...")
        competition_info = self.get_competition_info()
        if not competition_info.get("status"):
            print(f"Failed to get competition info: {competition_info.get('message')}")
            return []
        
        # Get clubs
        print("Getting clubs...")
        clubs = self.get_clubs()
        print(f"Found {len(clubs)} clubs")
        
        # Create club lookup
        club_lookup = {club["id"]: club for club in clubs}
        
        # Get all players performance data
        print("Getting players performance data...")
        players_performance = self.get_players_performance()
        print(f"Found {len(players_performance)} players")
        
        all_players = []
        
        for i, player_perf in enumerate(players_performance):
            player_id = player_perf["id"]
            club_id = player_perf["clubID"]
            
            print(f"Processing player {i+1}/{len(players_performance)}: ID {player_id}")
            
            # Get player profile
            profile_response = self.get_player_profile(player_id)
            player_data = {
                "id": player_id,
                "club_id": club_id,
                "club": club_lookup.get(club_id, {}),
                "performance": player_perf,
                "profile": {},
                "detailed_stats": {},
                "league": {
                    "id": self.competition_id,
                    "name": "MLS Next Pro",
                    "short_name": "MLSNP"
                }
            }
            
            if profile_response.get("status") and "data" in profile_response:
                player_data["profile"] = profile_response["data"]
            
            # Get detailed performance stats if requested
            if include_detailed_stats:
                perf_response = self.get_player_performance_summary(player_id)
                if perf_response.get("status") and "data" in perf_response:
                    player_data["detailed_stats"] = perf_response["data"]
            
            all_players.append(player_data)
            
            # Save progressively every 10 players
            if (i + 1) % 10 == 0:
                self.save_progressive_data(all_players)
            
            # Rate limiting - be nice to the API
            time.sleep(0.1)
        
        # Final save
        self.save_final_data(all_players)
        return all_players
    
    def save_final_data(self, players: List[Dict], filename: str = "mls_next_pro_players_api.json"):
        """Save final player data to JSON file"""
        data = {
            "metadata": {
                "competition": "MLS Next Pro",
                "competition_id": self.competition_id,
                "season": self.season_id,
                "total_players": len(players),
                "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "status": "completed"
            },
            "players": players
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"Final data saved to {filename}")
        print(f"Total players: {len(players)}")

def main():
    """Main function to run the scraper"""
    scraper = MLSNextProAPIScraper()
    
    # Scrape all players
    players = scraper.scrape_all_players()
    
    print("MLS Next Pro scraping completed!")

if __name__ == "__main__":
    main() 