#!/usr/bin/env python3
"""
Photo URL Update Script
Add photo URLs to claimed profiles after manual finding.
"""

import json

# Photo URL mappings - add your found photo URLs here
PHOTO_URLS = {
    # Format: "Player Name": "photo_url_here"
    # Example: "Jose Carlos Ortiz": "https://example.com/photo.jpg",
}

def update_profiles_with_photos():
    """Update profiles with found photo URLs."""
    
    # Load current profiles
    with open('clean_claimed_players.json', 'r', encoding='utf-8') as f:
        profiles = json.load(f)
    
    updated_count = 0
    
    for profile in profiles:
        player_name = profile.get('Name', '')
        if player_name in PHOTO_URLS:
            profile['photo_url'] = PHOTO_URLS[player_name]
            updated_count += 1
            print(f"✅ Added photo for {player_name}")
    
    # Save updated profiles
    with open('clean_claimed_players_with_photos.json', 'w', encoding='utf-8') as f:
        json.dump(profiles, f, indent=2, ensure_ascii=False)
    
    print(f"\n📸 Updated {updated_count} profiles with photos")
    print(f"💾 Saved to: clean_claimed_players_with_photos.json")

if __name__ == "__main__":
    update_profiles_with_photos()
