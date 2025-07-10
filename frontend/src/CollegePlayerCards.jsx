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

const CollegePlayerCard = React.memo(({ player, getPlayerImage, getClubImage, translatePosition, formatMinutes, isValidPlayer, expandedStats, setExpandedStats, handleViewFootage, selectedLeague }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isValidPlayer(player)) {
    return null;
  }

  // Support both NJCAA data structure and legacy structure
  const playerName = player.name || player.profile?.playerProfile?.playerName || 'Unknown Player';
  const position = translatePosition(player.position || player.profile?.playerProfile?.position || player.profile?.playerProfile?.playerMainPosition || 'Unknown');
  const teamName = player.team || player.profile?.playerProfile?.club || player.club?.name || 'Unknown Team';
  const nationality = translateNationality(player.nationality || player.profile?.playerProfile?.birthplaceCountry || 'USA');
  
  // Clean up height and weight data - handle encoding issues
  const cleanHeight = (player.height || player.profile?.playerProfile?.height || '')
    .replace(/Ã.*/g, '') // Remove encoding artifacts
    .trim();
  const height = cleanHeight || 'N/A';
  
  const cleanWeight = (player.weight || player.profile?.playerProfile?.weight || '')
    .replace(/Ã.*/g, '') // Remove encoding artifacts
    .trim();
  const weight = cleanWeight || 'N/A';
  
  // College-specific fields - remove tier from league name
  const academicLevel = (player.league || player.profile?.playerProfile?.academicLevel || 'Unknown')
    .replace(' (Tier 2 USA)', '')
    .replace(' (Tier 1 USA)', '')
    .replace(' (Tier 3 USA)', '');
  
  // Fix region mapping - use actual region data, not age
  const region = player.region || player.profile?.playerProfile?.region || 'N/A';
  const graduationYear = player.year || player.profile?.playerProfile?.graduationYear || 'N/A';
  const gpa = player.gpa || player.profile?.playerProfile?.gpa || 'N/A';
  const satScore = player.satScore || player.profile?.playerProfile?.satScore || 'N/A';
  const actScore = player.actScore || player.profile?.playerProfile?.actScore || 'N/A';

  const goals = player.goals || player.performance?.goals || 0;
  const assists = player.assists || player.performance?.assists || 0;
  const matches = player.games || player.performance?.matches || 0;
  const minutesPlayed = player.minutesPlayed || player.performance?.minutesPlayed || 0;
  const gamesStarted = player.games_started || player.performance?.starting || 0;
  const points = player.points || 0;
  const shots = player.shots || 0;
  const shotPct = player.shot_pct || 0;
  const penaltyKicks = player.penalty_kicks || 0;
  const gameWinningGoals = player.game_winning_goals || 0;

  return (
    <div className="player-card">
      <div className="card-header">
        <div className="player-image-container">
          <img 
            src={getPlayerImage(player)} 
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
        
        <div className="league-badge">{academicLevel}</div>

        <div className="player-info">
          <div className="info-item">
            <span className="info-label">Position:</span>
            <span className="info-value">{position}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Age:</span>
            <span className="info-value">{age}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Height:</span>
            <span className="info-value">{height && height !== 'Unknown' ? height : 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Weight:</span>
            <span className="info-value">{weight && weight !== 'Unknown' ? weight : 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Year:</span>
            <span className="info-value">{graduationYear}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Region:</span>
            <span className="info-value">{region}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Nationality:</span>
            <span className="info-value">{nationality}</span>
          </div>
          {gpa !== 'Unknown' && (
            <div className="info-item">
              <span className="info-label">GPA:</span>
              <span className="info-value">{gpa}</span>
            </div>
          )}
          {satScore !== 'Unknown' && (
            <div className="info-item">
              <span className="info-label">SAT Score:</span>
              <span className="info-value">{satScore}</span>
            </div>
          )}
          {actScore !== 'Unknown' && (
            <div className="info-item">
              <span className="info-label">ACT Score:</span>
              <span className="info-value">{actScore}</span>
            </div>
          )}
        </div>

        <div className="performance-stats">
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

        <div className="more-stats-section">
          <button 
            className="more-stats-button"
            onClick={() => setExpandedStats(prev => prev === player.id ? null : player.id)}
          >
            {expandedStats === player.id ? 'Hide Stats' : 'More Stats'}
          </button>
          
          {expandedStats === player.id && (
            <div className="detailed-stats">
              <div className="stat-detail">
                <span className="detail-label">Shots:</span>
                <span className="detail-value">{shots}</span>
              </div>
              <div className="stat-detail">
                <span className="detail-label">Shot Percentage:</span>
                <span className="detail-value">{shotPct.toFixed(1)}%</span>
              </div>
              <div className="stat-detail">
                <span className="detail-label">Penalty Kicks:</span>
                <span className="detail-value">{penaltyKicks}</span>
              </div>
              <div className="stat-detail">
                <span className="detail-label">Game Winning Goals:</span>
                <span className="detail-value">{gameWinningGoals}</span>
              </div>
              <div className="stat-detail">
                <span className="detail-label">Goals per Game:</span>
                <span className="detail-value">
                  {matches > 0 ? (goals / matches).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="stat-detail">
                <span className="detail-label">Assists per Game:</span>
                <span className="detail-value">
                  {matches > 0 ? (assists / matches).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          )}
        </div>

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
  const [expandedStats, setExpandedStats] = useState(null);
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
      let query = [];
      
      // Map league filter to backend league name
      if (filters?.league && filters.league !== 'All') {
        if (filters.league === 'NJCAA D1') {
          query.push(`league=${encodeURIComponent('NJCAA D1 (Tier 2 USA)')}`);
        }
        // Add more league mappings as needed
      } else {
        // If no specific league is selected, only fetch college players
        // This prevents pro players from showing up in the college section
        query.push(`league=${encodeURIComponent('NJCAA D1 (Tier 2 USA)')}`);
      }
      
      if (filters?.position && filters.position !== 'All Positions') {
        query.push(`position=${encodeURIComponent(filters.position)}`);
      }
      
      // Fetch college players with the appropriate filters
      const url = `${apiBaseUrl}/api/players${query.length ? '?' + query.join('&') : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch players');
      const data = await response.json();
      
      // Apply client-side filters for fields not supported by backend yet
      let filteredPlayers = data.players || [];
      
      if (filters?.region && filters.region !== 'All Regions') {
        filteredPlayers = filteredPlayers.filter(player => 
          player.region && player.region.includes(filters.region)
        );
      }
      
      if (filters?.graduationYear && filters.graduationYear !== 'All Graduation Years') {
        // This would need to be implemented based on your data structure
        // For now, we'll skip this filter
      }
      
      setPlayers(filteredPlayers);
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
      'Defender': 'Defender',
      'Midfielder': 'Midfielder',
      'Forward': 'Forward',
      'Center Back': 'Center Back',
      'Left Back': 'Left Back',
      'Right Back': 'Right Back',
      'Defensive Midfielder': 'Defensive Midfielder',
      'Central Midfielder': 'Central Midfielder',
      'Attacking Midfielder': 'Attacking Midfielder',
      'Left Winger': 'Left Winger',
      'Right Winger': 'Right Winger',
      'Center Forward': 'Center Forward'
    };
    return translations[position] || position;
  }, []);

  const filteredAndSortedPlayers = useMemo(() => {
    console.log('Filtering college players. Total players:', players.length);
    console.log('Current filters:', currentFilters);
    console.log('Search term:', searchTerm);
    
    const filteredPlayers = players
      .filter(player => {
        // Filter out players with missing or invalid names
        const playerName = player.name || player.profile?.playerProfile?.playerName;
        if (!playerName || playerName === 'Unknown Player' || playerName.trim() === '') {
          return false;
        }
        
        // Filter by league
        if (currentFilters.league && currentFilters.league !== 'All') {
          const playerLeague = player.league || '';
          if (currentFilters.league === 'NJCAA D1' && playerLeague !== 'NJCAA D1 (Tier 2 USA)') {
            return false;
          }
        }
        
        // Filter by position
        if (currentFilters.position && currentFilters.position !== 'All Positions') {
          const playerPosition = player.position || player.profile?.playerProfile?.position || '';
          if (playerPosition !== currentFilters.position) {
            return false;
          }
        }
        
        // Filter by academic level (college year)
        if (currentFilters.academicLevel && currentFilters.academicLevel !== 'All Academic Levels') {
          const playerYear = player.year || player.profile?.playerProfile?.graduationYear || '';
          if (playerYear !== currentFilters.academicLevel) {
            return false;
          }
        }
        
        // Filter by region
        if (currentFilters.region && currentFilters.region !== 'All Regions') {
          const playerRegion = player.region || player.profile?.playerProfile?.region || '';
          if (playerRegion && !playerRegion.includes(currentFilters.region)) {
            return false;
          }
        }
        
        // Search term filtering
        const searchLower = searchTerm.toLowerCase();
        const teamName = player.team || player.profile?.playerProfile?.club || player.club?.name || 'Unknown';
        const matchesSearch = playerName.toLowerCase().includes(searchLower) || 
                             teamName.toLowerCase().includes(searchLower);
        
        if (!matchesSearch && searchTerm) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
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
  }, [players, searchTerm, sortBy, sortOrder, currentFilters]);

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
            <option value="Center Back">Center Back</option>
            <option value="Left Back">Left Back</option>
            <option value="Right Back">Right Back</option>
            <option value="Defensive Midfielder">Defensive Midfielder</option>
            <option value="Central Midfielder">Central Midfielder</option>
            <option value="Left Midfielder">Left Midfielder</option>
            <option value="Right Midfielder">Right Midfielder</option>
            <option value="Attacking Midfielder">Attacking Midfielder</option>
            <option value="Left Winger">Left Winger</option>
            <option value="Right Winger">Right Winger</option>
            <option value="Center Forward">Center Forward</option>
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
          </select>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
          <label style={{ fontWeight: 600, marginBottom: '8px', color: '#374151', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            Academic Level
          </label>
          <select
            value={currentFilters.academicLevel || 'All Academic Levels'}
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
            <option value="All Academic Levels">All Academic Levels</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
            <option value="Graduate Student">Graduate Student</option>
            <option value="Transfer Student">Transfer Student</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
          <label style={{ fontWeight: 600, marginBottom: '8px', color: '#374151', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            Region
          </label>
          <select
            value={currentFilters.region || 'All Regions'}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, region: e.target.value }))}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid rgba(79,140,255,0.2)',
              background: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <option value="All Regions">All Regions</option>
            <option value="Northeast">Northeast</option>
            <option value="Southeast">Southeast</option>
            <option value="Midwest">Midwest</option>
            <option value="Southwest">Southwest</option>
            <option value="West Coast">West Coast</option>
            <option value="International">International</option>
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
            expandedStats={expandedStats}
            setExpandedStats={setExpandedStats}
            handleViewFootage={handleViewFootage}
            selectedLeague={filters?.academicLevel || 'All Levels'}
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