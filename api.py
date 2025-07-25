from flask import Flask, request, jsonify
import json
import os
import requests
from flask_cors import CORS
import stripe
import csv
import pandas as pd

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# Membership price IDs (replace with your actual Stripe price IDs)
MEMBERSHIP_PRICES = {
    'monthly': os.getenv('STRIPE_MONTHLY_PRICE_ID', 'price_monthly_placeholder'),
    'yearly': os.getenv('STRIPE_YEARLY_PRICE_ID', 'price_yearly_placeholder'),
}

# Try to import YouTube highlights, but handle import errors gracefully
try:
    from backend.college.youtube_highlights import search_youtube_videos
    YOUTUBE_AVAILABLE = True
except ImportError as e:
    print(f"YouTube highlights import failed: {e}")
    YOUTUBE_AVAILABLE = False
    # Create a dummy function that returns a simple response
    def search_youtube_videos(player_name, club_name):
        return [{
            'title': f'{player_name} Highlights',
            'video_url': f'https://www.youtube.com/results?search_query={player_name}+{club_name}+highlights',
            'channel': 'YouTube Search',
            'published_at': 'N/A',
            'description': f'Search results for {player_name} from {club_name}'
        }]

app = Flask(__name__)
CORS(app, origins=['*'], methods=['GET', 'POST', 'OPTIONS'], allow_headers=['Content-Type', 'Authorization'])

# Remove the duplicate CORS headers from after_request since CORS() wrapper handles it

# CORS wrapper handles OPTIONS requests automatically

@app.route('/', methods=['GET'])
def root():
    """Root endpoint for testing"""
    return jsonify({
        'message': 'draftme API is running',
        'youtube_available': YOUTUBE_AVAILABLE,
        'endpoints': [
            '/api/health',
            '/api/players',
            '/api/youtube-highlights'
        ]
    })

# GitHub raw URLs for the player data
USL_CHAMPIONSHIP_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/usl_championship_players_api.json'
USL_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/usl_league_one_players_api.json'
MLS_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/mls_next_pro_players_api.json'
CPL_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/cpl_players_api.json'
LIGA_MX_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/liga_mx_players_api.json'
ANDORRA_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/andorra_players_api.json'
NJCAA_D1_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/college/njcaa/njcaa_d1_players.json'
NJCAA_D2_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/college/njcaa/njcaa_d2_players.json'
NJCAA_D3_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/college/njcaa/njcaa_d3_players.json'
TEAM_LOGOS_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/college/njcaa/team_logos.json'
EFBET_LIGA_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/efbet_liga_players_api.json'
VTORA_LIGA_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/vtora_liga_players_api.json'
NATIONAL_LEAGUE_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/national_league_players_api.json'
LEAGUE_TWO_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/league_two_players_api.json'
NATIONAL_LEAGUE_SOUTH_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/national_league_south_players_api.json'
NATIONAL_LEAGUE_NORTH_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/national_league_north_players_api.json'
GIBRALTAR_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/gibraltar_players_api.json'
SPAIN_SEGUNDA_G1_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/spain_segunda_g1_players_api.json'
SPAIN_SEGUNDA_G2_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/spain_segunda_g2_players_api.json'
SPAIN_SEGUNDA_G3_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/spain_segunda_g3_players_api.json'
SPAIN_SEGUNDA_G4_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/spain_segunda_g4_players_api.json'
SPAIN_SEGUNDA_G5_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/spain_segunda_g5_players_api.json'
CLEAN_CLAIMED_PLAYERS_JSON = 'backend/college/njcaa/clean_claimed_players.json'

# Cache for loaded data
_player_cache = {}

