import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './USLPlayerCards.css';
import { apiBaseUrl } from './config';

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

const CollegePlayerCard = React.memo(({ player, getPlayerImage, getClubImage, translatePosition, formatMinutes, isValidPlayer, handleViewFootage, selectedLeague }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isValidPlayer(player)) {
    return null;
  }

  // Extract data from NJCAA structure
  const playerName = player.name || 'Unknown Player';
  const teamName = player.team || 'Unknown Team';
  const position = translatePosition(player.position || 'Unknown');
  const year = expandYear(player.year || 'N/A');
  const region = player.region || 'N/A';
  const league = (player.league || 'NJCAA D1').replace(' (Tier 2 USA)', '').replace(' (Tier 1 USA)', '').replace(' (Tier 3 USA)', '');

  // Detailed player information (new fields) - read from dataMap
  const dataMap = player.dataMap || {};
  const height = dataMap.height || 'N/A';
  const weight = dataMap.weight || 'N/A';
  const hometown = dataMap.hometown || 'N/A';
  const photoUrl = player.photo_url || 'N/A';
  const shotPercentage = dataMap.shot_percentage || 'N/A';
  const shotsOnGoal = dataMap.shots_on_goal || 'N/A';
  const penaltyKicks = dataMap.penalty_kicks || 'N/A';

  // Season stats
  const goals = player.goals || 0;
  const assists = player.assists || 0;
  const points = player.points || 0;
  const matches = player.games || 0;
  const gamesStarted = player.games_started || 0;
  const minutesPlayed = player.minutesPlayed || 0;

  return (
    <div className="player-card">
      <div className="card-header">
        <div className="player-image-container">
          <img 
            src={photoUrl !== 'N/A' ? photoUrl : getPlayerImage(player)} 
            alt={playerName}
            className="player-image"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiByeD0iNDgiIGZpbGw9IiM0ZjhjZmYiLz4KPHN2ZyB4PSIyNCIgeT0iMjQiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzEzLjEgMiAxNCAyLjkgMTQgNFY2QzE0IDcuMSAxMy4xIDggMTIgOEMxMC45IDggMTAgNy4xIDEwIDZWNEMxMCAyLjkgMTAuOSAyIDEyIDJaIi8+CjxwYXRoIGQ9Ik0xOCA4QzE5LjEgOCAyMCA4LjkgMjAgMTBWMTRDMjAgMTUuMSAxOS4xIDE2IDE4IDE2SDE2QzE0LjkgMTYgMTQgMTUuMSAxNCAxNFYxMEMxNCA4LjkgMTQuOSA4IDE2IDhIMThaIi8+CjxwYXRoIGQ9Ik04IDhDOS4xIDggMTAgOC45IDEwIDEwVjE0QzEwIDE1LjEgOS4xIDE2IDggMTZINkM0LjkgMTYgNCAxNS4xIDQgMTRWMTBDNCA4LjkgNC45IDggNiA4SDhaIi8+Cjwvc3ZnPgo8L3N2Zz4K';
            }}
          />
        </div>
        <div className="club-badge">
          <img 
            src={getClubImage(player)} 
            alt={teamName}
            className="club-image"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiM2ZjZmZmYiLz4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjAiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yNCA0QzI2LjIgNCAyOCA1LjggMjggOFYxNkMyOCAxOC4yIDI2LjIgMjAgMjQgMjBDMjEuOCAyMCAyMCAxOC4yIDIwIDE2VjhDMjAgNS44IDIxLjggNCAyNCA0WiIgZmlsbD0iIzZmNmZmZiIvPgo8L3N2Zz4K';
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

        {/* Detailed Statistics Section - only show if we have detailed stats */}
        {(shotPercentage !== 'N/A' || shotsOnGoal !== 'N/A' || penaltyKicks !== 'N/A') && (
          <div className="performance-stats">
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>Detailed Stats</h3>
            <div className="stat-row">
              {shotPercentage !== 'N/A' && (
                <div className="stat-item-card">
                  <span className="stat-value">{shotPercentage}%</span>
                  <span className="stat-label-card">Shot %</span>
                </div>
              )}
              {shotsOnGoal !== 'N/A' && (
                <div className="stat-item-card">
                  <span className="stat-value">{shotsOnGoal}</span>
                  <span className="stat-label-card">Shots on Goal</span>
                </div>
              )}
              {penaltyKicks !== 'N/A' && (
                <div className="stat-item-card">
                  <span className="stat-value">{penaltyKicks}</span>
                  <span className="stat-label-card">Penalty Kicks</span>
                </div>
              )}
            </div>
          </div>
        )}



        <div className="footage-section">
          <button 
            className="view-footage-button"
            onClick={(e) => {
              e.stopPropagation();
              handleViewFootage(player);
            }}
          >
            🎥 View Footage
          </button>
        </div>
      </div>
    </div>
  );
});

