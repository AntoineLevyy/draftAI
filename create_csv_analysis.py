#!/usr/bin/env python3
"""
Convert the college data analysis JSON to CSV format for easier viewing.
"""

import json
import csv

def json_to_csv():
    """Convert the JSON analysis results to CSV format."""
    
    # Load the JSON analysis results
    with open('college_data_analysis.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Extract team analysis data
    team_analysis = data['team_analysis']
    
    # Define CSV headers
    headers = [
        'Team',
        'Roster URL',
        'Team Photo URL', 
        'Number of players for which we found height in that team',
        'Number of players for which we found weight in that team',
        'Number of players for which we found hometown on that team',
        'Number of players for which we found a picture on that team',
        'Total Players'
    ]
    
    # Write to CSV
    with open('college_data_analysis.csv', 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=headers)
        writer.writeheader()
        
        for team_data in team_analysis:
            writer.writerow(team_data)
    
    print(f"CSV file created: college_data_analysis.csv")
    print(f"Total teams analyzed: {len(team_analysis)}")
    
    # Print summary statistics
    summary = data['summary']
    print(f"\nSummary:")
    print(f"Total Teams: {summary['Total Teams']}")
    print(f"Teams with Roster URLs: {summary['Teams with Roster URLs']} ({summary['Success Rates']['Teams with Roster URLs (%)']}%)")
    print(f"Teams with Team Photos: {summary['Teams with Team Photos']} ({summary['Success Rates']['Teams with Team Photos (%)']}%)")
    print(f"Total Players: {summary['Total Players']}")
    print(f"Players with Height: {summary['Players with Height']} ({summary['Success Rates']['Players with Height (%)']}%)")
    print(f"Players with Weight: {summary['Players with Weight']} ({summary['Success Rates']['Players with Weight (%)']}%)")
    print(f"Players with Hometown: {summary['Players with Hometown']} ({summary['Success Rates']['Players with Hometown (%)']}%)")
    print(f"Players with Pictures: {summary['Players with Pictures']} ({summary['Success Rates']['Players with Pictures (%)']}%)")

if __name__ == "__main__":
    json_to_csv() 