import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const nationality = translateNationality(player.nationality || player.profile?.playerProfile?.birthplaceCountry || 'Unknown');
  const age = player.age || player.profile?.playerProfile?.age || 'Unknown';
  const height = player.height || player.profile?.playerProfile?.height || 'Unknown';
  const weight = player.weight || player.profile?.playerProfile?.weight || 'Unknown';
  
  // College-specific fields
  const academicLevel = player.league || player.profile?.playerProfile?.academicLevel || 'Unknown';
  const region = player.region || player.profile?.playerProfile?.region || 'Unknown';
  const graduationYear = player.year || player.profile?.playerProfile?.graduationYear || 'Unknown';
  const gpa = player.gpa || player.profile?.playerProfile?.gpa || 'Unknown';
  const satScore = player.satScore || player.profile?.playerProfile?.satScore || 'Unknown';
  const actScore = player.actScore || player.profile?.playerProfile?.actScore || 'Unknown';

  const goals = player.goals || player.performance?.goals || 0;
  const assists = player.assists || player.performance?.assists || 0;
  const matches = player.games || player.performance?.matches || 0;
  const minutesPlayed = player.minutesPlayed || player.performance?.minutesPlayed || 0;

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
    setExpandedStats(isExpanded ? null : player.id);
  };

  const handleStatsClick = (e) => {
    e.stopPropagation();
    setExpandedStats(expandedStats === player.id ? null : player.id);
  };

  return (
    <div className="player-card" onClick={handleCardClick}>
      <div className="player-card-header">
        <div className="player-image-container">
          <img 
            src={getPlayerImage(player)} 
            alt={playerName}
            className="player-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/150x150?text=Player';
            }}
          />
        </div>
        <div className="player-info">
          <h3 className="player-name">{playerName}</h3>
          <p className="player-position">{position}</p>
          <p className="player-club">{teamName}</p>
          <p className="player-nationality">{nationality}</p>
        </div>
        <div className="club-image-container">
          <img 
            src={getClubImage(player)} 
            alt={teamName}
            className="club-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/50x50?text=Team';
            }}
          />
        </div>
      </div>

      <div className="player-stats" onClick={handleStatsClick}>
        <div className="stat-item">
          <span className="stat-value">{goals}</span>
          <span className="stat-label">Goals</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{assists}</span>
          <span className="stat-label">Assists</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{matches}</span>
          <span className="stat-label">Matches</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{formatMinutes(minutesPlayed)}</span>
          <span className="stat-label">Minutes</span>
        </div>
      </div>

      {expandedStats === player.id && (
        <div className="expanded-stats">
          <div className="stats-grid">
            <div className="stat-row">
              <span className="stat-label">Age:</span>
              <span className="stat-value">{age}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Height:</span>
              <span className="stat-value">{height}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Weight:</span>
              <span className="stat-value">{weight}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Academic Level:</span>
              <span className="stat-value">{academicLevel}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Region:</span>
              <span className="stat-value">{region}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Graduation Year:</span>
              <span className="stat-value">{graduationYear}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">GPA:</span>
              <span className="stat-value">{gpa}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">SAT Score:</span>
              <span className="stat-value">{satScore}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">ACT Score:</span>
              <span className="stat-value">{actScore}</span>
            </div>
          </div>
          <button 
            className="view-footage-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleViewFootage(player);
            }}
          >
            View Highlights
          </button>
        </div>
      )}
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
  
  // Filter state
  const [currentAcademicLevel, setCurrentAcademicLevel] = useState(filters?.academicLevel || 'All Levels');
  const [currentPosition, setCurrentPosition] = useState(filters?.position || 'All Positions');
  const [currentRegion, setCurrentRegion] = useState(filters?.region || 'All Regions');
  const [currentGraduationYear, setCurrentGraduationYear] = useState(filters?.graduationYear || 'All Years');

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
  }, [filters?.academicLevel, filters?.position, filters?.region, filters?.graduationYear]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      let query = [];
      
      // Map academic level to league filter
      if (filters?.academicLevel && filters.academicLevel !== 'All Academic Levels') {
        if (filters.academicLevel === 'NJCAA D1') {
          query.push(`league=${encodeURIComponent('NJCAA D1 (Tier 2 USA)')}`);
        }
        // Add more academic level mappings as needed
      }
      
      if (filters?.position && filters.position !== 'All Positions') {
        query.push(`position=${encodeURIComponent(filters.position)}`);
      }
      
      // For now, fetch all college players and filter client-side for region/graduation year
      // since these aren't in the backend API yet
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
    console.log('Current filters - Academic Level:', currentAcademicLevel, 'Position:', currentPosition, 'Region:', currentRegion, 'Graduation Year:', currentGraduationYear);
    console.log('Search term:', searchTerm);
    
    const filteredPlayers = players
      .filter(player => {
        // Filter out players with missing or invalid names
        const playerName = player.name || player.profile?.playerProfile?.playerName;
        if (!playerName || playerName === 'Unknown Player' || playerName.trim() === '') {
          return false;
        }
        
        // Filter by academic level (for NJCAA, this maps to league)
        if (currentAcademicLevel && currentAcademicLevel !== 'All Academic Levels') {
          const playerLeague = player.league || '';
          if (currentAcademicLevel === 'NJCAA D1' && playerLeague !== 'NJCAA D1 (Tier 2 USA)') {
            return false;
          }
        }
        
        // Filter by position
        if (currentPosition && currentPosition !== 'All Positions') {
          const playerPosition = player.position || player.profile?.playerProfile?.position || '';
          if (playerPosition !== currentPosition) {
            return false;
          }
        }
        
        // Filter by region
        if (currentRegion && currentRegion !== 'All Regions') {
          const playerRegion = player.region || player.profile?.playerProfile?.region || '';
          if (playerRegion && !playerRegion.includes(currentRegion)) {
            return false;
          }
        }
        
        // Filter by graduation year
        if (currentGraduationYear && currentGraduationYear !== 'All Graduation Years') {
          const playerYear = player.year || player.profile?.playerProfile?.graduationYear || '';
          if (playerYear !== currentGraduationYear) {
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
  }, [players, searchTerm, sortBy, sortOrder, currentAcademicLevel, currentPosition, currentRegion, currentGraduationYear]);

  const formatMinutes = useCallback((minutes) => {
    if (!minutes) return '0';
    return minutes.toLocaleString();
  }, []);

  const getPlayerImage = useCallback((player) => {
    return player.profile?.playerProfile?.playerImage || 
           player.club?.image || 
           'https://via.placeholder.com/150x150?text=Player';
  }, []);

  const getClubImage = useCallback((player) => {
    return player.profile?.playerProfile?.clubImage || 
           player.club?.image || 
           'https://via.placeholder.com/50x50?text=Club';
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
    const playerName = player.profile?.playerProfile?.playerName;
    const clubName = player.profile?.playerProfile?.club;
    
    if (!playerName || !clubName) {
      alert('Player name or club information is missing');
      return;
    }
    
    setSelectedPlayer(player);
    setShowVideoModal(true);
    
    // Fetch videos if we don't have them already
    const cacheKey = `${playerName}-${clubName}`;
    if (!youtubeVideos[cacheKey]) {
      await fetchYoutubeVideos(playerName, clubName);
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
            Academic Level
          </label>
          <select
            value={currentAcademicLevel}
            onChange={(e) => setCurrentAcademicLevel(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid rgba(79,140,255,0.2)',
              background: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <option value="All Levels">All Levels</option>
            <option value="NCAA D1">NCAA D1</option>
            <option value="NCAA D2">NCAA D2</option>
            <option value="NCAA D3">NCAA D3</option>
            <option value="NJCAA D1">NJCAA D1</option>
            <option value="NJCAA D2">NJCAA D2</option>
            <option value="NJCAA D3">NJCAA D3</option>
            <option value="NAIA">NAIA</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
          <label style={{ fontWeight: 600, marginBottom: '8px', color: '#374151', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            Position
          </label>
          <select
            value={currentPosition}
            onChange={(e) => setCurrentPosition(e.target.value)}
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
            Region
          </label>
          <select
            value={currentRegion}
            onChange={(e) => setCurrentRegion(e.target.value)}
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
            <option value="West">West</option>
            <option value="Northwest">Northwest</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
          <label style={{ fontWeight: 600, marginBottom: '8px', color: '#374151', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            Graduation Year
          </label>
          <select
            value={currentGraduationYear}
            onChange={(e) => setCurrentGraduationYear(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid rgba(79,140,255,0.2)',
              background: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <option value="All Years">All Years</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="2029">2029</option>
            <option value="2030">2030</option>
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