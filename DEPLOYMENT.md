# Deployment Guide

## Backend API Deployment (Render)

### 1. Deploy to Render

1. Go to [render.com](https://render.com) and create an account
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `draft-ai-api`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn api:app`
   - **Plan**: Free

### 2. Set Environment Variables

In the Render dashboard, go to your service and add these environment variables:

- `YOUTUBE_API_KEY`: Your YouTube Data API v3 key

### 3. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Copy the API key and add it to Render environment variables

### 4. Update Frontend Configuration

Once deployed, update the API URL in `frontend/src/config.js`:

```javascript
production: {
  apiBaseUrl: 'https://your-render-service-name.onrender.com'
}
```

### 5. Deploy Frontend

The frontend is already deployed to Vercel and will automatically use the production API URL.

## Testing

1. Start the backend locally: `python api.py`
2. Test the API: `curl http://localhost:5001/api/health`
3. Test YouTube endpoint: `curl "http://localhost:5001/api/youtube-highlights?player_name=Test&club_name=Test"` 