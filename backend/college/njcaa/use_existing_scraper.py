#!/usr/bin/env python3
"""
Use Existing Photo Scraper for Claimed Profiles
Leverages the existing working photo scraper infrastructure.
"""

import json
import sys
import os

# Add the current directory to Python path to import the existing scraper
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from njcaa_player_photo_scraper import scrape_player_details
except ImportError:
    print("Could not import njcaa_player_photo_scraper. Make sure it exists.")
    sys.exit(1)

def load_claimed_profiles():
    """Load claimed profiles from JSON file."""
    try:
        with open('clean_claimed_players.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("clean_claimed_players.json not found")
        return []

def find_player_bio_url(player_name, school_name):
    """Try to construct a bio URL for a player based on common patterns."""
    
    # Common patterns for player bio URLs
    base_patterns = [
        f"https://{school_name.lower().replace(' ', '').replace('cc', 'cc')}.edu/sports/msoc/bios",
        f"https://athletics.{school_name.lower().replace(' ', '').replace('cc', 'cc')}.edu/sports/msoc/bios",
        f"https://www.{school_name.lower().replace(' ', '').replace('cc', 'cc')}.edu/sports/msoc/bios",
    ]
    
    # Clean player name for URL
    clean_name = player_name.lower().replace(' ', '_').replace('-', '_')
    first_name, last_name = clean_name.split('_')[0], clean_name.split('_')[-1]
    
    # Common URL patterns
    url_patterns = [
        f"{first_name}_{last_name}",
        f"{last_name}_{first_name}",
        f"{first_name}-{last_name}",
        f"{last_name}-{first_name}",
        f"{first_name}{last_name}",
        f"{last_name}{first_name}",
    ]
    
    for base in base_patterns:
        for pattern in url_patterns:
            bio_url = f"{base}/{pattern}"
            print(f"Trying: {bio_url}")
            # You could add a quick check here to see if the URL exists
            # For now, we'll just return the first pattern and let the scraper handle it
            return bio_url
    
    return None

def main():
    """Main function to process claimed profiles using existing scraper."""
    profiles = load_claimed_profiles()
    
    if not profiles:
        print("No profiles found")
        return
    
    print(f"Processing {len(profiles)} claimed profiles using existing scraper...")
    
    updated_profiles = []
    found_photos = 0
    
    # Only process first 3 for testing
    test_profiles = profiles[:3]
    
    for i, profile in enumerate(test_profiles):
        player_name = profile.get('Name', '')
        school_name = profile.get('Current School', '')
        
        if not player_name or not school_name:
            updated_profiles.append(profile)
            continue
        
        print(f"[{i+1}/{len(test_profiles)}] Processing {player_name} from {school_name}")
        
        # Skip if already has photo
        if profile.get('photo_url'):
            print(f"{player_name} already has photo")
            updated_profiles.append(profile)
            found_photos += 1
            continue
        
        # Try to find bio URL
        bio_url = find_player_bio_url(player_name, school_name)
        
        if bio_url:
            try:
                print(f"Scraping details from: {bio_url}")
                details = scrape_player_details(bio_url)
                
                if details and details.get('photo_url'):
                    profile['photo_url'] = details['photo_url']
                    found_photos += 1
                    print(f"✅ Found photo for {player_name}: {details['photo_url']}")
                else:
                    print(f"❌ No photo found for {player_name}")
                    
            except Exception as e:
                print(f"Error scraping {player_name}: {e}")
        else:
            print(f"❌ Could not construct bio URL for {player_name}")
        
        updated_profiles.append(profile)
    
    # Save updated profiles
    with open('test_claimed_players_existing_scraper.json', 'w', encoding='utf-8') as f:
        json.dump(updated_profiles, f, indent=2, ensure_ascii=False)
    
    print(f"\n=== Results ===")
    print(f"Total profiles tested: {len(test_profiles)}")
    print(f"Profiles with photos: {found_photos}")
    print(f"Success rate: {(found_photos/len(test_profiles)*100):.1f}%")
    print(f"Saved to: test_claimed_players_existing_scraper.json")

if __name__ == "__main__":
    main() 