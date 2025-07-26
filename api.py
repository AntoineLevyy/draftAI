from flask import Flask, request, jsonify
import json
import os
import requests
from flask_cors import CORS
import stripe
import csv
import pandas as pd
from dotenv import load_dotenv
import jwt

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase using direct HTTP requests
SUPABASE_AVAILABLE = True
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if supabase_url and supabase_key:
    print("SUPABASE: Using direct HTTP requests")
else:
    print("SUPABASE: Missing environment variables")
    SUPABASE_AVAILABLE = False

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

def verify_jwt_token(token):
    """Verify JWT token and return user ID"""
    try:
        # Decode the JWT token without verification (since we don't have the secret)
        # This is a simplified approach - in production you'd want proper verification
        decoded = jwt.decode(token, options={"verify_signature": False})
        print(f"JWT decoded successfully: {decoded}")
        
        # Try different possible user ID fields
        user_id = decoded.get('sub') or decoded.get('user_id') or decoded.get('id')
        print(f"Extracted user_id: {user_id}")
        
        return user_id
    except Exception as e:
        print(f"Error decoding JWT: {e}")
        print(f"Token (first 50 chars): {token[:50]}...")
        return None

def clear_player_cache():
    """Clear the player cache to force fresh data loading"""
    global _player_cache
    _player_cache = {}

def load_json(path):
    import json
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def check_user_exists(user_id):
    """Check if a user exists in the auth.users table"""
    # Note: Supabase auth.users table is not accessible via REST API
    # We'll rely on the foreign key constraint to handle this
    return True  # Assume user exists and let the constraint handle it

