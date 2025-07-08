from flask import Flask, request, jsonify
import json
import os
from backend.college.youtube_highlights import search_youtube_videos
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load data files
USL_DATA_FILE = 'usl_league_one_players_api.json'
MLS_DATA_FILE = 'mls_next_pro_players_api.json'

def load_player_data():
    """Load player data from JSON files"""
    players = []
    
    # Load USL League One players
    if os.path.exists(USL_DATA_FILE):
        try:
            with open(USL_DATA_FILE, 'r', encoding='utf-8') as f:
                usl_players = json.load(f)
                # Add league info to each player
                for player in usl_players:
                    player['league'] = 'USL League One'
                players.extend(usl_players)
        except Exception as e:
            print(f"Error loading USL data: {e}")
    
    # Load MLS Next Pro players
    if os.path.exists(MLS_DATA_FILE):
        try:
            with open(MLS_DATA_FILE, 'r', encoding='utf-8') as f:
                mls_players = json.load(f)
                # Add league info to each player
                for player in mls_players:
                    player['league'] = 'MLS Next Pro'
                players.extend(mls_players)
        except Exception as e:
            print(f"Error loading MLS data: {e}")
    
    return players

# Load all players at startup
ALL_PLAYERS = load_player_data()

@app.route('/api/players')
def get_players():
    """Get filtered players based on query parameters"""
    league = request.args.get('league', None)
    position = request.args.get('position', None)
    nationality = request.args.get('nationality', None)
    
    def match(player):
        # League filter
        if league and league != 'All' and player.get('league') not in league:
            return False
        
        # Position filter
        if position and position != 'All Positions':
            player_position = player.get('profile', {}).get('playerProfile', {}).get('position', '')
            if position.lower() not in player_position.lower():
                return False
        
        # Nationality filter
        if nationality and nationality != 'All':
            player_nationality = player.get('profile', {}).get('playerProfile', {}).get('nationality', '')
            if nationality.lower() not in player_nationality.lower():
                return False
        
        return True
    
    filtered = [p for p in ALL_PLAYERS if match(p)]
    return jsonify(filtered)

@app.route('/api/youtube-highlights', methods=['GET'])
def get_youtube_highlights():
    """Get YouTube highlights for a specific player"""
    try:
        player_name = request.args.get('player_name')
        club_name = request.args.get('club_name')
        
        if not player_name or not club_name:
            return jsonify({'error': 'Player name and club name are required'}), 400
        
        # Get YouTube API key from environment
        youtube_api_key = os.getenv('YOUTUBE_API_KEY')
        if not youtube_api_key:
            return jsonify({'error': 'YouTube API key not configured'}), 500
        
        # Search for YouTube videos
        videos = search_youtube_videos(player_name, club_name, youtube_api_key, max_results=5)
        
        return jsonify({
            'success': True,
            'player_name': player_name,
            'club_name': club_name,
            'videos': videos,
            'total_videos': len(videos)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'total_players': len(ALL_PLAYERS)})

if __name__ == '__main__':
    app.run(debug=True, port=5001) 