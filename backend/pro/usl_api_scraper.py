#!/usr/bin/env python3
"""
USL League One Player Data Scraper using Transfermarkt API
"""

import requests
import json
import time
from typing import Dict, List, Optional
import os

class USLAPIScraper:
    def __init__(self):
        self.api_key = "3239a3729emsha33e79a3ad07beep1b4d22jsn57e37ca1df6f"
        self.host = "transfermarkt6.p.rapidapi.com"
        self.competition_id = "USC3"  # USL League One
        self.season_id = "2024"
        
    def _make_api_request(self, endpoint: str) -> Dict:
        """Make an API request to Transfermarkt"""
        try:
            url = f"https://{self.host}{endpoint}"
            headers = {
                'x-rapidapi-key': self.api_key,
                'x-rapidapi-host': self.host
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            return response.json()
        except Exception as e:
            print(f"Error making API request to {endpoint}: {e}")
            return {"status": False, "message": str(e)}
    
    def get_competition_info(self) -> Dict:
        """Get USL League One competition information"""
        endpoint = f"/competitions/info?id={self.competition_id}"
        return self._make_api_request(endpoint)
    
    def get_clubs(self) -> List[Dict]:
        """Get all clubs in USL League One"""
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
    
    def get_player_performance_details(self, player_id: str) -> Dict:
        """Get detailed match-by-match performance data for a player"""
        endpoint = f"/players/performance-details?id={player_id}&seasonId={self.season_id}&competitionId={self.competition_id}"
        return self._make_api_request(endpoint)
    
    def get_player_performance_summary(self, player_id: str) -> Dict:
        """Get overall performance summary for a player"""
        endpoint = f"/players/performance?id={player_id}"
        return self._make_api_request(endpoint)
    
    def scrape_all_players(self, include_detailed_stats: bool = True, include_match_details: bool = False) -> List[Dict]:
        """
        Scrape comprehensive data for all USL League One players
        
        Args:
            include_detailed_stats: Whether to include detailed performance stats
            include_match_details: Whether to include match-by-match details (slower)
        
        Returns:
            List of player data dictionaries
        """
        print("Starting USL League One player data collection...")
        
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
                "match_details": []
            }
            
            if profile_response.get("status") and "data" in profile_response:
                player_data["profile"] = profile_response["data"]
            
            # Get detailed performance stats if requested
            if include_detailed_stats:
                perf_response = self.get_player_performance_summary(player_id)
                if perf_response.get("status") and "data" in perf_response:
                    player_data["detailed_stats"] = perf_response["data"]
            
            # Get match-by-match details if requested (this is slower)
            if include_match_details:
                match_response = self.get_player_performance_details(player_id)
                if match_response.get("status") and "data" in match_response:
                    player_data["match_details"] = match_response["data"]
            
            all_players.append(player_data)
            
            # Rate limiting - be nice to the API
            time.sleep(0.1)
        
        return all_players
    
    def save_data(self, players: List[Dict], filename: str = "usl_league_one_players_api.json"):
        """Save player data to JSON file"""
        data = {
            "metadata": {
                "competition": "USL League One",
                "competition_id": self.competition_id,
                "season": self.season_id,
                "total_players": len(players),
                "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S")
            },
            "players": players
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"Data saved to {filename}")
        print(f"Total players: {len(players)}")
    
    def get_player_summary_stats(self, players: List[Dict]) -> Dict:
        """Generate summary statistics from the collected data"""
        if not players:
            return {}
        
        total_players = len(players)
        total_goals = sum(p["performance"].get("goals", 0) for p in players)
        total_assists = sum(p["performance"].get("assists", 0) for p in players)
        total_matches = sum(p["performance"].get("matches", 0) for p in players)
        total_minutes = sum(p["performance"].get("minutesPlayed", 0) for p in players)
        
        # Top scorers
        top_scorers = sorted(players, key=lambda x: x["performance"].get("goals", 0), reverse=True)[:10]
        
        # Top assist providers
        top_assists = sorted(players, key=lambda x: x["performance"].get("assists", 0), reverse=True)[:10]
        
        # Most minutes played
        most_minutes = sorted(players, key=lambda x: x["performance"].get("minutesPlayed", 0), reverse=True)[:10]
        
        return {
            "total_players": total_players,
            "total_goals": total_goals,
            "total_assists": total_assists,
            "total_matches": total_matches,
            "total_minutes": total_minutes,
            "avg_goals_per_player": total_goals / total_players if total_players > 0 else 0,
            "avg_assists_per_player": total_assists / total_players if total_players > 0 else 0,
            "top_scorers": [
                {
                    "id": p["id"],
                    "name": p["profile"].get("name", "Unknown"),
                    "club": p["club"].get("name", "Unknown"),
                    "goals": p["performance"].get("goals", 0),
                    "assists": p["performance"].get("assists", 0),
                    "matches": p["performance"].get("matches", 0)
                } for p in top_scorers
            ],
            "top_assists": [
                {
                    "id": p["id"],
                    "name": p["profile"].get("name", "Unknown"),
                    "club": p["club"].get("name", "Unknown"),
                    "goals": p["performance"].get("goals", 0),
                    "assists": p["performance"].get("assists", 0),
                    "matches": p["performance"].get("matches", 0)
                } for p in top_assists
            ],
            "most_minutes": [
                {
                    "id": p["id"],
                    "name": p["profile"].get("name", "Unknown"),
                    "club": p["club"].get("name", "Unknown"),
                    "minutes": p["performance"].get("minutesPlayed", 0),
                    "matches": p["performance"].get("matches", 0)
                } for p in most_minutes
            ]
        }

