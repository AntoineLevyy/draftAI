#!/usr/bin/env python3
"""
Show All Photos Script
Displays all photos found by the Google API.
"""

import json
import webbrowser
import time

def load_photos_data():
    """Load the photos data from the latest results."""
    try:
        with open('clean_claimed_players_full_google_photos_20250727_144708.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ Photo data file not found")
        return []

def show_all_photos():
    """Show all photos found."""
    profiles = load_photos_data()
    
    if not profiles:
        print("❌ No profiles found")
        return
    
    # Filter profiles with photos
    profiles_with_photos = [p for p in profiles if p.get('photo_url')]
    
    print(f"📸 All Photos Found")
    print(f"=" * 60)
    print(f"📊 Total profiles: {len(profiles)}")
    print(f"📸 Profiles with photos: {len(profiles_with_photos)}")
    print(f"📈 Photo success rate: {(len(profiles_with_photos)/len(profiles)*100):.1f}%")
    print()
    
    if not profiles_with_photos:
        print("❌ No photos found")
        return
    
    print("🔍 All photos found:")
    print("-" * 60)
    
    for i, profile in enumerate(profiles_with_photos):
        name = profile.get('Name', 'Unknown')
        school = profile.get('Current School', 'Unknown')
        position = profile.get('Position', 'Unknown')
        photo_url = profile.get('photo_url', '')
        
        print(f"{i+1:2d}. {name}")
        print(f"    🏫 {school}")
        print(f"    ⚽ {position}")
        print(f"    📷 {photo_url}")
        print()
    
    print(f"✅ Total photos displayed: {len(profiles_with_photos)}")
    
    # Ask if user wants to open all photos in browser
    print("\n🌐 Would you like to open all photos in your browser?")
    print("⚠️  This will open 25 browser tabs!")
    print("1. Open all photos (25 tabs)")
    print("2. Open first 10 photos")
    print("3. Skip opening photos")
    
    choice = input("Enter choice (1-3): ").strip()
    
    if choice == "1":
        print("Opening all photos...")
        for i, profile in enumerate(profiles_with_photos):
            photo_url = profile.get('photo_url', '')
            if photo_url:
                print(f"Opening photo {i+1}/{len(profiles_with_photos)}: {profile.get('Name', 'Unknown')}")
                webbrowser.open_new_tab(photo_url)
                time.sleep(0.5)  # Small delay between opens
    
    elif choice == "2":
        print("Opening first 10 photos...")
        for i, profile in enumerate(profiles_with_photos[:10]):
            photo_url = profile.get('photo_url', '')
            if photo_url:
                print(f"Opening photo {i+1}/10: {profile.get('Name', 'Unknown')}")
                webbrowser.open_new_tab(photo_url)
                time.sleep(0.5)
    
    print("\n✅ Photo display complete!")

def show_photo_sources():
    """Show detailed breakdown of photo sources."""
    profiles = load_photos_data()
    
    if not profiles:
        return
    
    profiles_with_photos = [p for p in profiles if p.get('photo_url')]
    
    # Analyze photo sources
    photo_sources = {}
    for profile in profiles_with_photos:
        photo_url = profile.get('photo_url', '')
        if photo_url:
            domain = photo_url.split('/')[2] if len(photo_url.split('/')) > 2 else 'unknown'
            photo_sources[domain] = photo_sources.get(domain, 0) + 1
    
    print(f"\n📸 Photo Sources Breakdown:")
    print(f"=" * 40)
    for domain, count in sorted(photo_sources.items(), key=lambda x: x[1], reverse=True):
        print(f"  {domain}: {count} photos")

if __name__ == "__main__":
    show_all_photos()
    show_photo_sources() 