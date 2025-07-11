#!/usr/bin/env python3
"""
Detailed Player Scraper for NJCAA
Extracts detailed player information from roster pages and updates existing player JSON files.
"""

import json
import requests
import time
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional, Any
import logging
import os
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DetailedPlayerScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Load existing player data
        self.d1_players = self.load_player_data("../../pro/chunks/njcaa_d1_players.json")
        self.d2_players = self.load_player_data("../../pro/chunks/njcaa_d2_players.json")
        self.d3_players = self.load_player_data("../../pro/chunks/njcaa_d3_players.json")
        
        # Load club mappings
        self.club_mappings = self.load_club_mappings("njcaa_club_mappings.json")
        
        # Statistics
        self.stats = {
            'total_players_processed': 0,
            'players_updated': 0,
            'players_with_photos': 0,
            'players_with_height': 0,
            'players_with_weight': 0,
            'players_with_hometown': 0,
            'players_with_stats': 0
        }
    
    def load_player_data(self, filepath: str) -> List[Dict]:
        """Load existing player data from JSON file."""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error(f"File not found: {filepath}")
            return []
    
    def load_club_mappings(self, filepath: str) -> Dict[str, str]:
        """Load club to roster page mappings."""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error(f"File not found: {filepath}")
            return {}
    
    def get_page_content(self, url: str) -> Optional[str]:
        """Get page content with error handling."""
        try:
            response = self.session.get(url, timeout=15)
            if response.status_code == 200:
                return response.text
            else:
                logger.warning(f"HTTP {response.status_code} for {url}")
                return None
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
    
    def extract_player_details_from_roster(self, roster_url: str, team_name: str) -> Dict[str, Dict]:
        """Extract detailed player information from a roster page."""
        logger.info(f"Scraping roster page: {roster_url}")
        
        content = self.get_page_content(roster_url)
        if not content:
            return {}
        
        soup = BeautifulSoup(content, 'html.parser')
        players = {}
        
        # Look for player cards/rows in the roster
        # Common patterns for PrestoSports roster pages
        player_selectors = [
            '.roster-player', '.player-card', '.roster-row', 
            'tr[data-player]', '.player-info', '.athlete-card'
        ]
        
        player_elements = []
        for selector in player_selectors:
            player_elements = soup.select(selector)
            if player_elements:
                break
        
        # If no specific player elements found, try table rows
        if not player_elements:
            player_elements = soup.find_all('tr')
            # Filter out header rows
            player_elements = [row for row in player_elements if row.find('td')]
        
        for element in player_elements:
            player_info = self.extract_player_from_element(element, roster_url)
            if player_info and player_info.get('name'):
                players[player_info['name']] = player_info
        
        logger.info(f"Found {len(players)} players on roster page")
        return players
    
    def extract_player_from_element(self, element, base_url: str) -> Optional[Dict]:
        """Extract player information from a roster element."""
        try:
            player = {}
            
            # Extract name
            name_elem = element.find(['a', 'span', 'td'], class_=re.compile(r'name|player-name', re.I))
            if not name_elem:
                name_elem = element.find(['a', 'span', 'td'])
            
            if name_elem:
                player['name'] = name_elem.get_text(strip=True)
            
            # Extract photo
            img_elem = element.find('img')
            if img_elem:
                img_src = img_elem.get('src')
                if img_src:
                    if img_src.startswith('/'):
                        img_src = urljoin(base_url, img_src)
                    player['photo_url'] = img_src
            
            # Extract position
            pos_elem = element.find(['td', 'span'], class_=re.compile(r'position|pos', re.I))
            if pos_elem:
                player['position'] = pos_elem.get_text(strip=True)
            
            # Extract height
            height_elem = element.find(['td', 'span'], class_=re.compile(r'height|ht', re.I))
            if height_elem:
                player['height'] = height_elem.get_text(strip=True)
            
            # Extract weight
            weight_elem = element.find(['td', 'span'], class_=re.compile(r'weight|wt', re.I))
            if weight_elem:
                player['weight'] = weight_elem.get_text(strip=True)
            
            # Extract hometown
            hometown_elem = element.find(['td', 'span'], class_=re.compile(r'hometown|home|city', re.I))
            if hometown_elem:
                player['hometown'] = hometown_elem.get_text(strip=True)
            
            # Extract academic year
            year_elem = element.find(['td', 'span'], class_=re.compile(r'year|academic|class', re.I))
            if year_elem:
                player['academic_year'] = year_elem.get_text(strip=True)
            
            # Try to find individual player page link
            player_link = element.find('a', href=re.compile(r'player|roster'))
            if player_link:
                player_url = player_link.get('href')
                if player_url:
                    if player_url.startswith('/'):
                        player_url = urljoin(base_url, player_url)
                    player['player_page_url'] = player_url
                    
                    # Get detailed stats from individual player page
                    detailed_stats = self.get_detailed_player_stats(player_url)
                    if detailed_stats:
                        player.update(detailed_stats)
            
            return player if player.get('name') else None
            
        except Exception as e:
            logger.error(f"Error extracting player from element: {e}")
            return None
    
    def get_detailed_player_stats(self, player_url: str) -> Dict:
        """Get detailed statistics from individual player page."""
        try:
            content = self.get_page_content(player_url)
            if not content:
                return {}
            
            soup = BeautifulSoup(content, 'html.parser')
            stats = {}
            
            # Look for statistics in various formats
            stat_patterns = {
                'shot_percentage': [r'shot.*percentage', r'%', r'shot.*%'],
                'shots_on_goal': [r'shots.*goal', r'sog'],
                'penalty_kicks': [r'penalty.*kick', r'pk'],
                'goals': [r'goals', r'g'],
                'assists': [r'assists', r'a'],
                'points': [r'points', r'pts']
            }
            
            # Look for stats in text content
            text_content = soup.get_text().lower()
            
            for stat_name, patterns in stat_patterns.items():
                for pattern in patterns:
                    match = re.search(rf'{pattern}.*?(\d+(?:\.\d+)?)', text_content)
                    if match:
                        stats[stat_name] = match.group(1)
                        break
            
            # Look for stats in structured elements
            stat_elements = soup.find_all(['td', 'span', 'div'], class_=re.compile(r'stat|number'))
            for elem in stat_elements:
                text = elem.get_text(strip=True)
                for stat_name, patterns in stat_patterns.items():
                    for pattern in patterns:
                        if re.search(pattern, text, re.I):
                            # Try to extract the number
                            number_match = re.search(r'(\d+(?:\.\d+)?)', text)
                            if number_match:
                                stats[stat_name] = number_match.group(1)
                                break
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting detailed stats from {player_url}: {e}")
            return {}
    
    def update_player_data(self, players: List[Dict], team_name: str, roster_players: Dict[str, Dict]) -> int:
        """Update existing player data with detailed information."""
        updated_count = 0
        
        for player in players:
            if player.get('team') == team_name:
                player_name = player.get('name', '').strip()
                
                # Try to find matching player in roster data
                roster_player = roster_players.get(player_name)
                if not roster_player:
                    # Try fuzzy matching
                    for roster_name, roster_data in roster_players.items():
                        if self.fuzzy_match_names(player_name, roster_name):
                            roster_player = roster_data
                            break
                
                if roster_player:
                    # Update player with detailed information
                    player['height'] = roster_player.get('height', 'N/A')
                    player['weight'] = roster_player.get('weight', 'N/A')
                    player['hometown'] = roster_player.get('hometown', 'N/A')
                    player['photo_url'] = roster_player.get('photo_url', 'N/A')
                    player['shot_percentage'] = roster_player.get('shot_percentage', 'N/A')
                    player['shots_on_goal'] = roster_player.get('shots_on_goal', 'N/A')
                    player['penalty_kicks'] = roster_player.get('penalty_kicks', 'N/A')
                    
                    # Update statistics
                    if roster_player.get('height') != 'N/A':
                        self.stats['players_with_height'] += 1
                    if roster_player.get('weight') != 'N/A':
                        self.stats['players_with_weight'] += 1
                    if roster_player.get('hometown') != 'N/A':
                        self.stats['players_with_hometown'] += 1
                    if roster_player.get('photo_url') != 'N/A':
                        self.stats['players_with_photos'] += 1
                    if any(roster_player.get(stat) != 'N/A' for stat in ['shot_percentage', 'shots_on_goal', 'penalty_kicks']):
                        self.stats['players_with_stats'] += 1
                    
                    updated_count += 1
                else:
                    # Set default values for players not found in roster
                    player['height'] = 'N/A'
                    player['weight'] = 'N/A'
                    player['hometown'] = 'N/A'
                    player['photo_url'] = 'N/A'
                    player['shot_percentage'] = 'N/A'
                    player['shots_on_goal'] = 'N/A'
                    player['penalty_kicks'] = 'N/A'
        
        return updated_count
    
    def fuzzy_match_names(self, name1: str, name2: str) -> bool:
        """Simple fuzzy name matching."""
        # Clean names
        name1 = re.sub(r'[^\w\s]', '', name1.lower())
        name2 = re.sub(r'[^\w\s]', '', name2.lower())
        
        # Check if names are similar
        if name1 == name2:
            return True
        
        # Check if one name contains the other
        if name1 in name2 or name2 in name1:
            return True
        
        # Check for common variations
        name1_parts = name1.split()
        name2_parts = name2.split()
        
        if len(name1_parts) >= 2 and len(name2_parts) >= 2:
            # Check if first and last names match
            if (name1_parts[0] == name2_parts[0] and name1_parts[-1] == name2_parts[-1]):
                return True
        
        return False
    
    def save_updated_data(self, players: List[Dict], filepath: str):
        """Save updated player data to JSON file."""
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(players, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved updated data to {filepath}")
        except Exception as e:
            logger.error(f"Error saving data to {filepath}: {e}")
    
    def run(self):
        """Run the complete detailed player scraper."""
        logger.info("Starting Detailed Player Scraper")
        
        # Process each division
        divisions = [
            (self.d1_players, "NJCAA D1", "../../pro/chunks/njcaa_d1_players.json"),
            (self.d2_players, "NJCAA D2", "../../pro/chunks/njcaa_d2_players.json"),
            (self.d3_players, "NJCAA D3", "../../pro/chunks/njcaa_d3_players.json")
        ]
        
        for players, division_name, output_file in divisions:
            logger.info(f"Processing {division_name}")
            
            # Get unique teams that have roster pages
            teams_with_rosters = set()
            for player in players:
                team = player.get('team')
                if team and team in self.club_mappings and self.club_mappings[team]:
                    teams_with_rosters.add(team)
            
            logger.info(f"Found {len(teams_with_rosters)} teams with roster pages in {division_name}")
            
            # Process each team
            for team in teams_with_rosters:
                roster_url = self.club_mappings[team]
                if roster_url:
                    logger.info(f"Processing team: {team}")
                    
                    # Get detailed player data from roster page
                    roster_players = self.extract_player_details_from_roster(roster_url, team)
                    
                    # Update existing player data
                    updated_count = self.update_player_data(players, team, roster_players)
                    self.stats['players_updated'] += updated_count
                    
                    logger.info(f"Updated {updated_count} players for {team}")
                    
                    # Rate limiting
                    time.sleep(2)
            
            # Save updated data
            self.save_updated_data(players, output_file)
        
        # Print final statistics
        logger.info("Scraping completed!")
        logger.info(f"Total players processed: {len(self.d1_players) + len(self.d2_players) + len(self.d3_players)}")
        logger.info(f"Players updated with detailed info: {self.stats['players_updated']}")
        logger.info(f"Players with photos: {self.stats['players_with_photos']}")
        logger.info(f"Players with height: {self.stats['players_with_height']}")
        logger.info(f"Players with weight: {self.stats['players_with_weight']}")
        logger.info(f"Players with hometown: {self.stats['players_with_hometown']}")
        logger.info(f"Players with stats: {self.stats['players_with_stats']}")

if __name__ == "__main__":
    scraper = DetailedPlayerScraper()
    scraper.run() 