def fetch_claimed_profiles_from_db():
    """Fetch claimed profiles from the database using direct HTTP requests"""
    if not SUPABASE_AVAILABLE:
        print("WARNING: Supabase not configured, skipping database claimed profiles")
        return []
    
    try:
        # Make direct HTTP request to Supabase
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(f'{supabase_url}/rest/v1/claimed_profiles', headers=headers)
        response.raise_for_status()
        claimed_profiles = response.json() if response.json() else []
        
        # Convert database format to match JSON format
        converted_profiles = []
        for profile in claimed_profiles:
            print(f"DEBUG: Raw database profile: {profile}")
            print(f"DEBUG: original_player_id value: {profile.get('original_player_id')}")
            print(f"DEBUG: All profile keys: {list(profile.keys())}")
            converted_profile = {
                'playerId': profile['original_player_id'],
                'claimed': True,
                'type': 'transfer',
                'Name': profile['name'],
                'Position': profile['position'],
                'Current School': profile['current_school'],
                'Division Transferring From': profile['division_transferring_from'],
                'Email Address': profile['email_address'],
                'Years of Eligibility Left': profile['years_of_eligibility_left'],
                'GPA': str(profile['gpa']) if profile['gpa'] else '',
                'Individual Awards': profile['individual_awards'] or '',
                'College Accolades': profile['college_accolades'] or '',
                'Highlights': profile['highlights'] or '',
                'Full 90 min Game Link': profile['full_game_link'] or '',
                'Height': profile['height'] or '',
                'Weight (lbs)': profile['weight'] or '',
                'Credit Hours Taken when you will transfer': profile['credit_hours_taken'] or '',
                'Available': profile['available'] or '',
                'Nationality': profile['nationality'] or '',
                'Year of Birth': profile['year_of_birth'] or '',
                'Finances': profile['finances'] or '',
                'Why Player is Transferring': profile['why_player_is_transferring'] or '',
                'photo_url': '',  # No photo URL in database for now
                'claimed_at': profile['claimed_at'],
                'claimed_by_user_id': profile['claimed_by_user_id']
            }
            converted_profiles.append(converted_profile)
        
        print(f"DEBUG: Loaded {len(converted_profiles)} claimed profiles from database")
        return converted_profiles
        
    except Exception as e:
        print(f"ERROR: Failed to fetch claimed profiles from database: {e}")
        return []

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
        p['source'] = 'json'
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
    """Fetch player data from local college files and database claimed profiles"""
    global _player_cache
    # Force cache clear for debugging
    _player_cache = {}
    if _player_cache and len(_player_cache) > 0:
        return _player_cache

    players = []

    # Transfer - Claimed from JSON (legacy)
    for p in load_json('backend/college/njcaa/clean_claimed_players.json'):
        p['claimed'] = True
        p['type'] = 'transfer'
        p['source'] = 'json'
        players.append(p)
    
    # Transfer - Unclaimed (we'll replace these with claimed versions if they exist)
    unclaimed_players = []
    for fname in [
        'backend/college/njcaa/njcaa_d1_players.json',
        'backend/college/njcaa/njcaa_d2_players.json',
        'backend/college/njcaa/njcaa_d3_players.json',
    ]:
        for p in load_json(fname):
            p['claimed'] = False
            p['type'] = 'transfer'
            p['source'] = 'json'
            unclaimed_players.append(p)
    
    # Transfer - Claimed from database (new claims)
    db_claimed_profiles = fetch_claimed_profiles_from_db()
    
    # Create a set of claimed player IDs for quick lookup
    claimed_player_ids = set()
    for p in db_claimed_profiles:
        # Use the playerId from the converted profile (which was set from original_player_id)
        player_id = p.get('playerId')
        claimed_player_ids.add(player_id)
        p['source'] = 'database'
        players.append(p)
    
    print(f"DEBUG: Claimed player IDs from database: {claimed_player_ids}")
    
    # Add unclaimed players that don't have a claimed version
    for p in unclaimed_players:
        player_id = p.get('playerId') or p.get('id')
        if player_id not in claimed_player_ids:
            players.append(p)
        else:
            print(f"DEBUG: Skipping unclaimed player {player_id} because it has a claimed version")
    
    # High School - Unclaimed
    highschool_players = load_json('backend/college/highschool/highschool_players.json')
    print(f"DEBUG: Loaded {len(highschool_players)} high school players from JSON")
    for p in highschool_players:
        p['claimed'] = False
        p['type'] = 'highschool'
        p['source'] = 'json'
        players.append(p)
    print(f"DEBUG: Added {len(highschool_players)} high school players to total players")

    print('DEBUG: Total college players loaded:', len(players))
    print('DEBUG: Claimed players loaded:', sum(1 for p in players if p.get('claimed')))
    print('DEBUG: Unclaimed players loaded:', sum(1 for p in players if not p.get('claimed')))
    print('DEBUG: Database claimed profiles:', len(db_claimed_profiles))
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

