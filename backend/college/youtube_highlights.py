import os
import requests
from datetime import datetime
from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import re

# Load environment variables
load_dotenv()

def search_player_channel(youtube, player_name, club_name):
    """
    Search for a YouTube channel that belongs to the player or their club.
    """
    # Try different channel search queries
    channel_queries = [
        f'"{player_name}" soccer channel',
        f'"{player_name}" {club_name}',
        f'{club_name} {player_name}',
        f'"{player_name}" highlights channel',
        f'"{player_name}" soccer player'
    ]
    
    for query in channel_queries:
        try:
            print(f"Searching for channel: {query}")
            search_response = youtube.search().list(
                q=query,
                part='id,snippet',
                maxResults=5,
                type='channel',
                order='relevance'
            ).execute()
            
            for search_result in search_response.get('items', []):
                if search_result['id']['kind'] == 'youtube#channel':
                    channel_id = search_result['id']['channelId']
                    channel_title = search_result['snippet']['title']
                    channel_description = search_result['snippet'].get('description', '')
                    
                    # Check if this channel is likely the player's channel
                    player_name_lower = player_name.lower()
                    club_name_lower = club_name.lower()
                    channel_lower = channel_title.lower() + ' ' + channel_description.lower()
                    
                    # Check for player name and soccer-related content
                    has_player_name = any(part in channel_lower for part in player_name_lower.split())
                    has_soccer_content = any(keyword in channel_lower for keyword in ['soccer', 'football', 'highlight', 'player', 'goals'])
                    has_club = club_name_lower in channel_lower
                    
                    if has_player_name and (has_soccer_content or has_club):
                        print(f"Found potential player channel: {channel_title}")
                        return channel_id, channel_title
                        
        except Exception as e:
            print(f"Error searching for channel with query '{query}': {str(e)}")
            continue
    
    return None, None

def get_channel_videos(youtube, channel_id, player_name, max_results=10):
    """
    Get videos from a specific channel that are likely about the player.
    """
    try:
        print(f"Getting videos from channel {channel_id}")
        
        # Get channel's uploads playlist
        channels_response = youtube.channels().list(
            id=channel_id,
            part='contentDetails'
        ).execute()
        
        if not channels_response.get('items'):
            return []
        
        uploads_playlist_id = channels_response['items'][0]['contentDetails']['relatedPlaylists']['uploads']
        
        # Get videos from uploads playlist
        playlist_response = youtube.playlistItems().list(
            playlistId=uploads_playlist_id,
            part='snippet',
            maxResults=50  # Get more to filter from
        ).execute()
        
        relevant_videos = []
        player_name_lower = player_name.lower()
        name_parts = player_name_lower.split()
        
        for item in playlist_response.get('items', []):
            snippet = item['snippet']
            title = snippet.get('title', '').lower()
            description = snippet.get('description', '').lower()
            
            # Check if video is about the player
            has_first_name = name_parts[0] in title or name_parts[0] in description
            has_last_name = name_parts[-1] in title or name_parts[-1] in description if len(name_parts) > 1 else True
            
            # Check for soccer content
            soccer_keywords = ['soccer', 'football', 'goal', 'assist', 'highlight', 'match', 'game', 'player']
            has_soccer_content = any(keyword in title or keyword in description for keyword in soccer_keywords)
            
            if has_first_name and has_last_name and has_soccer_content:
                video_data = {
                    'title': snippet.get('title', ''),
                    'video_url': f"https://www.youtube.com/watch?v={snippet['resourceId']['videoId']}",
                    'channel': snippet.get('channelTitle', ''),
                    'published_at': format_date(snippet.get('publishedAt', '')),
                    'description': snippet.get('description', '')[:200] + '...' if len(snippet.get('description', '')) > 200 else snippet.get('description', '')
                }
                relevant_videos.append(video_data)
                
                if len(relevant_videos) >= max_results:
                    break
        
        return relevant_videos
        
    except Exception as e:
        print(f"Error getting channel videos: {str(e)}")
        return []

