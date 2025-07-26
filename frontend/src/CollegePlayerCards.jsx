import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './USLPlayerCards.css';
import { apiBaseUrl } from './config';
import { savePlayer, unsavePlayer, getSavedPlayersBatch } from './services/saveService';
import { saveClaimedProfile, isProfileAlreadyClaimed } from './services/claimService';
import { useAuth } from './AuthContext';
import ClaimProfileForm from './ClaimProfileForm';
import PlayerSignupModal from './PlayerSignupModal';

/**
 * @typedef {Object} Player
 * @property {boolean} claimed
 * @property {string} name
 * @property {string} [position]
 * @property {string} [awards]
 * @property {string} [eligibility]
 * @property {string} [email]
 * @property {string} [goals]
 * @property {string} [team]
 * @property {string} [league]
 * @property {string} [year]
 * @property {string} [photo_url]
 * // ...all other possible fields
 */

function normalizePlayer(rawPlayer, idx) {
  const isClaimed = rawPlayer.claimed || !!rawPlayer['Email Address'] || !!rawPlayer['Why Player is Transferring'];
  if (isClaimed) {
    // Generate a unique ID for claimed players
    const playerId =
      rawPlayer['Email Address'] ||
      (rawPlayer['Name'] && rawPlayer['Current School']
        ? `${rawPlayer['Name']}_${rawPlayer['Current School']}`.replace(/\s+/g, '_')
        : `claimed_${idx}`);
    return {
      claimed: true,
      playerId, // <-- add this line
      name: rawPlayer['Name'] || '',
      position: rawPlayer['Position'] || '',
      awards: rawPlayer['Individual Awards'] || '',
      eligibility: rawPlayer['Years of Eligibility Left'] || '',
      email: rawPlayer['Email Address'] || '',
      team: rawPlayer['Current School'] || '',
      league: rawPlayer['Division Transferring From'] || '',
      year: rawPlayer['Year of Birth'] || '',
      photo_url: rawPlayer['photo_url'] || '',
      raw: rawPlayer // keep all original fields for full display
    };
  } else {
    return {
      claimed: false,
      playerId: rawPlayer.playerId || rawPlayer.id || '',
      name: rawPlayer.name || '',
      position: rawPlayer.position || '',
      awards: '',
      eligibility: '',
      email: '',
      team: rawPlayer.team || '',
      league: rawPlayer.league || '',
      year: rawPlayer.year || '',
      photo_url: rawPlayer.photo_url || '',
      goals: rawPlayer.goals || '',
      raw: rawPlayer
    };
  }
}

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