@app.route('/api/save-claimed-profile', methods=['POST', 'OPTIONS'])
def save_claimed_profile():
    """Save a claimed profile to the database"""
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response

    if not SUPABASE_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500

    try:
        data = request.get_json()
        user_id = data.get('claimed_by_user_id')
        email = data.get('email_address')
        
        # Debug: Print the received data
        print(f"DEBUG: Received claim data for user {user_id}")
        print(f"DEBUG: Required fields - name: '{data.get('name')}', position: '{data.get('position')}', current_school: '{data.get('current_school')}', division_transferring_from: '{data.get('division_transferring_from')}', email_address: '{email}'")
        
        # Validate required fields
        required_fields = ['name', 'position', 'current_school', 'division_transferring_from', 'email_address']
        missing_fields = [field for field in required_fields if not data.get(field) or data.get(field).strip() == '']
        
        if missing_fields:
            print(f"ERROR: Missing required fields: {missing_fields}")
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        # Prepare the profile data for database insertion
        profile_data = {
            'original_player_id': data.get('original_player_id'),
            'claimed_by_user_id': user_id,
            'name': data.get('name'),
            'nationality': data.get('nationality'),
            'year_of_birth': data.get('year_of_birth'),
            'height': data.get('height'),
            'weight': data.get('weight'),
            'position': data.get('position'),
            'gpa': data.get('gpa'),
            'credit_hours_taken': data.get('credit_hours_taken'),
            'finances': data.get('finances'),
            'available': data.get('available'),
            'current_school': data.get('current_school'),
            'division_transferring_from': data.get('division_transferring_from'),
            'years_of_eligibility_left': data.get('years_of_eligibility_left'),
            'individual_awards': data.get('individual_awards'),
            'college_accolades': data.get('college_accolades'),
            'email_address': email,
            'highlights': data.get('highlights'),
            'full_game_link': data.get('full_game_link'),
            'why_player_is_transferring': data.get('why_player_is_transferring')
        }

        # Check if user exists and is confirmed
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json'
        }
        
        # Try to get user from auth.users (this will fail if user doesn't exist)
        user_response = requests.get(
            f'{supabase_url}/rest/v1/auth/users?id=eq.{user_id}',
            headers=headers
        )
        
        if user_response.status_code == 200:
            users = user_response.json()
            if users and users[0].get('email_confirmed_at'):
                print(f"User {user_id} is confirmed - saving directly to claimed_profiles and user_profiles")
                return save_confirmed_claim(data, user_id, email)
        
        # User not confirmed yet - save to pending claims
        print(f"User {user_id} not yet confirmed - saving to pending claims")
        return save_to_pending_claims(data, email)

    except Exception as e:
        print(f"Error saving claimed profile: {e}")
        return jsonify({'error': str(e)}), 500

def save_to_pending_claims(data, email):
    """Save claim to pending_claims table when user is not yet confirmed"""
    try:
        # Prepare pending claim data
        pending_data = {
            'original_player_id': data.get('original_player_id'),
            'pending_user_email': email,
            'name': data.get('name'),
            'nationality': data.get('nationality'),
            'year_of_birth': data.get('year_of_birth'),
            'height': data.get('height'),
            'weight': data.get('weight'),
            'position': data.get('position'),
            'gpa': data.get('gpa'),
            'credit_hours_taken': data.get('credit_hours_taken'),
            'finances': data.get('finances'),
            'available': data.get('available'),
            'current_school': data.get('current_school'),
            'division_transferring_from': data.get('division_transferring_from'),
            'years_of_eligibility_left': data.get('years_of_eligibility_left'),
            'individual_awards': data.get('individual_awards'),
            'college_accolades': data.get('college_accolades'),
            'email_address': email,
            'highlights': data.get('highlights'),
            'full_game_link': data.get('full_game_link'),
            'why_player_is_transferring': data.get('why_player_is_transferring')
        }

        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
        
        response = requests.post(
            f'{supabase_url}/rest/v1/pending_claims',
            headers=headers,
            json=pending_data
        )
        
        if response.status_code == 201:
            print(f"Successfully saved pending claim for email {email}")
            return jsonify({'success': True, 'message': 'Profile claimed successfully (pending email confirmation)'})
        else:
            print(f"Failed to save pending claim: {response.status_code} - {response.text}")
            return jsonify({'error': f'Failed to save pending claim: {response.text}'}), 500

    except Exception as e:
        print(f"Error saving pending claim: {e}")
        return jsonify({'error': str(e)}), 500