def is_relevant_video(video_data, player_name, club_name):
    """
    Strict filtering to determine if a video is actually about the specific player.
    """
    title = video_data['title'].lower()
    description = video_data['description'].lower()
    channel = video_data['channel'].lower()
    
    # Split player name into parts for more flexible matching
    name_parts = player_name.lower().split()
    first_name = name_parts[0]
    last_name = name_parts[-1] if len(name_parts) > 1 else first_name
    
    # Must have player's first name AND last name in title or description
    has_first_name = first_name in title or first_name in description
    has_last_name = last_name in title or last_name in description
    
    # Check for club name (case insensitive)
    club_lower = club_name.lower()
    has_club = club_lower in title or club_lower in description
    
    # Check for soccer-related keywords
    soccer_keywords = ['soccer', 'football', 'goal', 'assist', 'highlight', 'match', 'game', 'player']
    has_soccer_content = any(keyword in title or keyword in description for keyword in soccer_keywords)
    
    # Check for youth soccer indicators
    youth_indicators = ['youth', 'u16', 'u17', 'u18', 'u19', 'high school', 'college', 'academy', 'club']
    has_youth_content = any(indicator in title or indicator in description for indicator in youth_indicators)
    
    # Video must meet strict criteria:
    # 1. Must have both first and last name
    # 2. Must have soccer content OR youth content
    # 3. Bonus points for club name
    if not (has_first_name and has_last_name):
        return False
    
    if not (has_soccer_content or has_youth_content):
        return False
    
    # Additional checks to exclude irrelevant content
    exclude_keywords = ['music', 'song', 'cover', 'tutorial', 'how to', 'review', 'news', 'interview']
    for keyword in exclude_keywords:
        if keyword in title and not has_soccer_content:
            return False
    
    return True

