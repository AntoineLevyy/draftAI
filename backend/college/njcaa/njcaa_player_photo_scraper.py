import requests
from bs4 import BeautifulSoup
import json

# Helper to build full photo URL
BASE_URL = "https://athletics.mohave.edu"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def scrape_player_details(bio_url):
    """
    Given a PrestoSports player bio URL, return dict with photo_url, height, weight, hometown.
    """
    try:
        resp = requests.get(bio_url, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')

        # Find player photo
        photo_tag = soup.select_one('.player-headshot img')
        if photo_tag and photo_tag.get('src'):
            src = photo_tag['src']
            if src.startswith('http'):
                photo_url = src
            else:
                photo_url = BASE_URL + src
        else:
            photo_url = None

        # Find height, weight, hometown
        height = weight = hometown = None
        for li in soup.select('.roster-player-fields li'):
            label = li.select_one('dt.label')
            value = li.select_one('dd.value')
            if not label or not value:
                continue
            label_text = label.text.strip().lower()
            value_text = value.text.strip()
            if 'height' in label_text:
                height = value_text
            elif 'weight' in label_text:
                weight = value_text
            elif 'hometown' in label_text:
                hometown = value_text

        return {
            'photo_url': photo_url,
            'height': height,
            'weight': weight,
            'hometown': hometown
        }
    except Exception as e:
        print(f"Error scraping {bio_url}: {e}")
        return {
            'photo_url': None,
            'height': None,
            'weight': None,
            'hometown': None
        }

if __name__ == "__main__":
    # Test with a few sample players
    test_players = [
        {
            'name': 'Christopher Abad',
            'url': 'https://athletics.mohave.edu/sports/msoc/2024-25/bios/abad_christopher_xk5j'
        },
        {
            'name': 'Yahir Acero',
            'url': 'https://athletics.mohave.edu/sports/msoc/2024-25/bios/acero_yahir_71lq'
        },
        {
            'name': 'Gabriel Jimenez',
            'url': 'https://athletics.mohave.edu/sports/msoc/2024-25/bios/jimenez_gabriel_6puu'
        }
    ]
    results = []
    for player in test_players:
        print(f"Scraping {player['name']}...")
        details = scrape_player_details(player['url'])
        player.update(details)
        print(json.dumps(player, indent=2))
        results.append(player)
    # Optionally save to file
    with open('test_player_details.json', 'w') as f:
        json.dump(results, f, indent=2) 