def fetch_player_data():
    """Fetch player data from GitHub raw URLs and local files, including claimed players"""
    global _player_cache
    
    if _player_cache:
        return _player_cache
    
    players = []
    
    # Fetch USL Championship players
    try:
        print("Fetching USL Championship data from GitHub...")
        response = requests.get(USL_CHAMPIONSHIP_DATA_URL, timeout=30)
        if response.status_code == 200:
            usl_championship_data = response.json()
            usl_championship_players = usl_championship_data.get('players', [])
            # Add league info to each player
            for player in usl_championship_players:
                player['league'] = 'USL Championship'
            players.extend(usl_championship_players)
            print(f"Loaded {len(usl_championship_players)} USL Championship players")
        else:
            print(f"Failed to fetch USL Championship data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching USL Championship data: {e}")
    
    # Fetch USL League One players
    try:
        print("Fetching USL League One data from GitHub...")
        response = requests.get(USL_DATA_URL, timeout=30)
        if response.status_code == 200:
            usl_data = response.json()
            usl_players = usl_data.get('players', [])
            # Add league info to each player
            for player in usl_players:
                player['league'] = 'USL League One'
            players.extend(usl_players)
            print(f"Loaded {len(usl_players)} USL League One players")
        else:
            print(f"Failed to fetch USL League One data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching USL League One data: {e}")
    
    # Fetch MLS Next Pro players
    try:
        print("Fetching MLS data from GitHub...")
        response = requests.get(MLS_DATA_URL, timeout=30)
        if response.status_code == 200:
            mls_data = response.json()
            mls_players = mls_data.get('players', [])
            # Add league info to each player
            for player in mls_players:
                player['league'] = 'MLS Next Pro'
            players.extend(mls_players)
            print(f"Loaded {len(mls_players)} MLS players")
        else:
            print(f"Failed to fetch MLS data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching MLS data: {e}")
    
    # Fetch Canadian Premier League players
    try:
        print("Fetching CPL data from GitHub...")
        response = requests.get(CPL_DATA_URL, timeout=30)
        if response.status_code == 200:
            cpl_data = response.json()
            cpl_players = cpl_data.get('players', [])
            # Add league info to each player
            for player in cpl_players:
                player['league'] = 'Canadian Premier League'
            players.extend(cpl_players)
            print(f"Loaded {len(cpl_players)} CPL players")
        else:
            print(f"Failed to fetch CPL data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching CPL data: {e}")
    
    # Fetch Liga MX Apertura players
    try:
        print("Fetching Liga MX data from GitHub...")
        response = requests.get(LIGA_MX_DATA_URL, timeout=30)
        if response.status_code == 200:
            liga_mx_data = response.json()
            liga_mx_players = liga_mx_data.get('players', [])
            # Add league info to each player
            for player in liga_mx_players:
                player['league'] = 'Liga MX Apertura'
            players.extend(liga_mx_players)
            print(f"Loaded {len(liga_mx_players)} Liga MX players")
        else:
            print(f"Failed to fetch Liga MX data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching Liga MX data: {e}")
    
    # Fetch Primera Divisió (Andorra) players
    try:
        print("Fetching Andorra data from GitHub...")
        response = requests.get(ANDORRA_DATA_URL, timeout=30)
        if response.status_code == 200:
            andorra_data = response.json()
            andorra_players = andorra_data.get('players', [])
            # Add league info to each player
            for player in andorra_players:
                player['league'] = 'Primera Divisió'
            players.extend(andorra_players)
            print(f"Loaded {len(andorra_players)} Andorra players")
        else:
            print(f"Failed to fetch Andorra data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching Andorra data: {e}")
    
    # Fetch Efbet Liga players
    try:
        print("Fetching Efbet Liga data from GitHub...")
        response = requests.get(EFBET_LIGA_DATA_URL, timeout=30)
        if response.status_code == 200:
            efbet_data = response.json()
            efbet_players = efbet_data.get('players', [])
            # Add league info to each player
            for player in efbet_players:
                player['league'] = 'Efbet Liga'
            players.extend(efbet_players)
            print(f"Loaded {len(efbet_players)} Efbet Liga players")
        else:
            print(f"Failed to fetch Efbet Liga data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching Efbet Liga data: {e}")
    
    # Fetch Vtora Liga players
    try:
        print("Fetching Vtora Liga data from GitHub...")
        response = requests.get(VTORA_LIGA_DATA_URL, timeout=30)
        if response.status_code == 200:
            vtora_data = response.json()
            vtora_players = vtora_data.get('players', [])
            # Add league info to each player
            for player in vtora_players:
                player['league'] = 'Vtora Liga'
            players.extend(vtora_players)
            print(f"Loaded {len(vtora_players)} Vtora Liga players")
        else:
            print(f"Failed to fetch Vtora Liga data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching Vtora Liga data: {e}")
    
    # Fetch National League players
    try:
        print("Fetching National League data from GitHub...")
        response = requests.get(NATIONAL_LEAGUE_DATA_URL, timeout=30)
        if response.status_code == 200:
            national_league_data = response.json()
            national_league_players = national_league_data.get('players', national_league_data if isinstance(national_league_data, list) else [])
            # Add league info to each player
            for player in national_league_players:
                player['league'] = 'National League'
            players.extend(national_league_players)
            print(f"Loaded {len(national_league_players)} National League players.")
        else:
            print(f"Failed to fetch National League data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching National League data: {e}")
    
    # Fetch National League South players
    try:
        print("Fetching National League South data from GitHub...")
        response = requests.get(NATIONAL_LEAGUE_SOUTH_DATA_URL, timeout=30)
        if response.status_code == 200:
            nls_data = response.json()
            nls_players = nls_data.get('players', nls_data if isinstance(nls_data, list) else [])
            for player in nls_players:
                player['league'] = 'National League South'
            players.extend(nls_players)
            print(f"Loaded {len(nls_players)} National League South players.")
        else:
            print(f"Failed to fetch National League South data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching National League South data: {e}")
    # Fetch National League North players
    try:
        print("Fetching National League North data from GitHub...")
        response = requests.get(NATIONAL_LEAGUE_NORTH_DATA_URL, timeout=30)
        if response.status_code == 200:
            nln_data = response.json()
            nln_players = nln_data.get('players', nln_data if isinstance(nln_data, list) else [])
            for player in nln_players:
                player['league'] = 'National League North'
            players.extend(nln_players)
            print(f"Loaded {len(nln_players)} National League North players.")
        else:
            print(f"Failed to fetch National League North data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching National League North data: {e}")
    
    # Fetch League Two players
    try:
        print("Fetching League Two data from GitHub...")
        response = requests.get(LEAGUE_TWO_DATA_URL, timeout=30)
        if response.status_code == 200:
            league_two_data = response.json()
            league_two_players = league_two_data.get('players', league_two_data if isinstance(league_two_data, list) else [])
            # Add league info to each player
            for player in league_two_players:
                player['league'] = 'League Two'
            players.extend(league_two_players)
            print(f"Loaded {len(league_two_players)} League Two players.")
        else:
            print(f"Failed to fetch League Two data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching League Two data: {e}")
    
    # Fetch Gibraltar Football League players
    try:
        print("Fetching Gibraltar Football League data from GitHub...")
        response = requests.get(GIBRALTAR_DATA_URL, timeout=30)
        if response.status_code == 200:
            gibraltar_data = response.json()
            gibraltar_players = gibraltar_data.get('players', [])
            for player in gibraltar_players:
                player['league'] = 'Gibraltar Football League'
            players.extend(gibraltar_players)
            print(f"Loaded {len(gibraltar_players)} Gibraltar Football League players")
        else:
            print(f"Failed to fetch Gibraltar Football League data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching Gibraltar Football League data: {e}")

    # Fetch Spain Segunda Federacion Grupo 1-5 players
    for url, league_name in [
        (SPAIN_SEGUNDA_G1_DATA_URL, 'Segunda Federacion Grupo 1'),
        (SPAIN_SEGUNDA_G2_DATA_URL, 'Segunda Federacion Grupo 2'),
        (SPAIN_SEGUNDA_G3_DATA_URL, 'Segunda Federacion Grupo 3'),
        (SPAIN_SEGUNDA_G4_DATA_URL, 'Segunda Federacion Grupo 4'),
        (SPAIN_SEGUNDA_G5_DATA_URL, 'Segunda Federacion Grupo 5'),
    ]:
        try:
            print(f"Fetching {league_name} data from GitHub...")
            response = requests.get(url, timeout=30)
            if response.status_code == 200:
                data = response.json()
                players_list = data.get('players', [])
                for player in players_list:
                    player['league'] = league_name
                players.extend(players_list)
                print(f"Loaded {len(players_list)} {league_name} players")
            else:
                print(f"Failed to fetch {league_name} data: {response.status_code}")
        except Exception as e:
            print(f"Error fetching {league_name} data: {e}")
    
    # Fetch NJCAA D1 players
    try:
        print("Fetching NJCAA D1 data from GitHub...")
        response = requests.get(NJCAA_D1_DATA_URL, timeout=30)
        if response.status_code == 200:
            njcaa_players = response.json()
            # The cleaned JSON files are already in the correct format
            # Just add them directly without transformation
            players.extend(njcaa_players)
            print(f"Loaded {len(njcaa_players)} NJCAA D1 players")
        else:
            print(f"Failed to fetch NJCAA D1 data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching NJCAA D1 data: {e}")
    
    # Fetch NJCAA D2 players
    try:
        print("Fetching NJCAA D2 data from GitHub...")
        response = requests.get(NJCAA_D2_DATA_URL, timeout=30)
        if response.status_code == 200:
            njcaa_players = response.json()
            # The cleaned JSON files are already in the correct format
            # Just add them directly without transformation
            players.extend(njcaa_players)
            print(f"Loaded {len(njcaa_players)} NJCAA D2 players")
        else:
            print(f"Failed to fetch NJCAA D2 data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching NJCAA D2 data: {e}")
    
    # Fetch NJCAA D3 players
    try:
        print("Fetching NJCAA D3 data from GitHub...")
        response = requests.get(NJCAA_D3_DATA_URL, timeout=30)
        if response.status_code == 200:
            njcaa_players = response.json()
            # The cleaned JSON files are already in the correct format
            # Just add them directly without transformation
            players.extend(njcaa_players)
            print(f"Loaded {len(njcaa_players)} NJCAA D3 players")
        else:
            print(f"Failed to fetch NJCAA D3 data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching NJCAA D3 data: {e}")
    
    # Fetch High School players
    try:
        print("Fetching High School players from local file...")
        with open("backend/college/highschool/highschool_players.json", "r") as f:
            hs_players = json.load(f)
            for player in hs_players:
                player["type"] = "highschool"
            players.extend(hs_players)
            print(f"Loaded {len(hs_players)} High School players")
    except Exception as e:
        print(f"Error loading High School players: {e}")
    # Fetch claimed players from JSON
    try:
        print("Loading claimed players from JSON...")
        with open(CLEAN_CLAIMED_PLAYERS_JSON, 'r', encoding='utf-8') as f:
            claimed_players = json.load(f)
        print(f"Loaded {len(claimed_players)} claimed players from clean_claimed_players.json")
        for p in claimed_players:
            p['claimed'] = True
            p['type'] = 'transfer'
        players = claimed_players + players
        print(f"Total players after merging claimed: {len(players)}")
    except Exception as e:
        print(f"Error loading claimed players: {e}")
    # Set type='transfer' for NJCAA/college players if not already set
    for player in players:
        if (player.get("league", "").startswith("NJCAA") or player.get("league", "").startswith("College")) and not player.get("type"):
            player["type"] = "transfer"
        if player.get('claimed'):
            player['type'] = 'transfer'
    
    _player_cache = players
    print(f"Total players loaded: {len(players)}")
    print(f"Sample players by league:")
    for league in ['USL Championship', 'USL League One', 'MLS Next Pro', 'Canadian Premier League', 'Liga MX Apertura', 'Primera Divisió', 'NJCAA D1', 'NJCAA D2', 'NJCAA D3', 'Efbet Liga', 'Vtora Liga', 'National League', 'League Two', 'Gibraltar Football League', 'Segunda Federacion Grupo 1', 'Segunda Federacion Grupo 2', 'Segunda Federacion Grupo 3', 'Segunda Federacion Grupo 4', 'Segunda Federacion Grupo 5', 'High School']:
        league_players = [p for p in players if p.get('league') == league]
        print(f"  {league}: {len(league_players)} players")
    return players

