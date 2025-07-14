#!/usr/bin/env python3
"""
Test: Efbet Liga (Bulgaria 1st Tier) Player Data Scraper using Transfermarkt API
"""

import requests

API_KEY = "3239a3729emsha33e79a3ad07beep1b4d22jsn57e37ca1df6f"
HOST = "transfermarkt6.p.rapidapi.com"
SEASON_ID = "2024"
LEAGUE_ID = "BU1"  # Efbet Liga

endpoint = f"https://{HOST}/competitions/get-clubs"
headers = {
    "X-RapidAPI-Key": API_KEY,
    "X-RapidAPI-Host": HOST
}
params = {"id": LEAGUE_ID, "seasonID": SEASON_ID}

response = requests.get(endpoint, headers=headers, params=params, timeout=30)
print(f"Status code: {response.status_code}")
print(f"Response: {response.text[:500]}") 