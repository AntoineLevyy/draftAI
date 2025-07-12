#!/usr/bin/env python3
"""
Final Summary Report
Compares original data with updated data to show improvements achieved.
"""

import json
import csv

def create_final_summary():
    """Create a final summary report comparing original vs updated data."""
    
    # Load original analysis
    with open('college_data_analysis.json', 'r', encoding='utf-8') as f:
        original_analysis = json.load(f)
    
    # Load updated data
    with open('updated_njcaa_players.json', 'r', encoding='utf-8') as f:
        updated_players = json.load(f)
    
    # Load test results for comparison
    with open('roster_url_test_results.json', 'r', encoding='utf-8') as f:
        test_results = json.load(f)
    
    # Group updated players by team
    team_players_updated = {}
    for player in updated_players:
        team = player.get('team')
        if team:
            if team not in team_players_updated:
                team_players_updated[team] = []
            team_players_updated[team].append(player)
    
    # Analyze updated data
    updated_stats = {
        'total_players': len(updated_players),
        'players_with_height': 0,
        'players_with_weight': 0,
        'players_with_hometown': 0,
        'players_with_picture': 0,
        'players_with_team_logo': 0
    }
    
    for player in updated_players:
        # Check for height data
        height = player.get('height', '')
        data_map_height = player.get('dataMap', {}).get('height', '')
        if height and height not in ['', 'N/A', 'No.:'] or data_map_height and data_map_height not in ['', 'N/A']:
            updated_stats['players_with_height'] += 1
        
        # Check for weight data
        weight = player.get('weight', '')
        data_map_weight = player.get('dataMap', {}).get('weight', '')
        if weight and weight not in ['', 'N/A', 'No.:'] or data_map_weight and data_map_weight not in ['', 'N/A']:
            updated_stats['players_with_weight'] += 1
        
        # Check for hometown data
        hometown = player.get('hometown', '')
        data_map_hometown = player.get('dataMap', {}).get('hometown', '')
        if hometown and hometown not in ['', 'N/A'] or data_map_hometown and data_map_hometown not in ['', 'N/A']:
            updated_stats['players_with_hometown'] += 1
        
        # Check for picture data
        photo_url = player.get('photo_url', '')
        if photo_url and photo_url not in ['', 'N/A', 'https://westernnebraska.prestosports.com/info/images/spacer.gif']:
            updated_stats['players_with_picture'] += 1
        
        # Check for team logo
        team_logo = player.get('team_logo')
        if team_logo:
            updated_stats['players_with_team_logo'] += 1
    
    # Get original stats
    original_stats = original_analysis['summary']
    
    # Calculate improvements
    height_improvement = updated_stats['players_with_height'] - original_stats['Players with Height']
    weight_improvement = updated_stats['players_with_weight'] - original_stats['Players with Weight']
    hometown_improvement = updated_stats['players_with_hometown'] - original_stats['Players with Hometown']
    picture_improvement = updated_stats['players_with_picture'] - original_stats['Players with Pictures']
    
    # Print comprehensive report
    print("\n" + "="*100)
    print("FINAL SUMMARY REPORT - DATA EXTRACTION IMPROVEMENTS")
    print("="*100)
    
    print(f"\nOVERALL COMPARISON:")
    print(f"  Total Players: {updated_stats['total_players']} (unchanged)")
    print(f"  Teams with Updated Roster URLs: {len(test_results)}")
    print(f"  Successful Scrapes: {sum(1 for r in test_results if r['status'] == 'success')}")
    
    print(f"\nDATA COMPLETENESS IMPROVEMENTS:")
    print(f"  Height Data:")
    print(f"    Original: {original_stats['Players with Height']} ({original_stats['Success Rates']['Players with Height (%)']:.1f}%)")
    print(f"    Updated:  {updated_stats['players_with_height']} ({(updated_stats['players_with_height']/updated_stats['total_players'])*100:.1f}%)")
    print(f"    Improvement: +{height_improvement} players")
    
    print(f"  Weight Data:")
    print(f"    Original: {original_stats['Players with Weight']} ({original_stats['Success Rates']['Players with Weight (%)']:.1f}%)")
    print(f"    Updated:  {updated_stats['players_with_weight']} ({(updated_stats['players_with_weight']/updated_stats['total_players'])*100:.1f}%)")
    print(f"    Improvement: +{weight_improvement} players")
    
    print(f"  Hometown Data:")
    print(f"    Original: {original_stats['Players with Hometown']} ({original_stats['Success Rates']['Players with Hometown (%)']:.1f}%)")
    print(f"    Updated:  {updated_stats['players_with_hometown']} ({(updated_stats['players_with_hometown']/updated_stats['total_players'])*100:.1f}%)")
    print(f"    Improvement: +{hometown_improvement} players")
    
    print(f"  Picture Data:")
    print(f"    Original: {original_stats['Players with Pictures']} ({original_stats['Success Rates']['Players with Pictures (%)']:.1f}%)")
    print(f"    Updated:  {updated_stats['players_with_picture']} ({(updated_stats['players_with_picture']/updated_stats['total_players'])*100:.1f}%)")
    print(f"    Improvement: +{picture_improvement} players")
    
    print(f"  Team Logo Data:")
    print(f"    Original: {original_stats['Teams with Team Photos']} teams")
    print(f"    Updated:  {updated_stats['players_with_team_logo']} players with team logos")
    
    print(f"\nSUCCESSFUL TEAMS (from test results):")
    successful_teams = [r for r in test_results if r['status'] == 'success']
    for team in successful_teams:
        print(f"  {team['team']}:")
        print(f"    Players found: {team['actual_players_found']}/{team['expected_total_players']}")
        print(f"    Height: {team['actual_players_with_height']}")
        print(f"    Weight: {team['actual_players_with_weight']}")
        print(f"    Hometown: {team['actual_players_with_hometown']}")
        print(f"    Pictures: {team['actual_players_with_picture']}")
        print(f"    Team photo: {'Yes' if team['actual_team_photo'] else 'No'}")
    
    print(f"\nKEY FINDINGS:")
    print(f"  1. Success Rate: {len(successful_teams)}/{len(test_results)} teams successfully scraped ({(len(successful_teams)/len(test_results))*100:.1f}%)")
    print(f"  2. Data Quality: Most successful teams have complete height/weight/hometown data")
    print(f"  3. Picture Data: Still challenging to extract from most sites")
    print(f"  4. Team Logos: Successfully extracted from most PrestoSports sites")
    
    print(f"\nRECOMMENDATIONS:")
    print(f"  1. Expand roster URL database to include more teams")
    print(f"  2. Improve picture extraction logic for different site structures")
    print(f"  3. Add more robust selectors for different HTML structures")
    print(f"  4. Consider using headless browsers for JavaScript-heavy sites")
    
    print(f"\nFILES CREATED:")
    print(f"  - updated_njcaa_players.json (improved player data)")
    print(f"  - roster_url_test_results.json (test results)")
    print(f"  - data_extraction_comparison.csv (detailed comparison)")
    print(f"  - college_data_analysis.json (original analysis)")
    
    print("\n" + "="*100)

if __name__ == "__main__":
    create_final_summary() 