@app.route('/api/players', methods=['GET'])
def get_players():
    """Get filtered players"""
    try:
        # Get query parameters
        league_filter = request.args.get('league')
        position_filter = request.args.get('position')
        nationality_filter = request.args.get('nationality')
        type_filter = request.args.get('type')
        
        # Fetch all players
        players = fetch_player_data()
        
        # Debug: Check what we're actually returning
        print(f"API called - returning {len(players)} players")
        print(f"Type filter: {type_filter}")
        print(f"Players by type: {len([p for p in players if p.get('type') == 'transfer'])} transfer, {len([p for p in players if p.get('type') == 'highschool'])} highschool")
        
        # Apply filters
        filtered_players = players
        
        # Type filter for college players
        if type_filter and type_filter in ['transfer', 'highschool']:
            print(f"Filtering by type: '{type_filter}'")
            filtered_players = [p for p in filtered_players if p.get('type') == type_filter]
            print(f"Players after type filter: {len(filtered_players)}")
        
        # Robust league filter: handle unicode/encoding issues
        if league_filter and league_filter != 'All':
            print(f"Filtering by league: '{league_filter}'")
            filtered_players = [p for p in filtered_players if p.get('league', '').strip().lower() == league_filter.strip().lower()]
            print(f"Players after league filter: {len(filtered_players)}")
        
        if position_filter and position_filter != 'All Positions':
            filtered_players = [p for p in filtered_players if p.get('position') == position_filter]
        
        if nationality_filter and nationality_filter != 'All':
            filtered_players = [p for p in filtered_players if p.get('nationality') == nationality_filter]
        
        return jsonify({
            'players': filtered_players,
            'total': len(filtered_players),
            'filters_applied': {
                'type': type_filter,
                'league': league_filter,
                'position': position_filter,
                'nationality': nationality_filter
            }
        })
        
    except Exception as e:
        print(f"Error in get_players: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/youtube-highlights', methods=['GET', 'OPTIONS'])
def get_youtube_highlights():
    """Get YouTube highlights for a player"""
    
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response
    
    try:
        player_name = request.args.get('player_name')
        club_name = request.args.get('club_name')
        
        print(f"YouTube highlights request for: {player_name} from {club_name}")
        print(f"YouTube module available: {YOUTUBE_AVAILABLE}")
        
        if not player_name:
            return jsonify({'error': 'Player name is required'}), 400
        
        # Check if YouTube API key is available
        youtube_api_key = os.getenv('YOUTUBE_API_KEY')
        if not youtube_api_key:
            print("WARNING: No YouTube API key found in environment variables")
            # Return a helpful response with search link
            search_url = f"https://www.youtube.com/results?search_query={player_name}+{club_name}+soccer+highlights"
            return jsonify({
                'videos': [{
                    'title': f'{player_name} Highlights - Search Results',
                    'video_url': search_url,
                    'channel': 'YouTube Search',
                    'published_at': 'N/A',
                    'description': f'Click to search YouTube for {player_name} highlights from {club_name}',
                    'thumbnail': None
                }],
                'player_name': player_name,
                'club_name': club_name,
                'note': 'No YouTube API key configured. This is a search link.'
            })
        
        # Search for YouTube videos
        print(f"Calling search_youtube_videos with API key: {youtube_api_key[:10]}...")
        try:
            videos = search_youtube_videos(player_name, club_name)
            print(f"Found {len(videos)} videos for {player_name}")
        except Exception as e:
            print(f"YouTube API error: {e}")
            # Check if it's a quota exceeded error
            if "quota" in str(e).lower() or "403" in str(e):
                print("YouTube API quota exceeded, providing search links instead")
                # Create search links for different queries
                search_queries = [
                    f"{player_name} {club_name} soccer highlights",
                    f"{player_name} {club_name} goals",
                    f"{player_name} soccer highlights",
                    f"{player_name} {club_name} youth soccer"
                ]
                
                videos = []
                for i, query in enumerate(search_queries):
                    search_url = f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}"
                    videos.append({
                        'title': f'{player_name} Highlights - Search {i+1}',
                        'video_url': search_url,
                        'channel': 'YouTube Search',
                        'published_at': 'N/A',
                        'description': f'Search: {query}',
                        'thumbnail': None
                    })
            else:
                # Other error, re-raise
                raise e
        
        response = jsonify({
            'videos': videos,
            'player_name': player_name,
            'club_name': club_name
        })
        
        # Add CORS headers manually
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        
        return response
        
    except Exception as e:
        print(f"Error in get_youtube_highlights: {e}")
        import traceback
        traceback.print_exc()
        
        # Return a helpful error response
        return jsonify({
            'error': str(e),
            'videos': [],
            'player_name': player_name if 'player_name' in locals() else 'Unknown',
            'club_name': club_name if 'club_name' in locals() else 'Unknown',
            'note': 'YouTube search failed. Please check API key and try again.'
        }), 500

@app.route('/api/team-logos', methods=['GET'])
def get_team_logos():
    """Get team logos for college teams"""
    try:
        print("Fetching team logos from GitHub...")
        response = requests.get(TEAM_LOGOS_URL, timeout=30)
        if response.status_code == 200:
            team_logos = response.json()
            print(f"Loaded {len(team_logos)} team logos")
            return jsonify(team_logos)
        else:
            print(f"Failed to fetch team logos: {response.status_code}")
            return jsonify({}), 500
    except Exception as e:
        print(f"Error fetching team logos: {e}")
        return jsonify({}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'API is running'})

@app.route('/api/create-checkout-session', methods=['POST', 'OPTIONS'])
def create_checkout_session():
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response

    data = request.get_json()
    membership = data.get('membership')
    if membership not in MEMBERSHIP_PRICES:
        return jsonify({'error': 'Invalid membership type. Must be "monthly" or "yearly".'}), 400

    price_id = MEMBERSHIP_PRICES[membership]
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=os.getenv('STRIPE_SUCCESS_URL', 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}'),
            cancel_url=os.getenv('STRIPE_CANCEL_URL', 'http://localhost:5173/cancel'),
        )
        return jsonify({'url': session.url})
    except Exception as e:
        print(f"Stripe error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 