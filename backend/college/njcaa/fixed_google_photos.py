#!/usr/bin/env python3
"""
Fixed Google Photos Finder for Claimed Players
Uses Google Custom Search API with proper setup and error handling.
"""

import json
import requests
import time
import os
from typing import Optional, List, Dict
from datetime import datetime

class GoogleImagesFinder:
    def __init__(self, api_key: str, search_engine_id: str):
        self.api_key = api_key
        self.search_engine_id = search_engine_id
        self.base_url = "https://www.googleapis.com/customsearch/v1"
        self.queries_made = 0
        self.max_queries = 100  # Google's free daily limit
    
    def test_connection(self):
        """Test the API connection with a simple search."""
        try:
            params = {
                'key': self.api_key,
                'cx': self.search_engine_id,
                'q': 'soccer player',
                'searchType': 'image',
                'num': 1
            }
            
            response = requests.get(self.base_url, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if 'items' in data and data['items']:
                    print("✅ API connection successful!")
                    return True
                else:
                    print("⚠️  API connected but no results returned")
                    return False
            else:
                print(f"❌ API Error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Connection Error: {e}")
            return False
    
    def search_player_image(self, player_name: str, school_name: str) -> Optional[str]:
        """Search for a player's image using Google Custom Search API."""
        
        if self.queries_made >= self.max_queries:
            print(f"⚠️  Reached daily query limit ({self.max_queries})")
            return None
        
        # Create search query - try multiple variations
        queries = [
            f'"{player_name}" "{school_name}" soccer player photo',
            f'"{player_name}" "{school_name}" athletics roster',
            f'"{player_name}" soccer player headshot',
            f'"{player_name}" "{school_name}" men soccer',
            f'"{player_name}" "{school_name}" college soccer',
        ]
        
        for query in queries:
            if self.queries_made >= self.max_queries:
                break
                
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
                
                response = requests.get(self.base_url, params=params, timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    self.queries_made += 1
                    
                    if 'items' in data and data['items']:
                        # Get the first image result
                        first_image = data['items'][0]
                        image_url = first_image.get('link')
                        
                        if image_url:
                            print(f"✅ Found Google image for {player_name}: {image_url}")
                            return image_url
                else:
                    print(f"Error searching for {player_name}: {response.status_code} - {response.text}")
                    self.queries_made += 1
                
                # Be polite to API
                time.sleep(1)
                
            except Exception as e:
                print(f"Error searching for {player_name}: {e}")
                self.queries_made += 1
                continue
        
        print(f"❌ No Google images found for {player_name}")
        return None

def setup_google_search_engine():
    """Guide user through proper Google Custom Search Engine setup."""
    print("🔧 Google Custom Search Engine Setup")
    print("=" * 50)
    print("Follow these EXACT steps:")
    print()
    print("1. Go to: https://cse.google.com/cse/")
    print("2. Click 'Add' to create a new search engine")
    print("3. In 'Sites to search', enter: google.com")
    print("4. Give it a name (e.g., 'Player Photos')")
    print("5. Click 'Create'")
    print("6. Click on your new search engine")
    print("7. Go to 'Setup' tab")
    print("8. IMPORTANT: Enable 'Search the entire web'")
    print("9. Enable 'Image search'")
    print("10. Copy the 'Search engine ID' (looks like: 123456789012345678901:abcdefghijk)")
    print()
    print("⚠️  Make sure 'Search the entire web' is enabled!")
    print()
    
    search_engine_id = input("Enter your Search Engine ID: ").strip()
    
    if search_engine_id:
        # Save to environment file
        with open('.env', 'w') as f:
            f.write(f"GOOGLE_API_KEY=AIzaSyDb6Bpj5aQWBrF0isuP_sAIglw8nWK1RuI\n")
            f.write(f"GOOGLE_SEARCH_ENGINE_ID={search_engine_id}\n")
        
        print("✅ Search engine ID saved to .env file")
        return search_engine_id
    else:
        print("❌ Search engine ID not provided")
        return None

def load_claimed_profiles():
    """Load claimed profiles from JSON file."""
    try:
        with open('clean_claimed_players.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("clean_claimed_players.json not found")
        return []

def save_progress(profiles, filename):
    """Save profiles with progress."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(profiles, f, indent=2, ensure_ascii=False)
    print(f"💾 Progress saved to: {filename}")

def main():
    """Main function to process all claimed profiles with Google Images."""
    
    # Your API key
    api_key = "AIzaSyDb6Bpj5aQWBrF0isuP_sAIglw8nWK1RuI"
    
    # Check for existing search engine ID
    search_engine_id = os.getenv('GOOGLE_SEARCH_ENGINE_ID')
    
    if not search_engine_id:
        search_engine_id = setup_google_search_engine()
        if not search_engine_id:
            print("❌ Cannot proceed without Search Engine ID")
            return
    
    finder = GoogleImagesFinder(api_key, search_engine_id)
    
    # Test the connection first
    print("🔍 Testing API connection...")
    if not finder.test_connection():
        print("❌ API connection failed. Please check your setup.")
        print("Make sure 'Search the entire web' is enabled in your Custom Search Engine.")
        return
    
    profiles = load_claimed_profiles()
    
    if not profiles:
        print("No profiles found")
        return
    
    print(f"🎯 Fixed Google Photos Finder")
    print(f"📊 Total profiles: {len(profiles)}")
    print(f"🔍 Google API Key: {api_key[:20]}...")
    print(f"🔍 Search Engine ID: {search_engine_id}")
    print(f"📈 Daily query limit: {finder.max_queries}")
    print()
    
    # Filter out profiles that already have photos
    profiles_without_photos = [p for p in profiles if not p.get('photo_url')]
    
    if not profiles_without_photos:
        print("✅ All profiles already have photos!")
        return
    
    print(f"📸 Profiles needing photos: {len(profiles_without_photos)}")
    print()
    
    # Process profiles
    updated_profiles = []
    found_photos = 0
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    for i, profile in enumerate(profiles_without_photos):
        player_name = profile.get('Name', '')
        school_name = profile.get('Current School', '')
        
        if not player_name or not school_name:
            updated_profiles.append(profile)
            continue
        
        print(f"[{i+1}/{len(profiles_without_photos)}] Processing {player_name} from {school_name}")
        print(f"   Queries used: {finder.queries_made}/{finder.max_queries}")
        
        # Search for photo using Google Images
        photo_url = finder.search_player_image(player_name, school_name)
        
        if photo_url:
            profile['photo_url'] = photo_url
            found_photos += 1
            print(f"   ✅ Photo found!")
        else:
            print(f"   ❌ No photo found")
        
        updated_profiles.append(profile)
        
        # Save progress every 10 players
        if (i + 1) % 10 == 0:
            progress_filename = f"progress_photos_{timestamp}.json"
            save_progress(updated_profiles, progress_filename)
        
        # Check if we've hit the daily limit
        if finder.queries_made >= finder.max_queries:
            print(f"\n⚠️  Reached daily query limit ({finder.max_queries})")
            print(f"📊 Processed {i + 1} profiles, found {found_photos} photos")
            break
        
        # Be polite to API
        time.sleep(2)
    
    # Save final results
    final_filename = f"clean_claimed_players_google_photos_{timestamp}.json"
    save_progress(updated_profiles, final_filename)
    
    print(f"\n=== Final Results ===")
    print(f"Total profiles processed: {len(updated_profiles)}")
    print(f"Profiles with photos: {found_photos}")
    print(f"Success rate: {(found_photos/len(updated_profiles)*100):.1f}%")
    print(f"Queries used: {finder.queries_made}/{finder.max_queries}")
    print(f"Final file: {final_filename}")
    
    if len(profiles_without_photos) > len(updated_profiles):
        remaining = len(profiles_without_photos) - len(updated_profiles)
        print(f"\n⚠️  {remaining} profiles remaining (hit daily limit)")
        print("Run again tomorrow to continue processing")

if __name__ == "__main__":
    main() 