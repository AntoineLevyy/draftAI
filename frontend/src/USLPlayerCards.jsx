import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import './USLPlayerCards.css';

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
      
      // Fetch data from GitHub raw URLs
      let allPlayers = [];
      
      // Fetch USL League One players
      try {
        const uslResponse = await fetch('https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/usl_league_one_players_api.json');
        console.log('USL fetch status:', uslResponse.status);
        if (uslResponse.ok) {
          const uslData = await uslResponse.json();
          console.log('USL data:', uslData);
          const uslPlayers = uslData.players || [];
          // Add league info to each player
          uslPlayers.forEach(player => {
            player.league = 'USL League One';
          });
          allPlayers = allPlayers.concat(uslPlayers);
          console.log(`Loaded ${uslPlayers.length} USL players`);
        }
      } catch (error) {
        console.error('Error fetching USL data:', error);
      }
      
      // Fetch MLS Next Pro players
      try {
        const mlsResponse = await fetch('https://raw.githubusercontent.com/AntoineLevyy/draftAI/main/backend/pro/mls_next_pro_players_api.json');
        console.log('MLS fetch status:', mlsResponse.status);
        if (mlsResponse.ok) {
          const mlsData = await mlsResponse.json();
          console.log('MLS data:', mlsData);
          const mlsPlayers = mlsData.players || [];
          // Add league info to each player
          mlsPlayers.forEach(player => {
            player.league = 'MLS Next Pro';
          });
          allPlayers = allPlayers.concat(mlsPlayers);
          console.log(`Loaded ${mlsPlayers.length} MLS players`);
        }
      } catch (error) {
        console.error('Error fetching MLS data:', error);
      }
      
      console.log('Total players loaded:', allPlayers.length);
      console.log('First player structure:', allPlayers[0]);
      
      // Apply league filter if specified
      let filteredPlayers = allPlayers;
      
      if (filters?.league && filters.league !== 'All') {
        console.log('Filtering by league:', filters.league);
        // Handle both single league and array of leagues
        const leagueFilter = Array.isArray(filters.league) ? filters.league : [filters.league];
        filteredPlayers = allPlayers.filter(player => leagueFilter.includes(player.league));
        console.log('After league filter:', filteredPlayers.length, 'players');
      }
      
      setPlayers(filteredPlayers);
      setLoading(false);
      
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
    console.log('Filters:', filters);
    console.log('Filter league value:', filters?.league);
    console.log('Filter league type:', typeof filters?.league);
    console.log('Search term:', searchTerm);
    
    // Debug: Log first few players to see their structure
    if (players.length > 0) {
      console.log('First player structure:', players[0]);
      console.log('First player position field:', players[0].profile?.playerProfile?.position);
      console.log('First player playerMainPosition field:', players[0].profile?.playerProfile?.playerMainPosition);
      console.log('First player name:', players[0].profile?.playerProfile?.playerName);
    }
    
    let filteredCount = 0;
    
    return players
      .filter(player => {
        // Filter out players with missing or invalid names
        const playerName = player.profile?.playerProfile?.playerName;
        if (!playerName || playerName === 'Unknown Player' || playerName.trim() === '') {
          console.log('Filtering out player with invalid name:', playerName);
          return false;
        }
        
        filteredCount++;
        if (filteredCount <= 5) {
          console.log(`Player ${filteredCount}: ${playerName} passed name filter`);
        }
        
        // Filter by position (convert English position back to German for comparison)
        if (filters?.position && filters.position !== 'All Positions') {
          const germanPosition = reverseTranslatePosition(filters.position);
          const playerPosition = player.profile?.playerProfile?.position || player.profile?.playerProfile?.playerMainPosition || '';
          console.log(`Checking position for ${playerName}: player position "${playerPosition}" vs filter "${germanPosition}"`);
          if (playerPosition !== germanPosition) {
            console.log(`Position mismatch for ${playerName}: "${playerPosition}" !== "${germanPosition}"`);
            return false;
          }
        }
        
        // League filtering is handled in fetchPlayers, so we don't need to filter here
        
        // Filter by nationality (if not 'All')
        if (filters?.nationality && filters.nationality !== 'All') {
          const playerNationality = translateNationality(player.profile?.playerProfile?.birthplaceCountry);
          console.log(`Checking nationality for ${playerName}: player nationality "${playerNationality}" vs filter "${filters.nationality}"`);
          if (playerNationality !== filters.nationality) {
            console.log(`Nationality mismatch for ${playerName}: "${playerNationality}" !== "${filters.nationality}"`);
            return false;
          }
        }
        
        // Search term filtering
        const searchLower = searchTerm.toLowerCase();
        const clubName = player.profile?.playerProfile?.club || player.club?.name || 'Unknown';
        const matchesSearch = playerName.toLowerCase().includes(searchLower) || 
                             clubName.toLowerCase().includes(searchLower);
        
        if (!matchesSearch && searchTerm) {
          console.log(`Search term mismatch for ${playerName}: "${playerName}" or "${clubName}" doesn't include "${searchTerm}"`);
          return false;
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
  }, [players, searchTerm, sortBy, sortOrder, filters, reverseTranslatePosition, translateNationality]);

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
    // Since we don't have a backend API in production, we'll just return an empty array
    // and let the modal handle opening YouTube search directly
    return [];
  }, []);

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

  const handleVideoClick = async (playerName, clubName) => {
    try {
      setVideoLoading(true);
      
      // For now, create a simple YouTube search URL
      const searchQuery = `${playerName} ${clubName} highlights`;
      const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
      
      // Open YouTube search in a new tab
      window.open(youtubeSearchUrl, '_blank');
      
      setVideoLoading(false);
    } catch (error) {
      console.error('Error opening YouTube:', error);
      setVideoLoading(false);
    }
  };

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
              <div className="youtube-search-section">
                <p>Search for {selectedPlayer.profile?.playerProfile?.playerName} highlights on YouTube:</p>
                <button 
                  className="youtube-search-button"
                  onClick={() => {
                    const playerName = selectedPlayer.profile?.playerProfile?.playerName;
                    const clubName = selectedPlayer.profile?.playerProfile?.club;
                    const searchQuery = `${playerName} ${clubName} highlights`;
                    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
                    window.open(youtubeSearchUrl, '_blank');
                  }}
                >
                  🔍 Search YouTube for Highlights
                </button>
                <p className="search-tip">This will open YouTube in a new tab with search results for this player's highlights.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCards; 