import json
import time
from njcaa_player_photo_scraper import scrape_player_details

INPUT_FILE = '../../pro/chunks/njcaa_d1_players.json'.replace('../../pro/chunks', 'backend/pro/chunks')
OUTPUT_FILE = '../../pro/chunks/njcaa_d1_players_detailed_test.json'.replace('../../pro/chunks', 'backend/pro/chunks')

# You may need to adjust this key if your player objects use a different field for the bio page
BIO_URL_KEY = 'url'

with open(INPUT_FILE, 'r') as f:
    players = json.load(f)

# Only process the first 5 players for testing
players = players[:5]

enriched_players = []
for i, player in enumerate(players):
    bio_url = player.get(BIO_URL_KEY)
    if not bio_url:
        enriched_players.append(player)
        continue
    print(f"[{i+1}/{len(players)}] Scraping {player.get('name', 'Unknown')}...")
    details = scrape_player_details(bio_url)
    player.update(details)
    enriched_players.append(player)
    time.sleep(0.5)  # Be polite to the server

with open(OUTPUT_FILE, 'w') as f:
    json.dump(enriched_players, f, indent=2)

print(f"Done! Saved {len(enriched_players)} players to {OUTPUT_FILE}") 