const CollegePlayerCard = React.memo(({ player, getPlayerImage, getClubImage, translatePosition, formatMinutes, isValidPlayer, handleViewFootage, selectedLeague, loadingVideos, savedPlayerIds, onSaveToggle, onShowSignupModal, isClaimMode = false, onClaimProfile }) => {
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

  const handleClaimClick = () => {
    // This will be handled by the parent component
    if (onClaimProfile) {
      onClaimProfile(player);
    }
  };

  // Additional validation to ensure we have valid data
  if (!isValidPlayer(player)) {
    return null; // Don't render cards for players without valid names
  }

  // Handle different player types (transfer vs highschool)
  const isHighSchoolPlayer = player.type === 'highschool';
  
  if (isHighSchoolPlayer) {
    // High school player fields
    const playerName = player.name || 'Unknown Player';
    const clubName = player.club || 'Unknown Club';
    const state = player.state || 'N/A';
    const position = translatePosition(player.position || 'Unknown');
    const gradYear = player.grad_year || 'N/A';
    const commitment = player.commitment || 'Uncommitted';
    const photoUrl = player.picture_url || null;
    const coachInfo = player.coach_info || 'No coach information available';
    
    // Add missing variables that are used in the stats section
    const goals = player.goals || 0;
    const assists = player.assists || 0;
    const points = goals + assists;
    const matches = player.matches || 0;
    const gamesStarted = player.games_started || 0;
    const minutesPlayed = player.minutes_played || 0;
    
    // Add other missing variables used in the template
    const teamName = clubName; // Use clubName as teamName for high school players
    const league = player.league || 'High School';
    const year = gradYear; // Use gradYear as year for high school players
    const height = player.height || 'N/A';
    const weight = player.weight || 'N/A';
    const hometown = player.hometown || 'N/A';

    // Only use photoUrl if it is a real photo (not N/A or empty) and has a valid URL format
    const isRealPhoto = photoUrl && 
      photoUrl !== 'N/A' && 
      photoUrl !== '' && 
      (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('data:'));

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
            <span>{clubName}</span>
          </div>
          {isClaimMode ? (
            <button
              className="claim-button"
              onClick={handleClaimClick}
              style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(90deg, #c0c0c0 0%, #a0a0a0 100%)',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                zIndex: 10,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              Claim Profile
            </button>
          ) : (
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
          )}
        </div>
        
        <div className="card-body">
          <h3 className="player-name">{playerName}</h3>
          <div className="player-details">
            <div className="detail-row">
              <span className="detail-label">Position:</span>
              <span className="detail-value">{position}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">State:</span>
              <span className="detail-value">{state}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Graduation Year:</span>
              <span className="detail-value">{gradYear}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Commitment:</span>
              <span className="detail-value">{commitment}</span>
            </div>
          </div>
          
          {/* Contact Details Button */}
          <div className="contact-details-section">
            <button 
              className="view-contact-button"
              onClick={() => {
                alert(`Coach Information:\n\n${coachInfo}`);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
                marginTop: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)';
              }}
            >
              View Contact Details
            </button>
          </div>
        </div>
        

      </div>
    );
  } else if (player.claimed) {
    // --- Claimed Player Card ---
    const [showFootage, setShowFootage] = useState(false);
    const raw = player.raw || {};
    const playerName = raw['Name'] || player.name || 'Unknown Player';
    const email = raw['Email Address'] || player.email || '';
    const currentSchool = raw['Current School'] || '';
    const division = raw['Division Transferring From'] || player.league || '';
    const yearOfBirth = raw['Year of Birth'] || '';
    const eligibility = raw['Years of Eligibility Left'] || '';
    const gpa = raw['GPA'] || '';
    const finances = raw['Finances'] || '';
    const awards = raw['Individual Awards'] || '';
    const accolades = raw['College Accolades'] || '';
    const highlights = raw['Highlights'] || '';
    const fullGame = raw['Full 90 min Game Link'] || '';
    const height = raw['Height'] || '';
    const weight = raw['Weight (lbs)'] || '';
    const creditHours = raw['Credit Hours Taken when you will transfer'] || '';
    const available = raw['Available'] || '';
    const nationality = raw['Nationality'] || '';
    const position = raw['Position'] || player.position || '';
    const photoUrl = player.photo_url || '';

    // Grouped sections
    return (
      <div className="player-card claimed-player-card">
        <div className="card-header">
          <div className="player-image-container">
            {photoUrl ? (
              <img src={photoUrl} alt={playerName} className="player-image" />
            ) : (
              <div className="player-image" style={{ backgroundColor: '#eee', border: '3px solid white', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }} />
            )}
          </div>
          {/* Remove club-badge for claimed cards */}
          {isClaimMode ? (
            <button
              className="claim-button"
              onClick={handleClaimClick}
              style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(90deg, #c0c0c0 0%, #a0a0a0 100%)',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                zIndex: 10,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              Claim Profile
            </button>
          ) : (
            <button
              className={`save-button ${isSaved ? 'saved' : ''} ${isSaving ? 'saving' : ''}`}
              onClick={handleSaveToggle}
              disabled={isSaving}
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: isSaved ? '#10b981' : 'rgba(255,255,255,0.9)',
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
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                opacity: isSaved ? 0.8 : 1
              }}
            >
              {isSaving ? (isSaved ? 'Unsaving...' : 'Saving...') : isSaved ? 'Saved ✓' : 'Save'}
            </button>
          )}
        </div>
        <div className="card-body">
          <h3 className="player-name">{playerName}</h3>
          {currentSchool && <div className="club-name">{currentSchool}</div>}
          {division && (
            <div className="league-badge">{division}</div>
          )}
          <div className="claimed-section-group">
            <div className="claimed-section">
              <h4 className="claimed-section-title">Personal</h4>
              <div><span className="info-label">Nationality:</span><span className="info-value">{nationality}</span></div>
              <div><span className="info-label">Year of Birth:</span><span className="info-value">{yearOfBirth}</span></div>
              <div><span className="info-label">Height:</span><span className="info-value">{height}</span></div>
              <div><span className="info-label">Weight:</span><span className="info-value">{weight}</span></div>
              <div><span className="info-label">Position:</span><span className="info-value">{position}</span></div>
            </div>
            <div className="claimed-section">
              <h4 className="claimed-section-title">Academic</h4>
              <div><span className="info-label">GPA:</span><span className="info-value">{gpa}</span></div>
              <div><span className="info-label">Credit Hours:</span><span className="info-value">{creditHours}</span></div>
              <div><span className="info-label">Finances:</span><span className="info-value">{finances}</span></div>
              <div><span className="info-label">Available:</span><span className="info-value">{available}</span></div>
            </div>
            <div className="claimed-section">
              <h4 className="claimed-section-title">Athletic</h4>
              <div><span className="info-label">Current School:</span><span className="info-value">{currentSchool}</span></div>
              <div><span className="info-label">Division Transferring From:</span><span className="info-value">{division}</span></div>
              <div><span className="info-label">Years of Eligibility Left:</span><span className="info-value">{eligibility}</span></div>
              <div><span className="info-label">Individual Awards:</span><span className="info-value">{awards}</span></div>
              <div><span className="info-label">College Accolades:</span><span className="info-value">{accolades}</span></div>
            </div>
            <div className="claimed-section">
              <h4 className="claimed-section-title">Contact</h4>
              <div><span className="info-label">Email:</span><span className="info-value">{email}</span></div>
            </div>
            <div className="claimed-section claimed-footage-section">
              <button
                className="claimed-view-footage-button"
                onClick={() => setShowFootage((v) => !v)}
              >
                {showFootage ? 'Hide Highlights' : 'View Highlights'}
              </button>
              {showFootage && (
                <div style={{ marginTop: 8 }}>
                  {highlights && <div><span className="info-label">Highlights:</span> <a href={highlights} target="_blank" rel="noopener noreferrer" className="info-value">Watch</a></div>}
                  {fullGame && <div><span className="info-label">Full Game:</span> <a href={fullGame} target="_blank" rel="noopener noreferrer" className="info-value">Watch</a></div>}
                  {!highlights && !fullGame && <div className="info-value">No video links available.</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // Transfer player fields (existing logic)
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
          {isClaimMode ? (
            <button
              className="claim-button"
              onClick={handleClaimClick}
              style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(90deg, #c0c0c0 0%, #a0a0a0 100%)',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                zIndex: 10,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              Claim Profile
            </button>
          ) : (
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
          )}
        </div>
        
        <div className="card-body">
          <h3 className="player-name">{playerName}</h3>
          
          <div className="club-name">{teamName}</div>
          
          <div className="league-badge">{league}</div>

          <div className="player-info">
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

          <div className="stats-section">
            <h4 className="season-stats-title">Season Stats</h4>
            <div className="stats-grid">
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
  }
});

// Define filter arrays
const positions = ['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
const academicLevels = ['All', 'Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate Student'];
const leagues = ['All', 'NJCAA D1', 'NJCAA D2', 'NJCAA D3'];

const CollegePlayerCards = ({ filters, onBack, onShowSignupModal, isClaimMode = false }) => {
  const { user } = useAuth();
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedPlayerForClaim, setSelectedPlayerForClaim] = useState(null);
  const [showPlayerSignup, setShowPlayerSignup] = useState(false);
  const [claimFormData, setClaimFormData] = useState(null);
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
  
  // Add state for list mode modal
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState(null);
  
  // Type state - can be changed by user
  const [type, setType] = useState(filters?.type || 'transfer');
  
  // Add state and graduation year filters for high school
  const [stateFilter, setStateFilter] = useState('All');
  const [gradYearFilter, setGradYearFilter] = useState('All');

  // 2. Add claimed/unclaimed filter and claimed-specific filters state
  const [claimedFilter, setClaimedFilter] = useState(filters?.claimedFilter || 'all'); // 'all' | 'claimed' | 'unclaimed'
  const [claimedPosition, setClaimedPosition] = useState('All');
  const [claimedEligibility, setClaimedEligibility] = useState('All');
  const [claimedAwards, setClaimedAwards] = useState('All');
  const [claimedLeague, setClaimedLeague] = useState('All');
  const [minGpa, setMinGpa] = useState('All');

  // Compute unique states and grad years from players
  const highSchoolStates = useMemo(() => {
    const states = new Set();
    players.forEach(p => {
      if (p.type === 'highschool' && p.state && p.state.trim() !== '') {
        states.add(p.state);
      }
    });
    return ['All', ...Array.from(states).sort()];
  }, [players]);

  const highSchoolGradYears = useMemo(() => {
    const years = new Set();
    players.forEach(p => {
      if (p.type === 'highschool' && p.grad_year && p.grad_year.trim() !== '') {
        years.add(p.grad_year);
      }
    });
    return ['All', ...Array.from(years).sort()];
  }, [players]);

  // 4. Compute unique claimed positions, eligibility, awards for filters
  const claimedPositions = useMemo(() => {
    const setP = new Set();
    players.forEach(p => { if (p.claimed && p.position) setP.add(p.position); });
    return ['All', ...Array.from(setP).sort()];
  }, [players]);
  const claimedEligibilities = useMemo(() => {
    const setE = new Set();
    players.forEach(p => { if (p.claimed && p.eligibility) setE.add(p.eligibility); });
    return ['All', ...Array.from(setE).sort()];
  }, [players]);
  const claimedAwardsList = useMemo(() => {
    const setA = new Set();
    players.forEach(p => { if (p.claimed && p.awards) setA.add(p.awards); });
    return ['All', ...Array.from(setA).sort()];
  }, [players]);
  const claimedLeagues = useMemo(() => {
    const setL = new Set();
    players.forEach(p => { if (p.claimed && p.league) setL.add(p.league); });
    return ['All', ...Array.from(setL).sort()];
  }, [players]);

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
    console.log('useEffect triggered - fetching players with type:', type);
    fetchPlayers();
  }, [type]); // Refetch when type changes

  const fetchPlayers = async () => {
    console.log('=== FETCH PLAYERS STARTED ===');
    console.log('Fetching players with type:', type);
    try {
      setLoading(true);
      setError(null);
      
      // Build URL with type filter
      const url = `${apiBaseUrl}/api/players?type=${type}`;
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
      console.log('Players from API:', data.players?.length || 0);
      console.log('Type filter applied:', data.filters_applied?.type);
      
      // Print the first 5 players from the API response for debugging
      console.log('First 5 players from API:', (data.players || data || []).slice(0, 5));
      // Normalize all players
      const normalized = (data.players || data || []).map(normalizePlayer);
      console.log('Claimed players after normalization:', normalized.filter(p => p.claimed));
      setPlayers(normalized);
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
    
    let filtered = players;
    if (claimedFilter === 'claimed') filtered = filtered.filter(p => p.claimed);
    if (claimedFilter === 'unclaimed') filtered = filtered.filter(p => !p.claimed);
    if (claimedFilter === 'claimed') {
      if (claimedPosition !== 'All') filtered = filtered.filter(p => p.position === claimedPosition);
      if (claimedEligibility !== 'All') filtered = filtered.filter(p => p.eligibility === claimedEligibility);
      if (claimedAwards !== 'All') filtered = filtered.filter(p => p.awards === claimedAwards);
      if (claimedLeague !== 'All') filtered = filtered.filter(p => p.league === claimedLeague);
      if (minGpa !== 'All') filtered = filtered.filter(p => {
        const gpa = parseFloat(p.gpa || (p.raw && p.raw['GPA']) || 0);
        return !isNaN(gpa) && gpa >= parseFloat(minGpa);
      });
    }

    let filteredPlayers = filtered.filter(player => {
      // Filter out players with missing or invalid names
      const playerName = player.name;
      if (!playerName || playerName === 'Unknown Player' || playerName.trim() === '') {
        return false;
      }
      // Type-specific filters
      if (type === 'highschool') {
        if (stateFilter !== 'All' && player.state !== stateFilter) return false;
        if (gradYearFilter !== 'All' && player.grad_year !== gradYearFilter) return false;
        if (currentFilters.position && currentFilters.position !== 'All') {
          const playerPosition = getMainPositionCategory(player.position || '');
          return playerPosition === currentFilters.position;
        }
      } else if (type === 'transfer') {
        // Transfer: use existing filters
        if (currentFilters.position && currentFilters.position !== 'All') {
          const playerPosition = getMainPositionCategory(player.position || '');
          if (playerPosition !== currentFilters.position) return false;
        }
        if (currentFilters.academicLevel && currentFilters.academicLevel !== 'All') {
          const playerYear = expandYear(player.year || '');
          if (playerYear !== currentFilters.academicLevel) return false;
        }
        if (currentFilters.league && currentFilters.league !== 'All') {
          const playerLeague = player.league || 'NJCAA D1';
          if (playerLeague !== currentFilters.league) return false;
        }
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
  }, [players, searchTerm, sortBy, sortOrder, currentFilters, expandYear, getMainPositionCategory, type, stateFilter, gradYearFilter, claimedFilter, claimedPosition, claimedEligibility, claimedAwards, claimedLeague, minGpa]);

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

  const handleClaimProfile = (player) => {
    setSelectedPlayerForClaim(player);
    setShowClaimForm(true);
  };

  const handleClaimFormComplete = async (formData) => {
    console.log('Claim form completed:', formData);
    console.log('Player being claimed:', selectedPlayerForClaim);
    
    // Store the form data and show the signup modal
    setClaimFormData(formData);
    setShowClaimForm(false);
    setShowPlayerSignup(true);
  };

  const handlePlayerSignupSuccess = async (user, formData) => {
    try {
      console.log('Player account created:', user);
      console.log('Claim form data:', formData);
      console.log('Original player:', selectedPlayerForClaim);

      // Check if profile is already claimed
      const isAlreadyClaimed = await isProfileAlreadyClaimed(selectedPlayerForClaim.playerId || selectedPlayerForClaim.id);
      
      if (isAlreadyClaimed) {
        alert('This profile has already been claimed by another user.');
        return;
      }

      // Save the claimed profile to database
      const savedProfile = await saveClaimedProfile(formData, selectedPlayerForClaim, user.id);
      console.log('Claimed profile saved:', savedProfile);
      // Show success message
      alert('Profile claimed successfully! You can now manage your profile from your account.');
      // Close the signup modal
      setShowPlayerSignup(false);
      setClaimFormData(null);
      setSelectedPlayerForClaim(null);
      // Force a complete page refresh to update the user session and data
      window.location.reload();
    } catch (error) {
      console.error('Error completing claim process:', error);
      alert('Error completing claim process. Please try again.');
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
      {/* In the main filter row, move Claimed Status to the far left and make the filter row responsive */}
      {/* Add a container for the filters with flex-wrap and overflow for responsiveness */}
      {!isClaimMode && (
        <div
          className="filtersRow"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            marginTop: 24,
            marginBottom: 16,
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
            width: '100%',
            background: '#18181b',
            borderRadius: 12,
            padding: '16px 24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            overflowX: 'auto',
            minHeight: 0,
          }}
        >
        {/* Claimed/Unclaimed Filter - always first */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
          <label style={{ fontWeight: 600, marginBottom: '8px', color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            Claimed Status
          </label>
          <select
            value={claimedFilter}
            onChange={e => setClaimedFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="claimed">Claimed</option>
            <option value="unclaimed">Unclaimed</option>
          </select>
        </div>
        {/* Type Filter - restore after Claimed Status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
          <label style={{ fontWeight: 600, marginBottom: '8px', color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            Type
          </label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="filter-select"
          >
            <option value="transfer">Transfer</option>
            <option value="highschool">High School</option>
            <option value="international" disabled>International (coming soon)</option>
          </select>
        </div>
        {claimedFilter === 'claimed' ? (
          <>
            {/* Only show claimed filters */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
              <label style={{ fontWeight: 600, marginBottom: '8px', color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                Position
              </label>
              <select
                value={claimedPosition}
                onChange={e => setClaimedPosition(e.target.value)}
                className="filter-select"
              >
                {claimedPositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
              <label style={{ fontWeight: 600, marginBottom: '8px', color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                Eligibility
              </label>
              <select
                value={claimedEligibility}
                onChange={e => setClaimedEligibility(e.target.value)}
                className="filter-select"
              >
                {claimedEligibilities.map(el => <option key={el} value={el}>{el}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
              <label style={{ fontWeight: 600, marginBottom: '8px', color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                Awards
              </label>
              <select
                value={claimedAwards}
                onChange={e => setClaimedAwards(e.target.value)}
                className="filter-select"
              >
                {claimedAwardsList.map(aw => <option key={aw} value={aw}>{aw}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
              <label style={{ fontWeight: 600, marginBottom: '8px', color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                Minimum GPA
              </label>
              <select
                value={minGpa}
                onChange={e => setMinGpa(e.target.value)}
                className="filter-select"
              >
                {['All', '2.0', '2.5', '3.0', '3.5', '4.0'].map(gpa => <option key={gpa} value={gpa}>{gpa}</option>)}
              </select>
            </div>
          </>
        ) : (claimedFilter === 'unclaimed' || claimedFilter === 'all') && (
          <>
            {/* Only show unclaimed filters here (existing logic) */}
            {type === 'transfer' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
                  <label style={{ fontWeight: 600, marginBottom: '8px', color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    League
                  </label>
                  <select
                    value={currentFilters.league}
                    onChange={e => setLocalFilters(f => ({ ...f, league: e.target.value }))}
                    className="filter-select"
                  >
                    {leagues.map(lg => <option key={lg} value={lg}>{lg}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
                  <label style={{ fontWeight: 600, marginBottom: '8px', color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Position
                  </label>
                  <select
                    value={currentFilters.position}
                    onChange={e => setLocalFilters(f => ({ ...f, position: e.target.value }))}
                    className="filter-select"
                  >
                    {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
                  <label style={{ fontWeight: 600, marginBottom: '8px', color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Academic Year
                  </label>
                  <select
                    value={currentFilters.academicLevel}
                    onChange={e => setLocalFilters(f => ({ ...f, academicLevel: e.target.value }))}
                    className="filter-select"
                  >
                    {academicLevels.map(ay => <option key={ay} value={ay}>{ay}</option>)}
                  </select>
                </div>
              </>
            )}
            {/* Add other unclaimed filters as needed */}
          </>
        )}
        {/* Common filters for both claimed and unclaimed */}
        {claimedFilter === 'claimed' && (
          <>
            {/* League filter for claimed players (shows "Division Transferring From" data as "League") */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
              <label style={{ fontWeight: 600, marginBottom: '8px', color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                League
              </label>
              <select
                value={claimedLeague}
                onChange={e => setClaimedLeague(e.target.value)}
                className="filter-select"
              >
                {claimedLeagues.map(lg => <option key={lg} value={lg}>{lg}</option>)}
              </select>
            </div>
          </>
        )}
        {(claimedFilter === 'unclaimed' || claimedFilter === 'all') && type === 'transfer' && (
          <>
            {/* League filter for unclaimed transfer players */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
              <label style={{ fontWeight: 600, marginBottom: '8px', color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                League
              </label>
              <select
                value={currentFilters.league}
                onChange={e => setLocalFilters(f => ({ ...f, league: e.target.value }))}
                className="filter-select"
              >
                {leagues.map(lg => <option key={lg} value={lg}>{lg}</option>)}
              </select>
            </div>
          </>
        )}
        {type === 'highschool' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
              <label style={{ fontWeight: 600, marginBottom: '8px', color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                State
              </label>
              <select
                value={stateFilter}
                onChange={e => setStateFilter(e.target.value)}
                className="filter-select"
              >
                {highSchoolStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
              <label style={{ fontWeight: 600, marginBottom: '8px', color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                Graduation Year
              </label>
              <select
                value={gradYearFilter}
                onChange={e => setGradYearFilter(e.target.value)}
                className="filter-select"
              >
                {highSchoolGradYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
              <label style={{ fontWeight: 600, marginBottom: '8px', color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                Position
              </label>
              <select
                value={currentFilters.position}
                onChange={e => setLocalFilters(prev => ({ ...prev, position: e.target.value }))}
                className="filter-select"
              >
                <option value="All">All</option>
                <option value="Goalkeeper">Goalkeeper</option>
                <option value="Defender">Defender</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Forward">Forward</option>
              </select>
            </div>
          </>
        )}
        {type === 'international' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 150 }}>
            <label style={{ fontWeight: 600, marginBottom: '8px', color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              No Results
            </label>
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
              International player data is not yet available.
            </p>
          </div>
        )}
      </div>
      )}
      {/* Search/Sort/Toggle Controls */}
      <div className="controls-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder={isClaimMode ? "Search for your profile..." : "Search by player or club..."}
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        {!isClaimMode && (
          <div>
            <button
              className={viewMode === 'grid' ? 'toggle-text-btn active' : 'toggle-text-btn'}
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </button>
            <button
              className={viewMode === 'list' ? 'toggle-text-btn active' : 'toggle-text-btn'}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
            <button
              className={viewMode === 'tinder' ? 'toggle-text-btn active' : 'toggle-text-btn'}
              onClick={() => setViewMode('tinder')}
            >
              Tinder Mode
            </button>
          </div>
        )}
      </div>

      <div className="headline-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
        <div className="gradient-headline college">
          {isClaimMode ? `Found ${filteredAndSortedPlayers.length} unclaimed profiles` : `We found ${filteredAndSortedPlayers.length} college players for you`}
        </div>
        {!isClaimMode && (
          <div className="sort-controls">
            <label>Sort by:</label>
            <select value={sortBy} onChange={handleSortChange} className="sort-select">
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
        )}
      </div>
      
      {/* 5. Add filter UI for claimed/unclaimed and claimed-specific filters */}
      {/* Removed the separate claimed filter dropdown from above the cards list */}

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
                <div className="tinder-card-inner ultra-wide compact" style={{ maxWidth: 420, margin: '0 auto' }}>
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
                    isClaimMode={isClaimMode}
                    onClaimProfile={handleClaimProfile}
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
                      {filteredAndSortedPlayers.slice(0, 9).map((player, visibleIdx) => (
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
                isClaimMode={isClaimMode}
                onClaimProfile={handleClaimProfile}
              />
              {player.claimed && (
                <span style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: 'linear-gradient(90deg, #FFD700 0%, #FFC300 100%)',
                  color: '#333',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 13,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  letterSpacing: 1,
                  zIndex: 20,
                  border: '2px solid #fff',
                  textShadow: '0 1px 2px #fff',
                }}>Claimed</span>
              )}
            </div>
          ))}
                      {!user && filteredAndSortedPlayers.length > 9 && (
            <div className="unlock-more-message" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              background: 'rgba(24, 24, 27, 0.8)',
              borderRadius: '16px',
              border: '2px dashed rgba(239, 68, 68, 0.3)',
              margin: '40px auto',
              maxWidth: '400px',
              textAlign: 'center',
              width: '100%',
              gridColumn: '1 / -1'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.7 }}>🔒</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>
                Sign in to unlock more players
              </div>
              <div style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '20px' }}>
                {filteredAndSortedPlayers.length - 9} more players available
              </div>
              <div style={{ fontSize: '2rem', marginBottom: '16px', opacity: 0.5, animation: 'bounce 2s infinite' }}>⬇️</div>
              <button className="unlock-more-btn" onClick={onShowSignupModal} style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)'
              }}>
                Sign In Now
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
                {claimedFilter === 'claimed' ? (
                  <>
                    <th>Nationality</th>
                    <th>Club</th>
                    <th>League</th>
                    <th>Position</th>
                    <th>Eligibility</th>
                    <th>GPA</th>
                  </>
                ) : (
                  <>
                    <th>Club</th>
                    <th>League</th>
                    <th>Position</th>
                    <th>Goals</th>
                    <th>Assists</th>
                    <th>Matches</th>
                  </>
                )}
                <th>Save</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPlayers.slice(0, 9).map((player, visibleIdx) => {
                const playerName = player.name || 'Unknown Player';
                const playerId = player.playerId;
                const isSaved = user && savedPlayerIds.map(id => String(id)).includes(String(playerId));
                const isSaving = !!savingMap[playerId];
                
                // Data for claimed players
                const nationality = player.claimed ? (player.raw && player.raw['Nationality']) || 'N/A' : '';
                const club = player.team || 'Unknown Club';
                const league = player.league || 'Unknown League';
                const position = player.position || 'Unknown';
                const eligibility = player.claimed ? (player.raw && player.raw['Years of Eligibility Left']) || 'N/A' : '';
                const gpa = player.claimed ? (player.raw && player.raw['GPA']) || 'N/A' : '';
                
                // Data for unclaimed players
                const goals = !player.claimed ? (player.goals || 0) : '';
                const assists = !player.claimed ? (player.assists || 0) : '';
                const matches = !player.claimed ? (player.games || 0) : '';
                
                return (
                  <tr key={String(player.playerId) + '-' + playerName} onClick={() => { setSelectedPlayerForModal(player); setShowPlayerModal(true); }} style={{ cursor: 'pointer', background: 'transparent', border: 'none' }}>
                    <td><img src={getPlayerImage(player)} alt={playerName} className="player-list-img" /></td>
                    <td style={{ color: 'white' }}>{playerName}</td>
                    {claimedFilter === 'claimed' ? (
                      <>
                        <td style={{ color: 'white' }}>{nationality}</td>
                        <td style={{ color: 'white' }}>{club}</td>
                        <td style={{ color: 'white' }}>{league}</td>
                        <td style={{ color: 'white' }}>{position}</td>
                        <td style={{ color: 'white' }}>{eligibility}</td>
                        <td style={{ color: 'white' }}>{gpa}</td>
                      </>
                    ) : (
                      <>
                        <td style={{ color: 'white' }}>{club}</td>
                        <td style={{ color: 'white' }}>{league}</td>
                        <td style={{ color: 'white' }}>{position}</td>
                        <td style={{ color: 'white' }}>{goals}</td>
                        <td style={{ color: 'white' }}>{assists}</td>
                        <td style={{ color: 'white' }}>{matches}</td>
                      </>
                    )}
                    <td>
                      <button
                        className={isSaved ? 'save-btn saved' : 'save-btn'}
                        onClick={async (e) => {
                          e.stopPropagation();
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
              {!user && filteredAndSortedPlayers.length > 9 && (
                <tr>
                  <td colSpan={claimedFilter === 'claimed' ? 8 : 9} style={{ 
                    textAlign: 'center', 
                    background: 'rgba(24, 24, 27, 0.8)', 
                    borderRadius: 12, 
                    padding: '30px 20px',
                    border: '2px dashed rgba(239, 68, 68, 0.3)'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '2rem', opacity: 0.7 }}>🔒</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>
                        Sign in to unlock more players
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                        {filteredAndSortedPlayers.length - 9} more players available
                      </div>
                      <div style={{ fontSize: '1.5rem', opacity: 0.5, animation: 'bounce 2s infinite' }}>⬇️</div>
                      <button className="unlock-more-btn" onClick={onShowSignupModal} style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)'
                      }}>
                        Sign In Now
                      </button>
                    </div>
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
      {showPlayerModal && selectedPlayerForModal && (
        <div className="player-modal-overlay" onClick={() => setShowPlayerModal(false)}>
          <div className="player-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal-button" onClick={() => setShowPlayerModal(false)}>×</button>
            <CollegePlayerCard
              player={selectedPlayerForModal}
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
              isClaimMode={isClaimMode}
              onClaimProfile={handleClaimProfile}
            />
          </div>
        </div>
      )}
      
      {showClaimForm && selectedPlayerForClaim && (
        <ClaimProfileForm
          player={selectedPlayerForClaim}
          onClose={() => {
            setShowClaimForm(false);
            setSelectedPlayerForClaim(null);
          }}
          onComplete={handleClaimFormComplete}
        />
      )}
      
      {showPlayerSignup && claimFormData && (
        <PlayerSignupModal
          isOpen={showPlayerSignup}
          onClose={() => {
            setShowPlayerSignup(false);
            setClaimFormData(null);
            setSelectedPlayerForClaim(null);
          }}
          onSuccess={handlePlayerSignupSuccess}
          claimData={claimFormData}
        />
      )}
    </div>
  );
};

export default CollegePlayerCards; 