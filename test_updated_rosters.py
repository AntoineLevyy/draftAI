#!/usr/bin/env python3
"""
Test Updated Roster URLs
Tests the updated roster URLs to see what data we're actually getting from each site.
"""

import json
import requests
import time
import csv
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from typing import Dict, List, Optional, Any
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RosterURLTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Load the updated roster data
        self.updated_rosters = self.load_updated_rosters()
        
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
    
    def test_roster_url(self, team_data: Dict) -> Dict:
        """Test a single roster URL and return results."""
        team_name = team_data['team']
        roster_url = team_data['roster_url']
        
        logger.info(f"Testing roster URL for {team_name}: {roster_url}")
        
        result = {
            'team': team_name,
            'roster_url': roster_url,
            'expected_team_photo': team_data['team_photo_url'],
            'expected_height': team_data['expected_height'],
            'expected_weight': team_data['expected_weight'],
            'expected_hometown': team_data['expected_hometown'],
            'expected_picture': team_data['expected_picture'],
            'expected_total_players': team_data['total_players'],
            'actual_team_photo': None,
            'actual_players_found': 0,
            'actual_players_with_height': 0,
            'actual_players_with_weight': 0,
            'actual_players_with_hometown': 0,
            'actual_players_with_picture': 0,
            'status': 'failed'
        }
        
        if not roster_url:
            result['status'] = 'no_url'
            return result
        
        try:
            # Extract team logo
            team_logo = self.extract_team_logo_from_roster(roster_url)
            result['actual_team_photo'] = team_logo
            
            # Extract player data
            roster_data = self.extract_player_details_from_roster(roster_url)
            players = roster_data.get('players', {})
            
            result['actual_players_found'] = len(players)
            
            # Count players with different data fields
            for player in players.values():
                if player.get('height'):
                    result['actual_players_with_height'] += 1
                if player.get('weight'):
                    result['actual_players_with_weight'] += 1
                if player.get('hometown'):
                    result['actual_players_with_hometown'] += 1
                if player.get('photo_url'):
                    result['actual_players_with_picture'] += 1
            
            result['status'] = 'success'
            
        except Exception as e:
            logger.error(f"Error testing {team_name}: {e}")
            result['status'] = 'error'
        
        return result
    
    def run_tests(self):
        """Run tests on all roster URLs."""
        logger.info(f"Testing {len(self.updated_rosters)} roster URLs")
        
        results = []
        
        for i, team_data in enumerate(self.updated_rosters, 1):
            logger.info(f"Testing {i}/{len(self.updated_rosters)}: {team_data['team']}")
            
            result = self.test_roster_url(team_data)
            results.append(result)
            
            # Rate limiting
            time.sleep(1)
        
        return results
    
    def save_results(self, results: List[Dict]):
        """Save test results to JSON file."""
        output_file = 'roster_url_test_results.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Test results saved to {output_file}")
    
    def print_summary(self, results: List[Dict]):
        """Print a summary of the test results."""
        total_tests = len(results)
        successful_tests = sum(1 for r in results if r['status'] == 'success')
        failed_tests = sum(1 for r in results if r['status'] == 'failed')
        error_tests = sum(1 for r in results if r['status'] == 'error')
        no_url_tests = sum(1 for r in results if r['status'] == 'no_url')
        
        print("\n" + "="*80)
        print("ROSTER URL TEST RESULTS SUMMARY")
        print("="*80)
        
        print(f"\nOVERVIEW:")
        print(f"  Total Tests: {total_tests}")
        print(f"  Successful: {successful_tests}")
        print(f"  Failed: {failed_tests}")
        print(f"  Errors: {error_tests}")
        print(f"  No URL: {no_url_tests}")
        
        if successful_tests > 0:
            success_rate = (successful_tests / total_tests) * 100
            print(f"  Success Rate: {success_rate:.1f}%")
        
        # Show some examples of what we found
        print(f"\nEXAMPLES OF SUCCESSFUL EXTRACTIONS:")
        successful_results = [r for r in results if r['status'] == 'success']
        for result in successful_results[:5]:  # Show first 5
            print(f"  {result['team']}:")
            print(f"    Players found: {result['actual_players_found']}")
            print(f"    With height: {result['actual_players_with_height']}")
            print(f"    With weight: {result['actual_players_with_weight']}")
            print(f"    With hometown: {result['actual_players_with_hometown']}")
            print(f"    With picture: {result['actual_players_with_picture']}")
            print(f"    Team photo: {'Yes' if result['actual_team_photo'] else 'No'}")
        
        print("\n" + "="*80)
    
    def run(self):
        """Run the complete test suite."""
        logger.info("Starting Roster URL Tests")
        
        # Run tests
        results = self.run_tests()
        
        # Save results
        self.save_results(results)
        
        # Print summary
        self.print_summary(results)
        
        logger.info("Testing completed!")

if __name__ == "__main__":
    tester = RosterURLTester()
    tester.run() 