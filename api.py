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
CORS(app, origins=['*'])

@app.route('/', methods=['GET'])
def root():
    """Root endpoint for testing"""
    return jsonify({
        'message': 'Draft AI API is running',
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
NJCAA_D1_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/chunks/njcaa_d1_players.json'
NJCAA_D2_DATA_URL = 'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/chunks/njcaa_d2_players.json'

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
    
    # Fetch NJCAA D1 players
    try:
        print("Fetching NJCAA D1 data from GitHub...")
        response = requests.get(NJCAA_D1_DATA_URL, timeout=30)
        if response.status_code == 200:
            njcaa_data = response.json()
            # NJCAA data is already an array, not wrapped in 'players' key
            njcaa_players = njcaa_data if isinstance(njcaa_data, list) else []
            # Transform NJCAA data to match our format
            for player in njcaa_players:
                # Extract stats from the stats object
                stats = player.get('stats', {})
                
                # Clean up height and weight data - handle encoding issues
                raw_height = player.get('dataMap', {}).get('height', '')
                clean_height = raw_height.replace('Ã', '').strip() if raw_height else ''
                
                raw_weight = player.get('dataMap', {}).get('weight', '')
                clean_weight = raw_weight.replace('Ã', '').strip() if raw_weight else ''
                
                transformed_player = {
                    'name': player.get('fullName', f"{player.get('firstName', '')} {player.get('lastName', '')}"),
                    'position': player.get('position', ''),
                    'team': player.get('team', ''),
                    'league': 'NJCAA D1 (Tier 2 USA)',
                    'games': int(stats.get('gp', 0)),
                    'games_started': int(stats.get('gs', 0)),
                    'goals': int(stats.get('g', 0)),
                    'assists': int(stats.get('a', 0)),
                    'points': int(stats.get('p', 0)),
                    'shots': int(stats.get('sh', 0)),
                    'shot_pct': float(stats.get('shpt', 0)),
                    'penalty_kicks': int(stats.get('pkm', 0)),
                    'game_winning_goals': int(stats.get('gw', 0)),
                    'nationality': 'USA',  # Default for college players
                    'age': 0,  # Not available in NJCAA data
                    'height': clean_height,
                    'weight': clean_weight,
                    'year': player.get('year', ''),
                    'region': player.get('region', ''),
                    'uniform': player.get('uniform', ''),
                    'url': f"https://njcaastats.prestosports.com/sports/msoc/2024-25/div1/players/{player.get('pageName', '')}"
                }
                players.append(transformed_player)
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
            njcaa_data = response.json()
            # NJCAA data is already an array, not wrapped in 'players' key
            njcaa_players = njcaa_data if isinstance(njcaa_data, list) else []
            # Transform NJCAA data to match our format
            for player in njcaa_players:
                # Extract stats from the stats object
                stats = player.get('stats', {})
                
                # Clean up height and weight data - handle encoding issues
                raw_height = player.get('dataMap', {}).get('height', '')
                clean_height = raw_height.replace('Ã', '').strip() if raw_height else ''
                
                raw_weight = player.get('dataMap', {}).get('weight', '')
                clean_weight = raw_weight.replace('Ã', '').strip() if raw_weight else ''
                
                transformed_player = {
                    'name': player.get('fullName', f"{player.get('firstName', '')} {player.get('lastName', '')}"),
                    'position': player.get('position', ''),
                    'team': player.get('team', ''),
                    'league': 'NJCAA D2 (Tier 3 USA)',
                    'games': int(stats.get('gp', 0)),
                    'games_started': int(stats.get('gs', 0)),
                    'goals': int(stats.get('g', 0)),
                    'assists': int(stats.get('a', 0)),
                    'points': int(stats.get('p', 0)),
                    'shots': int(stats.get('sh', 0)),
                    'shot_pct': float(stats.get('shpt', 0)),
                    'penalty_kicks': int(stats.get('pkm', 0)),
                    'game_winning_goals': int(stats.get('gw', 0)),
                    'nationality': 'USA',  # Default for college players
                    'age': 0,  # Not available in NJCAA data
                    'height': clean_height,
                    'weight': clean_weight,
                    'year': player.get('year', ''),
                    'region': player.get('region', ''),
                    'uniform': player.get('uniform', ''),
                    'url': f"https://njcaastats.prestosports.com/sports/msoc/2024-25/div2/players/{player.get('pageName', '')}"
                }
                players.append(transformed_player)
            print(f"Loaded {len(njcaa_players)} NJCAA D2 players")
        else:
            print(f"Failed to fetch NJCAA D2 data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching NJCAA D2 data: {e}")
    
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
        
        # Fetch all players
        players = fetch_player_data()
        
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
        
        if not player_name:
            return jsonify({'error': 'Player name is required'}), 400
        
        # Search for YouTube videos
        videos = search_youtube_videos(player_name, club_name)
        
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
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'API is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 