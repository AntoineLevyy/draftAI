#!/usr/bin/env python3
"""
Balanced Search Photos Finder
Uses balanced search queries that are accurate but not too strict.
"""

import json
import requests
import time
import os
from typing import Optional, List, Dict
from datetime import datetime

class BalancedGoogleImagesFinder:
    def __init__(self, api_key: str, search_engine_id: str):
        self.api_key = api_key
        self.search_engine_id = search_engine_id
        self.base_url = "https://www.googleapis.com/customsearch/v1"
        self.queries_made = 0
        self.max_queries = 100  # Google's free daily limit
        self.successful_finds = 0
        self.failed_finds = 0
    
    def clean_name(self, name: str) -> str:
        """Clean and format name for better search results."""
        # Remove extra spaces and normalize
        name = ' '.join(name.split())
        return name
    
    def search_player_image(self, player_name: str, school_name: str, position: str = "") -> Optional[str]:
        """Search for a player's image using balanced Google Custom Search API."""
        
        if self.queries_made >= self.max_queries:
            print(f"⚠️  Reached daily query limit ({self.max_queries})")
            return None
        
        # Clean the name
        clean_name = self.clean_name(player_name)
        
        # Create balanced search queries - not too strict, not too loose
        queries = [
            # Most specific queries first
            f'"{clean_name}" "{school_name}" soccer player',
            f'"{clean_name}" "{school_name}" men soccer',
            f'"{clean_name}" "{school_name}" soccer roster',
            
            # Name + school + position
            f'"{clean_name}" "{school_name}" {position}',
            f'"{clean_name}" soccer "{school_name}"',
            
            # Broader but still relevant
            f'"{clean_name}" "{school_name}" athletics',
            f'"{clean_name}" college soccer',
            f'"{clean_name}" soccer player',
        ]
        
        print(f"   🔍 Trying {len(queries)} search variations...")
        
        for i, query in enumerate(queries):
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
                    'safe': 'active',  # Safe search
                }
                
                response = requests.get(self.base_url, params=params, timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    self.queries_made += 1
                    
                    if 'items' in data and data['items']:
                        # Check if any result seems relevant
                        for j, image in enumerate(data['items']):
                            image_url = image.get('link', '')
                            image_title = image.get('title', '').lower()
                            image_snippet = image.get('snippet', '').lower()
                            
                            # Use a more balanced relevance check
                            if self.is_balanced_relevant(image_url, image_title, image_snippet, clean_name, school_name):
                                print(f"   ✅ Found relevant image (query {i+1}, result {j+1}): {image_url[:80]}...")
                                self.successful_finds += 1
                                return image_url
                        
                        # If no highly relevant image, take the first one
                        first_image = data['items'][0]
                        image_url = first_image.get('link')
                        if image_url:
                            print(f"   ⚠️  Found image (query {i+1}): {image_url[:80]}...")
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
    
    def is_balanced_relevant(self, image_url: str, title: str, snippet: str, player_name: str, school_name: str) -> bool:
        """Check if an image seems relevant using balanced criteria."""
        # Convert to lowercase for comparison
        title_lower = title.lower()
        snippet_lower = snippet.lower()
        player_lower = player_name.lower()
        school_lower = school_name.lower()
        
        # Check if player name appears (at least first or last name)
        name_parts = player_lower.split()
        first_name = name_parts[0] if name_parts else ""
        last_name = name_parts[-1] if len(name_parts) > 1 else ""
        
        # Check for name matches
        has_first_name = first_name in title_lower or first_name in snippet_lower
        has_last_name = last_name in title_lower or last_name in snippet_lower
        has_full_name = player_lower in title_lower or player_lower in snippet_lower
        
        # Check for school context
        has_school = school_lower in title_lower or school_lower in snippet_lower
        
        # Check for soccer context
        soccer_terms = ['soccer', 'football', 'athlete', 'player', 'team', 'roster', 'college', 'university']
        has_soccer_context = any(term in title_lower or term in snippet_lower for term in soccer_terms)
        
        # Balanced scoring - more lenient than before
        score = 0
        if has_full_name: score += 4
        elif has_first_name and has_last_name: score += 3
        elif has_first_name or has_last_name: score += 2
        if has_school: score += 2
        if has_soccer_context: score += 1
        
        # Lower threshold for relevance
        return score >= 2

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
    """Main function to test balanced search on a few players."""
    
    print("🎯 Balanced Search Photos Finder")
    print("=" * 50)
    
    # Your working credentials
    api_key = "AIzaSyDb6Bpj5aQWBrF0isuP_sAIglw8nWK1RuI"
    search_engine_id = "56edbe8a65a364f1a"
    
    finder = BalancedGoogleImagesFinder(api_key, search_engine_id)
    
    # Load profiles
    profiles = load_claimed_profiles()
    
    if not profiles:
        print("❌ No profiles found")
        return
    
    print(f"📊 Total profiles loaded: {len(profiles)}")
    print(f"🔍 Google API Key: {api_key[:20]}...")
    print(f"🔍 Search Engine ID: {search_engine_id}")
    print(f"📈 Daily query limit: {finder.max_queries}")
    print()
    
    # Test on first 5 players to see improvement
    test_profiles = profiles[:5]
    
    print(f"🧪 Testing balanced search on {len(test_profiles)} players...")
    print()
    
    # Process test profiles
    updated_profiles = []
    found_photos = 0
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    for i, profile in enumerate(test_profiles):
        player_name = profile.get('Name', '')
        school_name = profile.get('Current School', '')
        position = profile.get('Position', '')
        
        if not player_name or not school_name:
            print(f"[{i+1}/{len(test_profiles)}] Skipping {player_name} - missing name or school")
            updated_profiles.append(profile)
            continue
        
        print(f"[{i+1}/{len(test_profiles)}] 🔍 Searching for {player_name} from {school_name}")
        print(f"   📊 Queries used: {finder.queries_made}/{finder.max_queries}")
        total_attempts = finder.successful_finds + finder.failed_finds
        if total_attempts > 0:
            success_rate = (finder.successful_finds / total_attempts) * 100
            print(f"   📈 Success rate: {finder.successful_finds}/{total_attempts} ({success_rate:.1f}%)")
        else:
            print(f"   📈 Success rate: {finder.successful_finds}/{total_attempts} (0.0%)")
        
        # Search for photo using balanced Google Images
        photo_url = finder.search_player_image(player_name, school_name, position)
        
        if photo_url:
            profile['photo_url'] = photo_url
            found_photos += 1
            print(f"   ✅ Photo added successfully!")
        else:
            print(f"   ❌ No photo found")
        
        # Clean the profile data
        cleaned_profile = clean_json_output(profile)
        updated_profiles.append(cleaned_profile)
        
        # Check if we've hit the daily limit
        if finder.queries_made >= finder.max_queries:
            print(f"\n⚠️  Reached daily query limit ({finder.max_queries})")
            print(f"📊 Processed {i + 1} profiles, found {found_photos} photos")
            break
        
        # Be polite to API
        time.sleep(2)
        print()  # Add spacing between players
    
    # Save test results
    test_filename = f"balanced_search_test_{timestamp}.json"
    save_progress(updated_profiles, test_filename)
    
    print(f"\n🎉 === Test Results ===")
    print(f"📊 Total profiles processed: {len(updated_profiles)}")
    print(f"📸 New photos found: {found_photos}")
    print(f"📈 Success rate: {(found_photos/len(test_profiles)*100):.1f}%")
    print(f"🔍 Queries used: {finder.queries_made}/{finder.max_queries}")
    print(f"💾 Test file: {test_filename}")
    
    # Show some example photos found
    photos_found = [p for p in updated_profiles if p.get('photo_url')]
    if photos_found:
        print(f"\n📸 Photos found in test:")
        for i, profile in enumerate(photos_found):
            print(f"   {profile.get('Name', 'Unknown')}: {profile.get('photo_url', '')[:80]}...")

if __name__ == "__main__":
    main() 