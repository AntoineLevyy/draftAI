#!/usr/bin/env python3
"""
Team Logo Scraper for NJCAA
Extracts team logos from roster pages and creates a mapping file.
"""

import json
import requests
import time
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from typing import Dict, Optional
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TeamLogoScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Load club mappings
        self.club_mappings = self.load_club_mappings("njcaa_club_mappings.json")
        
        # Statistics
        self.stats = {
            'total_teams': 0,
            'teams_with_rosters': 0,
            'teams_with_logos': 0,
            'teams_processed': 0
        }
    
    def load_club_mappings(self, filepath: str) -> Dict[str, str]:
        """Load club mappings from JSON file."""
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
            response.raise_for_status()
            return response.text
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
    
    def extract_team_logo_from_roster(self, roster_url: str) -> Optional[str]:
        """Extract team logo from a roster page."""
        logger.info(f"Extracting team logo from: {roster_url}")
        
        content = self.get_page_content(roster_url)
        if not content:
            return None
        
        soup = BeautifulSoup(content, 'html.parser')
        
        # Common logo selectors for PrestoSports sites
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
            'img[class*="img-mh"]',  # Common class for logos
            'img[src*="logo"]',  # Any image with "logo" in src
            'img[src*="Logo"]'   # Any image with "Logo" in src
        ]
        
        for selector in logo_selectors:
            logo_elem = soup.select_one(selector)
            if logo_elem:
                logo_src = logo_elem.get('src')
                if logo_src:
                    # Convert relative URLs to absolute
                    if logo_src.startswith('/'):
                        logo_src = urljoin(roster_url, logo_src)
                    elif not logo_src.startswith('http'):
                        logo_src = urljoin(roster_url, logo_src)
                    
                    # Validate that it's actually an image URL
                    if any(ext in logo_src.lower() for ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg']):
                        logger.info(f"Found team logo: {logo_src}")
                        return logo_src
        
        logger.warning(f"No team logo found on {roster_url}")
        return None
    
    def process_teams(self) -> Dict[str, str]:
        """Process all teams and extract their logos."""
        logger.info("Starting team logo extraction")
        
        team_logos = {}
        self.stats['total_teams'] = len(self.club_mappings)
        
        for i, (team_name, roster_url) in enumerate(self.club_mappings.items(), 1):
            logger.info(f"Processing team {i}/{self.stats['total_teams']}: {team_name}")
            
            if roster_url:
                self.stats['teams_with_rosters'] += 1
                logo_url = self.extract_team_logo_from_roster(roster_url)
                
                if logo_url:
                    team_logos[team_name] = logo_url
                    self.stats['teams_with_logos'] += 1
                    logger.info(f"✓ Found logo for {team_name}: {logo_url}")
                else:
                    team_logos[team_name] = None
                    logger.warning(f"✗ No logo found for {team_name}")
                
                self.stats['teams_processed'] += 1
                
                # Rate limiting
                time.sleep(1)
            else:
                team_logos[team_name] = None
                logger.info(f"Skipping {team_name} (no roster URL)")
        
        return team_logos
    
    def save_team_logos(self, team_logos: Dict[str, str], filename: str = "team_logos.json"):
        """Save team logo mappings to JSON file."""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(team_logos, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved team logos to {filename}")
        except Exception as e:
            logger.error(f"Error saving team logos to {filename}: {e}")
    
    def print_statistics(self):
        """Print scraping statistics."""
        logger.info("=== TEAM LOGO SCRAPING STATISTICS ===")
        logger.info(f"Total teams: {self.stats['total_teams']}")
        logger.info(f"Teams with roster pages: {self.stats['teams_with_rosters']}")
        logger.info(f"Teams with logos found: {self.stats['teams_with_logos']}")
        logger.info(f"Teams processed: {self.stats['teams_processed']}")
        
        if self.stats['teams_with_rosters'] > 0:
            success_rate = (self.stats['teams_with_logos'] / self.stats['teams_with_rosters']) * 100
            logger.info(f"Success rate: {success_rate:.1f}%")
    
    def run(self):
        """Run the complete team logo scraper."""
        logger.info("Starting Team Logo Scraper")
        
        # Process all teams
        team_logos = self.process_teams()
        
        # Save results
        self.save_team_logos(team_logos)
        
        # Print statistics
        self.print_statistics()
        
        logger.info("Team logo scraping completed!")

if __name__ == "__main__":
    scraper = TeamLogoScraper()
    scraper.run() 