const CollegePlayerCards = ({ filters, onBack }) => {
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
  const [localFilters, setLocalFilters] = useState(filters || {});
  const currentFilters = localFilters;

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);

  const handleSortOrderChange = useCallback(() => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [localFilters.league, localFilters.position, localFilters.region, localFilters.academicLevel]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all college players (both D1 and D2) and let frontend filtering handle the rest
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
      
      const data = await response.json();
      
      console.log('API Response:', data);
      console.log('Total players from API:', data.players?.length || 0);
      
      // For now, just set all players and let the filtering happen in the UI
      setPlayers(data.players || []);
      setLoading(false);
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
    
    // Apply filters
    const filteredPlayers = players.filter(player => {
      // Only filter out players with completely missing names
      const playerName = player.name;
      if (!playerName || playerName.trim() === '') {
        return false;
      }
      
      // Search filter
      if (searchTerm && searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = playerName.toLowerCase().includes(searchLower);
        const teamMatch = (player.team || '').toLowerCase().includes(searchLower);
        if (!nameMatch && !teamMatch) {
          return false;
        }
      }
      
      // Filter by position
      if (currentFilters.position && currentFilters.position !== 'All Positions') {
        const playerPosition = translatePosition(player.position || '');
        const filterPosition = currentFilters.position;
        
        // Map positions to categories
        const isGoalkeeper = playerPosition.toLowerCase().includes('goalkeeper');
        const isDefender = playerPosition.toLowerCase().includes('defender') || playerPosition.toLowerCase().includes('back');
        const isMidfielder = playerPosition.toLowerCase().includes('midfielder');
        const isForward = playerPosition.toLowerCase().includes('forward') || playerPosition.toLowerCase().includes('winger') || 
                         playerPosition.toLowerCase().includes('striker');
        
        if (filterPosition === 'Goalkeeper' && !isGoalkeeper) return false;
        if (filterPosition === 'Defender' && !isDefender) return false;
        if (filterPosition === 'Midfielder' && !isMidfielder) return false;
        if (filterPosition === 'Forward' && !isForward) return false;
      }
      
      // Filter by academic year - temporarily disabled for debugging
      // if (currentFilters.academicLevel && currentFilters.academicLevel !== 'All Academic Years') {
      //   const playerYear = expandYear(player.year || '');
      //   console.log('Academic year filter:', {
      //     filterValue: currentFilters.academicLevel,
      //     playerYear: player.year,
      //     expandedYear: playerYear,
      //     match: playerYear === currentFilters.academicLevel
      //   });
      //   if (playerYear !== currentFilters.academicLevel) {
      //     return false;
      //   }
      // }
      
      // Filter by league
      if (currentFilters.league && currentFilters.league !== 'All') {
        const playerLeague = (player.league || 'NJCAA D1').replace(' (Tier 2 USA)', '').replace(' (Tier 1 USA)', '').replace(' (Tier 3 USA)', '');
        if (playerLeague !== currentFilters.league) {
          return false;
        }
      }
      

      
      return true;
    });
    
    console.log('After basic filtering:', filteredPlayers.length);
    
    return filteredPlayers.sort((a, b) => {
        let aValue, bValue;
        switch (sortBy) {
          case 'goals':
            aValue = a.goals || a.performance?.goals || 0;
            bValue = b.goals || b.performance?.goals || 0;
            break;
          case 'assists':
            aValue = a.assists || a.performance?.assists || 0;
            bValue = b.assists || b.performance?.assists || 0;
            break;
          case 'matches':
            aValue = a.games || a.performance?.matches || 0;
            bValue = b.games || b.performance?.matches || 0;
            break;
          case 'minutes':
            aValue = a.minutesPlayed || a.performance?.minutesPlayed || 0;
            bValue = b.minutesPlayed || b.performance?.minutesPlayed || 0;
            break;
          case 'name':
            aValue = a.name || a.profile?.playerProfile?.playerName || 'Unknown';
            bValue = b.name || b.profile?.playerProfile?.playerName || 'Unknown';
            break;
          case 'gpa':
            aValue = parseFloat(a.gpa || a.profile?.playerProfile?.gpa) || 0;
            bValue = parseFloat(b.gpa || b.profile?.playerProfile?.gpa) || 0;
            break;
          default:
            aValue = a.goals || a.performance?.goals || 0;
            bValue = b.goals || b.performance?.goals || 0;
        }
        if (sortOrder === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    
    return filteredPlayers;
  }, [players, searchTerm, sortBy, sortOrder, currentFilters, translatePosition, expandYear]);

  const formatMinutes = useCallback((minutes) => {
    if (!minutes) return '0';
    return minutes.toLocaleString();
  }, []);

  const getPlayerImage = useCallback((player) => {
    // For college players, use a simple data URI
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiByeD0iNDgiIGZpbGw9IiM0ZjhjZmYiLz4KPHN2ZyB4PSIyNCIgeT0iMjQiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzEzLjEgMiAxNCAyLjkgMTQgNFY2QzE0IDcuMSAxMy4xIDggMTIgOEMxMC45IDggMTAgNy4xIDEwIDZWNEMxMCAyLjkgMTAuOSAyIDEyIDJaIi8+CjxwYXRoIGQ9Ik0xOCA4QzE5LjEgOCAyMCA4LjkgMjAgMTBWMTRDMjAgMTUuMSAxOS4xIDE2IDE4IDE2SDE2QzE0LjkgMTYgMTQgMTUuMSAxNCAxNFYxMEMxNCA4LjkgMTQuOSA4IDE2IDhIMThaIi8+CjxwYXRoIGQ9Ik04IDhDOS4xIDggMTAgOC45IDEwIDEwVjE0QzEwIDE1LjEgOS4xIDE2IDggMTZINkM0LjkgMTYgNCAxNS4xIDQgMTRWMTBDNCA4LjkgNC45IDggNiA4SDhaIi8+Cjwvc3ZnPgo8L3N2Zz4K';
  }, []);

  const getClubImage = useCallback((player) => {
    // For college teams, use a simple data URI
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiM2ZjZmZmYiLz4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjAiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yNCA0QzI2LjIgNCAyOCA1LjggMjggOFYxNkMyOCAxOC4yIDI2LjIgMjAgMjQgMjBDMjEuOCAyMCAyMCAxOC4yIDIwIDE2VjhDMjAgNS44IDIxLjggNCAyNCA0WiIgZmlsbD0iIzZmNmZmZiIvPgo8L3N2Zz4K';
  }, []);

  const isValidPlayer = useCallback((player) => {
    return player && 
           ((player.name && player.name.trim() !== '') ||
            (player.profile && 
             player.profile.playerProfile && 
             player.profile.playerProfile.playerName &&
             player.profile.playerProfile.playerName.trim() !== ''));
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
    // Support both NJCAA data structure and legacy structure
    const playerName = player.name || player.profile?.playerProfile?.playerName;
    const teamName = player.team || player.profile?.playerProfile?.club || player.club?.name;
    
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
          placeholder="Search by player or school..."
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
            value={currentFilters.position || 'All Positions'}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, position: e.target.value }))}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid rgba(79,140,255,0.2)',
              background: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <option value="All Positions">All Positions</option>
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
              cursor: 'pointer'
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
            value={currentFilters.academicLevel || 'All Academic Years'}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, academicLevel: e.target.value }))}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid rgba(79,140,255,0.2)',
              background: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <option value="All Academic Years">All Academic Years</option>
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
              <h2>{selectedPlayer.profile?.playerProfile?.playerName} - Highlights</h2>
              <button 
                className="close-modal-button"
                onClick={() => setShowVideoModal(false)}
              >
                ×
              </button>
            </div>
            <div className="video-modal-content">
              {loadingVideos[`${selectedPlayer.profile?.playerProfile?.playerName}-${selectedPlayer.profile?.playerProfile?.club}`] ? (
                <div className="loading-videos">Loading videos...</div>
              ) : youtubeVideos[`${selectedPlayer.profile?.playerProfile?.playerName}-${selectedPlayer.profile?.playerProfile?.club}`]?.length > 0 ? (
                <div className="videos-grid">
                  {youtubeVideos[`${selectedPlayer.profile?.playerProfile?.playerName}-${selectedPlayer.profile?.playerProfile?.club}`].map((video, index) => {
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
                          <img 
                            src={video.thumbnail || `https://img.youtube.com/vi/${(video.video_url || video.url)?.split('v=')[1]}/mqdefault.jpg`} 
                            alt={video.title} 
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/320x180?text=Video+Thumbnail';
                            }}
                          />
                        </div>
                        <div className="video-info">
                          <div className="video-title">{video.title}</div>
                          <div className="video-channel">{video.channel}</div>
                          <div className="video-date">{video.published_at || video.publishedAt}</div>
                          <div className="watch-video-button">
                            Watch Video
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