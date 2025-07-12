import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import './USLPlayerCards.css';
import { apiBaseUrl } from './config';

const translateNationality = (nationality) => {
  const translations = {
    'Deutschland': 'Germany',
    'Vereinigte Staaten': 'United States',
    'Vereinigte Staaten von Amerika': 'United States',
    'USA': 'United States',
    'Kanada': 'Canada',
    'Mexiko': 'Mexico',
    'Brasilien': 'Brazil',
    'Argentinien': 'Argentina',
    'England': 'England',
    'Frankreich': 'France',
    'Spanien': 'Spain',
    'Italien': 'Italy',
    'Niederlande': 'Netherlands',
    'Belgien': 'Belgium',
    'Portugal': 'Portugal',
    'Schweiz': 'Switzerland',
    'Österreich': 'Austria',
    'Schweden': 'Sweden',
    'Norwegen': 'Norway',
    'Dänemark': 'Denmark',
    'Polen': 'Poland',
    'Tschechien': 'Czech Republic',
    'Ungarn': 'Hungary',
    'Slowakei': 'Slovakia',
    'Slowenien': 'Slovenia',
    'Kroatien': 'Croatia',
    'Serbien': 'Serbia',
    'Bosnien und Herzegowina': 'Bosnia and Herzegovina',
    'Montenegro': 'Montenegro',
    'Albanien': 'Albania',
    'Griechenland': 'Greece',
    'Türkei': 'Turkey',
    'Russland': 'Russia',
    'Ukraine': 'Ukraine',
    'Weißrussland': 'Belarus',
    'Lettland': 'Latvia',
    'Litauen': 'Lithuania',
    'Estland': 'Estonia',
    'Finnland': 'Finland',
    'Island': 'Iceland',
    'Irland': 'Ireland',
    'Schottland': 'Scotland',
    'Wales': 'Wales',
    'Nordirland': 'Northern Ireland',
    'Japan': 'Japan',
    'Südkorea': 'South Korea',
    'China': 'China',
    'Australien': 'Australia',
    'Neuseeland': 'New Zealand',
    'Südafrika': 'South Africa',
    'Nigeria': 'Nigeria',
    'Ghana': 'Ghana',
    'Senegal': 'Senegal',
    'Kamerun': 'Cameroon',
    'Elfenbeinküste': 'Ivory Coast',
    'Marokko': 'Morocco',
    'Tunesien': 'Tunisia',
    'Algerien': 'Algeria',
    'Ägypten': 'Egypt',
    'Kolumbien': 'Colombia',
    'Chile': 'Chile',
    'Peru': 'Peru',
    'Uruguay': 'Uruguay',
    'Paraguay': 'Paraguay',
    'Ecuador': 'Ecuador',
    'Venezuela': 'Venezuela',
    'Bolivien': 'Bolivia',
    'Honduras': 'Honduras',
    'Guatemala': 'Guatemala',
    'El Salvador': 'El Salvador',
    'Costa Rica': 'Costa Rica',
    'Panama': 'Panama',
    'Jamaika': 'Jamaica',
    'Trinidad und Tobago': 'Trinidad and Tobago',
    'Haiti': 'Haiti',
    'Dominikanische Republik': 'Dominican Republic',
    'Puerto Rico': 'Puerto Rico',
    'Kuba': 'Cuba',
    'Barbados': 'Barbados',
    'Grenada': 'Grenada',
    'St. Vincent und die Grenadinen': 'Saint Vincent and the Grenadines',
    'St. Kitts und Nevis': 'Saint Kitts and Nevis',
    'Antigua und Barbuda': 'Antigua and Barbuda',
    'St. Lucia': 'Saint Lucia',
    'Dominica': 'Dominica',
    'Bahamas': 'Bahamas',
    'Belize': 'Belize',
    'Guyana': 'Guyana',
    'Suriname': 'Suriname',
    'Französisch-Guayana': 'French Guiana',
    'Falklandinseln': 'Falkland Islands',
    'Grönland': 'Greenland',
    'Isle of Man': 'Isle of Man',
    'Färöer': 'Faroe Islands',
    'Gibraltar': 'Gibraltar',
    'Andorra': 'Andorra',
    'Liechtenstein': 'Liechtenstein',
    'Monaco': 'Monaco',
    'San Marino': 'San Marino',
    'Vatikanstadt': 'Vatican City',
    'Malta': 'Malta',
    'Zypern': 'Cyprus',
    'Georgien': 'Georgia',
    'Armenien': 'Armenia',
    'Aserbaidschan': 'Azerbaijan',
    'Kasachstan': 'Kazakhstan',
    'Usbekistan': 'Uzbekistan',
    'Kirgisistan': 'Kyrgyzstan',
    'Tadschikistan': 'Tajikistan',
    'Turkmenistan': 'Turkmenistan',
    'Mongolei': 'Mongolia',
    'Vietnam': 'Vietnam',
    'Thailand': 'Thailand',
    'Malaysia': 'Malaysia',
    'Singapur': 'Singapore',
    'Indonesien': 'Indonesia',
    'Philippinen': 'Philippines',
    'Taiwan': 'Taiwan',
    'Hongkong': 'Hong Kong',
    'Macau': 'Macau',
    'Indien': 'India',
    'Pakistan': 'Pakistan',
    'Bangladesch': 'Bangladesh',
    'Sri Lanka': 'Sri Lanka',
    'Nepal': 'Nepal',
    'Bhutan': 'Bhutan',
    'Malediven': 'Maldives',
    'Myanmar': 'Myanmar',
    'Laos': 'Laos',
    'Kambodscha': 'Cambodia',
    'Brunei': 'Brunei',
    'Osttimor': 'East Timor',
    'Papua-Neuguinea': 'Papua New Guinea',
    'Fidschi': 'Fiji',
    'Vanuatu': 'Vanuatu',
    'Salomonen': 'Solomon Islands',
    'Neukaledonien': 'New Caledonia',
    'Tahiti': 'Tahiti',
    'Samoa': 'Samoa',
    'Tonga': 'Tonga',
    'Cookinseln': 'Cook Islands',
    'Amerikanisch-Samoa': 'American Samoa',
    'Guam': 'Guam',
    'Nördliche Marianen': 'Northern Mariana Islands',
    'Palau': 'Palau',
    'Mikronesien': 'Micronesia',
    'Marshallinseln': 'Marshall Islands',
    'Kiribati': 'Kiribati',
    'Tuvalu': 'Tuvalu',
    'Nauru': 'Nauru',
    'Komoren': 'Comoros',
    'Seychellen': 'Seychelles',
    'Mauritius': 'Mauritius',
    'Madagaskar': 'Madagascar',
    'Mayotte': 'Mayotte',
    'Réunion': 'Réunion',
    'Kap Verde': 'Cape Verde',
    'São Tomé und Príncipe': 'São Tomé and Príncipe',
    'Äquatorialguinea': 'Equatorial Guinea',
    'Gabun': 'Gabon',
    'Kongo': 'Congo',
    'Demokratische Republik Kongo': 'Democratic Republic of the Congo',
    'Zentralafrikanische Republik': 'Central African Republic',
    'Tschad': 'Chad',
    'Sudan': 'Sudan',
    'Südsudan': 'South Sudan',
    'Äthiopien': 'Ethiopia',
    'Eritrea': 'Eritrea',
    'Dschibuti': 'Djibouti',
    'Somalia': 'Somalia',
    'Kenia': 'Kenya',
    'Tansania': 'Tanzania',
    'Uganda': 'Uganda',
    'Ruanda': 'Rwanda',
    'Burundi': 'Burundi',
    'Malawi': 'Malawi',
    'Sambia': 'Zambia',
    'Simbabwe': 'Zimbabwe',
    'Botswana': 'Botswana',
    'Namibia': 'Namibia',
    'Angola': 'Angola',
    'Mosambik': 'Mozambique',
    'Lesotho': 'Lesotho',
    'Eswatini': 'Eswatini'
  };
  return translations[nationality] || nationality;
};

