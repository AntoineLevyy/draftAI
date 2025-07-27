#!/usr/bin/env python3
"""
Manual Photo Finder for Claimed Profiles
Generates search queries and URLs to help manually find photos for existing claimed players.
"""

import json
import csv
from datetime import datetime

def load_claimed_profiles():
    """Load claimed profiles from JSON file."""
    try:
        with open('clean_claimed_players.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("clean_claimed_players.json not found")
        return []

def generate_search_queries(player_name, school_name):
    """Generate search queries for finding player photos."""
    queries = [
        f'"{player_name}" "{school_name}" soccer player photo',
        f'"{player_name}" "{school_name}" athletics roster',
        f'"{player_name}" "{school_name}" men soccer',
        f'"{player_name}" "{school_name}" college soccer',
        f'"{player_name}" "{school_name}" soccer team',
        f'"{player_name}" soccer player headshot',
        f'"{player_name}" "{school_name}" profile photo',
    ]
    return queries

def generate_school_urls(school_name):
    """Generate potential school URLs for manual checking."""
    base_name = school_name.lower().replace(' ', '').replace('cc', 'cc').replace('college', 'college')
    
    urls = [
        f"https://{base_name}.edu/athletics",
        f"https://{base_name}.edu/sports",
        f"https://athletics.{base_name}.edu",
        f"https://www.{base_name}.edu/athletics",
        f"https://www.{base_name}.edu/sports",
    ]
    
    # Add common variations
    if 'cc' in base_name:
        urls.extend([
            f"https://{base_name.replace('cc', 'cc')}.edu/athletics",
            f"https://{base_name.replace('cc', 'cc')}.edu/sports",
        ])
    
    return urls

def create_manual_photo_finder():
    """Create a CSV file with search queries and URLs for manual photo finding."""
    profiles = load_claimed_profiles()
    
    if not profiles:
        print("No profiles found")
        return
    
    print(f"Creating manual photo finder for {len(profiles)} claimed profiles...")
    
    # Create CSV file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_filename = f'manual_photo_finder_{timestamp}.csv'
    
    with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = [
            'Player Name', 
            'School', 
            'Position', 
            'Email',
            'Google Search Queries',
            'School URLs to Check',
            'Photo URL (Manual Entry)',
            'Notes'
        ]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for i, profile in enumerate(profiles):
            player_name = profile.get('Name', '')
            school_name = profile.get('Current School', '')
            position = profile.get('Position', '')
            email = profile.get('Email Address', '')
            
            if not player_name or not school_name:
                continue
            
            print(f"[{i+1}/{len(profiles)}] Processing {player_name} from {school_name}")
            
            # Skip if already has photo
            if profile.get('photo_url'):
                print(f"  {player_name} already has photo - skipping")
                continue
            
            # Generate search queries
            queries = generate_search_queries(player_name, school_name)
            queries_text = '\n'.join([f"• {query}" for query in queries])
            
            # Generate school URLs
            urls = generate_school_urls(school_name)
            urls_text = '\n'.join([f"• {url}" for url in urls])
            
            # Write to CSV
            writer.writerow({
                'Player Name': player_name,
                'School': school_name,
                'Position': position,
                'Email': email,
                'Google Search Queries': queries_text,
                'School URLs to Check': urls_text,
                'Photo URL (Manual Entry)': '',
                'Notes': ''
            })
    
    print(f"\n✅ Created manual photo finder: {csv_filename}")
    print(f"📊 Total profiles to process: {len([p for p in profiles if not p.get('photo_url')])}")
    print(f"📋 Open the CSV file and manually find photos for each player")
    print(f"🔗 Use the Google search queries to find photos")
    print(f"🌐 Check the school URLs for roster pages")

def create_photo_update_script():
    """Create a script to update profiles with found photo URLs."""
    profiles = load_claimed_profiles()
    
    if not profiles:
        print("No profiles found")
        return
    
    print("Creating photo update script...")
    
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
    print("🎯 Manual Photo Finder for Claimed Profiles")
    print("=" * 50)
    
    while True:
        print("\nChoose an option:")
        print("1. Create CSV file for manual photo finding")
        print("2. Create photo update script")
        print("3. Both")
        print("4. Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == '1':
            create_manual_photo_finder()
        elif choice == '2':
            create_photo_update_script()
        elif choice == '3':
            create_manual_photo_finder()
            create_photo_update_script()
        elif choice == '4':
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main() 