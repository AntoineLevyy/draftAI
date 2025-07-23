import React, { useState, useEffect, useMemo } from 'react';
import { apiBaseUrl } from './config';

const getBgStyle = (coachType) => ({
  flex: 1,
  width: '100%',
  background: coachType === 'pro'
    ? 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 40%, #4f8cff 100%)'
    : 'linear-gradient(120deg, #f0fdf4 0%, #bbf7d0 40%, #10b981 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '0',
  overflow: 'hidden',
});

const toggleContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.5rem',
  margin: '1.2rem 0 1.2rem 0',
  background: 'rgba(255,255,255,0.5)',
  borderRadius: '1.2rem',
  padding: '0.18rem 0.5rem',
  boxShadow: '0 1px 6px rgba(79,140,255,0.04)',
};

const toggleButton = (active, type) => ({
  padding: '0.32rem 1.1rem',
  borderRadius: '1rem',
  border: 'none',
  background: active
    ? (type === 'pro' ? 'linear-gradient(90deg, #4f8cff 0%, #38bdf8 100%)' : 'linear-gradient(90deg, #10b981 0%, #22d3ee 100%)')
    : '#fff',
  color: active ? '#fff' : '#222',
  fontWeight: 700,
  fontSize: '0.98rem',
  cursor: 'pointer',
  boxShadow: active
    ? (type === 'pro' ? '0 2px 8px rgba(79,140,255,0.10)' : '0 2px 8px rgba(16,185,129,0.10)')
    : 'none',
  transition: 'all 0.18s',
  outline: 'none',
  borderBottom: active ? (type === 'pro' ? '2px solid #4f8cff' : '2px solid #10b981') : '2px solid transparent',
  letterSpacing: '0.01em',
});

const headlineStyle = {
  fontWeight: 800,
  fontSize: '2rem',
  marginBottom: '2.5rem',
  background: 'linear-gradient(90deg, #4f8cff, #6f6fff 60%, #38bdf8 100%)',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  letterSpacing: '-1px',
  textAlign: 'center',
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
  'Gibraltar Football League (Tier 1 Gibraltar)',
  'Segunda Federacion Grupo 1 (Tier 4 Spain)',
  'Segunda Federacion Grupo 2 (Tier 4 Spain)',
  'Segunda Federacion Grupo 3 (Tier 4 Spain)',
  'Segunda Federacion Grupo 4 (Tier 4 Spain)',
  'Segunda Federacion Grupo 5 (Tier 4 Spain)',
];

// College filter data
const collegePositions = [
  'All',
  'Goalkeeper',
  'Defender',
  'Midfielder',
  'Forward',
];
const academicLevels = [
  'All',
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Graduate Student',
];
const collegeLeagues = [
  'All',
  'NJCAA D1',
  'NJCAA D2',
  'NJCAA D3',
];