const PlayerCard = memo(({ player, getPlayerImage, getClubImage, translatePosition, formatMinutes, isValidPlayer, expandedStats, setExpandedStats, handleViewFootage, selectedLeague }) => {
  // Additional validation to ensure we have valid data
  const playerName = player.profile?.playerProfile?.playerName;
  if (!playerName || playerName === 'Unknown Player' || playerName.trim() === '') {
    return null; // Don't render cards for players without valid names
  }
  
  return (
    <div className="player-card">
      <div className="card-header">
        <div className="player-image-container">
          <img 
            src={getPlayerImage(player)} 
            alt={player.profile?.playerProfile?.playerName || 'Player'}
            className="player-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/150x150?text=Player';
            }}
          />
        </div>
        <div className="club-badge">
          <img 
            src={getClubImage(player)} 
            alt={player.profile?.playerProfile?.club || player.club?.name || 'Club'}
            className="club-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/50x50?text=Club';
            }}
          />
        </div>
      </div>

      <div className="card-body">
        <h3 className="player-name">
          {player.profile?.playerProfile?.playerName || 'Unknown Player'}
        </h3>
        
        <div className="club-name">
          {player.profile?.playerProfile?.club || player.club?.name || 'Unknown Club'}
        </div>
        
        <div className="league-badge">
          {player.league || 'Unknown League'}
        </div>

        {player.profile && (
          <div className="player-info">
            <div className="info-item">
              <span className="info-label">Age:</span>
              <span className="info-value">
                {player.profile?.playerProfile?.age || 'Unknown'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Birth Date:</span>
              <span className="info-value">
                {player.profile?.playerProfile?.dateOfBirth || 'Unknown'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Birthplace:</span>
              <span className="info-value">
                {player.profile?.playerProfile?.birthplace || 'Unknown'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Position:</span>
              <span className="info-value">
                {translatePosition(player.profile?.playerProfile?.playerMainPosition) || 'Unknown'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Height:</span>
              <span className="info-value">
                {player.profile?.playerProfile?.height ? `${player.profile.playerProfile.height}m` : 'Unknown'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Foot:</span>
              <span className="info-value">
                {player.profile?.playerProfile?.foot === 'links' ? 'Left' : 
                 player.profile?.playerProfile?.foot === 'rechts' ? 'Right' : 
                 player.profile?.playerProfile?.foot || 'Unknown'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Shirt Number:</span>
              <span className="info-value">
                {player.profile?.playerProfile?.playerShirtNumber || 'Unknown'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Nationality:</span>
              <span className="info-value">
                {player.profile?.playerProfile?.birthplaceCountryImage && (
                  <img 
                    src={player.profile.playerProfile.birthplaceCountryImage} 
                    alt={translateNationality(player.profile.playerProfile.birthplaceCountry)}
                    style={{ width: '20px', height: '15px', marginRight: '8px', verticalAlign: 'middle' }}
                  />
                )}
                {translateNationality(player.profile?.playerProfile?.birthplaceCountry) || 'Unknown'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">International:</span>
              <span className="info-value">
                {player.profile?.playerProfile?.internationalTeam ? 
                  `${player.profile.playerProfile.internationalTeam} (${player.profile.playerProfile.internationalGames} caps)` : 
                  'No international caps'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Contract Until:</span>
              <span className="info-value">
                {player.profile?.playerProfile?.contractExpiryDate || 'Unknown'}
              </span>
            </div>
            {player.profile?.playerProfile?.agent && (
              <div className="info-item">
                <span className="info-label">Agent:</span>
                <span className="info-value">
                  {player.profile.playerProfile.agent}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="performance-stats">
          <div className="stat-row">
            <div className="stat-item-card">
              <span className="stat-value">{player.performance?.goals || 0}</span>
              <span className="stat-label-card">Goals</span>
            </div>
            <div className="stat-item-card">
              <span className="stat-value">{player.performance?.assists || 0}</span>
              <span className="stat-label-card">Assists</span>
            </div>
            <div className="stat-item-card">
              <span className="stat-value">{player.performance?.matches || 0}</span>
              <span className="stat-label-card">Matches</span>
            </div>
          </div>

          <div className="stat-row">
            <div className="stat-item-card">
              <span className="stat-value">{formatMinutes(player.performance?.minutesPlayed || 0)}</span>
              <span className="stat-label-card">Minutes</span>
            </div>
            <div className="stat-item-card">
              <span className="stat-value">{player.performance?.yellowCards || 0}</span>
              <span className="stat-label-card">Yellow Cards</span>
            </div>
            <div className="stat-item-card">
              <span className="stat-value">{player.performance?.redCards || 0}</span>
              <span className="stat-label-card">Red Cards</span>
            </div>
          </div>
          <div className="stat-row">
            <div className="stat-item-card">
              <span className="stat-value">{player.performance?.starting || 0}</span>
              <span className="stat-label-card">Starts</span>
            </div>
            <div className="stat-item-card">
              <span className="stat-value">{player.performance?.substitutedOn || 0}</span>
              <span className="stat-label-card">Subbed On</span>
            </div>
            <div className="stat-item-card">
              <span className="stat-value">{player.performance?.substitutedOff || 0}</span>
              <span className="stat-label-card">Subbed Off</span>
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
                <span className="detail-label">Goals per Match:</span>
                <span className="detail-value">
                  {player.performance?.goalsPerMatch ? 
                    player.performance.goalsPerMatch.toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="stat-detail">
                <span className="detail-label">Minutes per Goal:</span>
                <span className="detail-value">
                  {player.performance?.minutesPerGoal || 'N/A'}
                </span>
              </div>
              <div className="stat-detail">
                <span className="detail-label">Starting:</span>
                <span className="detail-value">
                  {player.performance?.starting || 0}
                </span>
              </div>
              <div className="stat-detail">
                <span className="detail-label">Substituted:</span>
                <span className="detail-value">
                  {player.performance?.substitutedOff || 0}
                </span>
              </div>
              <div className="stat-detail">
                <span className="detail-label">Penalties:</span>
                <span className="detail-value">
                  {player.performance?.penalty || 0}
                </span>
              </div>
              <div className="stat-detail">
                <span className="detail-label">Own Goals:</span>
                <span className="detail-value">
                  {player.performance?.ownGoals || 0}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="footage-section">
          <button 
            className="view-footage-button"
            onClick={() => handleViewFootage(player)}
          >
            🎥 View Footage
          </button>
        </div>
      </div>
    </div>
  );
});

const PlayerCards = ({ filters, onBack }) => {
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
  const [currentLeague, setCurrentLeague] = useState(() => {
    if (Array.isArray(filters?.league)) {
      return filters.league[0] || 'All';
    }
    return filters?.league || 'All';
  });
  const [currentPosition, setCurrentPosition] = useState(filters?.position || 'All');
  const [currentNationality, setCurrentNationality] = useState(filters?.nationality || 'All');

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
  }, [filters?.league]);

  const fetchPlayers = async () => {
    try {
      console.log('Fetching players with filters:', filters);
      
      // Fetch all players from the API
      const response = await fetch(`${apiBaseUrl}/api/players`);
      console.log('API fetch status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API data received:', data);
        const allPlayers = data.players || [];
        console.log('Total players loaded from API:', allPlayers.length);
        console.log('First player structure:', allPlayers[0]);
        
        // Log league distribution
        const leagueCounts = {};
        allPlayers.forEach(player => {
          const league = player.league || 'Unknown';
          leagueCounts[league] = (leagueCounts[league] || 0) + 1;
        });
        console.log('League distribution:', leagueCounts);
        
        setPlayers(allPlayers);
        setLoading(false);
      } else {
        console.error('API response not ok:', response.status, response.statusText);
        setError('Failed to load player data from API');
        setLoading(false);
      }
      
    } catch (error) {
      console.error('Error fetching players:', error);
      setError('Failed to load player data');
      setLoading(false);
    }
  };

  const translatePosition = useCallback((position) => {
    const translations = {
      'Torwart': 'Goalkeeper',
      'Innenverteidiger': 'Center Back',
      'Linker Verteidiger': 'Left Back',
      'Rechter Verteidiger': 'Right Back',
      'Defensives Mittelfeld': 'Defensive Midfielder',
      'Zentrales Mittelfeld': 'Central Midfielder',
      'Offensives Mittelfeld': 'Attacking Midfielder',
      'Linkes Mittelfeld': 'Left Midfielder',
      'Rechtes Mittelfeld': 'Right Midfielder',
      'Linksaußen': 'Left Winger',
      'Rechtsaußen': 'Right Winger',
      'Mittelstürmer': 'Center Forward',
      'Stürmer': 'Forward'
    };
    return translations[position] || position;
  }, []);



  const reverseTranslatePosition = useCallback((englishPosition) => {
    const reverseTranslations = {
      'Goalkeeper': 'Torwart',
      'Center Back': 'Innenverteidiger',
      'Left Back': 'Linker Verteidiger',
      'Right Back': 'Rechter Verteidiger',
      'Defensive Midfielder': 'Defensives Mittelfeld',
      'Central Midfielder': 'Zentrales Mittelfeld',
      'Attacking Midfielder': 'Offensives Mittelfeld',
      'Left Midfielder': 'Linkes Mittelfeld',
      'Right Midfielder': 'Rechtes Mittelfeld',
      'Left Winger': 'Linksaußen',
      'Right Winger': 'Rechtsaußen',
      'Center Forward': 'Mittelstürmer',
      'Forward': 'Stürmer'
    };
    return reverseTranslations[englishPosition] || englishPosition;
  }, []);

  const filteredAndSortedPlayers = useMemo(() => {
    console.log('Filtering players. Total players:', players.length);
    console.log('Current filters - League:', currentLeague, 'Position:', currentPosition, 'Nationality:', currentNationality);
    console.log('Search term:', searchTerm);
    
    const filteredPlayers = players.filter(player => {
      // Filter out players with missing or invalid names
      const playerName = player.profile?.playerProfile?.playerName;
      if (!playerName || playerName === 'Unknown Player' || playerName.trim() === '') {
        return false;
      }
      
      // Simple league filter
      if (currentLeague && currentLeague !== 'All') {
        if (player.league !== currentLeague) {
          return false;
        }
      }
      
      // Simple position filter - use English positions directly
      if (currentPosition && currentPosition !== 'All') {
        const playerPosition = translatePosition(player.profile?.playerProfile?.position || player.profile?.playerProfile?.playerMainPosition || '');
        if (playerPosition !== currentPosition) {
          return false;
        }
      }
      
      // Simple nationality filter
      if (currentNationality && currentNationality !== 'All') {
        const playerNationality = translateNationality(player.profile?.playerProfile?.birthplaceCountry);
        if (playerNationality !== currentNationality) {
          return false;
        }
      }
      
      // Simple search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const playerNameLower = playerName.toLowerCase();
        const clubName = player.profile?.playerProfile?.club || player.club?.name || '';
        const clubNameLower = clubName.toLowerCase();
        
        if (!playerNameLower.includes(searchLower) && !clubNameLower.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    })
      .sort((a, b) => {
        let aValue, bValue;
        switch (sortBy) {
          case 'goals':
            aValue = a.performance?.goals || 0;
            bValue = b.performance?.goals || 0;
            break;
          case 'assists':
            aValue = a.performance?.assists || 0;
            bValue = b.performance?.assists || 0;
            break;
          case 'matches':
            aValue = a.performance?.matches || 0;
            bValue = b.performance?.matches || 0;
            break;
          case 'minutes':
            aValue = a.performance?.minutesPlayed || 0;
            bValue = b.performance?.minutesPlayed || 0;
            break;
          case 'name':
            aValue = a.profile?.playerProfile?.playerName || 'Unknown';
            bValue = b.profile?.playerProfile?.playerName || 'Unknown';
            break;
          default:
            aValue = a.performance?.goals || 0;
            bValue = b.performance?.goals || 0;
        }
        if (sortOrder === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    
    return filteredPlayers;
  }, [players, searchTerm, sortBy, sortOrder, currentLeague, currentPosition, currentNationality, translateNationality]);

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
           player.profile && 
           player.profile.playerProfile && 
           player.profile.playerProfile.playerName &&
           player.profile.playerProfile.playerName.trim() !== '';
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
        if (data.videos.length > 0) {
          console.log('First video URL:', data.videos[0].video_url);
          console.log('First video title:', data.videos[0].title);
        }
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
        <p>Loading {filters?.league || 'USL League One'} players...</p>
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
            League
          </label>
          <select
            value={currentLeague}
            onChange={(e) => setCurrentLeague(e.target.value)}
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
            <option value="USL Championship">USL Championship (Tier 2 USA)</option>
            <option value="USL League One">USL League One (Tier 3 USA)</option>
            <option value="MLS Next Pro">MLS Next Pro (Tier 3 USA)</option>
            <option value="Canadian Premier League">Canadian Premier League (Tier 1 Canada)</option>
            <option value="Liga MX Apertura">Liga MX Apertura (Tier 1 Mexico)</option>
            <option value="Primera Divisió">Primera Divisió (Tier 1 Andorra)</option>
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
            <option value="All">All</option>
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
            Nationality
          </label>
          <select
            value={currentNationality}
            onChange={(e) => setCurrentNationality(e.target.value)}
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
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="Mexico">Mexico</option>
            <option value="Brazil">Brazil</option>
            <option value="Argentina">Argentina</option>
            <option value="England">England</option>
            <option value="France">France</option>
            <option value="Germany">Germany</option>
            <option value="Spain">Spain</option>
            <option value="Italy">Italy</option>
            <option value="Netherlands">Netherlands</option>
            <option value="Japan">Japan</option>
            <option value="Nigeria">Nigeria</option>
            <option value="Ghana">Ghana</option>
            <option value="Senegal">Senegal</option>
            <option value="Cameroon">Cameroon</option>
            <option value="Colombia">Colombia</option>
            <option value="Chile">Chile</option>
            <option value="Venezuela">Venezuela</option>
            <option value="Honduras">Honduras</option>
            <option value="Guatemala">Guatemala</option>
            <option value="Panama">Panama</option>
            <option value="Jamaica">Jamaica</option>
            <option value="Trinidad and Tobago">Trinidad and Tobago</option>
            <option value="Haiti">Haiti</option>
            <option value="Puerto Rico">Puerto Rico</option>
            <option value="Barbados">Barbados</option>
            <option value="Scotland">Scotland</option>
            <option value="Ireland">Ireland</option>
            <option value="Norway">Norway</option>
            <option value="Austria">Austria</option>
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
        We found {filteredAndSortedPlayers.length} players for you
      </div>
      <div className="player-cards-grid">
        {filteredAndSortedPlayers.map(player => (
          <PlayerCard
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
            selectedLeague={filters?.league || 'USL League One'}
          />
        ))}
      </div>
      {filteredAndSortedPlayers.length === 0 && (
        <div className="no-results">
          <p>No players found matching your search criteria.</p>
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
                    console.log('Rendering video:', video);
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
                          console.log('Video clicked! URL:', videoUrl);
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

export default PlayerCards; 