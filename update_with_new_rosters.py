#!/usr/bin/env python3
"""
Update existing player data with improved roster URLs and better data extraction.
"""

import json
import csv
import requests
import time
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from typing import Dict, List, Optional, Any
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PlayerDataUpdater:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Load updated roster data
        self.updated_rosters = self.load_updated_rosters()
        
        # Load existing player data
        self.d1_players = self.load_json_file("backend/college/njcaa/njcaa_d1_players.json")
        self.d2_players = self.load_json_file("backend/college/njcaa/njcaa_d2_players.json")
        self.d3_players = self.load_json_file("backend/college/njcaa/njcaa_d3_players.json")
        
        # Combine all players
        self.all_players = self.d1_players + self.d2_players + self.d3_players
        
        logger.info(f"Loaded {len(self.all_players)} existing players")
        logger.info(f"Loaded {len(self.updated_rosters)} updated roster URLs")
    
    def load_updated_rosters(self) -> List[Dict]:
        """Load the updated roster data from CSV."""
        rosters = []
        
        with open('backend/college/njcaa/data_college.csv', 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                if len(row) >= 8:
                    rosters.append({
                        'team': row[0],
                        'roster_url': row[1] if row[1] else None,
                        'team_photo_url': row[2] if row[2] and row[2] != 'Find it' else None,
                        'expected_height': row[3],
                        'expected_weight': row[4],
                        'expected_hometown': row[5],
                        'expected_picture': row[6],
                        'total_players': int(row[7]) if row[7].isdigit() else 0
                    })
        
        return rosters
    
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
    
    def get_page_content(self, url: str) -> Optional[str]:
        """Get page content with error handling."""
        try:
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            return response.text
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
    
    def extract_team_logo_from_roster(self, roster_url: str) -> Optional[str]:
        """Extract team logo from a roster page."""
        content = self.get_page_content(roster_url)
        if not content:
            return None
        
        soup = BeautifulSoup(content, 'html.parser')
        
        # Common logo selectors for different platforms
        logo_selectors = [
            '.site-logo img',
            '.site-logo img[src*="logo"]',
            '.site-logo img[src*="Logo"]',
            '.site-logo img[src*="Primary_Logo"]',
            '.site-logo img[src*="Secondary_Logo"]',
            'header img[src*="logo"]',
            'header img[src*="Logo"]',
            '.navbar-brand img',
            '.logo img',
            'img[alt*="logo"]',
            'img[alt*="Logo"]',
            'img[src*="/images/setup/"]',
            'img[src*="Primary_Logo"]',
            'img[src*="Secondary_Logo"]',
            'img[class*="img-mh"]',
            'img[src*="logo"]',
            'img[src*="Logo"]'
        ]
        
        for selector in logo_selectors:
            logo_elem = soup.select_one(selector)
            if logo_elem:
                logo_src = logo_elem.get('src')
                if logo_src:
                    if logo_src.startswith('/'):
                        logo_src = urljoin(roster_url, logo_src)
                    elif not logo_src.startswith('http'):
                        logo_src = urljoin(roster_url, logo_src)
                    
                    if any(ext in logo_src.lower() for ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg']):
                        return logo_src
        
        return None
    
    def extract_player_details_from_roster(self, roster_url: str) -> Dict[str, Any]:
        """Extract detailed player information from a roster page."""
        content = self.get_page_content(roster_url)
        if not content:
            return {}
        
        soup = BeautifulSoup(content, 'html.parser')
        players = {}
        
        # Look for player cards/rows in the roster
        player_selectors = [
            '.roster-player', '.player-card', '.roster-row', 
            'tr[data-player]', '.player-info', '.athlete-card',
            '.roster-table tbody tr', 'table tbody tr',
            '.roster-player-fields', '.player-fields',
            '.roster-player-info', '.player-info'
        ]
        
        player_elements = []
        for selector in player_selectors:
            player_elements = soup.select(selector)
            if player_elements:
                break
        
        # If no specific player elements found, try table rows
        if not player_elements:
            player_elements = soup.find_all('tr')
            player_elements = [row for row in player_elements if row.find('td')]
        
        for element in player_elements:
            player_info = self.extract_player_from_element(element, roster_url)
            if player_info and player_info.get('name'):
                players[player_info['name']] = player_info
        
        return {'players': players}
    
    def extract_player_from_element(self, element, base_url: str) -> Optional[Dict]:
        """Extract player information from a roster element."""
        try:
            player = {}
            
            # Extract name
            name_elem = None
            name_selectors = [
                'a[href*="player"]', '.player-name', '.name', 
                'td:first-child', 'td:nth-child(1)', 'td:nth-child(2)'
            ]
            
            for selector in name_selectors:
                name_elem = element.select_one(selector)
                if name_elem:
                    break
            
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
                    elif not img_src.startswith('http'):
                        img_src = urljoin(base_url, img_src)
                    player['photo_url'] = img_src
            
            # Extract height
            height_selectors = ['td:nth-child(5)', 'td:nth-child(6)', '.height', '.ht']
            for selector in height_selectors:
                height_elem = element.select_one(selector)
                if height_elem:
                    height_text = height_elem.get_text(strip=True)
                    if height_text and height_text not in ['', 'N/A', 'No.:']:
                        player['height'] = height_text
                        break
            
            # Extract weight
            weight_selectors = ['td:nth-child(6)', 'td:nth-child(7)', '.weight', '.wt']
            for selector in weight_selectors:
                weight_elem = element.select_one(selector)
                if weight_elem:
                    weight_text = weight_elem.get_text(strip=True)
                    if weight_text and weight_text not in ['', 'N/A', 'No.:']:
                        player['weight'] = weight_text
                        break
            
            # Extract hometown
            hometown_selectors = ['td:nth-child(7)', 'td:nth-child(8)', '.hometown', '.ht']
            for selector in hometown_selectors:
                hometown_elem = element.select_one(selector)
                if hometown_elem:
                    hometown_text = hometown_elem.get_text(strip=True)
                    if hometown_text and hometown_text not in ['', 'N/A']:
                        player['hometown'] = hometown_text
                        break
            
            return player
            
        except Exception as e:
            logger.error(f"Error extracting player from element: {e}")
            return None
    
    def update_player_data(self, players: List[Dict], team_name: str, roster_players: Dict[str, Dict], team_logo: Optional[str] = None) -> int:
        """Update existing player data with detailed information and team logo."""
        updated_count = 0
        
        for player in players:
            if player.get('team') == team_name:
                player_name = player.get('name', '').strip()
                if not player_name:
                    # Try to construct name from firstName and lastName
                    first_name = player.get('firstName', '')
                    last_name = player.get('lastName', '')
                    if first_name and last_name:
                        player_name = f"{first_name} {last_name}"
                    else:
                        player_name = player.get('fullName', '')
                
                # Try to find matching player in roster data
                roster_player = roster_players.get(player_name)
                if not roster_player:
                    # Try fuzzy matching
                    for roster_name, roster_data in roster_players.items():
                        if self.fuzzy_match_names(player_name, roster_name):
                            roster_player = roster_data
                            break
                
                if roster_player:
                    # Initialize dataMap if it doesn't exist
                    if 'dataMap' not in player:
                        player['dataMap'] = {}
                    
                    # Update player with detailed information in dataMap
                    if roster_player.get('height'):
                        player['dataMap']['height'] = roster_player['height']
                    
                    if roster_player.get('weight'):
                        player['dataMap']['weight'] = roster_player['weight']
                    
                    if roster_player.get('hometown'):
                        player['dataMap']['hometown'] = roster_player['hometown']
                    
                    if roster_player.get('photo_url'):
                        player['photo_url'] = roster_player['photo_url']
                    
                    updated_count += 1
        
        # Update team logo for all players on this team
        if team_logo:
            for player in players:
                if player.get('team') == team_name:
                    player['team_logo'] = team_logo
        
        return updated_count
    
    def fuzzy_match_names(self, name1: str, name2: str) -> bool:
        """Simple fuzzy name matching."""
        if not name1 or not name2:
            return False
        
        # Convert to lowercase and remove extra spaces
        name1_clean = ' '.join(name1.lower().split())
        name2_clean = ' '.join(name2.lower().split())
        
        # Exact match
        if name1_clean == name2_clean:
            return True
        
        # Check if one name is contained in the other
        if name1_clean in name2_clean or name2_clean in name1_clean:
            return True
        
        return False
    
    def save_updated_data(self, players: List[Dict], output_file: str):
        """Save updated player data to JSON file."""
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(players, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved updated data to {output_file}")
        except Exception as e:
            logger.error(f"Error saving data to {output_file}: {e}")
    
    def run(self):
        """Run the complete update process."""
        logger.info("Starting Player Data Update with New Roster URLs")
        
        # Create a mapping of team names to updated roster data
        team_roster_map = {roster['team']: roster for roster in self.updated_rosters}
        
        # Group players by team
        team_players = {}
        for player in self.all_players:
            team = player.get('team')
            if team:
                if team not in team_players:
                    team_players[team] = []
                team_players[team].append(player)
        
        # Process each team with updated roster URLs
        updated_count = 0
        teams_processed = 0
        
        for team_name, players in team_players.items():
            if team_name in team_roster_map:
                roster_data = team_roster_map[team_name]
                roster_url = roster_data['roster_url']
                
                if roster_url:
                    logger.info(f"Processing team: {team_name}")
                    
                    # Extract team logo
                    team_logo = self.extract_team_logo_from_roster(roster_url)
                    
                    # Extract player data from roster
                    roster_data_extracted = self.extract_player_details_from_roster(roster_url)
                    roster_players = roster_data_extracted.get('players', {})
                    
                    # Update existing player data
                    team_updated_count = self.update_player_data(players, team_name, roster_players, team_logo)
                    updated_count += team_updated_count
                    teams_processed += 1
                    
                    logger.info(f"Updated {team_updated_count} players for {team_name}")
                    
                    # Rate limiting
                    time.sleep(1)
        
        # Save updated data
        self.save_updated_data(self.all_players, "updated_njcaa_players.json")
        
        logger.info(f"Update completed!")
        logger.info(f"Teams processed: {teams_processed}")
        logger.info(f"Total players updated: {updated_count}")
        logger.info(f"Updated data saved to: updated_njcaa_players.json")

if __name__ == "__main__":
    updater = PlayerDataUpdater()
    updater.run() 