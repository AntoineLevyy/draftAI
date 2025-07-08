# Draft AI - Soccer Player Scouting App

A web application for scouting USL League One and MLS Next Pro soccer players.

## Features
- Player database with stats and profiles
- YouTube highlights integration
- Advanced filtering and search
- Modern React frontend with Flask backend

## Deployment
- Frontend: Vercel
- Backend: Render
- Data: GitHub raw URLs

## API Endpoints
- `/api/players` - Get filtered players
- `/api/youtube-highlights` - Get YouTube videos for players
- `/api/health` - Health check

## Tech Stack

- **Frontend**: React, Vite, CSS3
- **Backend**: Flask, Python
- **Data**: JSON files with player statistics

## Local Development

### Prerequisites
- Node.js (v16 or higher)
- Python 3.9+
- pip

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the API
python api.py
```

### Environment Variables
Create a `.env` file in the root directory:
```
YOUTUBE_API_KEY=your_youtube_api_key_here
```

## Deployment

### GitHub Setup
1. Initialize git repository:
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub and push:
```bash
git remote add origin https://github.com/yourusername/soccer-scouting-app.git
git branch -M main
git push -u origin main
```

### Vercel Deployment
1. Go to [Vercel](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Other
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd frontend && npm install`
5. Add environment variables in Vercel dashboard:
   - `YOUTUBE_API_KEY`: Your YouTube API key
6. Deploy!

## Data Sources

Player data is scraped from official league websites and stored in JSON format:
- `usl_league_one_players_api.json` - USL League One players
- `mls_next_pro_players_api.json` - MLS Next Pro players

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License 