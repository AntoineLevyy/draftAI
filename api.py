from flask import Flask, request, jsonify
import json
import os
import requests
from flask_cors import CORS

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

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Handle preflight OPTIONS requests
@app.route('/api/players', methods=['OPTIONS'])
def handle_options():
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/api/team-logos', methods=['OPTIONS'])
def handle_team_logos_options():
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

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
USL_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/usl_league_one_players_api.json'
MLS_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/mls_next_pro_players_api.json'
CPL_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/cpl_players_api.json'
LIGA_MX_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/liga_mx_players_api.json'
ANDORRA_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/andorra_players_api.json'
NJCAA_D1_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/college/njcaa/njcaa_d1_players.json'
NJCAA_D2_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/college/njcaa/njcaa_d2_players.json'
NJCAA_D3_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/college/njcaa/njcaa_d3_players.json'
TEAM_LOGOS_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/college/njcaa/team_logos.json'

# Cache for loaded data
_player_cache = {}

def fetch_player_data():
    """Fetch player data from GitHub raw URLs"""
    global _player_cache
    
    if _player_cache:
        return _player_cache
    
    players = []
    
    # Fetch USL League One players
    try:
        print("Fetching USL data from GitHub...")
        response = requests.get(USL_DATA_URL, timeout=30)
        if response.status_code == 200:
            usl_data = response.json()
            usl_players = usl_data.get('players', [])
            # Add league info to each player
            for player in usl_players:
                player['league'] = 'USL League One'
            players.extend(usl_players)
            print(f"Loaded {len(usl_players)} USL players")
        else:
            print(f"Failed to fetch USL data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching USL data: {e}")
    
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
    
    _player_cache = players
    print(f"Total players loaded: {len(players)}")
    print(f"Sample players by league:")
    for league in ['USL League One', 'MLS Next Pro', 'Canadian Premier League', 'Liga MX Apertura', 'Primera Divisió', 'NJCAA D1', 'NJCAA D2', 'NJCAA D3']:
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
        
        # Fetch all players
        players = fetch_player_data()
        
        # Debug: Check what we're actually returning
        print(f"API called - returning {len(players)} players")
        print(f"First 3 players leagues: {[p.get('league', 'NO_LEAGUE') for p in players[:3]]}")
        print(f"NJCAA players in response: {len([p for p in players if p.get('league', '').startswith('NJCAA')])}")
        
        # Check for Juan Jose Montoya specifically
        juan_jose = [p for p in players if p.get('name') == 'Juan Jose Montoya']
        if juan_jose:
            print(f"Juan Jose Montoya found in API response: {juan_jose[0].get('photo_url', 'NO_PHOTO')}")
        else:
            print("Juan Jose Montoya NOT found in API response")
        
        # Apply filters
        filtered_players = players
        
        if league_filter and league_filter != 'All':
            filtered_players = [p for p in filtered_players if p.get('league') == league_filter]
        
        if position_filter and position_filter != 'All Positions':
            filtered_players = [p for p in filtered_players if p.get('position') == position_filter]
        
        if nationality_filter and nationality_filter != 'All':
            filtered_players = [p for p in filtered_players if p.get('nationality') == nationality_filter]
        
        return jsonify({
            'players': filtered_players,
            'total': len(filtered_players),
            'filters_applied': {
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 