def search_youtube_videos(player_name, club_name, api_key=None, max_results=10):
    """
    Search YouTube for highlight videos of a specific player and club.
    First tries to find the player's channel, then falls back to general search.
    
    Args:
        player_name (str): Name of the player
        club_name (str): Name of the club/team
        api_key (str, optional): YouTube API key. If not provided, will try to load from .env
        max_results (int): Maximum number of results to return (default: 10)
    
    Returns:
        list: List of dictionaries containing video information
    """
    
    # Get API key from parameter or environment variable
    if api_key is None:
        api_key = os.getenv('YOUTUBE_API_KEY')
        if not api_key:
            raise ValueError("YouTube API key not found. Please provide it as a parameter or set YOUTUBE_API_KEY in your .env file")
    
    try:
        # Build the YouTube API service
        youtube = build('youtube', 'v3', developerKey=api_key)
        
        # First, try to find the player's channel
        print(f"Searching for {player_name}'s YouTube channel...")
        channel_id, channel_title = search_player_channel(youtube, player_name, club_name)
        
        if channel_id:
            print(f"Found channel: {channel_title}")
            # Get videos from the player's channel
            channel_videos = get_channel_videos(youtube, channel_id, player_name, max_results)
            if channel_videos:
                print(f"Found {len(channel_videos)} videos from player's channel")
                return channel_videos
        
        # If no channel found or no videos from channel, fall back to general search
        print("No player channel found, searching for general videos...")
        
        # Create more specific search queries
        search_queries = [
            f'"{player_name}" "{club_name}" soccer highlights',
            f'"{player_name}" "{club_name}" goals assists',
            f'"{player_name}" soccer highlights {club_name}',
            f'"{player_name}" {club_name} youth soccer',
            f'"{player_name}" soccer player highlights'
        ]
        
        all_videos = []
        
        for query in search_queries:
            print(f"Trying query: {query}")
            try:
                # Search for videos with this specific query
                search_response = youtube.search().list(
                    q=query,
                    part='id,snippet',
                    maxResults=5,  # Get fewer results per query to avoid duplicates
                    type='video',
                    order='relevance',
                    videoDuration='medium',  # Filter for medium length videos (4-20 minutes)
                    publishedAfter='2018-01-01T00:00:00Z'  # Include slightly older videos for youth players
                ).execute()
                
                # Extract video information
                for search_result in search_response.get('items', []):
                    if search_result['id']['kind'] == 'youtube#video':
                        video_id = search_result['id']['videoId']
                        snippet = search_result['snippet']
                        
                        # Check if this video is already in our results
                        if not any(video['video_url'] == f"https://www.youtube.com/watch?v={video_id}" for video in all_videos):
                            # Format published date
                            published_at = snippet.get('publishedAt', '')
                            formatted_date = format_date(published_at)
                            
                            video_data = {
                                'title': snippet.get('title', ''),
                                'video_url': f"https://www.youtube.com/watch?v={video_id}",
                                'channel': snippet.get('channelTitle', ''),
                                'published_at': formatted_date,
                                'description': snippet.get('description', '')[:200] + '...' if len(snippet.get('description', '')) > 200 else snippet.get('description', '')
                            }
                            
                            all_videos.append(video_data)
                            
                            # Stop if we have enough results
                            if len(all_videos) >= max_results * 2:  # Get more to filter from
                                break
                
                if len(all_videos) >= max_results * 2:
                    break
                    
            except Exception as e:
                print(f"Error with query '{query}': {str(e)}")
                continue
        
        # Apply strict filtering
        filtered_videos = [
            v for v in all_videos
            if is_relevant_video(v, player_name, club_name)
        ]

        # If strict filtering is too restrictive, try a more lenient approach
        if len(filtered_videos) < 2:
            print("Strict filtering too restrictive, trying lenient approach...")
            # More lenient filtering - just check for player name and soccer content
            player_name_lower = player_name.lower()
            name_parts = player_name_lower.split()
            first_name = name_parts[0]
            last_name = name_parts[-1] if len(name_parts) > 1 else first_name
            
            soccer_keywords = ['soccer', 'football', 'goal', 'assist', 'highlight', 'match', 'game']
            
            filtered_videos = [
                v for v in all_videos
                if (first_name in v['title'].lower() or first_name in v['description'].lower()) and
                   (last_name in v['title'].lower() or last_name in v['description'].lower()) and
                   any(keyword in v['title'].lower() or keyword in v['description'].lower() for keyword in soccer_keywords)
            ]

        # Fallback: if still nothing found, search just player name + 'soccer highlights'
        if not filtered_videos:
            fallback_query = f'"{player_name}" soccer highlights'
            print(f"Trying fallback query: {fallback_query}")
            try:
                search_response = youtube.search().list(
                    q=fallback_query,
                    part='id,snippet',
                    maxResults=max_results,
                    type='video',
                    order='relevance',
                    videoDuration='medium',
                    publishedAfter='2018-01-01T00:00:00Z'
                ).execute()
                for search_result in search_response.get('items', []):
                    if search_result['id']['kind'] == 'youtube#video':
                        video_id = search_result['id']['videoId']
                        snippet = search_result['snippet']
                        if not any(video['video_url'] == f"https://www.youtube.com/watch?v={video_id}" for video in filtered_videos):
                            published_at = snippet.get('publishedAt', '')
                            formatted_date = format_date(published_at)
                            video_data = {
                                'title': snippet.get('title', ''),
                                'video_url': f"https://www.youtube.com/watch?v={video_id}",
                                'channel': snippet.get('channelTitle', ''),
                                'published_at': formatted_date,
                                'description': snippet.get('description', '')[:200] + '...' if len(snippet.get('description', '')) > 200 else snippet.get('description', '')
                            }
                            # Apply strict filtering to fallback results too
                            if is_relevant_video(video_data, player_name, club_name):
                                filtered_videos.append(video_data)
                                if len(filtered_videos) >= max_results:
                                    break
            except Exception as e:
                print(f"Error with fallback query: {str(e)}")

        return filtered_videos[:max_results]
        
    except HttpError as e:
        print(f"An HTTP error {e.resp.status} occurred: {e.content.decode()}")
        raise e  # Re-raise the exception so the API can handle it
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        raise e  # Re-raise the exception so the API can handle it

def format_date(date_str):
    """
    Format ISO date string to readable format
    """
    try:
        date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return date_obj.strftime('%B %d, %Y')
    except:
        return date_str

def display_video_results(videos):
    """
    Display video results in a formatted way
    """
    if not videos:
        print("No videos found.")
        return
    
    print(f"\nFound {len(videos)} highlight videos:\n")
    
    for i, video in enumerate(videos, 1):
        print(f"{i}. {video['title']}")
        print(f"   📺 {video['video_url']}")
        print(f"   👤 Channel: {video['channel']}")
        print(f"   📅 Published: {video['published_at']}")
        print("-" * 80)

# Example usage
if __name__ == "__main__":
    # Test with a more common player name
    player_name = "Erik Adame"
    club_name = "City SC"
    
    print(f"Searching for highlight videos of {player_name} from {club_name}...")
    
    results = search_youtube_videos(player_name, club_name)
    
    display_video_results(results) 