def save_confirmed_claim(data, user_id, email):
    """Save claim directly to claimed_profiles and user_profiles when user is confirmed"""
    try:
        # Prepare claimed profile data
        profile_data = {
            'original_player_id': data.get('original_player_id'),
            'claimed_by_user_id': user_id,
            'name': data.get('name'),
            'nationality': data.get('nationality'),
            'year_of_birth': data.get('year_of_birth'),
            'height': data.get('height'),
            'weight': data.get('weight'),
            'position': data.get('position'),
            'gpa': data.get('gpa'),
            'credit_hours_taken': data.get('credit_hours_taken'),
            'finances': data.get('finances'),
            'available': data.get('available'),
            'current_school': data.get('current_school'),
            'division_transferring_from': data.get('division_transferring_from'),
            'years_of_eligibility_left': data.get('years_of_eligibility_left'),
            'individual_awards': data.get('individual_awards'),
            'college_accolades': data.get('college_accolades'),
            'email_address': email,
            'highlights': data.get('highlights'),
            'full_game_link': data.get('full_game_link'),
            'why_player_is_transferring': data.get('why_player_is_transferring')
        }

        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
        
        # Insert into claimed_profiles
        profile_response = requests.post(
            f'{supabase_url}/rest/v1/claimed_profiles',
            headers=headers,
            json=profile_data
        )
        
        if profile_response.status_code == 201:
            # Create user_profiles entry for the player
            user_profile_data = {
                'user_id': user_id,
                'user_type': 'Player',
                'name': data.get('name'),
                'email': email
            }
            
            user_profile_response = requests.post(
                f'{supabase_url}/rest/v1/user_profiles',
                headers=headers,
                json=user_profile_data
            )
            
            if user_profile_response.status_code == 201:
                print(f"Created user profile for confirmed player {user_id}")
            else:
                print(f"Failed to create user profile for confirmed player {user_id}: {user_profile_response.status_code} - {user_profile_response.text}")
            
            print(f"Successfully saved confirmed claim for user {user_id}")
            return jsonify({'success': True, 'message': 'Profile claimed successfully'})
        else:
            print(f"Failed to save confirmed claim: {profile_response.status_code} - {profile_response.text}")
            return jsonify({'error': f'Failed to save confirmed claim: {profile_response.text}'}), 500

    except Exception as e:
        print(f"Error saving confirmed claim: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/get-claimed-profile/<user_id>', methods=['GET', 'OPTIONS'])
def get_claimed_profile(user_id):
    """Get a claimed profile by user ID"""
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        return response

    if not SUPABASE_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500

    try:
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(
            f'{supabase_url}/rest/v1/claimed_profiles?claimed_by_user_id=eq.{user_id}',
            headers=headers
        )
        
        if response.status_code == 200:
            profiles = response.json()
            if profiles:
                return jsonify(profiles[0])  # Return the first (and should be only) profile
            else:
                return jsonify({'error': 'No claimed profile found'}), 404
        else:
            print(f"Failed to fetch claimed profile: {response.status_code} - {response.text}")
            return jsonify({'error': 'Failed to fetch claimed profile'}), 500

    except Exception as e:
        print(f"Error fetching claimed profile: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/migrate-pending-claims', methods=['POST', 'OPTIONS'])
def migrate_pending_claims():
    """Migrate pending claims to claimed_profiles after email confirmation"""
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response

    if not SUPABASE_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500

    try:
        data = request.get_json()
        user_id = data.get('user_id')
        email = data.get('email')
        
        print(f"DEBUG: Migration request - user_id: {user_id}, email: {email}")
        
        if not user_id or not email:
            return jsonify({'error': 'Missing user_id or email'}), 400

        # Get pending claims for this email
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json'
        }
        
        print(f"DEBUG: Fetching pending claims for email: {email}")
        response = requests.get(
            f'{supabase_url}/rest/v1/pending_claims?pending_user_email=eq.{email}',
            headers=headers
        )
        
        if response.status_code != 200:
            print(f"Failed to fetch pending claims: {response.status_code} - {response.text}")
            return jsonify({'error': 'Failed to fetch pending claims'}), 500

        pending_claims = response.json()
        
        print(f"DEBUG: Found {len(pending_claims)} pending claims for email {email}")
        if pending_claims:
            print(f"DEBUG: Pending claims: {pending_claims}")
        
        if not pending_claims:
            print(f"No pending claims found for email {email}")
            return jsonify({'success': True, 'message': 'No pending claims to migrate'})

        migrated_count = 0
        
        for claim in pending_claims:
            # Prepare claimed profile data
            profile_data = {
                'original_player_id': claim['original_player_id'],
                'claimed_by_user_id': user_id,
                'name': claim['name'],
                'nationality': claim['nationality'],
                'year_of_birth': claim['year_of_birth'],
                'height': claim['height'],
                'weight': claim['weight'],
                'position': claim['position'],
                'gpa': claim['gpa'],
                'credit_hours_taken': claim['credit_hours_taken'],
                'finances': claim['finances'],
                'available': claim['available'],
                'current_school': claim['current_school'],
                'division_transferring_from': claim['division_transferring_from'],
                'years_of_eligibility_left': claim['years_of_eligibility_left'],
                'individual_awards': claim['individual_awards'],
                'college_accolades': claim['college_accolades'],
                'email_address': claim['email_address'],
                'highlights': claim['highlights'],
                'full_game_link': claim['full_game_link'],
                'why_player_is_transferring': claim['why_player_is_transferring']
            }

            # Insert into claimed_profiles
            profile_response = requests.post(
                f'{supabase_url}/rest/v1/claimed_profiles',
                headers=headers,
                json=profile_data
            )
            
            if profile_response.status_code == 201:
                # Create user_profiles entry for the player
                user_profile_data = {
                    'user_id': user_id,
                    'user_type': 'Player',
                    'name': claim['name'],
                    'email': claim['email_address']
                }
                
                user_profile_response = requests.post(
                    f'{supabase_url}/rest/v1/user_profiles',
                    headers=headers,
                    json=user_profile_data
                )
                
                if user_profile_response.status_code == 201:
                    print(f"Created user profile for player {user_id}")
                else:
                    print(f"Failed to create user profile for player {user_id}: {user_profile_response.status_code} - {user_profile_response.text}")
                
                # Delete from pending_claims
                delete_response = requests.delete(
                    f'{supabase_url}/rest/v1/pending_claims?id=eq.{claim["id"]}',
                    headers=headers
                )
                
                if delete_response.status_code == 204:
                    migrated_count += 1
                    print(f"Successfully migrated pending claim {claim['id']} for user {user_id}")
                else:
                    print(f"Failed to delete pending claim {claim['id']}: {delete_response.status_code}")
            else:
                print(f"Failed to migrate pending claim {claim['id']}: {profile_response.status_code} - {profile_response.text}")

        print(f"Migrated {migrated_count} pending claims for user {user_id}")
        
        # Clear the player cache to ensure fresh data is loaded
        if migrated_count > 0:
            clear_player_cache()
            print("Cleared player cache after successful migration")
        
        return jsonify({'success': True, 'message': f'Migrated {migrated_count} pending claims'})

    except Exception as e:
        print(f"Error migrating pending claims: {e}")
        return jsonify({'error': str(e)}), 500

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

@app.route('/api/update-claimed-profile', methods=['PUT', 'OPTIONS'])
def update_claimed_profile():
    """Update a claimed profile"""
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'PUT, OPTIONS')
        return response

    if not SUPABASE_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500

    try:
        data = request.get_json()
        profile_id = data.get('profile_id')
        updates = data.get('updates', {})

        if not profile_id:
            return jsonify({'error': 'Profile ID is required'}), 400

        # Use service role key to update the profile
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
        
        response = requests.patch(
            f'{supabase_url}/rest/v1/claimed_profiles?id=eq.{profile_id}',
            headers=headers,
            json=updates
        )
        
        if response.status_code == 200:
            updated_profile = response.json()
            if updated_profile:
                # Clear the player cache to ensure fresh data is loaded
                clear_player_cache()
                return jsonify(updated_profile[0])
            else:
                return jsonify({'error': 'Profile not found'}), 404
        else:
            print(f"Failed to update claimed profile: {response.status_code} - {response.text}")
            return jsonify({'error': 'Failed to update claimed profile'}), 500

    except Exception as e:
        print(f"Error updating claimed profile: {e}")
        return jsonify({'error': str(e)}), 500

