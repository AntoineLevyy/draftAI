from flask import Flask, request, jsonify
import json
import os
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['https://aiscoutingassistant.vercel.app', 'http://localhost:5173'])

@app.route('/', methods=['GET'])
def root():
    """Root endpoint for testing"""
    return jsonify({
        'message': 'draftme API is running',
        'status': 'healthy',
        'endpoints': [
            '/api/health',
            '/api/youtube-highlights'
        ]
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'API is running'})

@app.route('/api/youtube-highlights', methods=['GET'])
def get_youtube_highlights():
    """Get YouTube highlights for a player"""
    try:
        player_name = request.args.get('player_name')
        club_name = request.args.get('club_name')
        
        if not player_name:
            return jsonify({'error': 'Player name is required'}), 400
        
        # For now, return a simple response indicating the API is working
        # You can add the actual YouTube API integration later
        return jsonify({
            'videos': [
                {
                    'title': f'{player_name} Highlights',
                    'video_url': f'https://www.youtube.com/results?search_query={player_name}+{club_name}+highlights',
                    'channel': 'YouTube Search',
                    'published_at': 'N/A',
                    'description': f'Search results for {player_name} from {club_name}'
                }
            ],
            'player_name': player_name,
            'club_name': club_name,
            'message': 'API is working - YouTube integration pending'
        })
        
    except Exception as e:
        print(f"Error in get_youtube_highlights: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 