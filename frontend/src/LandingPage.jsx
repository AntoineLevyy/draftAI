import React, { useState } from 'react';
import { apiBaseUrl } from './config';

const bgStyle = {
  flex: 1,
  width: '100%',
  background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 40%, #c7d2fe 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '0',
  overflow: 'hidden',
};

const mainContainer = {
  maxWidth: 900,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '1rem',
  justifyContent: 'center',
  paddingTop: '8rem',
};

const headlineStyle = {
  fontWeight: 800,
  fontSize: '2rem',
  marginBottom: '4.5rem',
  background: 'linear-gradient(90deg, #4f8cff, #6f6fff 60%, #38bdf8 100%)',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  letterSpacing: '-1px',
  textAlign: 'center',
};

const filtersRow = {
  display: 'flex',
  flexDirection: 'row',
  gap: '1.5rem',
  width: '100%',
  justifyContent: 'center',
  marginBottom: '1.5rem',
  alignItems: 'flex-start',
};

const filterGroup = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  minWidth: 200,
  flex: 1,
  maxWidth: 220,
};

const labelStyle = {
  fontWeight: 600,
  marginBottom: '12px',
  color: '#374151',
  fontSize: '0.8rem',
  letterSpacing: '0.025em',
  textTransform: 'uppercase',
};

const selectStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '12px',
  border: '2px solid rgba(79,140,255,0.2)',
  fontSize: '0.9rem',
  background: 'rgba(255,255,255,0.9)',
  boxShadow: '0 2px 8px rgba(79,140,255,0.08)',
  outline: 'none',
  marginBottom: 0,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  backdropFilter: 'blur(10px)',
  color: '#374151',
  fontWeight: '500',
};

const selectStyleActive = {
  border: '2px solid #4f8cff',
  background: 'rgba(255,255,255,0.95)',
  boxShadow: '0 4px 16px rgba(79,140,255,0.15)',
  transform: 'translateY(-1px)',
};

const selectStyleHover = {
  border: '2px solid rgba(79,140,255,0.4)',
  background: 'rgba(255,255,255,0.95)',
  boxShadow: '0 4px 12px rgba(79,140,255,0.12)',
};

const buttonStyle = {
  padding: '0.875rem 2rem',
  borderRadius: '2rem',
  border: 'none',
  background: 'linear-gradient(90deg, #4f8cff 0%, #6f6fff 100%)',
  color: 'white',
  fontWeight: 700,
  fontSize: '1rem',
  cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(79,140,255,0.3)',
  transition: 'all 0.2s ease',
  outline: 'none',
  marginTop: '0.75rem',
  letterSpacing: '0.01em',
};

const buttonStyleHover = {
  transform: 'translateY(-2px)',
  boxShadow: '0 6px 20px rgba(79,140,255,0.4)',
};

const positions = [
  'All',
  'Goalkeeper',
  'Center Back',
  'Left Back',
  'Right Back',
  'Defensive Midfielder',
  'Central Midfielder',
  'Left Midfielder',
  'Right Midfielder',
  'Attacking Midfielder',
  'Left Winger',
  'Right Winger',
  'Center Forward',
];

const nationalities = [
  'All',
  'Argentina', 'Australia', 'Barbados', 'Benin', 'Brazil', 'Bulgaria', 'Chile', 'Germany', 'England', 'France', 'Gambia', 'Ghana', 'Greece', 'Guatemala', 'Haiti', 'Honduras', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Cameroon', 'Canada', 'Cape Verde', 'Kenya', 'Colombia', 'Liberia', 'Mexico', 'Moldova', 'Netherlands', 'Nigeria', 'Norway', 'Panama', 'Poland', 'Puerto Rico', 'Scotland', 'Switzerland', 'Senegal', 'Sierra Leone', 'Spain', 'South Africa', 'Tanzania', 'Trinidad and Tobago', 'Venezuela', 'United States', 'Zaire', 'Central African Republic', 'Austria',
];

