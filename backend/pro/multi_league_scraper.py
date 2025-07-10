#!/usr/bin/env python3
"""
Multi-League Player Data Scraper using Transfermarkt API
Supports USL Championship, USL League One, and MLS Next Pro
"""

import requests
import json
import time
from typing import Dict, List, Optional
import os

class MultiLeagueAPIScraper:
    def __init__(self):
        self.api_key = "3239a3729emsha33e79a3ad07beep1b4d22jsn57e37ca1df6f"
        self.host = "transfermarkt6.p.rapidapi.com"
        self.season_id = "2024"
        
        # League configurations
        self.leagues = {
            "USL Championship": {
                "id": "USL",
                "name": "USL Championship",
                "short_name": "USLC"
            },
            
            "USL League One": {
                "id": "USC3",
                "name": "USL League One",
                "short_name": "USL1"
            },
            
            "MLS Next Pro": {
                "id": "MNP3", 
                "name": "MLS Next Pro",
                "short_name": "MLSNP"
            },
            
            "Canadian Premier League": {
                "id": "CDN1",
                "name": "Canadian Premier League",
                "short_name": "CPL"
            },
            
            "Liga MX Apertura": {
                "id": "MEXA",
                "name": "Liga MX Apertura",
                "short_name": "Liga MX"
            }
        }
        
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
    
    def get_competition_info(self, league_id: str) -> Dict:
        """Get competition information"""
        endpoint = f"/competitions/info?id={league_id}"
        return self._make_api_request(endpoint)
    
    def get_clubs(self, league_id: str) -> List[Dict]:
        """Get all clubs in a league"""
        endpoint = f"/competitions/clubs?id={league_id}"
        response = self._make_api_request(endpoint)
        
        if response.get("status") and "data" in response:
            return response["data"].get("clubs", [])
        return []
    
    def get_players_performance(self, league_id: str) -> List[Dict]:
        """Get all players' performance data for the current season"""
        endpoint = f"/competitions/players-performance?id={league_id}&seasonId={self.season_id}"
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
    
    def scrape_league_players(self, league_name: str, include_detailed_stats: bool = True) -> List[Dict]:
        """
        Scrape comprehensive data for all players in a specific league
        
        Args:
            league_name: Name of the league (must be in self.leagues)
            include_detailed_stats: Whether to include detailed performance stats
        
        Returns:
            List of player data dictionaries
        """
        if league_name not in self.leagues:
            print(f"Unknown league: {league_name}")
            return []
        
        league_config = self.leagues[league_name]
        league_id = league_config["id"]
        
        print(f"Starting {league_name} player data collection...")
        
        # Get competition info
        print(f"Getting {league_name} competition information...")
        competition_info = self.get_competition_info(league_id)
        if not competition_info.get("status"):
            print(f"Failed to get competition info: {competition_info.get('message')}")
            return []
        
        # Get clubs
        print(f"Getting {league_name} clubs...")
        clubs = self.get_clubs(league_id)
        print(f"Found {len(clubs)} clubs in {league_name}")
        
        # Create club lookup
        club_lookup = {club["id"]: club for club in clubs}
        
        # Get all players performance data
        print(f"Getting {league_name} players performance data...")
        players_performance = self.get_players_performance(league_id)
        print(f"Found {len(players_performance)} players in {league_name}")
        
        all_players = []
        
        for i, player_perf in enumerate(players_performance):
            player_id = player_perf["id"]
            club_id = player_perf["clubID"]
            
            print(f"Processing {league_name} player {i+1}/{len(players_performance)}: ID {player_id}")
            
            # Get player profile
            profile_response = self.get_player_profile(player_id)
            player_data = {
                "id": player_id,
                "club_id": club_id,
                "club": club_lookup.get(club_id, {}),
                "performance": player_perf,
                "profile": {},
                "detailed_stats": {},
                "league": league_config
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
    
    def scrape_all_leagues(self, leagues_to_scrape: List[str] = None, include_detailed_stats: bool = True) -> Dict[str, List[Dict]]:
        """
        Scrape data for multiple leagues
        
        Args:
            leagues_to_scrape: List of league names to scrape (default: all leagues)
            include_detailed_stats: Whether to include detailed performance stats
        
        Returns:
            Dictionary with league names as keys and player lists as values
        """
        if leagues_to_scrape is None:
            leagues_to_scrape = list(self.leagues.keys())
        
        all_data = {}
        
        for league_name in leagues_to_scrape:
            if league_name in self.leagues:
                players = self.scrape_league_players(league_name, include_detailed_stats)
                all_data[league_name] = players
                print(f"Completed scraping {league_name}: {len(players)} players")
            else:
                print(f"Skipping unknown league: {league_name}")
        
        return all_data
    
    def save_league_data(self, league_name: str, players: List[Dict], filename: str = None):
        """Save player data for a specific league to JSON file"""
        if filename is None:
            filename = f"{league_name.lower().replace(' ', '_')}_players_api.json"
        
        data = {
            "metadata": {
                "league": league_name,
                "league_id": self.leagues[league_name]["id"],
                "season": self.season_id,
                "total_players": len(players),
                "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S")
            },
            "players": players
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"Data saved to {filename}")
        print(f"Total players in {league_name}: {len(players)}")
    
    def save_combined_data(self, all_data: Dict[str, List[Dict]], filename: str = "all_leagues_players_api.json"):
        """Save combined data from all leagues to a single JSON file"""
        all_players = []
        total_players = 0
        
        for league_name, players in all_data.items():
            total_players += len(players)
            all_players.extend(players)
        
        data = {
            "metadata": {
                "leagues": list(all_data.keys()),
                "season": self.season_id,
                "total_players": total_players,
                "players_per_league": {league: len(players) for league, players in all_data.items()},
                "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S")
            },
            "players": all_players
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"Combined data saved to {filename}")
        print(f"Total players across all leagues: {total_players}")
        for league, count in data["metadata"]["players_per_league"].items():
            print(f"  {league}: {count} players")

def main():
    """Main function to run the scraper"""
    scraper = MultiLeagueAPIScraper()
    
    # Scrape both leagues
    print("Starting multi-league player data collection...")
    all_data = scraper.scrape_all_leagues()
    
    # Save individual league data
    for league_name, players in all_data.items():
        scraper.save_league_data(league_name, players)
    
    # Save combined data
    scraper.save_combined_data(all_data)
    
    print("Multi-league scraping completed!")

if __name__ == "__main__":
    main() 