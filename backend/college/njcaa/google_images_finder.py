#!/usr/bin/env python3
"""
Google Images Finder for Claimed Profiles
Uses Google Custom Search API to find player photos when school roster method fails.
"""

import json
import requests
import time
import os
from typing import Optional, List, Dict

class GoogleImagesFinder:
    def __init__(self, api_key: str, search_engine_id: str):
        self.api_key = api_key
        self.search_engine_id = search_engine_id
        self.base_url = "https://www.googleapis.com/customsearch/v1"
    
    def search_player_image(self, player_name: str, school_name: str) -> Optional[str]:
        """Search for a player's image using Google Custom Search API."""
        
        # Create search query
        query = f'"{player_name}" "{school_name}" soccer player photo'
        
        params = {
            'key': self.api_key,
            'cx': self.search_engine_id,
            'q': query,
            'searchType': 'image',
            'num': 5,  # Get top 5 results
            'imgType': 'face',  # Prefer face photos
            'imgSize': 'medium',  # Medium size images
            'safe': 'active'  # Safe search
        }
        
        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if 'items' in data and data['items']:
                # Get the first image result
                first_image = data['items'][0]
                image_url = first_image.get('link')
                
                if image_url:
                    print(f"✅ Found Google image for {player_name}: {image_url}")
                    return image_url
            
            print(f"❌ No Google images found for {player_name}")
            return None
            
        except Exception as e:
            print(f"Error searching Google Images for {player_name}: {e}")
            return None

def load_claimed_profiles():
    """Load claimed profiles from JSON file."""
    try:
        with open('clean_claimed_players.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("clean_claimed_players.json not found")
        return []

def main():
    """Main function to process claimed profiles with Google Images."""
    
    # You'll need to set up Google Custom Search API
    # Get API key from: https://console.cloud.google.com/apis/credentials
    # Get Search Engine ID from: https://cse.google.com/cse/
    api_key = os.getenv('GOOGLE_API_KEY')
    search_engine_id = os.getenv('GOOGLE_SEARCH_ENGINE_ID')
    
    if not api_key or not search_engine_id:
        print("Please set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables")
        print("Get API key from: https://console.cloud.google.com/apis/credentials")
        print("Get Search Engine ID from: https://cse.google.com/cse/")
        return
    
    finder = GoogleImagesFinder(api_key, search_engine_id)
    profiles = load_claimed_profiles()
    
    if not profiles:
        print("No profiles found")
        return
    
    print(f"Processing {len(profiles)} claimed profiles with Google Images...")
    
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
        
        # Search for photo using Google Images
        photo_url = finder.search_player_image(player_name, school_name)
        
        if photo_url:
            profile['photo_url'] = photo_url
            found_photos += 1
        
        updated_profiles.append(profile)
        
        # Be polite to API (Google allows 100 queries per day for free)
        time.sleep(1)
    
    # Save updated profiles
    with open('clean_claimed_players_google_photos.json', 'w', encoding='utf-8') as f:
        json.dump(updated_profiles, f, indent=2, ensure_ascii=False)
    
    print(f"\n=== Results ===")
    print(f"Total profiles: {len(profiles)}")
    print(f"Profiles with photos: {found_photos}")
    print(f"Success rate: {(found_photos/len(profiles)*100):.1f}%")
    print(f"Saved to: clean_claimed_players_google_photos.json")

if __name__ == "__main__":
    main() 