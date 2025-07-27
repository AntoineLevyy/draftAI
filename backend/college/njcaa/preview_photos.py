#!/usr/bin/env python3
"""
Photo Preview Script
Shows the photos found by the Google API to verify quality.
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

def preview_photos():
    """Preview the photos found."""
    profiles = load_photos_data()
    
    if not profiles:
        print("❌ No profiles found")
        return
    
    # Filter profiles with photos
    profiles_with_photos = [p for p in profiles if p.get('photo_url')]
    
    print(f"📸 Photo Preview")
    print(f"=" * 50)
    print(f"📊 Total profiles: {len(profiles)}")
    print(f"📸 Profiles with photos: {len(profiles_with_photos)}")
    print(f"📈 Photo success rate: {(len(profiles_with_photos)/len(profiles)*100):.1f}%")
    print()
    
    if not profiles_with_photos:
        print("❌ No photos found")
        return
    
    print("🔍 Found photos:")
    print("-" * 50)
    
    for i, profile in enumerate(profiles_with_photos[:10]):  # Show first 10
        name = profile.get('Name', 'Unknown')
        school = profile.get('Current School', 'Unknown')
        photo_url = profile.get('photo_url', '')
        
        print(f"{i+1:2d}. {name} ({school})")
        print(f"    📷 {photo_url}")
        print()
    
    if len(profiles_with_photos) > 10:
        print(f"... and {len(profiles_with_photos) - 10} more photos")
    
    # Ask if user wants to open photos in browser
    print("🌐 Would you like to open some photos in your browser?")
    print("1. Open first 5 photos")
    print("2. Open random 5 photos")
    print("3. Skip preview")
    
    choice = input("Enter choice (1-3): ").strip()
    
    if choice == "1":
        # Open first 5 photos
        for i, profile in enumerate(profiles_with_photos[:5]):
            photo_url = profile.get('photo_url', '')
            if photo_url:
                print(f"Opening photo {i+1}: {profile.get('Name', 'Unknown')}")
                webbrowser.open_new_tab(photo_url)
                time.sleep(1)  # Small delay between opens
    
    elif choice == "2":
        # Open random 5 photos
        import random
        random_photos = random.sample(profiles_with_photos, min(5, len(profiles_with_photos)))
        for i, profile in enumerate(random_photos):
            photo_url = profile.get('photo_url', '')
            if photo_url:
                print(f"Opening random photo {i+1}: {profile.get('Name', 'Unknown')}")
                webbrowser.open_new_tab(photo_url)
                time.sleep(1)
    
    print("\n✅ Photo preview complete!")

def show_photo_stats():
    """Show detailed statistics about the photos."""
    profiles = load_photos_data()
    
    if not profiles:
        return
    
    profiles_with_photos = [p for p in profiles if p.get('photo_url')]
    
    print(f"\n📊 Photo Statistics:")
    print(f"=" * 30)
    print(f"Total players: {len(profiles)}")
    print(f"With photos: {len(profiles_with_photos)}")
    print(f"Without photos: {len(profiles) - len(profiles_with_photos)}")
    print(f"Success rate: {(len(profiles_with_photos)/len(profiles)*100):.1f}%")
    
    # Analyze photo sources
    photo_sources = {}
    for profile in profiles_with_photos:
        photo_url = profile.get('photo_url', '')
        if photo_url:
            domain = photo_url.split('/')[2] if len(photo_url.split('/')) > 2 else 'unknown'
            photo_sources[domain] = photo_sources.get(domain, 0) + 1
    
    print(f"\n📸 Photo Sources:")
    for domain, count in sorted(photo_sources.items(), key=lambda x: x[1], reverse=True):
        print(f"  {domain}: {count} photos")

if __name__ == "__main__":
    preview_photos()
    show_photo_stats() 