def main():
    """Main function to run the scraper"""
    scraper = USLAPIScraper()
    
    # Get basic competition info first
    competition_info = scraper.get_competition_info()
    if competition_info.get("status"):
        comp_data = competition_info["data"]["competition"]
        print(f"Competition: {comp_data['competitionName']}")
        print(f"Season: {comp_data['season']}")
        print(f"Current Match Day: {comp_data['currentMatchDay']}")
        print(f"Total Market Value: {comp_data['marketValue']} {comp_data['marketValueCurrency']}")
        print()
    
    # Scrape all players (without match details for speed)
    players = scraper.scrape_all_players(
        include_detailed_stats=True,
        include_match_details=False  # Set to True if you want match-by-match data
    )
    
    if players:
        # Save the data
        scraper.save_data(players)
        
        # Generate and display summary stats
        summary = scraper.get_player_summary_stats(players)
        print("\n" + "="*50)
        print("SUMMARY STATISTICS")
        print("="*50)
        print(f"Total Players: {summary['total_players']}")
        print(f"Total Goals: {summary['total_goals']}")
        print(f"Total Assists: {summary['total_assists']}")
        print(f"Total Matches: {summary['total_matches']}")
        print(f"Total Minutes: {summary['total_minutes']}")
        print(f"Average Goals per Player: {summary['avg_goals_per_player']:.2f}")
        print(f"Average Assists per Player: {summary['avg_assists_per_player']:.2f}")
        
        print("\nTOP 5 SCORERS:")
        for i, player in enumerate(summary['top_scorers'][:5], 1):
            print(f"{i}. {player['name']} ({player['club']}) - {player['goals']} goals, {player['assists']} assists")
        
        print("\nTOP 5 ASSIST PROVIDERS:")
        for i, player in enumerate(summary['top_assists'][:5], 1):
            print(f"{i}. {player['name']} ({player['club']}) - {player['assists']} assists, {player['goals']} goals")
        
        # Save summary stats
        with open("usl_league_one_summary_stats.json", 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        print(f"\nSummary stats saved to usl_league_one_summary_stats.json")
        
    else:
        print("No players found!")

if __name__ == "__main__":
    main() 