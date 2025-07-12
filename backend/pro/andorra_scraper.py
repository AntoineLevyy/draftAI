#!/usr/bin/env python3
"""
Primera Divisió (Andorra) Player Data Scraper using Transfermarkt API
"""

import requests
import json
import time
from typing import Dict, List, Optional
import os

class AndorraAPIScraper:
    def __init__(self):
        self.api_key = "3239a3729emsha33e79a3ad07beep1b4d22jsn57e37ca1df6f"
        self.host = "transfermarkt6.p.rapidapi.com"
        self.season_id = "2024"
        self.league_id = "AND1"  # Primera Divisió (Andorra)
        
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
        """Get competition information"""
        endpoint = f"/competitions/info?id={self.league_id}"
        return self._make_api_request(endpoint)
    
    def get_clubs(self) -> List[Dict]:
        """Get all clubs in the league"""
        endpoint = f"/competitions/clubs?id={self.league_id}"
        response = self._make_api_request(endpoint)
        
        if response.get("status") and "data" in response:
            return response["data"].get("clubs", [])
        return []
    
    def get_players_performance(self) -> List[Dict]:
        """Get all players' performance data for the current season"""
        endpoint = f"/competitions/players-performance?id={self.league_id}&seasonId={self.season_id}"
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
    
    def scrape_league_players(self, include_detailed_stats: bool = True) -> List[Dict]:
        """
        Scrape comprehensive data for all players in Primera Divisió
        
        Args:
            include_detailed_stats: Whether to include detailed performance stats
        
        Returns:
            List of player data dictionaries
        """
        print("Starting Primera Divisió (Andorra) player data collection...")
        
        # Get competition info
        print("Getting Primera Divisió competition information...")
        competition_info = self.get_competition_info()
        if not competition_info.get("status"):
            print(f"Failed to get competition info: {competition_info.get('message')}")
            return []
        
        # Get clubs
        print("Getting Primera Divisió clubs...")
        clubs = self.get_clubs()
        print(f"Found {len(clubs)} clubs in Primera Divisió")
        
        # Create club lookup
        club_lookup = {club["id"]: club for club in clubs}
        
        # Get all players performance data
        print("Getting Primera Divisió players performance data...")
        players_performance = self.get_players_performance()
        print(f"Found {len(players_performance)} players in Primera Divisió")
        
        all_players = []
        
        for i, player_perf in enumerate(players_performance):
            player_id = player_perf["id"]
            club_id = player_perf["clubID"]
            
            print(f"Processing Primera Divisió player {i+1}/{len(players_performance)}: ID {player_id}")
            
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
                    "id": self.league_id,
                    "name": "Primera Divisió",
                    "short_name": "Primera Divisió"
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
            
            # Rate limiting - be nice to the API
            time.sleep(0.1)
        
        return all_players
    
    def save_league_data(self, players: List[Dict], filename: str = "andorra_players_api.json"):
        """Save league data to JSON file"""
        output_data = {
            "league": "Primera Divisió",
            "country": "Andorra",
            "season": "2024",
            "total_players": len(players),
            "players": players
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        print(f"Saved {len(players)} players to {filename}")
    
    def generate_summary_stats(self, players: List[Dict]) -> Dict:
        """Generate summary statistics for the league"""
        if not players:
            return {}
        
        # Position distribution
        positions = {}
        nationalities = {}
        clubs = {}
        
        for player in players:
            # Position
            position = player.get("profile", {}).get("playerProfile", {}).get("position", "Unknown")
            positions[position] = positions.get(position, 0) + 1
            
            # Nationality
            nationality = player.get("profile", {}).get("playerProfile", {}).get("nationality", "Unknown")
            nationalities[nationality] = nationalities.get(nationality, 0) + 1
            
            # Club
            club_name = player.get("club", {}).get("name", "Unknown")
            clubs[club_name] = clubs.get(club_name, 0) + 1
        
        return {
            "total_players": len(players),
            "positions": positions,
            "nationalities": nationalities,
            "clubs": clubs
        }

def main():
    """Main function to run the scraper"""
    scraper = AndorraAPIScraper()
    
    # Scrape all players
    players = scraper.scrape_league_players(include_detailed_stats=True)
    
    if players:
        # Save the data
        scraper.save_league_data(players)
        
        # Generate and save summary stats
        summary_stats = scraper.generate_summary_stats(players)
        with open("andorra_summary_stats.json", 'w', encoding='utf-8') as f:
            json.dump(summary_stats, f, ensure_ascii=False, indent=2)
        
        print(f"Successfully scraped {len(players)} players from Primera Divisió")
        print("Summary stats saved to andorra_summary_stats.json")
    else:
        print("No players found or error occurred during scraping")

if __name__ == "__main__":
    main() 