function LandingPage({ onApplyFilters, onBack, coachType, onToggleCoachType }) {
  // Pro state
  const [selectedLeague, setSelectedLeague] = useState('All');
  const [position, setPosition] = useState('All');
  const [nationality, setNationality] = useState('All');
  // College state
  const [type, setType] = useState('transfer'); // 'transfer', 'highschool', 'international'
  const [collegePosition, setCollegePosition] = useState('All');
  const [academicLevel, setAcademicLevel] = useState('All');
  const [collegeLeague, setCollegeLeague] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const [gradYearFilter, setGradYearFilter] = useState('All');
  const [highSchoolPlayers, setHighSchoolPlayers] = useState([]);
  const [activeSelect, setActiveSelect] = useState('');
  const [hoveredSelect, setHoveredSelect] = useState('');
  const [leagues] = useState(proLeagues);

  // Fetch high school players for dynamic filter options
  useEffect(() => {
    if (coachType === 'college' && type === 'highschool') {
      fetch(`${apiBaseUrl}/api/players`)
        .then(res => res.json())
        .then(data => {
          setHighSchoolPlayers((data.players || []).filter(p => p.type === 'highschool'));
        });
    }
  }, [coachType, type]);

  // Compute unique states, positions, grad years from high school players
  const highSchoolStates = useMemo(() => {
    const states = new Set();
    highSchoolPlayers.forEach(p => {
      if (p.state && p.state.trim() !== '') states.add(p.state);
    });
    return ['All', ...Array.from(states).sort()];
  }, [highSchoolPlayers]);

  const highSchoolPositions = useMemo(() => {
    const positions = new Set();
    highSchoolPlayers.forEach(p => {
      if (p.position && p.position.trim() !== '') positions.add(p.position);
    });
    return ['All', ...Array.from(positions).sort()];
  }, [highSchoolPlayers]);

  const highSchoolGradYears = useMemo(() => {
    const years = new Set();
    highSchoolPlayers.forEach(p => {
      if (p.grad_year && p.grad_year.trim() !== '') years.add(p.grad_year);
    });
    return ['All', ...Array.from(years).sort()];
  }, [highSchoolPlayers]);

  const handleLeagueChange = (e) => {
    setSelectedLeague(e.target.value);
  };

  const handleProSubmit = (e) => {
    e.preventDefault();
    let leagueToSend;
    if (selectedLeague === 'All') {
      leagueToSend = leagues.slice(1).map(league => league.split(' (')[0]);
    } else {
      leagueToSend = [selectedLeague.split(' (')[0]];
    }
    onApplyFilters({ league: leagueToSend, position, nationality });
  };

  const handleCollegeSubmit = (e) => {
    e.preventDefault();
    if (type === 'highschool') {
      onApplyFilters({
        type,
        state: stateFilter,
        grad_year: gradYearFilter,
        position: collegePosition
      });
    } else if (type === 'transfer') {
      onApplyFilters({
        type,
        position: collegePosition,
        academicLevel,
        league: collegeLeague
      });
    } else {
      onApplyFilters({ type });
    }
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
    <div style={getBgStyle(coachType)}>
      <div style={toggleContainer}>
        <button
          style={toggleButton(coachType === 'pro', 'pro')}
          onClick={() => onToggleCoachType('pro')}
        >
          Pro
        </button>
        <button
          style={toggleButton(coachType === 'college', 'college')}
          onClick={() => onToggleCoachType('college')}
        >
          College
        </button>
      </div>
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
      <div className="mainContainer" style={{ paddingTop: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h1 style={{
          fontWeight: 800,
          fontSize: '2.2rem',
          marginBottom: '1.2rem',
          marginTop: 0,
          letterSpacing: '-1px',
        }}>
          <span className={`gradient-headline${coachType === 'college' ? ' college' : ''}`}>
            Find your next player
          </span>
        </h1>
        {coachType === 'pro' && (
          <form onSubmit={handleProSubmit} style={{width: '100%'}}>
            <div className="filtersRow">
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
                  e.target.style.transform = '0';
                  e.target.style.boxShadow = '0 4px 16px rgba(79,140,255,0.3)';
                }}
              >
                Find Players
              </button>
            </div>
          </form>
        )}
        {coachType === 'college' && (
          <form onSubmit={handleCollegeSubmit} style={{width: '100%'}}>
            <div className="filtersRow" style={{ display: 'flex', gap: 24, marginBottom: 0, justifyContent: 'center', width: '100%' }}>
              {/* Type Dropdown */}
              <div style={filterGroup}>
                <label style={labelStyle}>Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  style={getSelectStyle('type')}
                  onFocus={()=>setActiveSelect('type')}
                  onBlur={()=>setActiveSelect('')}
                  onMouseEnter={()=>setHoveredSelect('type')}
                  onMouseLeave={()=>setHoveredSelect('')}
                >
                  <option value="transfer">Transfer</option>
                  <option value="highschool">High School</option>
                  <option value="international" disabled>International (coming soon)</option>
                </select>
              </div>
              {/* Transfer Filters */}
              {type === 'transfer' && <>
                <div style={filterGroup}>
                  <label style={labelStyle} htmlFor="collegePosition">Position</label>
                  <select
                    style={getSelectStyle('collegePosition')}
                    id="collegePosition"
                    value={collegePosition}
                    onChange={e => setCollegePosition(e.target.value)}
                    onFocus={()=>setActiveSelect('collegePosition')}
                    onBlur={()=>setActiveSelect('')}
                    onMouseEnter={()=>setHoveredSelect('collegePosition')}
                    onMouseLeave={()=>setHoveredSelect('')}
                    required
                  >
                    {collegePositions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                <div style={filterGroup}>
                  <label style={labelStyle} htmlFor="collegeLeague">League</label>
                  <select
                    style={getSelectStyle('collegeLeague')}
                    id="collegeLeague"
                    value={collegeLeague}
                    onChange={e => setCollegeLeague(e.target.value)}
                    onFocus={()=>setActiveSelect('collegeLeague')}
                    onBlur={()=>setActiveSelect('')}
                    onMouseEnter={()=>setHoveredSelect('collegeLeague')}
                    onMouseLeave={()=>setHoveredSelect('')}
                  >
                    {collegeLeagues.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div style={filterGroup}>
                  <label style={labelStyle} htmlFor="academicLevel">Academic Year</label>
                  <select
                    style={getSelectStyle('academicLevel')}
                    id="academicLevel"
                    value={academicLevel}
                    onChange={e => setAcademicLevel(e.target.value)}
                    onFocus={()=>setActiveSelect('academicLevel')}
                    onBlur={()=>setActiveSelect('')}
                    onMouseEnter={()=>setHoveredSelect('academicLevel')}
                    onMouseLeave={()=>setHoveredSelect('')}
                  >
                    {academicLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </>}
              {/* High School Filters */}
              {type === 'highschool' && <>
                <div style={filterGroup}>
                  <label style={labelStyle}>State</label>
                  <select
                    value={stateFilter}
                    onChange={e => setStateFilter(e.target.value)}
                    style={getSelectStyle('state')}
                    onFocus={()=>setActiveSelect('state')}
                    onBlur={()=>setActiveSelect('')}
                    onMouseEnter={()=>setHoveredSelect('state')}
                    onMouseLeave={()=>setHoveredSelect('')}
                  >
                    {highSchoolStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={filterGroup}>
                  <label style={labelStyle}>Graduation Year</label>
                  <select
                    value={gradYearFilter}
                    onChange={e => setGradYearFilter(e.target.value)}
                    style={getSelectStyle('grad_year')}
                    onFocus={()=>setActiveSelect('grad_year')}
                    onBlur={()=>setActiveSelect('')}
                    onMouseEnter={()=>setHoveredSelect('grad_year')}
                    onMouseLeave={()=>setHoveredSelect('')}
                  >
                    {highSchoolGradYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div style={filterGroup}>
                  <label style={labelStyle}>Position</label>
                  <select
                    value={collegePosition}
                    onChange={e => setCollegePosition(e.target.value)}
                    style={getSelectStyle('collegePosition')}
                    onFocus={()=>setActiveSelect('collegePosition')}
                    onBlur={()=>setActiveSelect('')}
                    onMouseEnter={()=>setHoveredSelect('collegePosition')}
                    onMouseLeave={()=>setHoveredSelect('')}
                  >
                    {highSchoolPositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                  </select>
                </div>
              </>}
              {/* International: grayed out, no filters */}
              {type === 'international' && (
                <div style={filterGroup}>
                  <label style={labelStyle}>No Results</label>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                    International player data is not yet available.
                  </p>
                </div>
              )}
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
                  e.target.style.transform = '0';
                  e.target.style.boxShadow = '0 4px 16px rgba(79,140,255,0.3)';
                }}
                disabled={type === 'international'}
              >
                Find Players
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default LandingPage; 