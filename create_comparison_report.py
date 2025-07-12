#!/usr/bin/env python3
"""
Create a detailed comparison report between expected and actual data extraction results.
"""

import json
import csv

def create_comparison_report():
    """Create a detailed comparison report."""
    
    # Load the test results
    with open('roster_url_test_results.json', 'r', encoding='utf-8') as f:
        results = json.load(f)
    
    # Create comparison data
    comparison_data = []
    
    for result in results:
        team_name = result['team']
        roster_url = result['roster_url']
        
        # Compare expected vs actual
        comparison = {
            'Team': team_name,
            'Roster URL': roster_url,
            'Status': result['status'],
            
            # Team Photo
            'Expected Team Photo': 'Yes' if result['expected_team_photo'] else 'No',
            'Actual Team Photo': 'Yes' if result['actual_team_photo'] else 'No',
            'Team Photo Match': '✓' if (result['expected_team_photo'] and result['actual_team_photo']) or (not result['expected_team_photo'] and not result['actual_team_photo']) else '✗',
            
            # Player Count
            'Expected Players': result['expected_total_players'],
            'Actual Players Found': result['actual_players_found'],
            'Player Count Match': '✓' if result['expected_total_players'] == result['actual_players_found'] else '✗',
            
            # Height Data
            'Expected Height': result['expected_height'],
            'Actual Height': result['actual_players_with_height'],
            'Height Match': '✓' if (result['expected_height'] == 'Should Have' and result['actual_players_with_height'] > 0) or (result['expected_height'] == '0' and result['actual_players_with_height'] == 0) else '✗',
            
            # Weight Data
            'Expected Weight': result['expected_weight'],
            'Actual Weight': result['actual_players_with_weight'],
            'Weight Match': '✓' if (result['expected_weight'] == 'Should Have' and result['actual_players_with_weight'] > 0) or (result['expected_weight'] == '0' and result['actual_players_with_weight'] == 0) else '✗',
            
            # Hometown Data
            'Expected Hometown': result['expected_hometown'],
            'Actual Hometown': result['actual_players_with_hometown'],
            'Hometown Match': '✓' if (result['expected_hometown'] == 'Should Have' and result['actual_players_with_hometown'] > 0) or (result['expected_hometown'] == '0' and result['actual_players_with_hometown'] == 0) else '✗',
            
            # Picture Data
            'Expected Picture': result['expected_picture'],
            'Actual Picture': result['actual_players_with_picture'],
            'Picture Match': '✓' if (result['expected_picture'] == 'Should Have' and result['actual_players_with_picture'] > 0) or (result['expected_picture'] == '0' and result['actual_players_with_picture'] == 0) else '✗'
        }
        
        comparison_data.append(comparison)
    
    # Save to CSV
    headers = [
        'Team', 'Roster URL', 'Status', 
        'Expected Team Photo', 'Actual Team Photo', 'Team Photo Match',
        'Expected Players', 'Actual Players Found', 'Player Count Match',
        'Expected Height', 'Actual Height', 'Height Match',
        'Expected Weight', 'Actual Weight', 'Weight Match',
        'Expected Hometown', 'Actual Hometown', 'Hometown Match',
        'Expected Picture', 'Actual Picture', 'Picture Match'
    ]
    
    with open('data_extraction_comparison.csv', 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=headers)
        writer.writeheader()
        
        for comparison in comparison_data:
            writer.writerow(comparison)
    
    # Calculate summary statistics
    total_tests = len(comparison_data)
    successful_tests = sum(1 for c in comparison_data if c['Status'] == 'success')
    no_url_tests = sum(1 for c in comparison_data if c['Status'] == 'no_url')
    
    # Count matches for each data type
    team_photo_matches = sum(1 for c in comparison_data if c['Team Photo Match'] == '✓')
    player_count_matches = sum(1 for c in comparison_data if c['Player Count Match'] == '✓')
    height_matches = sum(1 for c in comparison_data if c['Height Match'] == '✓')
    weight_matches = sum(1 for c in comparison_data if c['Weight Match'] == '✓')
    hometown_matches = sum(1 for c in comparison_data if c['Hometown Match'] == '✓')
    picture_matches = sum(1 for c in comparison_data if c['Picture Match'] == '✓')
    
    # Print summary
    print("\n" + "="*100)
    print("DATA EXTRACTION COMPARISON SUMMARY")
    print("="*100)
    
    print(f"\nOVERALL RESULTS:")
    print(f"  Total Tests: {total_tests}")
    print(f"  Successful Scrapes: {successful_tests}")
    print(f"  No URL Provided: {no_url_tests}")
    print(f"  Success Rate: {(successful_tests/total_tests)*100:.1f}%")
    
    print(f"\nDATA EXTRACTION ACCURACY:")
    print(f"  Team Photo Matches: {team_photo_matches}/{total_tests} ({(team_photo_matches/total_tests)*100:.1f}%)")
    print(f"  Player Count Matches: {player_count_matches}/{total_tests} ({(player_count_matches/total_tests)*100:.1f}%)")
    print(f"  Height Data Matches: {height_matches}/{total_tests} ({(height_matches/total_tests)*100:.1f}%)")
    print(f"  Weight Data Matches: {weight_matches}/{total_tests} ({(weight_matches/total_tests)*100:.1f}%)")
    print(f"  Hometown Data Matches: {hometown_matches}/{total_tests} ({(hometown_matches/total_tests)*100:.1f}%)")
    print(f"  Picture Data Matches: {picture_matches}/{total_tests} ({(picture_matches/total_tests)*100:.1f}%)")
    
    # Show specific issues
    print(f"\nSPECIFIC ISSUES FOUND:")
    
    # Teams with no players found but should have
    no_players_but_should = [c for c in comparison_data if c['Expected Players'] > 0 and c['Actual Players Found'] == 0 and c['Status'] == 'success']
    if no_players_but_should:
        print(f"  Teams with no players found (but should have):")
        for team in no_players_but_should:
            print(f"    - {team['Team']} (expected {team['Expected Players']})")
    
    # Teams with missing height data
    missing_height = [c for c in comparison_data if c['Expected Height'] == 'Should Have' and c['Actual Height'] == 0 and c['Status'] == 'success']
    if missing_height:
        print(f"  Teams missing height data:")
        for team in missing_height:
            print(f"    - {team['Team']}")
    
    # Teams with missing weight data
    missing_weight = [c for c in comparison_data if c['Expected Weight'] == 'Should Have' and c['Actual Weight'] == 0 and c['Status'] == 'success']
    if missing_weight:
        print(f"  Teams missing weight data:")
        for team in missing_weight:
            print(f"    - {team['Team']}")
    
    # Teams with missing hometown data
    missing_hometown = [c for c in comparison_data if c['Expected Hometown'] == 'Should Have' and c['Actual Hometown'] == 0 and c['Status'] == 'success']
    if missing_hometown:
        print(f"  Teams missing hometown data:")
        for team in missing_hometown:
            print(f"    - {team['Team']}")
    
    # Teams with missing picture data
    missing_picture = [c for c in comparison_data if c['Expected Picture'] == 'Should Have' and c['Actual Picture'] == 0 and c['Status'] == 'success']
    if missing_picture:
        print(f"  Teams missing picture data:")
        for team in missing_picture:
            print(f"    - {team['Team']}")
    
    print(f"\nFiles created:")
    print(f"  - data_extraction_comparison.csv (detailed comparison)")
    print(f"  - roster_url_test_results.json (raw test results)")
    
    print("\n" + "="*100)

if __name__ == "__main__":
    create_comparison_report() 