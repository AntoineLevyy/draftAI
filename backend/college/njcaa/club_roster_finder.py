#!/usr/bin/env python3
"""
Club Roster Finder for NJCAA
Extracts unique clubs from NJCAA player data and finds their roster pages.
"""

import json
import requests
import time
import re
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional, Set
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ClubRosterFinder:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Common PrestoSports URL patterns
        self.url_patterns = [
            "https://{school_slug}.prestosports.com/sports/msoc/2024-25/roster",
            "https://{school_slug}.prestosports.com/sports/msoc/roster",
            "https://{school_slug}.prestosports.com/sports/msoc/2023-24/roster",
            "https://{school_slug}.prestosports.com/sports/msoc/2022-23/roster"
        ]
        
        # Common school domain patterns
        self.domain_patterns = [
            "{school_slug}.edu",
            "{school_slug}.com",
            "{school_slug}.org"
        ]
    
    def extract_unique_clubs(self, json_file: str) -> Set[str]:
        """Extract unique club names from a JSON file."""
        logger.info(f"Extracting clubs from {json_file}")
        
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        clubs = set()
        for player in data:
            if 'team' in player and player['team']:
                clubs.add(player['team'].strip())
        
        logger.info(f"Found {len(clubs)} unique clubs")
        return clubs
    
    def generate_school_slug(self, school_name: str) -> str:
        """Generate a school slug from school name."""
        # Remove common words
        remove_words = ['community', 'college', 'university', 'institute', 'technical', 'tech']
        name = school_name.lower()
        
        for word in remove_words:
            name = name.replace(word, '').strip()
        
        # Clean up and create slug
        slug = re.sub(r'[^a-z0-9\s]', '', name)
        slug = re.sub(r'\s+', '', slug)
        
        return slug
    
    def test_url(self, url: str) -> bool:
        """Test if a URL exists and contains roster information."""
        try:
            response = self.session.get(url, timeout=10)
            if response.status_code == 200:
                # Check if page contains roster-related content
                content = response.text.lower()
                roster_indicators = ['roster', 'players', 'team', 'soccer', 'msoc']
                return any(indicator in content for indicator in roster_indicators)
            return False
        except Exception as e:
            logger.debug(f"Error testing {url}: {e}")
            return False
    
    def find_roster_page(self, school_name: str) -> Optional[str]:
        """Find the roster page for a given school."""
        school_slug = self.generate_school_slug(school_name)
        
        # Try PrestoSports patterns first
        for pattern in self.url_patterns:
            url = pattern.format(school_slug=school_slug)
            if self.test_url(url):
                logger.info(f"Found roster page for {school_name}: {url}")
                return url
        
        # Try domain patterns
        for pattern in self.domain_patterns:
            domain = pattern.format(school_slug=school_slug)
            url = f"https://{domain}/sports/msoc/roster"
            if self.test_url(url):
                logger.info(f"Found roster page for {school_name}: {url}")
                return url
        
        logger.warning(f"No roster page found for {school_name}")
        return None
    
    def process_division(self, json_file: str, division: str) -> Dict[str, str]:
        """Process a single division and find roster pages for all clubs."""
        logger.info(f"Processing {division}")
        
        clubs = self.extract_unique_clubs(json_file)
        club_mappings = {}
        
        for i, club in enumerate(sorted(clubs), 1):
            logger.info(f"Processing club {i}/{len(clubs)}: {club}")
            
            roster_url = self.find_roster_page(club)
            club_mappings[club] = roster_url
            
            # Rate limiting
            time.sleep(1)
        
        return club_mappings
    
    def save_mappings(self, mappings: Dict[str, str], filename: str):
        """Save club mappings to JSON file."""
        output_dir = "../../pro/chunks"
        os.makedirs(output_dir, exist_ok=True)
        
        filepath = os.path.join(output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(mappings, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved mappings to {filepath}")
    
    def run(self):
        """Run the complete club roster finder for all divisions."""
        logger.info("Starting Club Roster Finder")
        
        # Process each division
        divisions = [
            ("../../pro/chunks/njcaa_d1_players.json", "NJCAA D1", "njcaa_d1_club_mappings.json"),
            ("../../pro/chunks/njcaa_d2_players.json", "NJCAA D2", "njcaa_d2_club_mappings.json"),
            ("../../pro/chunks/njcaa_d3_players.json", "NJCAA D3", "njcaa_d3_club_mappings.json")
        ]
        
        all_mappings = {}
        
        for json_file, division_name, output_file in divisions:
            if os.path.exists(json_file):
                mappings = self.process_division(json_file, division_name)
                self.save_mappings(mappings, output_file)
                all_mappings.update(mappings)
            else:
                logger.error(f"File not found: {json_file}")
        
        # Save combined mappings
        self.save_mappings(all_mappings, "njcaa_club_mappings.json")
        
        # Summary
        total_clubs = len(all_mappings)
        found_rosters = sum(1 for url in all_mappings.values() if url is not None)
        
        logger.info(f"Summary:")
        logger.info(f"Total clubs processed: {total_clubs}")
        logger.info(f"Roster pages found: {found_rosters}")
        logger.info(f"Success rate: {found_rosters/total_clubs*100:.1f}%")

if __name__ == "__main__":
    finder = ClubRosterFinder()
    finder.run() 