const proLeagues = [
  'All',
  'USL Championship (Tier 2 USA)',
  'USL League One (Tier 3 USA)',
  'MLS Next Pro (Tier 3 USA)',
  'Canadian Premier League (Tier 1 Canada)',
  'Liga MX Apertura (Tier 1 Mexico)',
  'Primera Divisió (Tier 1 Andorra)',
  'Efbet Liga (Tier 1 Bulgaria)',
  'Vtora Liga (Tier 2 Bulgaria)',
  'National League (Tier 5 England)',
  'National League South (Tier 6 England)',
  'National League North (Tier 6 England)',
  'League Two (Tier 4 England)',
];

function LandingPage({ onApplyFilters, onBack }) {
  const [selectedLeague, setSelectedLeague] = useState('All');
  const [position, setPosition] = useState('All');
  const [nationality, setNationality] = useState('All');
  const [activeSelect, setActiveSelect] = useState('');
  const [hoveredSelect, setHoveredSelect] = useState('');
  const [leagues] = useState(proLeagues);

  const handleLeagueChange = (e) => {
    setSelectedLeague(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // If 'All' is selected, pass all leagues except 'All'
    let leagueToSend;
    if (selectedLeague === 'All') {
      // Extract base league names from display text
      leagueToSend = leagues.slice(1).map(league => league.split(' (')[0]);
    } else {
      // Extract base league name from selected display text
      leagueToSend = [selectedLeague.split(' (')[0]];
    }
    onApplyFilters({ league: leagueToSend, position, nationality });
  };

  const getSelectStyle = (selectName) => {
    let style = { ...selectStyle };
    if (activeSelect === selectName) {
      style = { ...style, ...selectStyleActive };
    } else if (hoveredSelect === selectName) {
      style = { ...style, ...selectStyleHover };
    }
    return style;
  };

  return (
    <div style={bgStyle}>
      <button 
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.1)',
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.9rem',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(10px)',
        }}
        onClick={onBack}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.1)';
        }}
      >
        ← Back to Main Menu
      </button>
      
      <div style={mainContainer}>
        <h1 style={headlineStyle}>Find your next player</h1>
        
        <form onSubmit={handleSubmit} style={{width: '100%'}}>
          <div style={filtersRow}>
            <div style={filterGroup}>
              <label style={labelStyle} htmlFor="league">League</label>
              <select
                style={getSelectStyle('league')}
                id="league"
                value={selectedLeague}
                onChange={handleLeagueChange}
                onFocus={()=>setActiveSelect('league')}
                onBlur={()=>setActiveSelect('')}
                onMouseEnter={()=>setHoveredSelect('league')}
                onMouseLeave={()=>setHoveredSelect('')}
              >
                {leagues.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div style={filterGroup}>
              <label style={labelStyle} htmlFor="position">Position</label>
              <select
                style={getSelectStyle('position')}
                id="position"
                value={position}
                onChange={e => setPosition(e.target.value)}
                onFocus={()=>setActiveSelect('position')}
                onBlur={()=>setActiveSelect('')}
                onMouseEnter={()=>setHoveredSelect('position')}
                onMouseLeave={()=>setHoveredSelect('')}
                required
              >
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
            <div style={filterGroup}>
              <label style={labelStyle} htmlFor="nationality">Nationality</label>
              <select
                style={getSelectStyle('nationality')}
                id="nationality"
                value={nationality}
                onChange={e => setNationality(e.target.value)}
                onFocus={()=>setActiveSelect('nationality')}
                onBlur={()=>setActiveSelect('')}
                onMouseEnter={()=>setHoveredSelect('nationality')}
                onMouseLeave={()=>setHoveredSelect('')}
              >
                {nationalities.map(nat => (
                  <option key={nat} value={nat}>{nat}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <button 
              type="submit" 
              style={buttonStyle}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(79,140,255,0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(79,140,255,0.3)';
              }}
            >
              Find Players
            </button>
          </div>
        </form>
        

      </div>
    </div>
  );
}

export default LandingPage; 