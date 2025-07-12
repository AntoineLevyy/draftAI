#!/usr/bin/env python3
"""
Extract colleges that have roster URLs from njcaa_club_mappings.json
"""

import json

def extract_colleges_with_urls():
    # Load the club mappings
    with open('backend/college/njcaa/njcaa_club_mappings.json', 'r') as f:
        club_mappings = json.load(f)
    
    # Get colleges with URLs
    colleges_with_urls = []
    for college, url in club_mappings.items():
        if url and url != "null":
            colleges_with_urls.append(college)
    
    # Sort alphabetically
    colleges_with_urls.sort()
    
    print(f"Colleges with roster URLs ({len(colleges_with_urls)} total):")
    print("=" * 50)
    
    for i, college in enumerate(colleges_with_urls, 1):
        print(f"{i:2d}. {college}")
    
    print(f"\nTotal: {len(colleges_with_urls)} colleges with URLs")
    print(f"Total teams in file: {len(club_mappings)}")
    print(f"Teams without URLs: {len(club_mappings) - len(colleges_with_urls)}")

if __name__ == "__main__":
    extract_colleges_with_urls() 