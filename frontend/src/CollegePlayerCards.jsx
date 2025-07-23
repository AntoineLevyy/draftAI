import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './USLPlayerCards.css';
import { apiBaseUrl } from './config';
import { savePlayer, unsavePlayer, getSavedPlayersBatch } from './services/saveService';
import { useAuth } from './AuthContext';

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

const CollegePlayerCard = React.memo(({ player, getPlayerImage, getClubImage, translatePosition, formatMinutes, isValidPlayer, handleViewFootage, selectedLeague, loadingVideos, savedPlayerIds, onSaveToggle, onShowSignupModal }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Defensive: Warn if playerId is missing
  if (!player.playerId) {
    console.warn('College player is missing playerId:', player);
  }

  // Only use playerId for saved state and key
  const playerId = String(player.playerId);
  const savedPlayerIdsStrings = savedPlayerIds.map(id => String(id));
  const isSaved = user && savedPlayerIdsStrings.includes(playerId);

  // Debug: Log the player ID and saved status (only for players that are saved or being saved)
  if (user && (isSaved || isSaving)) {
    console.log(`Player ${playerId}: savedPlayerIds=${savedPlayerIds}, isSaved=${isSaved}, isSaving=${isSaving}`);
    console.log(`Player ${playerId}: playerIdString="${playerId}", savedPlayerIdsStrings=${savedPlayerIdsStrings}`);
  }

  const handleSaveToggle = async () => {
    if (!user) {
      if (onShowSignupModal) onShowSignupModal();
      return;
    }
    setIsSaving(true);
    try {
      if (isSaved) {
        await unsavePlayer(player, 'college');
      } else {
        await savePlayer(player, 'college');
      }
      if (onSaveToggle) await onSaveToggle();
    } catch (error) {
      console.error('Error saving/unsaving player:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Additional validation to ensure we have valid data
  if (!isValidPlayer(player)) {
    return null; // Don't render cards for players without valid names
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

  // Debug: log the player name and photoUrl (only for debugging specific issues)
  // console.log('Player:', playerName, '| photo_url:', photoUrl, '| isRealPhoto:', isRealPhoto);

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
        <button
          className={`save-button ${isSaved ? 'saved' : ''} ${isSaving ? 'saving' : ''}`}
          onClick={handleSaveToggle}
          disabled={isSaving}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: isSaved ? '#10b981' : 'rgba(255, 255, 255, 0.9)',
            color: isSaved ? 'white' : '#374151',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: isSaving ? 'default' : 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 10,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            opacity: isSaved ? 0.8 : 1
          }}
        >
          {isSaving ? (isSaved ? 'Unsaving...' : 'Saving...') : isSaved ? 'Saved ✓' : 'Save'}
        </button>
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

const CollegePlayerCards = ({ filters, onBack, onShowSignupModal }) => {
  const { user } = useAuth();
  console.log('CollegePlayerCards received filters:', filters);
  
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('goals');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'tinder'
  const [tinderIndex, setTinderIndex] = useState(0);
  const [tinderAnimating, setTinderAnimating] = useState(false);
  const [tinderDecision, setTinderDecision] = useState(null); // 'save' | 'skip' | null
  const tinderCardRef = useRef(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragDelta, setDragDelta] = useState(0);

  const [youtubeVideos, setYoutubeVideos] = useState({});
  const [loadingVideos, setLoadingVideos] = useState({});
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [savedPlayerIds, setSavedPlayerIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [savingMap, setSavingMap] = useState({}); // {playerId: true/false}
  
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
          'https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/college/njcaa/team_logos.json'
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

  // Load saved players when user changes
  useEffect(() => {
    if (user) {
      getSavedPlayersBatch('college').then(setSavedPlayerIds);
    } else {
      setSavedPlayerIds([]);
    }
  }, [user]);

  // Clear saved players when user logs out
  useEffect(() => {
    if (!user) {
      setSavedPlayerIds([]);
    }
  }, [user]);

  // Function to refresh saved players list
  const refreshSavedPlayers = useCallback(async () => {
    console.log('=== REFRESH SAVED PLAYERS STARTED ===');
    if (user) {
      try {
        console.log('Current savedPlayerIds before refresh:', savedPlayerIds);
        const updatedSavedPlayers = await getSavedPlayersBatch('college');
        console.log('Updated saved players from database:', updatedSavedPlayers);
        console.log('Setting savedPlayerIds to:', updatedSavedPlayers);
        setSavedPlayerIds(updatedSavedPlayers);
        setRefreshKey(prev => {
          const newKey = prev + 1;
          console.log('Forced re-render with new key:', newKey);
          return newKey;
        });
        console.log('=== REFRESH SAVED PLAYERS COMPLETED ===');
      } catch (error) {
        console.error('Error refreshing saved players:', error);
      }
    } else {
      console.log('No user, skipping refresh');
    }
  }, [user, savedPlayerIds]);

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
      
      if (!response.ok) {
        throw new Error(`Failed to fetch players: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Total players from API:', data.players?.length || 0);
      
      // Filter for NJCAA players only
      const allPlayers = data.players || [];
      const njcaaPlayers = allPlayers.filter(player => 
        player.league && player.league.startsWith('NJCAA')
      );
      console.log('NJCAA players filtered:', njcaaPlayers.length);
      
      setPlayers(njcaaPlayers);
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
    
    let filteredPlayers = players.filter(player => {
      // Filter out players with missing or invalid names
      const playerName = player.name;
      if (!playerName || playerName === 'Unknown Player' || playerName.trim() === '') {
        return false;
      }
      return true;
    });
    
    // Search filter
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filteredPlayers = filteredPlayers.filter(player => {
        const playerName = player.name;
        const nameMatch = playerName.toLowerCase().includes(searchLower);
        const teamMatch = (player.team || '').toLowerCase().includes(searchLower);
        return nameMatch || teamMatch;
      });
    }
    
    // Filter by position
    if (currentFilters.position && currentFilters.position !== 'All') {
      filteredPlayers = filteredPlayers.filter(player => {
        const playerPosition = getMainPositionCategory(player.position || '');
        return playerPosition === currentFilters.position;
      });
    }
    
    // Filter by academic year
    if (currentFilters.academicLevel && currentFilters.academicLevel !== 'All') {
      filteredPlayers = filteredPlayers.filter(player => {
        const playerYear = expandYear(player.year || '');
        return playerYear === currentFilters.academicLevel;
      });
    }
    
    // Filter by league
    if (currentFilters.league && currentFilters.league !== 'All') {
      filteredPlayers = filteredPlayers.filter(player => {
        const playerLeague = player.league || 'NJCAA D1';
        return playerLeague === currentFilters.league;
      });
    }
    
    // Sort the filtered players
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
  }, [players, searchTerm, sortBy, sortOrder, currentFilters, expandYear, getMainPositionCategory]);

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
      return window.teamLogos[teamName];
    }
    
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

  const handleOptimisticSave = async (player, playerId) => {
    if (!user && onShowSignupModal) { onShowSignupModal(); return; }
    if (savedPlayerIds.map(id => String(id)).includes(String(playerId))) return;
    setSavingMap(prev => ({ ...prev, [playerId]: true }));
    setSavedPlayerIds(prev => [...prev, String(playerId)]); // Optimistic update
    try {
      await savePlayer(player, 'college');
      await refreshSavedPlayers();
    } finally {
      setSavingMap(prev => ({ ...prev, [playerId]: false }));
    }
  };


  if (loading) {
    return (
      <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
        <div className="modern-spinner" style={{ width: 56, height: 56, marginBottom: 24 }}></div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4f8cff', letterSpacing: '0.02em' }}>Loading…</div>
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
      {/* Filter Controls - move above search/sort */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        justifyContent: 'center',
        margin: '2rem 0 1.2rem 0',
        padding: '1.5rem',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
          <label style={{ fontWeight: 600, marginBottom: '8px', color: '#374151', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            League
          </label>
          <select
            value={currentFilters.league}
            onChange={e => setLocalFilters(prev => ({ ...prev, league: e.target.value }))}
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
            Position
          </label>
          <select
            value={currentFilters.position}
            onChange={e => setLocalFilters(prev => ({ ...prev, position: e.target.value }))}
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
            Academic Year
          </label>
          <select
            value={currentFilters.academicLevel}
            onChange={e => setLocalFilters(prev => ({ ...prev, academicLevel: e.target.value }))}
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
      {/* Search/Sort/Toggle Controls */}
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
          <button
            className={viewMode === 'grid' ? 'toggle-text-btn active' : 'toggle-text-btn'}
            onClick={() => setViewMode('grid')}
            style={{ marginLeft: 16 }}
          >
            Grid View
          </button>
          <button
            className={viewMode === 'list' ? 'toggle-text-btn active' : 'toggle-text-btn'}
            onClick={() => setViewMode('list')}
            style={{ marginLeft: 4 }}
          >
            List View
          </button>
          <button
            className={viewMode === 'tinder' ? 'toggle-text-btn active' : 'toggle-text-btn'}
            onClick={() => setViewMode('tinder')}
            style={{ marginLeft: 4 }}
          >
            Tinder Mode
          </button>
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
      
      {viewMode === 'tinder' ? (
        <div className="tinder-mode-container">
          {tinderIndex >= filteredAndSortedPlayers.length ? (
            <div className="tinder-complete">
              <h2>You're all caught up!</h2>
              <button className="toggle-text-btn" onClick={() => setTinderIndex(0)}>Restart</button>
              <button className="toggle-text-btn" onClick={() => setViewMode('grid')}>Back to Grid</button>
            </div>
          ) : (
            <div className="tinder-swipe-layout">
              <button className="tinder-swipe-btn left" onClick={async () => {
                if (tinderAnimating) return;
                setTinderDecision('skip');
                setTinderAnimating(true);
                setTimeout(() => {
                  setTinderAnimating(false);
                  setTinderDecision(null);
                  setTinderIndex(i => i + 1);
                }, 500);
              }}>✗</button>
              <div
                className={`tinder-card-outer ${tinderAnimating ? (tinderDecision === 'save' ? 'slide-right' : 'slide-left') : ''}`}
                ref={tinderCardRef}
                style={{
                  transform: dragDelta ? `translateX(${dragDelta}px) rotate(${dragDelta/30}deg)` : undefined,
                  transition: tinderAnimating || dragDelta === 0 ? 'transform 0.45s cubic-bezier(0.4,0.2,0.2,1), opacity 0.45s' : 'none',
                }}
                onMouseDown={e => setDragStart(e.clientX)}
                onMouseMove={e => {
                  if (dragStart !== null) setDragDelta(e.clientX - dragStart);
                }}
                onMouseUp={async e => {
                  if (dragStart !== null) {
                    if (dragDelta > 120) {
                      // Save
                      if (user) {
                        setTinderDecision('save');
                        setTinderAnimating(true);
                        await savePlayer(filteredAndSortedPlayers[tinderIndex], 'college');
                        await refreshSavedPlayers();
                        setTimeout(() => {
                          setTinderAnimating(false);
                          setTinderDecision(null);
                          setTinderIndex(i => i + 1);
                          setDragDelta(0);
                          setDragStart(null);
                        }, 500);
                        return;
                      } else {
                        onShowSignupModal();
                        setDragDelta(0);
                        setDragStart(null);
                        return;
                      }
                    } else if (dragDelta < -120) {
                      // Skip
                      setTinderDecision('skip');
                      setTinderAnimating(true);
                      setTimeout(() => {
                        setTinderAnimating(false);
                        setTinderDecision(null);
                        setTinderIndex(i => i + 1);
                        setDragDelta(0);
                        setDragStart(null);
                      }, 500);
                      return;
                    }
                    // Snap back if not enough drag
                    setDragDelta(0);
                    setDragStart(null);
                  }
                }}
                onTouchStart={e => setDragStart(e.touches[0].clientX)}
                onTouchMove={e => {
                  if (dragStart !== null) setDragDelta(e.touches[0].clientX - dragStart);
                }}
                onTouchEnd={async e => {
                  if (dragStart !== null) {
                    if (dragDelta > 80) {
                      // Save
                      if (user) {
                        setTinderDecision('save');
                        setTinderAnimating(true);
                        await savePlayer(filteredAndSortedPlayers[tinderIndex], 'college');
                        await refreshSavedPlayers();
                        setTimeout(() => {
                          setTinderAnimating(false);
                          setTinderDecision(null);
                          setTinderIndex(i => i + 1);
                          setDragDelta(0);
                          setDragStart(null);
                        }, 500);
                        return;
                      } else {
                        onShowSignupModal();
                        setDragDelta(0);
                        setDragStart(null);
                        return;
                      }
                    } else if (dragDelta < -80) {
                      // Skip
                      setTinderDecision('skip');
                      setTinderAnimating(true);
                      setTimeout(() => {
                        setTinderAnimating(false);
                        setTinderDecision(null);
                        setTinderIndex(i => i + 1);
                        setDragDelta(0);
                        setDragStart(null);
                      }, 500);
                      return;
                    }
                    // Snap back if not enough drag
                    setDragDelta(0);
                    setDragStart(null);
                  }
                }}
              >
                <div className="tinder-card-inner ultra-wide compact">
                  <CollegePlayerCard
                    player={filteredAndSortedPlayers[tinderIndex]}
                    getPlayerImage={getPlayerImage}
                    getClubImage={getClubImage}
                    translatePosition={translatePosition}
                    formatMinutes={formatMinutes}
                    isValidPlayer={isValidPlayer}
                    handleViewFootage={handleViewFootage}
                    selectedLeague={currentFilters.league || 'All'}
                    loadingVideos={loadingVideos}
                    savedPlayerIds={savedPlayerIds}
                    onSaveToggle={refreshSavedPlayers}
                    onShowSignupModal={onShowSignupModal}
                  />
                  {tinderAnimating && (
                    <div className={`tinder-overlay ${tinderDecision}`}>{tinderDecision === 'save' ? 'Saved' : 'Skipped'}</div>
                  )}
                </div>
              </div>
              <button className="tinder-swipe-btn right" onClick={async () => {
                if (tinderAnimating) return;
                if (user) {
                  setTinderDecision('save');
                  setTinderAnimating(true);
                  await savePlayer(filteredAndSortedPlayers[tinderIndex], 'college');
                  await refreshSavedPlayers();
                  setTimeout(() => {
                    setTinderAnimating(false);
                    setTinderDecision(null);
                    setTinderIndex(i => i + 1);
                  }, 500);
                } else {
                  onShowSignupModal();
                }
              }}>✓</button>
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="player-cards-grid">
          {filteredAndSortedPlayers.slice(0, 10).map((player, visibleIdx) => (
            <div key={String(player.playerId) + '-' + savedPlayerIds.includes(String(player.playerId)) + '-' + refreshKey} style={{ position: 'relative' }}>
              <CollegePlayerCard
                player={player}
                getPlayerImage={getPlayerImage}
                getClubImage={getClubImage}
                translatePosition={translatePosition}
                formatMinutes={formatMinutes}
                isValidPlayer={isValidPlayer}
                handleViewFootage={handleViewFootage}
                selectedLeague={currentFilters.league || 'All'}
                loadingVideos={loadingVideos}
                savedPlayerIds={savedPlayerIds}
                onSaveToggle={refreshSavedPlayers}
                onShowSignupModal={onShowSignupModal}
              />
            </div>
          ))}
          {!user && filteredAndSortedPlayers.length > 10 && (
            <div className="unlock-more-message" style={{ gridColumn: '1 / -1', textAlign: 'center', margin: '2rem 0', width: '100%' }}>
              <button className="unlock-more-btn" onClick={onShowSignupModal} style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4f8cff', background: '#f8fafc', border: '1px solid #e3e9f5', borderRadius: 12, padding: '1.2rem 2.5rem', cursor: 'pointer', boxShadow: '0 2px 12px rgba(79,140,255,0.07)' }}>
                Sign in to unlock more
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="player-cards-table-wrap">
          <table className="player-cards-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Club</th>
                <th>League</th>
                <th>Position</th>
                <th>Goals</th>
                <th>Assists</th>
                <th>Matches</th>
                <th>Save</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPlayers.slice(0, 10).map((player, visibleIdx) => {
                const playerName = player.name || 'Unknown Player';
                const club = player.team || 'Unknown Club';
                const league = player.league || 'Unknown League';
                const position = player.position || 'Unknown';
                const goals = player.goals || 0;
                const assists = player.assists || 0;
                const matches = player.games || 0;
                const playerId = player.playerId;
                const isSaved = user && savedPlayerIds.map(id => String(id)).includes(String(playerId));
                const isSaving = !!savingMap[playerId];
                return (
                  <tr key={String(player.playerId) + '-' + playerName}>
                    <td><img src={getPlayerImage(player)} alt={playerName} className="player-list-img" /></td>
                    <td>{playerName}</td>
                    <td>{club}</td>
                    <td>{league}</td>
                    <td>{position}</td>
                    <td>{goals}</td>
                    <td>{assists}</td>
                    <td>{matches}</td>
                    <td>
                      <button
                        className={isSaved ? 'save-btn saved' : 'save-btn'}
                        onClick={async () => {
                          if (isSaved || isSaving) return;
                          await handleOptimisticSave(player, playerId);
                        }}
                        disabled={isSaved || isSaving}
                        style={{ minWidth: 60 }}
                      >
                        {isSaving ? 'Saving...' : isSaved ? 'Saved ✓' : 'Save'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!user && filteredAndSortedPlayers.length > 10 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', background: '#f8fafc', color: '#4f8cff', fontWeight: 700, fontSize: '1.1rem', borderRadius: 12, height: 60 }}>
                    <button className="unlock-more-btn" onClick={onShowSignupModal} style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4f8cff', background: '#f8fafc', border: '1px solid #e3e9f5', borderRadius: 12, padding: '1.2rem 2.5rem', cursor: 'pointer', boxShadow: '0 2px 12px rgba(79,140,255,0.07)' }}>
                      Sign in to unlock more
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
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