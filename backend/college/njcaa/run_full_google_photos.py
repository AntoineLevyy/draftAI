#!/usr/bin/env python3
"""
Full Google Photos Finder for Claimed Players
Processes the complete dataset to find photos for all players.
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
        self.successful_finds = 0
        self.failed_finds = 0
    
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
                            print(f"   ✅ Found image: {image_url[:80]}...")
                            self.successful_finds += 1
                            return image_url
                else:
                    print(f"   ❌ API Error: {response.status_code}")
                    self.queries_made += 1
                
                # Be polite to API
                time.sleep(1)
                
            except Exception as e:
                print(f"   ❌ Search error: {str(e)[:50]}...")
                self.queries_made += 1
                continue
        
        print(f"   ❌ No images found after {len(queries)} search attempts")
        self.failed_finds += 1
        return None

def load_claimed_profiles():
    """Load claimed profiles from JSON file."""
    try:
        with open('clean_claimed_players.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ clean_claimed_players.json not found")
        return []

def save_progress(profiles, filename):
    """Save profiles with progress."""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(profiles, f, indent=2, ensure_ascii=False)
        print(f"💾 Progress saved: {filename}")
    except Exception as e:
        print(f"❌ Error saving progress: {e}")

def clean_json_output(profile):
    """Clean and standardize the JSON output."""
    # Remove any None values and empty strings
    cleaned = {}
    for key, value in profile.items():
        if value is not None and value != "":
            cleaned[key] = value
    
    # Ensure photo_url is properly formatted
    if 'photo_url' in cleaned:
        # Remove any extra whitespace
        cleaned['photo_url'] = cleaned['photo_url'].strip()
    
    return cleaned

def main():
    """Main function to process all claimed profiles with Google Images."""
    
    print("🎯 Full Google Photos Finder")
    print("=" * 50)
    
    # Your working credentials
    api_key = "AIzaSyDb6Bpj5aQWBrF0isuP_sAIglw8nWK1RuI"
    search_engine_id = "56edbe8a65a364f1a"
    
    finder = GoogleImagesFinder(api_key, search_engine_id)
    
    # Load all profiles from scratch
    print("🆕 Loading all profiles from clean_claimed_players.json...")
    profiles = load_claimed_profiles()
    
    if not profiles:
        print("❌ No profiles found")
        return
    
    print(f"📊 Total profiles loaded: {len(profiles)}")
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
    print(f"📸 Profiles with photos: {len(profiles) - len(profiles_without_photos)}")
    print()
    
    # Process profiles
    updated_profiles = []
    found_photos = 0
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    for i, profile in enumerate(profiles_without_photos):
        player_name = profile.get('Name', '')
        school_name = profile.get('Current School', '')
        
        if not player_name or not school_name:
            print(f"[{i+1}/{len(profiles_without_photos)}] Skipping {player_name} - missing name or school")
            updated_profiles.append(profile)
            continue
        
        print(f"[{i+1}/{len(profiles_without_photos)}] 🔍 Searching for {player_name} from {school_name}")
        print(f"   📊 Queries used: {finder.queries_made}/{finder.max_queries}")
        total_attempts = finder.successful_finds + finder.failed_finds
        if total_attempts > 0:
            success_rate = (finder.successful_finds / total_attempts) * 100
            print(f"   📈 Success rate: {finder.successful_finds}/{total_attempts} ({success_rate:.1f}%)")
        else:
            print(f"   📈 Success rate: {finder.successful_finds}/{total_attempts} (0.0%)")
        
        # Search for photo using Google Images
        photo_url = finder.search_player_image(player_name, school_name)
        
        if photo_url:
            profile['photo_url'] = photo_url
            found_photos += 1
            print(f"   ✅ Photo added successfully!")
        else:
            print(f"   ❌ No photo found")
        
        # Clean the profile data
        cleaned_profile = clean_json_output(profile)
        updated_profiles.append(cleaned_profile)
        
        # Save progress every 5 players
        if (i + 1) % 5 == 0:
            progress_filename = f"full_progress_photos_{timestamp}.json"
            save_progress(updated_profiles, progress_filename)
            print(f"   💾 Progress saved at player {i+1}")
        
        # Check if we've hit the daily limit
        if finder.queries_made >= finder.max_queries:
            print(f"\n⚠️  Reached daily query limit ({finder.max_queries})")
            print(f"📊 Processed {i + 1} profiles, found {found_photos} photos")
            break
        
        # Be polite to API
        time.sleep(2)
        print()  # Add spacing between players
    
    # Save final results
    final_filename = f"clean_claimed_players_full_google_photos_{timestamp}.json"
    save_progress(updated_profiles, final_filename)
    
    print(f"\n🎉 === Final Results ===")
    print(f"📊 Total profiles processed: {len(updated_profiles)}")
    print(f"📸 New photos found: {found_photos}")
    print(f"📸 Total photos now: {sum(1 for p in updated_profiles if p.get('photo_url'))}")
    print(f"📈 Success rate: {(found_photos/len(profiles_without_photos)*100):.1f}%")
    print(f"🔍 Queries used: {finder.queries_made}/{finder.max_queries}")
    print(f"💾 Final file: {final_filename}")
    
    if len(profiles_without_photos) > len(updated_profiles):
        remaining = len(profiles_without_photos) - len(updated_profiles)
        print(f"\n⚠️  {remaining} profiles remaining (hit daily limit)")
        print("🔄 Run again tomorrow to continue processing")
    
    # Show some example photos found
    photos_found = [p for p in updated_profiles if p.get('photo_url')]
    if photos_found:
        print(f"\n📸 Example photos found:")
        for i, profile in enumerate(photos_found[-5:]):  # Show last 5
            print(f"   {profile.get('Name', 'Unknown')}: {profile.get('photo_url', '')[:80]}...")

if __name__ == "__main__":
    main() 