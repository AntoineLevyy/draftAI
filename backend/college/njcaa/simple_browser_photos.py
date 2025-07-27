#!/usr/bin/env python3
"""
Simple Browser Photo Finder
Opens Google Image search tabs for efficient manual photo finding.
"""

import json
import webbrowser
import time
from urllib.parse import quote
from datetime import datetime

def load_claimed_profiles():
    """Load claimed profiles from JSON file."""
    try:
        with open('clean_claimed_players.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("clean_claimed_players.json not found")
        return []

def open_search_tabs(profiles, start_index=0, batch_size=5):
    """Open browser tabs with search queries for a batch of players."""
    
    end_index = min(start_index + batch_size, len(profiles))
    batch = profiles[start_index:end_index]
    
    print(f"Opening browser tabs for players {start_index + 1}-{end_index}...")
    
    for i, profile in enumerate(batch):
        player_name = profile.get('Name', '')
        school_name = profile.get('Current School', '')
        
        if not player_name or not school_name:
            continue
        
        # Skip if already has photo
        if profile.get('photo_url'):
            print(f"  {player_name} already has photo - skipping")
            continue
        
        print(f"  Opening tabs for {player_name} from {school_name}")
        
        # Create search queries
        queries = [
            f'"{player_name}" "{school_name}" soccer player photo',
            f'"{player_name}" "{school_name}" athletics roster',
            f'"{player_name}" soccer player headshot',
            f'"{player_name}" "{school_name}" men soccer',
        ]
        
        # Open browser tabs
        for query in queries:
            search_url = f"https://www.google.com/search?q={quote(query)}&tbm=isch"
            webbrowser.open_new_tab(search_url)
            time.sleep(0.5)  # Small delay between tabs
    
    print(f"✅ Opened {len(batch)} players' search tabs")
    return end_index

def create_photo_update_template():
    """Create a template for updating photos."""
    template = """# Photo URL Updates
# Add your found photo URLs here and run the update script

PHOTO_URLS = {
    # Format: "Player Name": "photo_url_here"
    # Example: "Jose Carlos Ortiz": "https://example.com/photo.jpg",
}

# Instructions:
# 1. Find photos using the browser tabs
# 2. Copy the image URLs (right-click on image -> Copy image address)
# 3. Add them to this dictionary
# 4. Run: python3 update_photos.py
"""
    
    with open('photo_updates_template.py', 'w') as f:
        f.write(template)
    
    print("✅ Created photo_updates_template.py")
    print("📝 Add your found photo URLs to this file")

def create_update_script():
    """Create the update script."""
    script_content = """#!/usr/bin/env python3
\"\"\"
Photo URL Update Script
Add photo URLs to claimed profiles after manual finding.
\"\"\"

import json

# Photo URL mappings - add your found photo URLs here
PHOTO_URLS = {
    # Format: "Player Name": "photo_url_here"
    # Example: "Jose Carlos Ortiz": "https://example.com/photo.jpg",
}

def update_profiles_with_photos():
    \"\"\"Update profiles with found photo URLs.\"\"\"
    
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
    
    print(f"\\n📸 Updated {updated_count} profiles with photos")
    print(f"💾 Saved to: clean_claimed_players_with_photos.json")

if __name__ == "__main__":
    update_profiles_with_photos()
"""
    
    with open('update_photos.py', 'w') as f:
        f.write(script_content)
    
    print("✅ Created update_photos.py script")
    print("📝 Edit the PHOTO_URLS dictionary with your found photo URLs")
    print("🚀 Run 'python3 update_photos.py' to update the profiles")

def main():
    """Main function."""
    profiles = load_claimed_profiles()
    
    if not profiles:
        print("No profiles found")
        return
    
    # Filter out profiles that already have photos
    profiles_without_photos = [p for p in profiles if not p.get('photo_url')]
    
    print(f"🎯 Simple Browser Photo Finder")
    print(f"📊 Total profiles: {len(profiles)}")
    print(f"📸 Profiles needing photos: {len(profiles_without_photos)}")
    print()
    
    while True:
        print("Choose an option:")
        print("1. Open browser tabs for first 5 players")
        print("2. Open browser tabs for next 5 players")
        print("3. Open browser tabs for specific player")
        print("4. Create photo update template and script")
        print("5. Show progress")
        print("6. Exit")
        
        choice = input("\nEnter your choice (1-6): ").strip()
        
        if choice == '1':
            open_search_tabs(profiles_without_photos, 0, 5)
        elif choice == '2':
            current_pos = int(input("Enter current position (0 for first batch): "))
            open_search_tabs(profiles_without_photos, current_pos, 5)
        elif choice == '3':
            player_name = input("Enter player name: ").strip()
            found_profile = None
            for profile in profiles_without_photos:
                if player_name.lower() in profile.get('Name', '').lower():
                    found_profile = profile
                    break
            
            if found_profile:
                open_search_tabs([found_profile], 0, 1)
            else:
                print(f"Player '{player_name}' not found")
        elif choice == '4':
            create_photo_update_template()
            create_update_script()
        elif choice == '5':
            with_photos = len([p for p in profiles if p.get('photo_url')])
            without_photos = len(profiles) - with_photos
            print(f"📊 Progress:")
            print(f"   • Profiles with photos: {with_photos}")
            print(f"   • Profiles without photos: {without_photos}")
            print(f"   • Completion: {(with_photos/len(profiles)*100):.1f}%")
        elif choice == '6':
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main() 