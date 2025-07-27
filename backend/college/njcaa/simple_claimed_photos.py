#!/usr/bin/env python3
"""
Simple Claimed Profiles Photo Finder
Uses existing photo scraper infrastructure to find photos for claimed profiles.
"""

import json
import requests
import time
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import re

def load_claimed_profiles():
    """Load claimed profiles from JSON file."""
    try:
        with open('clean_claimed_players.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("clean_claimed_players.json not found")
        return []

def search_player_photo(player_name, school_name):
    """Search for a player's photo using their name and school."""
    
    # Common school website patterns
    school_patterns = [
        f"https://{school_name.lower().replace(' ', '').replace('cc', 'cc')}.edu",
        f"https://athletics.{school_name.lower().replace(' ', '').replace('cc', 'cc')}.edu",
        f"https://www.{school_name.lower().replace(' ', '').replace('cc', 'cc')}.edu",
    ]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    for school_url in school_patterns:
        try:
            # Try to find soccer roster page
            roster_urls = [
                f"{school_url}/sports/msoc/roster",
                f"{school_url}/athletics/soccer/roster",
                f"{school_url}/sports/mens-soccer/roster",
                f"{school_url}/athletics/msoc/roster",
            ]
            
            for roster_url in roster_urls:
                try:
                    response = requests.get(roster_url, headers=headers, timeout=10)
                    if response.status_code == 200:
                        print(f"Found roster: {roster_url}")
                        
                        # Parse the roster page
                        soup = BeautifulSoup(response.text, 'html.parser')
                        
                        # Clean player name for matching
                        clean_name = re.sub(r'[^\w\s]', '', player_name.lower())
                        first_name = clean_name.split()[0] if clean_name.split() else ""
                        last_name = clean_name.split()[-1] if len(clean_name.split()) > 1 else ""
                        
                        # Try multiple approaches to find player photos
                        photo_url = find_player_photo_advanced(soup, player_name, first_name, last_name, roster_url)
                        if photo_url:
                            return photo_url
                        
                except Exception as e:
                    continue
                    
        except Exception as e:
            continue
    
    print(f"❌ No photo found for {player_name}")
    return None

def find_player_photo_advanced(soup, player_name, first_name, last_name, base_url):
    """Advanced method to find player photos using multiple strategies."""
    
    # Strategy 1: Look for player elements with class names
    player_selectors = [
        '.roster-player', '.player-card', '.roster-row', 
        'tr[data-player]', '.player-info', '.athlete-card',
        '.roster-table tbody tr', 'table tbody tr',
        '.player', '.athlete', '.roster-item'
    ]
    
    for selector in player_selectors:
        elements = soup.select(selector)
        for element in elements:
            photo_url = extract_photo_from_element(element, player_name, first_name, last_name, base_url)
            if photo_url:
                return photo_url
    
    # Strategy 2: Look for all images and check surrounding text
    all_images = soup.find_all('img')
    for img in all_images:
        # Check if image is near player name
        parent = img.parent
        if parent:
            parent_text = parent.get_text().lower()
            if first_name in parent_text and last_name in parent_text:
                img_src = img.get('src')
                if img_src:
                    if img_src.startswith('/'):
                        img_src = urljoin(base_url, img_src)
                    elif not img_src.startswith('http'):
                        img_src = urljoin(base_url, img_src)
                    
                    # Check if it looks like a player photo (not a logo)
                    if any(keyword in img_src.lower() for keyword in ['player', 'photo', 'headshot', 'portrait']):
                        print(f"✅ Found photo for {player_name}: {img_src}")
                        return img_src
    
    # Strategy 3: Look for links that might contain player pages
    player_links = soup.find_all('a', href=re.compile(r'player|bio|athlete'))
    for link in player_links:
        link_text = link.get_text().lower()
        if first_name in link_text and last_name in link_text:
            # Follow the link to player page
            player_url = link.get('href')
            if player_url:
                if player_url.startswith('/'):
                    player_url = urljoin(base_url, player_url)
                elif not player_url.startswith('http'):
                    player_url = urljoin(base_url, player_url)
                
                # Try to get photo from player page
                photo_url = get_photo_from_player_page(player_url)
                if photo_url:
                    return photo_url
    
    return None

def extract_photo_from_element(element, player_name, first_name, last_name, base_url):
    """Extract photo from a player element."""
    element_text = element.get_text().lower()
    
    # Check if this element contains the player name
    if first_name in element_text and last_name in element_text:
        # Find image in this element
        img = element.find('img')
        if img and img.get('src'):
            img_src = img['src']
            if img_src.startswith('/'):
                img_src = urljoin(base_url, img_src)
            elif not img_src.startswith('http'):
                img_src = urljoin(base_url, img_src)
            
            print(f"✅ Found photo for {player_name}: {img_src}")
            return img_src
    
    return None

def get_photo_from_player_page(player_url):
    """Get photo from a player's individual page."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        response = requests.get(player_url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for player photo on individual page
            photo_selectors = [
                '.player-headshot img',
                '.player-photo img',
                '.athlete-photo img',
                '.headshot img',
                '.portrait img'
            ]
            
            for selector in photo_selectors:
                img = soup.select_one(selector)
                if img and img.get('src'):
                    img_src = img['src']
                    if img_src.startswith('/'):
                        img_src = urljoin(player_url, img_src)
                    elif not img_src.startswith('http'):
                        img_src = urljoin(player_url, img_src)
                    return img_src
    except:
        pass
    
    return None

def main():
    """Main function to process claimed profiles."""
    profiles = load_claimed_profiles()
    
    if not profiles:
        print("No profiles found")
        return
    
    print(f"Processing {len(profiles)} claimed profiles...")
    
    updated_profiles = []
    found_photos = 0
    
    for i, profile in enumerate(profiles):
        player_name = profile.get('Name', '')
        school_name = profile.get('Current School', '')
        
        if not player_name or not school_name:
            updated_profiles.append(profile)
            continue
        
        print(f"[{i+1}/{len(profiles)}] Processing {player_name} from {school_name}")
        
        # Skip if already has photo
        if profile.get('photo_url'):
            print(f"{player_name} already has photo")
            updated_profiles.append(profile)
            found_photos += 1
            continue
        
        # Search for photo
        photo_url = search_player_photo(player_name, school_name)
        
        if photo_url:
            profile['photo_url'] = photo_url
            found_photos += 1
        
        updated_profiles.append(profile)
        
        # Be polite to servers
        time.sleep(1)
    
    # Save updated profiles
    with open('clean_claimed_players_with_photos.json', 'w', encoding='utf-8') as f:
        json.dump(updated_profiles, f, indent=2, ensure_ascii=False)
    
    print(f"\n=== Results ===")
    print(f"Total profiles: {len(profiles)}")
    print(f"Profiles with photos: {found_photos}")
    print(f"Success rate: {(found_photos/len(profiles)*100):.1f}%")
    print(f"Saved to: clean_claimed_players_with_photos.json")

if __name__ == "__main__":
    main() 