# Chat System API Endpoints

@app.route('/api/chat/conversations', methods=['GET', 'OPTIONS'])
def get_conversations():
    """Get all conversations for the current user"""
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        return response

    if not SUPABASE_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500

    try:
        # Get user ID from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header required'}), 401

        token = auth_header.split(' ')[1]
        
        # Verify token and get user ID
        user_id = verify_jwt_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401

        # Get conversations where user is either coach or player
        response = requests.get(
            f'{supabase_url}/rest/v1/conversations?or=(coach_id.eq.{user_id},player_id.eq.{user_id})&order=updated_at.desc',
            headers={
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json'
            }
        )
        
        if response.status_code == 200:
            conversations = response.json()
            
            # For each conversation, get the other user's details and latest message
            enriched_conversations = []
            for conv in conversations:
                other_user_id = conv['player_id'] if conv['coach_id'] == user_id else conv['coach_id']
                
                # Get other user's profile
                user_profile_response = requests.get(
                    f'{supabase_url}/rest/v1/user_profiles?user_id=eq.{other_user_id}',
                    headers={
                        'apikey': supabase_key,
                        'Authorization': f'Bearer {supabase_key}',
                        'Content-Type': 'application/json'
                    }
                )
                
                other_user_profile = None
                if user_profile_response.status_code == 200:
                    profiles = user_profile_response.json()
                    if profiles:
                        other_user_profile = profiles[0]
                
                # Get latest message
                latest_message_response = requests.get(
                    f'{supabase_url}/rest/v1/messages?conversation_id=eq.{conv["id"]}&order=created_at.desc&limit=1',
                    headers={
                        'apikey': supabase_key,
                        'Authorization': f'Bearer {supabase_key}',
                        'Content-Type': 'application/json'
                    }
                )
                
                latest_message = None
                if latest_message_response.status_code == 200:
                    messages = latest_message_response.json()
                    if messages:
                        latest_message = messages[0]
                
                # Get unread count
                unread_response = requests.get(
                    f'{supabase_url}/rest/v1/unread_messages?user_id=eq.{user_id}&conversation_id=eq.{conv["id"]}',
                    headers={
                        'apikey': supabase_key,
                        'Authorization': f'Bearer {supabase_key}',
                        'Content-Type': 'application/json'
                    }
                )
                
                unread_count = 0
                if unread_response.status_code == 200:
                    unread_records = unread_response.json()
                    if unread_records:
                        unread_count = unread_records[0]['unread_count']
                
                enriched_conversations.append({
                    'id': conv['id'],
                    'other_user': {
                        'id': other_user_id,
                        'name': other_user_profile['name'] if other_user_profile else 'Unknown',
                        'user_type': other_user_profile['user_type'] if other_user_profile else 'Unknown'
                    },
                    'latest_message': latest_message,
                    'unread_count': unread_count,
                    'updated_at': conv['updated_at']
                })
            
            return jsonify(enriched_conversations)
        else:
            print(f"Failed to fetch conversations: {response.status_code} - {response.text}")
            return jsonify({'error': 'Failed to fetch conversations'}), 500

    except Exception as e:
        print(f"Error fetching conversations: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/conversations', methods=['POST', 'OPTIONS'])
def create_conversation():
    """Create a new conversation between coach and player"""
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response

    if not SUPABASE_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500

    try:
        data = request.get_json()
        player_id = data.get('player_id')
        
        if not player_id:
            return jsonify({'error': 'Player ID is required'}), 400

        # Get user ID from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header required'}), 401

        token = auth_header.split(' ')[1]
        
        # Verify token and get user ID
        coach_id = verify_jwt_token(token)
        if not coach_id:
            return jsonify({'error': 'Invalid token'}), 401

        # Check if user is a coach
        user_profile_response = requests.get(
            f'{supabase_url}/rest/v1/user_profiles?user_id=eq.{coach_id}',
            headers={
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json'
            }
        )
        
        if user_profile_response.status_code != 200:
            return jsonify({'error': 'Failed to verify user type'}), 500

        profiles = user_profile_response.json()
        if not profiles or profiles[0]['user_type'] != 'Coach':
            return jsonify({'error': 'Only coaches can create conversations'}), 403

        # Check if player has a user profile
        player_profile_response = requests.get(
            f'{supabase_url}/rest/v1/user_profiles?user_id=eq.{player_id}',
            headers={
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json'
            }
        )
        
        if player_profile_response.status_code == 200:
            player_profiles = player_profile_response.json()
            if not player_profiles:
                return jsonify({'error': 'Player profile not found. Player must have claimed their profile.'}), 404
        else:
            return jsonify({'error': 'Failed to verify player profile'}), 500

        # Check if conversation already exists
        existing_response = requests.get(
            f'{supabase_url}/rest/v1/conversations?coach_id=eq.{coach_id}&player_id=eq.{player_id}',
            headers={
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json'
            }
        )
        
        if existing_response.status_code == 200:
            existing_conversations = existing_response.json()
            if existing_conversations:
                return jsonify({'conversation_id': existing_conversations[0]['id']})

        # Create new conversation
        conversation_data = {
            'coach_id': coach_id,
            'player_id': player_id
        }
        
        response = requests.post(
            f'{supabase_url}/rest/v1/conversations',
            headers={
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            json=conversation_data
        )
        
        if response.status_code == 201:
            conversation = response.json()
            return jsonify({'conversation_id': conversation[0]['id']})
        else:
            print(f"Failed to create conversation: {response.status_code} - {response.text}")
            return jsonify({'error': 'Failed to create conversation'}), 500

    except Exception as e:
        print(f"Error creating conversation: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/conversations/<int:conversation_id>/messages', methods=['GET', 'OPTIONS'])
def get_messages(conversation_id):
    """Get all messages in a conversation"""
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        return response

    if not SUPABASE_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500

    try:
        # Get user ID from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header required'}), 401

        token = auth_header.split(' ')[1]
        
        # Verify token and get user ID
        user_id = verify_jwt_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401

        # Verify user is part of the conversation
        conversation_response = requests.get(
            f'{supabase_url}/rest/v1/conversations?id=eq.{conversation_id}',
            headers={
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json'
            }
        )
        
        if conversation_response.status_code != 200:
            return jsonify({'error': 'Conversation not found'}), 404

        conversations = conversation_response.json()
        if not conversations:
            return jsonify({'error': 'Conversation not found'}), 404

        conversation = conversations[0]
        if conversation['coach_id'] != user_id and conversation['player_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403

        # Get messages
        response = requests.get(
            f'{supabase_url}/rest/v1/messages?conversation_id=eq.{conversation_id}&order=created_at.asc',
            headers={
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json'
            }
        )
        
        if response.status_code == 200:
            messages = response.json()
            
            # Mark messages as read for this user
            requests.post(
                f'{supabase_url}/rest/v1/rpc/mark_conversation_as_read',
                headers={
                    'apikey': supabase_key,
                    'Authorization': f'Bearer {supabase_key}',
                    'Content-Type': 'application/json'
                },
                json={'conv_id': conversation_id, 'user_uuid': user_id}
            )
            
            return jsonify(messages)
        else:
            print(f"Failed to fetch messages: {response.status_code} - {response.text}")
            return jsonify({'error': 'Failed to fetch messages'}), 500

    except Exception as e:
        print(f"Error fetching messages: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/conversations/<int:conversation_id>', methods=['DELETE', 'OPTIONS'])
def delete_conversation(conversation_id):
    """Delete a conversation"""
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'DELETE, OPTIONS')
        return response

    if not SUPABASE_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500

    try:
        # Get user ID from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header required'}), 401

        token = auth_header.split(' ')[1]
        
        # Verify token and get user ID
        user_id = verify_jwt_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401

        # Check if user is part of this conversation
        conversation_response = requests.get(
            f'{supabase_url}/rest/v1/conversations?id=eq.{conversation_id}',
            headers={
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json'
            }
        )
        
        if conversation_response.status_code != 200:
            return jsonify({'error': 'Failed to fetch conversation'}), 500

        conversations = conversation_response.json()
        if not conversations:
            return jsonify({'error': 'Conversation not found'}), 404

        conversation = conversations[0]
        if conversation['coach_id'] != user_id and conversation['player_id'] != user_id:
            return jsonify({'error': 'Not authorized to delete this conversation'}), 403

        # Delete the conversation (this will cascade delete messages and unread_messages)
        delete_response = requests.delete(
            f'{supabase_url}/rest/v1/conversations?id=eq.{conversation_id}',
            headers={
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json'
            }
        )
        
        if delete_response.status_code == 204:
            return jsonify({'message': 'Conversation deleted successfully'})
        else:
            print(f"Failed to delete conversation: {delete_response.status_code} - {delete_response.text}")
            return jsonify({'error': 'Failed to delete conversation'}), 500

    except Exception as e:
        print(f"Error deleting conversation: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/conversations/<int:conversation_id>/messages', methods=['POST', 'OPTIONS'])
def send_message(conversation_id):
    """Send a message in a conversation"""
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response

    if not SUPABASE_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500

    try:
        data = request.get_json()
        content = data.get('content')
        
        if not content or not content.strip():
            return jsonify({'error': 'Message content is required'}), 400

        # Get user ID from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header required'}), 401

        token = auth_header.split(' ')[1]
        
        # Verify token and get user ID
        sender_id = verify_jwt_token(token)
        if not sender_id:
            return jsonify({'error': 'Invalid token'}), 401

        # Verify user is part of the conversation
        conversation_response = requests.get(
            f'{supabase_url}/rest/v1/conversations?id=eq.{conversation_id}',
            headers={
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json'
            }
        )
        
        if conversation_response.status_code != 200:
            return jsonify({'error': 'Conversation not found'}), 404

        conversations = conversation_response.json()
        if not conversations:
            return jsonify({'error': 'Conversation not found'}), 404

        conversation = conversations[0]
        if conversation['coach_id'] != sender_id and conversation['player_id'] != sender_id:
            return jsonify({'error': 'Access denied'}), 403

        # Send message
        message_data = {
            'conversation_id': conversation_id,
            'sender_id': sender_id,
            'content': content.strip()
        }
        
        response = requests.post(
            f'{supabase_url}/rest/v1/messages',
            headers={
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            json=message_data
        )
        
        if response.status_code == 201:
            message = response.json()
            return jsonify(message[0])
        else:
            print(f"Failed to send message: {response.status_code} - {response.text}")
            return jsonify({'error': 'Failed to send message'}), 500

    except Exception as e:
        print(f"Error sending message: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/unread-count', methods=['GET', 'OPTIONS'])
def get_unread_count():
    """Get total unread message count for the current user"""
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        return response

    if not SUPABASE_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500

    try:
        # Get user ID from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header required'}), 401

        token = auth_header.split(' ')[1]
        
        # Verify token and get user ID
        user_id = verify_jwt_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401

        # Get total unread count
        response = requests.post(
            f'{supabase_url}/rest/v1/rpc/get_total_unread_count',
            headers={
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json'
            },
            json={'user_uuid': user_id}
        )
        
        if response.status_code == 200:
            result = response.json()
            return jsonify({'unread_count': result})
        else:
            print(f"Failed to get unread count: {response.status_code} - {response.text}")
            return jsonify({'error': 'Failed to get unread count'}), 500

    except Exception as e:
        print(f"Error getting unread count: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 