import requests
from bs4 import BeautifulSoup
import json
import re
import time

BASE_URL = "https://www.topdrawersoccer.com"
START_URL = "https://www.topdrawersoccer.com/search/?query=&genderId=m&positionId=0&graduationYear=&regionId=0&countyId=0&pageNo={page}&area=clubplayer&sortColumns=0&sortDirections=1&search=1"
OUTPUT_FILE = "male_club_players.json"

def extract_player_info(item_div):
    # Name
    name = None
    name_a = item_div.select_one(".col-name a.bd")
    if name_a:
        name = name_a.text.strip()

    # Club (text node after rating span in .ml-2)
    club = None
    ml2 = item_div.select_one(".col-name .ml-2")
    if ml2:
        # Remove all children (a, span, div) to get the club text
        club_text = ml2.get_text(separator="\n", strip=True)
        # Remove lines that are name, state, pos, or empty
        lines = [l.strip() for l in club_text.split("\n") if l.strip()]
        # Remove name line
        if lines and name and lines[0] == name:
            lines = lines[1:]
        # Remove rating line if present
        if lines and lines[0].startswith("TSJ FC") or lines[0].startswith("ELA") or lines[0].startswith("N/A"):
            # Sometimes club is first line
            club = lines[0]
        else:
            # Otherwise, look for first line that isn't state/pos
            for l in lines:
                if not l.startswith("State:") and not l.startswith("Pos:"):
                    club = l
                    break
    # State
    state = None
    state_div = item_div.select_one(".col-state")
    if state_div:
        state = state_div.text.strip()
    else:
        # Fallback to mobile
        for d in item_div.select(".ml-2 .d-flex.d-md-none"):
            if d.text.strip().startswith("State:"):
                state = d.text.strip().replace("State:", "").replace("(", "").replace(")", "").strip()
    # Position
    position = None
    pos_div = item_div.select_one(".col-position")
    if pos_div:
        position = pos_div.text.strip()
    else:
        # Fallback to mobile
        for d in item_div.select(".ml-2 .d-flex.d-md-none"):
            if d.text.strip().startswith("Pos:"):
                position = d.text.strip().replace("Pos:", "").replace("(", "").replace(")", "").strip()
    # Grad year
    grad_year = None
    grad_div = item_div.select_one(".col-grad")
    if grad_div:
        grad_year = grad_div.text.strip()
    # Commitment
    commitment = None
    commit_div = item_div.select_one(".col-commitment")
    if commit_div:
        commitment = commit_div.text.strip() or None
    # Avatar (no image, just icon, so set to None)
    avatar_div = item_div.select_one(".avatar")
    picture_url = None
    # If they ever add an <img> or style, you could extract it here
    return {
        "name": name,
        "club": club,
        "state": state,
        "position": position,
        "grad_year": grad_year,
        "commitment": commitment,
        "picture_url": picture_url
    }

def scrape_all_players():
    players = []
    session = requests.Session()
    page = 0
    while True:
        print(f"Scraping page {page+1}")
        url = START_URL.format(page=page)
        try:
            resp = session.get(url, timeout=15)
            resp.raise_for_status()
        except Exception as e:
            print(f"Failed to fetch page {page}: {e}")
            break
        soup = BeautifulSoup(resp.text, "html.parser")
        items = soup.select("div.d-flex.item")
        if not items:
            # Print HTML for debugging if first page
            if page == 0:
                with open("debug_first_page.html", "w") as f:
                    f.write(resp.text)
                print("No player cards found on first page. HTML saved to debug_first_page.html")
            break
        for item in items:
            try:
                player = extract_player_info(item)
                players.append(player)
            except Exception as e:
                print(f"Error extracting player info: {e}")
        # Check for 'Next' button in pagination
        pagination = soup.find("ul", class_="pagination")
        has_next = False
        if pagination:
            for a in pagination.find_all("a", class_="page-link"):
                if a.text.strip().lower() == "next":
                    has_next = True
                    break
        if not has_next:
            break
        page += 1
        time.sleep(0.5)
    return players

def main():
    players = scrape_all_players()
    with open(OUTPUT_FILE, "w") as f:
        json.dump(players, f, indent=2)
    print(f"Saved {len(players)} players to {OUTPUT_FILE}")

if __name__ == "__main__":
    main() 