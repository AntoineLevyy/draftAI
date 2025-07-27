import React, { useState } from 'react';
import './USLPlayerCards.css';

const PlayerDetailModalCard = ({ player }) => {
  // Defensive: Warn if playerId is missing
  if (!player) return null;

  // Handle different player types (transfer vs highschool)
  const isHighSchoolPlayer = player.type === 'highschool';

  if (isHighSchoolPlayer) {
    // High school player fields
    const playerName = player.name || 'Unknown Player';
    const clubName = player.club || 'Unknown Club';
    const state = player.state || 'N/A';
    const position = player.position || 'Unknown';
    const gradYear = player.grad_year || 'N/A';
    const commitment = player.commitment || 'Uncommitted';
    const photoUrl = player.picture_url || null;
    const coachInfo = player.coach_info || 'No coach information available';
    const goals = player.goals || 0;
    const assists = player.assists || 0;
    const matches = player.matches || 0;
    const height = player.height || 'N/A';
    const weight = player.weight || 'N/A';
    const hometown = player.hometown || 'N/A';
    const isRealPhoto = photoUrl && photoUrl !== 'N/A' && photoUrl !== '' && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('data:'));
    return (
      <div className="player-card">
        <div className="card-header">
          <div className="player-image-container">
            {isRealPhoto ? (
              <img src={photoUrl} alt={playerName} className="player-image" />
            ) : (
              <div className="player-image" style={{ backgroundColor: 'transparent', border: '3px solid white', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }} />
            )}
          </div>
          <div className="club-badge">
            <span>{clubName}</span>
          </div>
        </div>
        <div className="card-body">
          <h3 className="player-name">{playerName}</h3>
          <div className="player-details">
            <div className="detail-row"><span className="detail-label">Position:</span><span className="detail-value">{position}</span></div>
            <div className="detail-row"><span className="detail-label">State:</span><span className="detail-value">{state}</span></div>
            <div className="detail-row"><span className="detail-label">Graduation Year:</span><span className="detail-value">{gradYear}</span></div>
            <div className="detail-row"><span className="detail-label">Commitment:</span><span className="detail-value">{commitment}</span></div>
            <div className="detail-row"><span className="detail-label">Goals:</span><span className="detail-value">{goals}</span></div>
            <div className="detail-row"><span className="detail-label">Assists:</span><span className="detail-value">{assists}</span></div>
            <div className="detail-row"><span className="detail-label">Matches:</span><span className="detail-value">{matches}</span></div>
            <div className="detail-row"><span className="detail-label">Height:</span><span className="detail-value">{height}</span></div>
            <div className="detail-row"><span className="detail-label">Weight:</span><span className="detail-value">{weight}</span></div>
            <div className="detail-row"><span className="detail-label">Hometown:</span><span className="detail-value">{hometown}</span></div>
          </div>
        </div>
      </div>
    );
  } else if (player.claimed) {
    // Claimed player card
    const raw = player.raw || {};
    const playerName = raw['Name'] || player.name || 'Unknown Player';
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
    const email = raw['Email Address'] || player.email || '';
    const xUsername = raw['X Username'] || '';
    const instagramUsername = raw['Instagram Username'] || '';
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
        </div>
        <div className="card-body">
          <h3 className="player-name">{playerName}</h3>
          {currentSchool && <div className="club-name">{currentSchool}</div>}
          {division && <div className="league-badge">{division}</div>}
          <div className="claimed-section-group">
            {/* Top row: Personal and Academic side by side */}
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
              <div><span className="info-label">Years of Eligibility Left:</span><span className="info-value">{eligibility}</span></div>
              <div><span className="info-label">Finances:</span><span className="info-value">{finances}</span></div>
              <div><span className="info-label">Available:</span><span className="info-value">{available}</span></div>
            </div>
            {/* Bottom row: Athletic and Contact side by side */}
            <div className="claimed-section">
              <h4 className="claimed-section-title">Athletic</h4>
              <div><span className="info-label">Current School:</span><span className="info-value">{currentSchool}</span></div>
              <div><span className="info-label">Division Transferring From:</span><span className="info-value">{division}</span></div>
              <div><span className="info-label">Individual Awards:</span><span className="info-value">{awards}</span></div>
              <div><span className="info-label">College Accolades:</span><span className="info-value">{accolades}</span></div>
              <div><span className="info-label">Why Player is Transferring:</span><span className="info-value">{raw['Why Player is Transferring'] || ''}</span></div>
            </div>
            <div className="claimed-section">
              <h4 className="claimed-section-title">Contact</h4>
              <div><span className="info-label">Email:</span><span className="info-value">{email}</span></div>
              {xUsername && xUsername !== 'none' && (
                <div><span className="info-label">X:</span><span className="info-value">@{xUsername}</span></div>
              )}
              {instagramUsername && instagramUsername !== 'none' && (
                <div><span className="info-label">Instagram:</span><span className="info-value">@{instagramUsername}</span></div>
              )}
            </div>
            {/* Footage section spans full width */}
            <div className="claimed-section claimed-footage-section" style={{ flex: '1 1 100%' }}>
              {highlights && <div><a href={highlights} target="_blank" rel="noopener noreferrer" className="claimed-view-footage-button">Highlights</a></div>}
              {fullGame && <div><a href={fullGame} target="_blank" rel="noopener noreferrer" className="claimed-view-footage-button">Full Game</a></div>}
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // Unclaimed player card
    const playerName = player.name || 'Unknown Player';
    const club = player.team || 'Unknown Club';
    const league = player.league || 'Unknown League';
    const position = player.position || 'Unknown';
    const goals = player.goals || 0;
    const assists = player.assists || 0;
    const matches = player.matches || 0;
    const photoUrl = player.image || '/default-player.png';
    return (
      <div className="player-card">
        <div className="card-header">
          <div className="player-image-container">
            <img src={photoUrl} alt={playerName} className="player-image" />
          </div>
          <div className="club-badge">
            <span>{club}</span>
          </div>
        </div>
        <div className="card-body">
          <h3 className="player-name">{playerName}</h3>
          <div className="player-details">
            <div className="detail-row"><span className="detail-label">Position:</span><span className="detail-value">{position}</span></div>
            <div className="detail-row"><span className="detail-label">Club:</span><span className="detail-value">{club}</span></div>
            <div className="detail-row"><span className="detail-label">League:</span><span className="detail-value">{league}</span></div>
            <div className="detail-row"><span className="detail-label">Goals:</span><span className="detail-value">{goals}</span></div>
            <div className="detail-row"><span className="detail-label">Assists:</span><span className="detail-value">{assists}</span></div>
            <div className="detail-row"><span className="detail-label">Matches:</span><span className="detail-value">{matches}</span></div>
          </div>
        </div>
      </div>
    );
  }
};

export default PlayerDetailModalCard; 