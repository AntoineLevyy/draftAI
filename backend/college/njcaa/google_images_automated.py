#!/usr/bin/env python3
"""
Google Images Automated Photo Finder
Uses Google Custom Search API to automatically find player photos.
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
        
        # Create search query - try multiple variations
        queries = [
            f'"{player_name}" "{school_name}" soccer player photo',
            f'"{player_name}" "{school_name}" athletics roster',
            f'"{player_name}" "{school_name}" men soccer',
            f'"{player_name}" soccer player headshot',
            f'"{player_name}" "{school_name}" college soccer',
        ]
        
        for query in queries:
            try:
                params = {
                    'key': self.api_key,
                    'cx': self.search_engine_id,
                    'q': query,
                    'searchType': 'image',
                    'num': 3,  # Get top 3 results
                    'imgType': 'face',  # Prefer face photos
                    'imgSize': 'medium',  # Medium size images
                    'safe': 'active'  # Safe search
                }
                
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
                
                # Be polite to API
                time.sleep(1)
                
            except Exception as e:
                print(f"Error searching for {player_name}: {e}")
                continue
        
        print(f"❌ No Google images found for {player_name}")
        return None

def load_claimed_profiles():
    """Load claimed profiles from JSON file."""
    try:
        with open('clean_claimed_players.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("clean_claimed_players.json not found")
        return []

def setup_google_api():
    """Guide user through Google API setup."""
    print("🔧 Google Custom Search API Setup Required")
    print("=" * 50)
    print("To use automated photo finding, you need:")
    print()
    print("1. Google API Key:")
    print("   • Go to: https://console.cloud.google.com/apis/credentials")
    print("   • Create a new API key")
    print("   • Enable Custom Search API")
    print()
    print("2. Custom Search Engine ID:")
    print("   • Go to: https://cse.google.com/cse/")
    print("   • Create a new search engine")
    print("   • Enable 'Search the entire web'")
    print("   • Enable 'Image search'")
    print("   • Copy the Search Engine ID")
    print()
    
    api_key = input("Enter your Google API Key: ").strip()
    search_engine_id = input("Enter your Search Engine ID: ").strip()
    
    if api_key and search_engine_id:
        # Save to environment file
        with open('.env', 'w') as f:
            f.write(f"GOOGLE_API_KEY={api_key}\n")
            f.write(f"GOOGLE_SEARCH_ENGINE_ID={search_engine_id}\n")
        
        print("✅ API credentials saved to .env file")
        return api_key, search_engine_id
    else:
        print("❌ API credentials not provided")
        return None, None

def main():
    """Main function to process claimed profiles with Google Images."""
    
    # Check for existing credentials
    api_key = os.getenv('GOOGLE_API_KEY')
    search_engine_id = os.getenv('GOOGLE_SEARCH_ENGINE_ID')
    
    if not api_key or not search_engine_id:
        api_key, search_engine_id = setup_google_api()
        if not api_key or not search_engine_id:
            print("❌ Cannot proceed without API credentials")
            return
    
    finder = GoogleImagesFinder(api_key, search_engine_id)
    profiles = load_claimed_profiles()
    
    if not profiles:
        print("No profiles found")
        return
    
    print(f"Processing {len(profiles)} claimed profiles with Google Images...")
    print("Note: Google allows 100 free queries per day")
    print()
    
    updated_profiles = []
    found_photos = 0
    
    # Process profiles (limit to avoid hitting API limits)
    max_profiles = min(50, len(profiles))  # Process max 50 profiles
    profiles_to_process = profiles[:max_profiles]
    
    for i, profile in enumerate(profiles_to_process):
        player_name = profile.get('Name', '')
        school_name = profile.get('Current School', '')
        
        if not player_name or not school_name:
            updated_profiles.append(profile)
            continue
        
        print(f"[{i+1}/{len(profiles_to_process)}] Processing {player_name} from {school_name}")
        
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
        
        # Be polite to API
        time.sleep(2)
    
    # Save updated profiles
    with open('clean_claimed_players_google_photos.json', 'w', encoding='utf-8') as f:
        json.dump(updated_profiles, f, indent=2, ensure_ascii=False)
    
    print(f"\n=== Results ===")
    print(f"Total profiles processed: {len(profiles_to_process)}")
    print(f"Profiles with photos: {found_photos}")
    print(f"Success rate: {(found_photos/len(profiles_to_process)*100):.1f}%")
    print(f"Saved to: clean_claimed_players_google_photos.json")
    
    if len(profiles) > max_profiles:
        print(f"\n⚠️  Note: {len(profiles) - max_profiles} more profiles remain")
        print("Run again tomorrow (Google allows 100 free queries per day)")

if __name__ == "__main__":
    main() 