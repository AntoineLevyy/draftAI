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

def load_json(path):
    import json
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_all_players():
    players = []
    # Transfer - Claimed
    for p in load_json('backend/college/njcaa/clean_claimed_players.json'):
        p['claimed'] = True
        p['type'] = 'transfer'
        players.append(p)
    # Transfer - Unclaimed
    for fname in [
        'backend/college/njcaa/njcaa_d1_players.json',
        'backend/college/njcaa/njcaa_d2_players.json',
        'backend/college/njcaa/njcaa_d3_players.json',
    ]:
        for p in load_json(fname):
            p['claimed'] = False
            p['type'] = 'transfer'
            players.append(p)
    # High School - Claimed (future)
    # for p in load_json('backend/college/highschool/clean_claimed_highschool_players.json'):
    #     p['claimed'] = True
    #     p['type'] = 'highschool'
    #     players.append(p)
    # High School - Unclaimed
    for p in load_json('backend/college/highschool/highschool_players.json'):
        p['claimed'] = False
        p['type'] = 'highschool'
        players.append(p)
    print('DEBUG: Total players loaded:', len(players))
    print('DEBUG: Claimed players loaded:', sum(1 for p in players if p.get('claimed')))
    print('DEBUG: Unclaimed players loaded:', sum(1 for p in players if not p.get('claimed')))
    return players

players = []

# Transfer - Claimed
for p in load_json('backend/college/njcaa/clean_claimed_players.json'):
    p['claimed'] = True
    p['type'] = 'transfer'
    players.append(p)

# Transfer - Unclaimed
for fname in [
    'backend/college/njcaa/njcaa_d1_players.json',
    'backend/college/njcaa/njcaa_d2_players.json',
    'backend/college/njcaa/njcaa_d3_players.json',
]:
    for p in load_json(fname):
        p['claimed'] = False
        p['type'] = 'transfer'
        players.append(p)

# High School - Claimed (future)
# for p in load_json('backend/college/highschool/clean_claimed_highschool_players.json'):
#     p['claimed'] = True
#     p['type'] = 'highschool'
#     players.append(p)

# High School - Unclaimed
for p in load_json('backend/college/highschool/highschool_players.json'):
    p['claimed'] = False
    p['type'] = 'highschool'
    players.append(p)

def fetch_player_data():
    """Fetch player data from local college files only (for local development)"""
    global _player_cache
    if _player_cache:
        return _player_cache

    players = []

    # Transfer - Claimed
    for p in load_json('backend/college/njcaa/clean_claimed_players.json'):
        p['claimed'] = True
        p['type'] = 'transfer'
        players.append(p)
    # Transfer - Unclaimed
    for fname in [
        'backend/college/njcaa/njcaa_d1_players.json',
        'backend/college/njcaa/njcaa_d2_players.json',
        'backend/college/njcaa/njcaa_d3_players.json',
    ]:
        for p in load_json(fname):
            p['claimed'] = False
            p['type'] = 'transfer'
            players.append(p)
    # Optionally, add high school players if needed in the future
    # for p in load_json('backend/college/highschool/highschool_players.json'):
    #     p['claimed'] = False
    #     p['type'] = 'highschool'
    #     players.append(p)

    print('DEBUG: Total college players loaded:', len(players))
    print('DEBUG: Claimed players loaded:', sum(1 for p in players if p.get('claimed')))
    print('DEBUG: Unclaimed players loaded:', sum(1 for p in players if not p.get('claimed')))
    _player_cache = players
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