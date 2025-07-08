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
    # Create a dummy function
    def search_youtube_videos(player_name, club_name):
        return []

app = Flask(__name__)
CORS(app)

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

@app.route('/api/youtube-highlights', methods=['GET'])
def get_youtube_highlights():
    """Get YouTube highlights for a player"""
    try:
        player_name = request.args.get('player_name')
        club_name = request.args.get('club_name')
        
        if not player_name:
            return jsonify({'error': 'Player name is required'}), 400
        
        # Search for YouTube videos
        videos = search_youtube_videos(player_name, club_name)
        
        return jsonify({
            'videos': videos,
            'player_name': player_name,
            'club_name': club_name
        })
        
    except Exception as e:
        print(f"Error in get_youtube_highlights: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'API is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 