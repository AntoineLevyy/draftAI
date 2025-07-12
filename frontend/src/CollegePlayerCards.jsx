import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './USLPlayerCards.css';
import { apiBaseUrl } from './config';

// Add the highlights button styles to match the pro section
const highlightsButtonStyles = `
  .footage-section {
    margin-top: 10px;
  }

  .view-footage-button {
    width: 100%;
    padding: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  }

  .view-footage-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }

  .view-footage-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Inject the styles
const styleSheet = document.createElement('style');
styleSheet.textContent = highlightsButtonStyles;
document.head.appendChild(styleSheet);

const translateNationality = (nationality) => {
  const translations = {
    'Vereinigte Staaten': 'United States',
    'Kanada': 'Canada',
    'Mexiko': 'Mexico',
    'Brasilien': 'Brazil',
    'Argentinien': 'Argentina',
    'England': 'England',
    'Frankreich': 'France',
    'Deutschland': 'Germany',
    'Spanien': 'Spain',
    'Italien': 'Italy',
    'Niederlande': 'Netherlands',
    'Japan': 'Japan',
    'Nigeria': 'Nigeria',
    'Ghana': 'Ghana',
    'Senegal': 'Senegal',
    'Kamerun': 'Cameroon',
    'Kolumbien': 'Colombia',
    'Chile': 'Chile',
    'Venezuela': 'Venezuela',
    'Honduras': 'Honduras',
    'Guatemala': 'Guatemala',
    'Panama': 'Panama',
    'Jamaika': 'Jamaica',
    'Trinidad und Tobago': 'Trinidad and Tobago',
    'Haiti': 'Haiti',
    'Puerto Rico': 'Puerto Rico',
    'Barbados': 'Barbados',
    'Schottland': 'Scotland',
    'Irland': 'Ireland',
    'Norwegen': 'Norway',
    'Österreich': 'Austria'
  };
  return translations[nationality] || nationality;
};

const expandYear = (year) => {
  const yearTranslations = {
    'Fr': 'Freshman',
    'So': 'Sophomore',
    'Jr': 'Junior',
    'Sr': 'Senior',
    'Freshman': 'Freshman',
    'Sophomore': 'Sophomore',
    'Junior': 'Junior',
    'Senior': 'Senior',
    'Graduate': 'Graduate Student',
    'Transfer': 'Transfer Student'
  };
  return yearTranslations[year] || year;
};

const CollegePlayerCard = React.memo(({ player, getPlayerImage, getClubImage, translatePosition, formatMinutes, isValidPlayer, handleViewFootage, selectedLeague, loadingVideos }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isValidPlayer(player)) {
    return null;
  }

  // Read from the cleaned JSON structure - simple fields only
  const playerName = player.name || 'Unknown Player';
  const teamName = player.team || 'Unknown Team';
  const position = translatePosition(player.position || 'Unknown');
  const year = expandYear(player.year || 'N/A');
  const league = player.league || 'NJCAA D1';

  // Basic player information from cleaned structure
  const height = player.height || 'N/A';
  const weight = player.weight || 'N/A';
  const hometown = player.hometown || 'N/A';
  const photoUrl = player.photo_url || null;

  // Season stats from cleaned structure
  const goals = parseInt(player.goals || 0);
  const assists = parseInt(player.assists || 0);
  const points = parseInt(player.points || 0);
  const matches = parseInt(player.games || 0);
  const gamesStarted = parseInt(player.games_started || 0);
  const minutesPlayed = parseInt(player.minutes || 0);

  // Only use photoUrl if it is a real photo (not N/A or empty) and has a valid URL format
  const isRealPhoto = photoUrl && 
    photoUrl !== 'N/A' && 
    photoUrl !== '' && 
    (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('data:'));

  // Debug: log the player name and photoUrl
  console.log('Player:', playerName, '| photo_url:', photoUrl, '| isRealPhoto:', isRealPhoto);

  return (
    <div className="player-card">
      <div className="card-header">
        <div className="player-image-container">
          {isRealPhoto ? (
            <img 
              src={photoUrl} 
              alt={playerName}
              className="player-image"
              onError={(e) => {
                console.warn('Failed to load player image for:', playerName, 'URL:', photoUrl);
                e.target.style.display = 'none';
                // Show fallback placeholder
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <div 
            className="player-image"
            style={{
              backgroundColor: 'transparent',
              border: '3px solid white',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              display: isRealPhoto ? 'none' : 'block'
            }}
          />
        </div>
        <div className="club-badge">
          <img 
            src={getClubImage(player)} 
            alt={teamName}
            className="club-image"
            onError={(e) => {
              console.warn('Failed to load team logo for:', teamName);
              e.target.style.display = 'none';
              // Show fallback placeholder
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div 
            className="club-image"
            style={{
              backgroundColor: 'rgba(79, 140, 255, 0.1)',
              border: '2px solid rgba(79, 140, 255, 0.3)',
              borderRadius: '50%',
              display: 'none'
            }}
          />
        </div>
      </div>

      <div className="card-body">
        <h3 className="player-name">{playerName}</h3>
        
        <div className="club-name">{teamName}</div>
        
        <div className="league-badge">{league}</div>

        <div className="player-info">
          <div className="info-item">
            <span className="info-label">Team:</span>
            <span className="info-value">{teamName}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Position:</span>
            <span className="info-value">{position}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Year:</span>
            <span className="info-value">{year}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Height:</span>
            <span className="info-value">{height}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Weight:</span>
            <span className="info-value">{weight}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Hometown:</span>
            <span className="info-value">{hometown}</span>
          </div>
        </div>

        <div className="performance-stats">
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>Season Stats</h3>
          <div className="stat-row">
            <div className="stat-item-card">
              <span className="stat-value">{goals}</span>
              <span className="stat-label-card">Goals</span>
            </div>
            <div className="stat-item-card">
              <span className="stat-value">{assists}</span>
              <span className="stat-label-card">Assists</span>
            </div>
            <div className="stat-item-card">
              <span className="stat-value">{points}</span>
              <span className="stat-label-card">Points</span>
            </div>
          </div>

          <div className="stat-row">
            <div className="stat-item-card">
              <span className="stat-value">{matches}</span>
              <span className="stat-label-card">Games</span>
            </div>
            <div className="stat-item-card">
              <span className="stat-value">{gamesStarted}</span>
              <span className="stat-label-card">Games Started</span>
            </div>
            <div className="stat-item-card">
              <span className="stat-value">{formatMinutes(minutesPlayed)}</span>
              <span className="stat-label-card">Minutes</span>
            </div>
          </div>
        </div>

        {/* Highlights Button - Using pro section styling */}
        <div className="footage-section">
          <button 
            className="view-footage-button"
            onClick={() => handleViewFootage(player)}
            disabled={loadingVideos[`${playerName}-${teamName}`]}
          >
            {loadingVideos[`${playerName}-${teamName}`] ? (
              <span>Loading...</span>
            ) : (
              <span>View Highlights</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

const CollegePlayerCards = ({ filters, onBack }) => {
  console.log('CollegePlayerCards received filters:', filters);
  
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('goals');
  const [sortOrder, setSortOrder] = useState('desc');

  const [youtubeVideos, setYoutubeVideos] = useState({});
  const [loadingVideos, setLoadingVideos] = useState({});
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  
  // Use filters passed from landing page, with local state for adjustments
  const [localFilters, setLocalFilters] = useState({
    position: 'All',
    league: 'All',
    academicLevel: 'All',
    ...filters
  });
  const currentFilters = localFilters;
  
  console.log('Current filters after initialization:', currentFilters);

  // Load team logos when component mounts
  useEffect(() => {
    const loadTeamLogos = async () => {
      try {
        // Try multiple possible paths for team logos
        const possiblePaths = [
          `${apiBaseUrl}/api/team-logos`,
          '/team_logos.json',
          '/backend/college/njcaa/team_logos.json',
          'https://raw.githubusercontent.com/AntoineLevyy/draftme/main/backend/college/njcaa/team_logos.json'
        ];
        
        let teamLogos = null;
        for (const path of possiblePaths) {
          try {
            console.log('Trying to load team logos from:', path);
            const response = await fetch(path);
            if (response.ok) {
              teamLogos = await response.json();
              console.log('Team logos loaded successfully from:', path);
              break;
            }
          } catch (error) {
            console.warn('Failed to load team logos from:', path, error);
          }
        }
        
        if (teamLogos) {
          window.teamLogos = teamLogos;
          console.log('Team logos loaded:', Object.keys(teamLogos).length, 'teams');
        } else {
          console.warn('Could not load team logos from any source, using fallback');
          window.teamLogos = {};
        }
      } catch (error) {
        console.warn('Error loading team logos:', error);
        window.teamLogos = {};
      }
    };

    loadTeamLogos();
  }, []);

  const handleSearchChange = useCallback((e) => {
    console.log('Search term changed to:', e.target.value);
    setSearchTerm(e.target.value);
  }, []);

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);

  const handleSortOrderChange = useCallback(() => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  }, []);



  useEffect(() => {
    console.log('useEffect triggered - fetching players');
    fetchPlayers();
  }, []); // Only fetch once when component mounts

  const fetchPlayers = async () => {
    console.log('=== FETCH PLAYERS STARTED ===');
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all players and filter for NJCAA on frontend
      const url = `${apiBaseUrl}/api/players`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        throw new Error(`Failed to fetch players: ${response.status} ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('Raw response text (first 1000 chars):', responseText.substring(0, 1000));
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('API Response parsed successfully');
      } catch (error) {
        console.error('Error parsing JSON:', error);
        throw new Error('Invalid JSON response from server');
      }
      console.log('API Response:', data);
      console.log('Total players from API:', data.players?.length || 0);
      console.log('=== RAW API DATA CHECK ===');
      console.log('First 3 players from API:', data.players?.slice(0, 3).map(p => ({ name: p.name, league: p.league, photo_url: p.photo_url })));
      console.log('NJCAA players count from API:', data.players?.filter(p => p.league?.startsWith('NJCAA')).length || 0);
      console.log('=== END RAW API DATA CHECK ===');
      
      // Debug: Check if Juan Jose Montoya is in the API response
      const juanJoseInAPI = data.players?.find(p => p.name === 'Juan Jose Montoya');
      if (juanJoseInAPI) {
        console.log('Found Juan Jose Montoya in API response:', juanJoseInAPI);
        console.log('His photo_url from API:', juanJoseInAPI.photo_url);
      } else {
        console.log('Juan Jose Montoya NOT found in API response');
      }
      
      // Debug: Check what positions are in the data
      const allPlayers = data.players || [];
      const uniquePositions = [...new Set(allPlayers.map(p => p.position).filter(Boolean))];
      console.log('Unique positions in data:', uniquePositions);
      console.log('Sample players with positions:', allPlayers.slice(0, 10).map(p => ({ name: p.name, position: p.position })));
      
      // Filter for NJCAA players only
      console.log('Total players from API:', allPlayers.length);
      console.log('Sample player leagues:', allPlayers.slice(0, 5).map(p => p.league));
      
      const njcaaPlayers = allPlayers.filter(player => 
        player.league && player.league.startsWith('NJCAA')
      );
      console.log('NJCAA players filtered:', njcaaPlayers.length);
      console.log('Sample NJCAA player leagues:', njcaaPlayers.slice(0, 5).map(p => p.league));
      console.log('=== NJCAA FILTERING CHECK ===');
      console.log('First 3 NJCAA players after filtering:', njcaaPlayers.slice(0, 3).map(p => ({ name: p.name, league: p.league, photo_url: p.photo_url })));
      console.log('=== END NJCAA FILTERING CHECK ===');
      
      const playersToSet = njcaaPlayers;
      console.log('Setting players state with:', playersToSet.length, 'players');
      
      // Check Juan Jose Montoya in the data we're about to set
      const juanJoseBeforeSet = playersToSet.find(p => p.name === 'Juan Jose Montoya');
      if (juanJoseBeforeSet) {
        console.log('Juan Jose Montoya before setState:', juanJoseBeforeSet);
        console.log('His photo_url before setState:', juanJoseBeforeSet.photo_url);
      }
      
      setPlayers(playersToSet);
      setLoading(false);
      console.log('=== FETCH PLAYERS COMPLETED ===');
    } catch (error) {
      console.error('Error fetching players:', error);
      setError('Failed to load college player data');
      setPlayers([]);
      setLoading(false);
    }
  };

  const translatePosition = useCallback((position) => {
    const translations = {
      'Goalkeeper': 'Goalkeeper',
      'GK': 'Goalkeeper',
      'Defender': 'Defender',
      'Def': 'Defender',
      'D': 'Defender',
      'Midfielder': 'Midfielder',
      'Mid': 'Midfielder',
      'M': 'Midfielder',
      'Forward': 'Forward',
      'Fwd': 'Forward',
      'F': 'Forward',
      'Center Back': 'Center Back',
      'CB': 'Center Back',
      'C': 'Center Back',
      'Left Back': 'Left Back',
      'LB': 'Left Back',
      'Right Back': 'Right Back',
      'RB': 'Right Back',
      'Defensive Midfielder': 'Defensive Midfielder',
      'DM': 'Defensive Midfielder',
      'Central Midfielder': 'Central Midfielder',
      'CM': 'Central Midfielder',
      'Attacking Midfielder': 'Attacking Midfielder',
      'AM': 'Attacking Midfielder',
      'Left Winger': 'Left Winger',
      'LW': 'Left Winger',
      'Right Winger': 'Right Winger',
      'RW': 'Right Winger',
      'Center Forward': 'Center Forward',
      'CF': 'Center Forward',
      'Striker': 'Striker',
      'ST': 'Striker'
    };
    return translations[position] || position;
  }, []);

  const getMainPositionCategory = useCallback((position) => {
    const translatedPosition = translatePosition(position);
    
    // Map specific positions to main categories
    if (translatedPosition === 'Goalkeeper' || translatedPosition === 'GK') {
      return 'Goalkeeper';
    }
    
    if (translatedPosition.includes('Back') || translatedPosition.includes('Defender') || 
        translatedPosition === 'Def' || translatedPosition === 'D' || 
        translatedPosition === 'CB' || translatedPosition === 'C') {
      return 'Defender';
    }
    
    if (translatedPosition.includes('Midfielder') || translatedPosition === 'Mid' || 
        translatedPosition === 'M' || translatedPosition === 'DM' || 
        translatedPosition === 'CM' || translatedPosition === 'AM') {
      return 'Midfielder';
    }
    
    if (translatedPosition.includes('Forward') || translatedPosition.includes('Winger') || 
        translatedPosition === 'Fwd' || translatedPosition === 'F' || 
        translatedPosition === 'CF' || translatedPosition === 'ST' || 
        translatedPosition === 'Striker' || translatedPosition === 'LW' || 
        translatedPosition === 'RW') {
      return 'Forward';
    }
    
    return translatedPosition; // Return original if no match
  }, [translatePosition]);

  const expandYear = useCallback((year) => {
    const yearTranslations = {
      'Fr': 'Freshman',
      'So': 'Sophomore',
      'Jr': 'Junior',
      'Sr': 'Senior',
      'Freshman': 'Freshman',
      'Sophomore': 'Sophomore',
      'Junior': 'Junior',
      'Senior': 'Senior',
      'Graduate': 'Graduate Student',
      'Transfer': 'Transfer Student'
    };
    return yearTranslations[year] || year;
  }, []);

    const filteredAndSortedPlayers = useMemo(() => {
    console.log('Filtering college players. Total players:', players.length);
    console.log('Current filters:', currentFilters);
    console.log('Search term:', searchTerm);
    console.log('Sample player data:', players[0]);
    console.log('Active filters:', {
      position: currentFilters.position,
      academicLevel: currentFilters.academicLevel,
      league: currentFilters.league,
      searchTerm: searchTerm
    });
    
    // Debug: Check if Juan Jose Montoya is in the players array
    const juanJose = players.find(p => p.name === 'Juan Jose Montoya');
    if (juanJose) {
      console.log('Found Juan Jose Montoya in players array:', juanJose);
      console.log('His photo_url:', juanJose.photo_url);
    } else {
      console.log('Juan Jose Montoya NOT found in players array');
    }
    
    // Apply filters
    let filteredPlayers = players.filter(player => {
      // Only filter out players with completely missing names
      const playerName = player.name;
      if (!playerName || playerName.trim() === '') {
        console.log('Filtering out player with missing name:', player);
        return false;
      }
      return true;
    });
    console.log('After name filter:', filteredPlayers.length);
    
    // Search filter
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filteredPlayers = filteredPlayers.filter(player => {
        const playerName = player.name;
        const nameMatch = playerName.toLowerCase().includes(searchLower);
        const teamMatch = (player.team || '').toLowerCase().includes(searchLower);
        if (!nameMatch && !teamMatch) {
          console.log('Filtering out player due to search term:', playerName, 'search term:', searchTerm);
          return false;
        }
        return true;
      });
      console.log('After search filter:', filteredPlayers.length);
    }
    
    // Filter by position
    if (currentFilters.position && currentFilters.position !== 'All') {
      console.log('Position filter active:', currentFilters.position);
      filteredPlayers = filteredPlayers.filter(player => {
        const playerName = player.name;
        const originalPosition = player.position || '';
        const playerPosition = getMainPositionCategory(player.position || '');
        console.log(`Player: ${playerName}, Original position: "${originalPosition}", Mapped to: "${playerPosition}", Filter: "${currentFilters.position}"`);
        if (playerPosition !== currentFilters.position) {
          console.log('Filtering out player due to position:', playerName, 'position:', playerPosition, 'filter:', currentFilters.position);
          return false;
        }
        return true;
      });
      console.log('After position filter:', filteredPlayers.length);
    }
    
    // Filter by academic year
    if (currentFilters.academicLevel && currentFilters.academicLevel !== 'All') {
      filteredPlayers = filteredPlayers.filter(player => {
        const playerName = player.name;
        const playerYear = expandYear(player.year || '');
        if (playerYear !== currentFilters.academicLevel) {
          console.log('Filtering out player due to academic year:', playerName, 'year:', playerYear, 'filter:', currentFilters.academicLevel);
          return false;
        }
        return true;
      });
      console.log('After academic year filter:', filteredPlayers.length);
    }
    
    // Filter by league
    if (currentFilters.league && currentFilters.league !== 'All') {
      filteredPlayers = filteredPlayers.filter(player => {
        const playerName = player.name;
        const playerLeague = player.league || 'NJCAA D1';
        if (playerLeague !== currentFilters.league) {
          console.log('Filtering out player due to league:', playerName, 'league:', playerLeague, 'filter:', currentFilters.league);
          return false;
        }
        return true;
      });
      console.log('After league filter:', filteredPlayers.length);
    }
    
    console.log('After basic filtering:', filteredPlayers.length);
    
    return filteredPlayers.sort((a, b) => {
        let aValue, bValue;
        switch (sortBy) {
          case 'goals':
            aValue = parseInt(a.goals || 0);
            bValue = parseInt(b.goals || 0);
            break;
          case 'assists':
            aValue = parseInt(a.assists || 0);
            bValue = parseInt(b.assists || 0);
            break;
          case 'matches':
            aValue = parseInt(a.games || 0);
            bValue = parseInt(b.games || 0);
            break;
          case 'minutes':
            aValue = parseInt(a.minutes || 0);
            bValue = parseInt(b.minutes || 0);
            break;
          case 'name':
            aValue = a.name || 'Unknown';
            bValue = b.name || 'Unknown';
            break;
          default:
            aValue = parseInt(a.goals || 0);
            bValue = parseInt(b.goals || 0);
        }
        if (sortOrder === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    
    return filteredPlayers;
  }, [players, searchTerm, sortBy, sortOrder, currentFilters, translatePosition, expandYear, getMainPositionCategory]);

  const formatMinutes = useCallback((minutes) => {
    if (!minutes) return '0';
    return minutes.toLocaleString();
  }, []);

  const getPlayerImage = useCallback((player) => {
    // For college players, use a simple data URI
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiByeD0iNDgiIGZpbGw9IiNmMWY1ZjkiLz4KPHN2ZyB4PSIyNCIgeT0iMjQiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOWNhM2FmIj4KPHBhdGggZD0iTTEyIDJDMzMuMSAyIDE0IDIuOSAxNCA0VjZDMjQgNy4xIDEzLjEgOCAxMiA4QzEwLjkgOCAxMCA3LjEgMTAgNlY0QzEwIDIuOSAxMC45IDIgMTIgMloiLz4KPHBhdGggZD0iTTE4IDhDMTkuMSA4IDIwIDguOSAyMCAxMFYxNEMyMCAxNS4xIDE5LjEgMTYgMTggMTZIMTZDMTQuOSAxNiAxNCAxNS4xIDE0IDE0VjEwQzE0IDguOSAxNC45IDggMTYgOEgxOFoiLz4KPHBhdGggZD0iTTggOEM5LjEgOCAxMCA4LjkgMTAgMTBWMTRDMjAgMTUuMSA5LjEgMTYgOCAxNkg2QzQuOSAxNiA0IDE1LjEgNCAxNFYxMEM0IDguOSA0LjkgOCA2IDhIOFoiLz4KPC9zdmc+Cjwvc3ZnPgo=';
  }, []);

  const getClubImage = useCallback((player) => {
    // For college teams, try to use actual team logo from the team_logos.json file
    const teamName = player.team;
    if (teamName && window.teamLogos && window.teamLogos[teamName] && window.teamLogos[teamName] !== null) {
      console.log('Using team logo for:', teamName, 'URL:', window.teamLogos[teamName]);
      return window.teamLogos[teamName];
    }
    
    console.log('No team logo found for:', teamName, 'using fallback');
    // Fallback to a simple data URI if no logo found
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNmMWY1ZjkiLz4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjAiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yNCA0QzI2LjIgNCAyOCA1LjggMjggOFYxNkMyOCAxOC4yIDI2LjIgMjAgMjQgMjBDMjEuOCAyMCAyMCAxOC4yIDIwIDE2VjhDMjAgNS44IDIxLjggNCAyNCA0WiIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4K';
  }, []);

  const isValidPlayer = useCallback((player) => {
    return player && player.name && player.name.trim() !== '';
  }, []);

  const fetchYoutubeVideos = useCallback(async (playerName, clubName) => {
    const cacheKey = `${playerName}-${clubName}`;
    
    // Check if we already have videos for this player
    if (youtubeVideos[cacheKey]) {
      console.log('Using cached videos for:', cacheKey);
      return youtubeVideos[cacheKey];
    }
    
    // Set loading state
    setLoadingVideos(prev => ({ ...prev, [cacheKey]: true }));
    
    try {
      console.log('Fetching videos for:', playerName, 'from club:', clubName);
      const response = await fetch(`${apiBaseUrl}/api/youtube-highlights?player_name=${encodeURIComponent(playerName)}&club_name=${encodeURIComponent(clubName)}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('YouTube API response:', data);
      
      if (data.videos) {
        console.log('Videos found:', data.videos.length);
        setYoutubeVideos(prev => ({ ...prev, [cacheKey]: data.videos }));
        return data.videos;
      } else {
        console.error('Error fetching YouTube videos:', data.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      // Set an empty array to prevent repeated failed requests
      setYoutubeVideos(prev => ({ ...prev, [cacheKey]: [] }));
      return [];
    } finally {
      setLoadingVideos(prev => ({ ...prev, [cacheKey]: false }));
    }
  }, [youtubeVideos]);

  const handleViewFootage = useCallback(async (player) => {
    const playerName = player.name;
    const teamName = player.team;
    
    if (!playerName || !teamName || playerName === 'Unknown Player' || teamName === 'Unknown Team') {
      alert('Player name or team information is missing');
      return;
    }
    
    setSelectedPlayer(player);
    setShowVideoModal(true);
    
    // Fetch videos if we don't have them already
    const cacheKey = `${playerName}-${teamName}`;
    if (!youtubeVideos[cacheKey]) {
      await fetchYoutubeVideos(playerName, teamName);
    }
  }, [youtubeVideos, fetchYoutubeVideos]);



  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading college players...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div className="usl-player-cards-container">
      <div className="search-sort-bar">
        <input
          type="text"
          placeholder="Search by player or club..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={handleSortChange}>
            <option value="goals">Goals</option>
            <option value="assists">Assists</option>
            <option value="matches">Matches</option>
            <option value="minutes">Minutes</option>
            <option value="name">Name</option>
            <option value="gpa">GPA</option>
          </select>
          <button onClick={handleSortOrderChange} className="sort-order-btn">
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>
      {/* Filter Controls */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        justifyContent: 'center',
        margin: '2rem 0',
        padding: '1.5rem',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
          <label style={{ fontWeight: 600, marginBottom: '8px', color: '#374151', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            Position
          </label>
          <select
            value={currentFilters.position || 'All'}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, position: e.target.value }))}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid rgba(79,140,255,0.2)',
              background: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              minWidth: 150
            }}
          >
            <option value="All">All</option>
            <option value="Goalkeeper">Goalkeeper</option>
            <option value="Defender">Defender</option>
            <option value="Midfielder">Midfielder</option>
            <option value="Forward">Forward</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
          <label style={{ fontWeight: 600, marginBottom: '8px', color: '#374151', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            League
          </label>
          <select
            value={currentFilters.league || 'All'}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, league: e.target.value }))}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid rgba(79,140,255,0.2)',
              background: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              minWidth: 150
            }}
          >
            <option value="All">All</option>
            <option value="NJCAA D1">NJCAA D1</option>
            <option value="NJCAA D2">NJCAA D2</option>
            <option value="NJCAA D3">NJCAA D3</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
          <label style={{ fontWeight: 600, marginBottom: '8px', color: '#374151', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            Academic Year
          </label>
          <select
            value={currentFilters.academicLevel || 'All'}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, academicLevel: e.target.value }))}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid rgba(79,140,255,0.2)',
              background: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              minWidth: 150
            }}
          >
            <option value="All">All</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
            <option value="Graduate Student">Graduate Student</option>
          </select>
        </div>
      </div>
      
      <div style={{
        textAlign: 'center',
        margin: '2rem 0',
        fontWeight: 900,
        fontSize: '1.5rem',
        letterSpacing: '-1px',
        background: 'linear-gradient(90deg, #4f8cff, #6f6fff 60%, #38bdf8 100%)',
        WebkitBackgroundClip: 'text',
        color: 'transparent'
      }}>
        We found {filteredAndSortedPlayers.length} college players for you
      </div>
      
      <div className="player-cards-grid">
        {filteredAndSortedPlayers.map(player => (
          <CollegePlayerCard
            key={player.id}
            player={player}
            getPlayerImage={getPlayerImage}
            getClubImage={getClubImage}
            translatePosition={translatePosition}
            formatMinutes={formatMinutes}
            isValidPlayer={isValidPlayer}
            handleViewFootage={handleViewFootage}
            selectedLeague={currentFilters.league || 'All'}
            loadingVideos={loadingVideos}
          />
        ))}
      </div>
      
      {filteredAndSortedPlayers.length === 0 && (
        <div className="no-results">
          <p>No college players found matching your search criteria.</p>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
            College player data will be available once we complete the scraping process.
          </p>
        </div>
      )}
      
      {showVideoModal && selectedPlayer && (
        <div className="video-modal-overlay" onClick={() => setShowVideoModal(false)}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <h2>{selectedPlayer.name} - Highlights</h2>
              <button 
                className="close-modal-button"
                onClick={() => setShowVideoModal(false)}
              >
                ×
              </button>
            </div>
            <div className="video-modal-content">
              {loadingVideos[`${selectedPlayer.name}-${selectedPlayer.team}`] ? (
                <div className="loading-videos">Loading videos...</div>
              ) : youtubeVideos[`${selectedPlayer.name}-${selectedPlayer.team}`]?.length > 0 ? (
                <div className="videos-grid">
                  {youtubeVideos[`${selectedPlayer.name}-${selectedPlayer.team}`].map((video, index) => {
                    const isSearchLink = video.channel === 'YouTube Search';
                    return (
                      <a 
                        key={index} 
                        href={video.video_url || video.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="video-card"
                        style={{ textDecoration: 'none' }}
                        onClick={(e) => {
                          const videoUrl = video.video_url || video.url;
                          if (!videoUrl || videoUrl === '') {
                            e.preventDefault();
                            alert('Video URL is not available');
                          }
                        }}
                      >
                        <div className="video-thumbnail">
                          {isSearchLink ? (
                            <div style={{
                              width: '100%',
                              height: '180px',
                              backgroundColor: '#f0f0f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '8px',
                              border: '2px dashed #ccc'
                            }}>
                              <div style={{ textAlign: 'center', color: '#666' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
                                <div>Search Link</div>
                              </div>
                            </div>
                          ) : (
                            <img 
                              src={video.thumbnail || `https://img.youtube.com/vi/${(video.video_url || video.url)?.split('v=')[1]}/mqdefault.jpg`} 
                              alt={video.title} 
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/320x180?text=Video+Thumbnail';
                              }}
                            />
                          )}
                        </div>
                        <div className="video-info">
                          <div className="video-title">{video.title}</div>
                          <div className="video-channel">{video.channel}</div>
                          <div className="video-date">{video.published_at || video.publishedAt}</div>
                          <div className="watch-video-button">
                            {isSearchLink ? 'Search YouTube' : 'Watch Video'}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="no-videos">
                  <p>No highlight videos found for this player.</p>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                    This feature requires the backend API to be running. Please ensure the server is started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegePlayerCards; 