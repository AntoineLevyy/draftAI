#!/usr/bin/env python3
"""
College Data Analysis Script
Analyzes the data we've scraped from college rosters and creates a comprehensive report.
"""

import json
import os
from typing import Dict, List, Tuple
from collections import defaultdict
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CollegeDataAnalyzer:
    def __init__(self):
        self.base_path = "backend/college/njcaa"
        self.chunks_path = "backend/pro/chunks"
        
        # Load data files
        self.club_mappings = self.load_json_file(f"{self.base_path}/njcaa_club_mappings.json")
        self.team_logos = self.load_json_file(f"{self.base_path}/team_logos.json")
        
        # Load player data for all divisions
        self.d1_players = self.load_json_file(f"{self.base_path}/njcaa_d1_players.json")
        self.d2_players = self.load_json_file(f"{self.base_path}/njcaa_d2_players.json")
        self.d3_players = self.load_json_file(f"{self.base_path}/njcaa_d3_players.json")
        
        # Combine all players
        self.all_players = self.d1_players + self.d2_players + self.d3_players
        
        logger.info(f"Loaded {len(self.all_players)} total players")
        logger.info(f"Loaded {len(self.club_mappings)} club mappings")
        logger.info(f"Loaded {len(self.team_logos)} team logos")
    
    def load_json_file(self, filepath: str) -> List[Dict]:
        """Load JSON file with error handling."""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                logger.info(f"Loaded {len(data)} items from {filepath}")
                return data
        except FileNotFoundError:
            logger.warning(f"File not found: {filepath}")
            return []
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON from {filepath}: {e}")
            return []
    
    def analyze_team_data(self) -> List[Dict]:
        """Analyze data for each team and create a comprehensive report."""
        logger.info("Starting team data analysis...")
        
        # Group players by team
        team_players = defaultdict(list)
        for player in self.all_players:
            team = player.get('team', 'Unknown')
            if team:
                team_players[team].append(player)
        
        analysis_results = []
        
        for team_name, players in team_players.items():
            logger.info(f"Analyzing team: {team_name} ({len(players)} players)")
            
            # Get roster URL
            roster_url = self.club_mappings.get(team_name)
            
            # Get team photo URL
            team_photo_url = self.team_logos.get(team_name)
            
            # Count players with different data fields
            players_with_height = 0
            players_with_weight = 0
            players_with_hometown = 0
            players_with_picture = 0
            
            for player in players:
                # Check for height data
                height = player.get('height', '')
                data_map_height = player.get('dataMap', {}).get('height', '')
                if height and height not in ['', 'N/A', 'No.:'] or data_map_height and data_map_height not in ['', 'N/A']:
                    players_with_height += 1
                
                # Check for weight data
                weight = player.get('weight', '')
                data_map_weight = player.get('dataMap', {}).get('weight', '')
                if weight and weight not in ['', 'N/A', 'No.:'] or data_map_weight and data_map_weight not in ['', 'N/A']:
                    players_with_weight += 1
                
                # Check for hometown data
                hometown = player.get('hometown', '')
                data_map_hometown = player.get('dataMap', {}).get('hometown', '')
                if hometown and hometown not in ['', 'N/A'] or data_map_hometown and data_map_hometown not in ['', 'N/A']:
                    players_with_hometown += 1
                
                # Check for picture data
                photo_url = player.get('photo_url', '')
                if photo_url and photo_url not in ['', 'N/A', 'https://westernnebraska.prestosports.com/info/images/spacer.gif']:
                    players_with_picture += 1
            
            team_analysis = {
                'Team': team_name,
                'Roster URL': roster_url,
                'Team Photo URL': team_photo_url,
                'Number of players for which we found height in that team': players_with_height,
                'Number of players for which we found weight in that team': players_with_weight,
                'Number of players for which we found hometown on that team': players_with_hometown,
                'Number of players for which we found a picture on that team': players_with_picture,
                'Total Players': len(players)
            }
            
            analysis_results.append(team_analysis)
        
        # Sort by team name
        analysis_results.sort(key=lambda x: x['Team'])
        
        return analysis_results
    
    def generate_summary_statistics(self, analysis_results: List[Dict]) -> Dict:
        """Generate summary statistics from the analysis."""
        total_teams = len(analysis_results)
        teams_with_rosters = sum(1 for team in analysis_results if team['Roster URL'])
        teams_with_team_photos = sum(1 for team in analysis_results if team['Team Photo URL'])
        
        total_players = sum(team['Total Players'] for team in analysis_results)
        total_players_with_height = sum(team['Number of players for which we found height in that team'] for team in analysis_results)
        total_players_with_weight = sum(team['Number of players for which we found weight in that team'] for team in analysis_results)
        total_players_with_hometown = sum(team['Number of players for which we found hometown on that team'] for team in analysis_results)
        total_players_with_picture = sum(team['Number of players for which we found a picture on that team'] for team in analysis_results)
        
        summary = {
            'Total Teams': total_teams,
            'Teams with Roster URLs': teams_with_rosters,
            'Teams with Team Photos': teams_with_team_photos,
            'Total Players': total_players,
            'Players with Height': total_players_with_height,
            'Players with Weight': total_players_with_weight,
            'Players with Hometown': total_players_with_hometown,
            'Players with Pictures': total_players_with_picture,
            'Success Rates': {
                'Teams with Roster URLs (%)': round((teams_with_rosters / total_teams) * 100, 1) if total_teams > 0 else 0,
                'Teams with Team Photos (%)': round((teams_with_team_photos / total_teams) * 100, 1) if total_teams > 0 else 0,
                'Players with Height (%)': round((total_players_with_height / total_players) * 100, 1) if total_players > 0 else 0,
                'Players with Weight (%)': round((total_players_with_weight / total_players) * 100, 1) if total_players > 0 else 0,
                'Players with Hometown (%)': round((total_players_with_hometown / total_players) * 100, 1) if total_players > 0 else 0,
                'Players with Pictures (%)': round((total_players_with_picture / total_players) * 100, 1) if total_players > 0 else 0
            }
        }
        
        return summary
    
    def save_analysis_results(self, analysis_results: List[Dict], summary: Dict):
        """Save analysis results to JSON file."""
        output_data = {
            'summary': summary,
            'team_analysis': analysis_results
        }
        
        output_file = 'college_data_analysis.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Analysis results saved to {output_file}")
    
    def print_summary(self, summary: Dict):
        """Print a formatted summary of the analysis."""
        print("\n" + "="*80)
        print("COLLEGE DATA ANALYSIS SUMMARY")
        print("="*80)
        
        print(f"\nOVERVIEW:")
        print(f"  Total Teams: {summary['Total Teams']}")
        print(f"  Total Players: {summary['Total Players']}")
        
        print(f"\nROSTER URLS:")
        print(f"  Teams with Roster URLs: {summary['Teams with Roster URLs']} ({summary['Success Rates']['Teams with Roster URLs (%)']}%)")
        print(f"  Teams with Team Photos: {summary['Teams with Team Photos']} ({summary['Success Rates']['Teams with Team Photos (%)']}%)")
        
        print(f"\nPLAYER DATA COMPLETENESS:")
        print(f"  Players with Height: {summary['Players with Height']} ({summary['Success Rates']['Players with Height (%)']}%)")
        print(f"  Players with Weight: {summary['Players with Weight']} ({summary['Success Rates']['Players with Weight (%)']}%)")
        print(f"  Players with Hometown: {summary['Players with Hometown']} ({summary['Success Rates']['Players with Hometown (%)']}%)")
        print(f"  Players with Pictures: {summary['Players with Pictures']} ({summary['Success Rates']['Players with Pictures (%)']}%)")
        
        print("\n" + "="*80)
    
    def run(self):
        """Run the complete analysis."""
        logger.info("Starting College Data Analysis")
        
        # Analyze team data
        analysis_results = self.analyze_team_data()
        
        # Generate summary statistics
        summary = self.generate_summary_statistics(analysis_results)
        
        # Save results
        self.save_analysis_results(analysis_results, summary)
        
        # Print summary
        self.print_summary(summary)
        
        logger.info("Analysis completed!")

if __name__ == "__main__":
    analyzer = CollegeDataAnalyzer()
    analyzer.run() 