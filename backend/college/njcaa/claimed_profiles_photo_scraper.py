#!/usr/bin/env python3
"""
Claimed Profiles Photo Scraper
Automatically finds photos for claimed profiles by searching their current school's roster pages.
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

class ClaimedProfilesPhotoScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Load claimed profiles
        self.claimed_profiles = self.load_claimed_profiles()
        
        # Statistics
        self.stats = {
            'total_players': 0,
            'players_with_photos': 0,
            'players_updated': 0,
            'errors': 0
        }
    
    def load_claimed_profiles(self) -> List[Dict]:
        """Load claimed profiles from JSON file."""
        try:
            with open('clean_claimed_players.json', 'r', encoding='utf-8') as f:
                profiles = json.load(f)
            logger.info(f"Loaded {len(profiles)} claimed profiles")
            return profiles
        except FileNotFoundError:
            logger.error("clean_claimed_players.json not found")
            return []
    
    def get_page_content(self, url: str) -> Optional[str]:
        """Get page content with error handling."""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response.text
        except Exception as e:
            logger.error(f"Failed to fetch {url}: {e}")
            return None
    
    def find_roster_url(self, school_name: str) -> Optional[str]:
        """Find the roster URL for a given school."""
        # Common patterns for school athletic websites
        school_patterns = [
            f"https://{school_name.lower().replace(' ', '').replace('cc', 'cc').replace('college', 'college')}.edu/athletics",
            f"https://{school_name.lower().replace(' ', '').replace('cc', 'cc').replace('college', 'college')}.edu/sports",
            f"https://athletics.{school_name.lower().replace(' ', '').replace('cc', 'cc').replace('college', 'college')}.edu",
            f"https://www.{school_name.lower().replace(' ', '').replace('cc', 'cc').replace('college', 'college')}.edu/athletics",
        ]
        
        # Add common variations
        if 'cc' in school_name.lower():
            school_patterns.extend([
                f"https://{school_name.lower().replace(' ', '').replace('cc', 'cc')}.edu/athletics",
                f"https://{school_name.lower().replace(' ', '').replace('cc', 'cc')}.edu/sports",
            ])
        
        for pattern in school_patterns:
            try:
                response = self.session.get(pattern, timeout=5)
                if response.status_code == 200:
                    logger.info(f"Found school website: {pattern}")
                    return pattern
            except:
                continue
        
        return None
    
    def find_soccer_roster_url(self, school_url: str) -> Optional[str]:
        """Find the soccer roster URL from a school's athletic website."""
        content = self.get_page_content(school_url)
        if not content:
            return None
        
        soup = BeautifulSoup(content, 'html.parser')
        
        # Common patterns for soccer roster links
        roster_patterns = [
            'a[href*="soccer"][href*="roster"]',
            'a[href*="msoc"][href*="roster"]',
            'a[href*="men"][href*="soccer"][href*="roster"]',
            'a[href*="roster"][href*="soccer"]',
            'a[href*="roster"][href*="msoc"]',
        ]
        
        for pattern in roster_patterns:
            links = soup.select(pattern)
            for link in links:
                href = link.get('href')
                if href:
                    full_url = urljoin(school_url, href)
                    logger.info(f"Found soccer roster: {full_url}")
                    return full_url
        
        return None
    
    def find_player_photo(self, roster_url: str, player_name: str) -> Optional[str]:
        """Find a player's photo from the roster page."""
        content = self.get_page_content(roster_url)
        if not content:
            return None
        
        soup = BeautifulSoup(content, 'html.parser')
        
        # Clean player name for matching
        clean_name = re.sub(r'[^\w\s]', '', player_name.lower())
        first_name = clean_name.split()[0] if clean_name.split() else ""
        last_name = clean_name.split()[-1] if len(clean_name.split()) > 1 else ""
        
        # Look for player elements
        player_elements = soup.find_all(['tr', 'div'], class_=re.compile(r'player|roster|athlete'))
        
        for element in player_elements:
            # Check if this element contains the player name
            element_text = element.get_text().lower()
            if first_name in element_text and last_name in element_text:
                # Find image in this element
                img = element.find('img')
                if img and img.get('src'):
                    img_src = img['src']
                    if img_src.startswith('/'):
                        img_src = urljoin(roster_url, img_src)
                    elif not img_src.startswith('http'):
                        img_src = urljoin(roster_url, img_src)
                    
                    logger.info(f"Found photo for {player_name}: {img_src}")
                    return img_src
        
        return None
    
    def search_google_images(self, player_name: str, school_name: str) -> Optional[str]:
        """Search Google Images for player photos (fallback method)."""
        # This would require Google Custom Search API
        # For now, return None as this requires API setup
        return None
    
    def process_claimed_profiles(self):
        """Process all claimed profiles to find photos."""
        logger.info("Starting photo search for claimed profiles...")
        
        updated_profiles = []
        
        for i, profile in enumerate(self.claimed_profiles):
            self.stats['total_players'] += 1
            player_name = profile.get('Name', '')
            school_name = profile.get('Current School', '')
            
            if not player_name or not school_name:
                logger.warning(f"Missing name or school for profile {i}")
                updated_profiles.append(profile)
                continue
            
            logger.info(f"[{i+1}/{len(self.claimed_profiles)}] Processing {player_name} from {school_name}")
            
            # Skip if already has photo
            if profile.get('photo_url'):
                logger.info(f"{player_name} already has photo")
                updated_profiles.append(profile)
                self.stats['players_with_photos'] += 1
                continue
            
            # Try to find photo
            photo_url = None
            
            # Method 1: Find school roster and search for player
            try:
                school_url = self.find_roster_url(school_name)
                if school_url:
                    roster_url = self.find_soccer_roster_url(school_url)
                    if roster_url:
                        photo_url = self.find_player_photo(roster_url, player_name)
            except Exception as e:
                logger.error(f"Error processing {player_name}: {e}")
                self.stats['errors'] += 1
            
            # Method 2: Google Images search (if implemented)
            if not photo_url:
                photo_url = self.search_google_images(player_name, school_name)
            
            # Update profile with photo URL
            if photo_url:
                profile['photo_url'] = photo_url
                self.stats['players_with_photos'] += 1
                self.stats['players_updated'] += 1
                logger.info(f"✅ Found photo for {player_name}")
            else:
                logger.warning(f"❌ No photo found for {player_name}")
            
            updated_profiles.append(profile)
            
            # Be polite to servers
            time.sleep(1)
        
        # Save updated profiles
        self.save_updated_profiles(updated_profiles)
        self.print_stats()
    
    def save_updated_profiles(self, profiles: List[Dict]):
        """Save updated profiles back to JSON file."""
        try:
            with open('clean_claimed_players_with_photos.json', 'w', encoding='utf-8') as f:
                json.dump(profiles, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved {len(profiles)} profiles to clean_claimed_players_with_photos.json")
        except Exception as e:
            logger.error(f"Failed to save profiles: {e}")
    
    def print_stats(self):
        """Print processing statistics."""
        logger.info("=== Processing Statistics ===")
        logger.info(f"Total players processed: {self.stats['total_players']}")
        logger.info(f"Players with photos: {self.stats['players_with_photos']}")
        logger.info(f"Players updated: {self.stats['players_updated']}")
        logger.info(f"Errors: {self.stats['errors']}")
        success_rate = (self.stats['players_with_photos'] / self.stats['total_players'] * 100) if self.stats['total_players'] > 0 else 0
        logger.info(f"Success rate: {success_rate:.1f}%")

def main():
    scraper = ClaimedProfilesPhotoScraper()
    scraper.process_claimed_profiles()

if __name__ == "__main__":
    main() 