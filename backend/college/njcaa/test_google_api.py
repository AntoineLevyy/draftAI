#!/usr/bin/env python3
"""
Simple Google API Test
Tests the Google Custom Search API with the existing credentials.
"""

import json
import requests
import time

def test_google_api():
    """Test the Google Custom Search API."""
    
    # Your credentials
    api_key = "AIzaSyDb6Bpj5aQWBrF0isuP_sAIglw8nWK1RuI"
    search_engine_id = "56edbe8a65a364f1a"
    
    print("🔍 Testing Google Custom Search API...")
    print(f"API Key: {api_key[:20]}...")
    print(f"Search Engine ID: {search_engine_id}")
    print()
    
    # Test with a simple search
    params = {
        'key': api_key,
        'cx': search_engine_id,
        'q': 'soccer player',
        'searchType': 'image',
        'num': 1
    }
    
    try:
        response = requests.get("https://www.googleapis.com/customsearch/v1", params=params, timeout=15)
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API is working!")
            
            if 'items' in data and data['items']:
                first_result = data['items'][0]
                print(f"✅ Found image: {first_result.get('link', 'No link')}")
                print(f"✅ Title: {first_result.get('title', 'No title')}")
            else:
                print("⚠️  No results returned")
                
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Error details: {response.text}")
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_google_api() 