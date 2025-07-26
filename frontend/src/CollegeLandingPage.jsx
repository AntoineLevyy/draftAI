
import React, { useState, useEffect, useMemo } from 'react';
import { apiBaseUrl } from './config';

const bgStyle = {
  flex: 1,
  width: '100%',
  background: 'linear-gradient(135deg, #18181b 0%, #111 100%)', // black gradient
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '0',
  overflow: 'hidden',
  position: 'relative',
  paddingTop: '0.2rem',
};

const headlineStyle = {
  fontWeight: 900,
  fontSize: '2.4rem',
  marginBottom: '1.2rem',
  marginTop: 0,
  color: '#fff',
  letterSpacing: '-1px',
  textAlign: 'center',
  textShadow: '0 2px 16px rgba(0,0,0,0.18)',
};

const subtitleStyle = {
  fontSize: '1.1rem',
  color: '#64748b',
  marginBottom: '2rem',
  fontWeight: 400,
  lineHeight: '1.5',
  textAlign: 'center'
};

const filterGroup = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  minWidth: 200,
  flex: 1,
  maxWidth: 220,
  // Remove white card background for native look
  background: 'transparent',
  borderRadius: 0,
  padding: 0,
  boxShadow: 'none',
  margin: '0 0.5rem',
};

const labelStyle = {
  fontWeight: 700,
  marginBottom: '12px',
  color: '#b91c1c', // red
  fontSize: '0.85rem',
  letterSpacing: '0.025em',
  textTransform: 'uppercase',
};

const selectStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '2px solid #b91c1c', // red border
  fontSize: '1rem',
  background: 'rgba(24,24,27,0.95)', // dark background
  color: '#fff',
  fontWeight: 500,
  outline: 'none',
  marginBottom: 0,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  boxShadow: 'none',
  appearance: 'auto', // native dropdown
  WebkitAppearance: 'auto',
  MozAppearance: 'auto',
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
  padding: '1rem 2.5rem',
  borderRadius: '2rem',
  border: 'none',
  background: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)', // red gradient
  color: 'white',
  fontWeight: 800,
  fontSize: '1.15rem',
  cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(185,28,28,0.18)',
  transition: 'all 0.2s ease',
  outline: 'none',
  letterSpacing: '0.01em',
  marginTop: '1.2rem',
};

const buttonStyleHover = {
  transform: 'translateY(-2px)',
  boxShadow: '0 6px 20px rgba(79,140,255,0.4)',
};

const backButtonStyle = {
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
};

const positions = [
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

const regions = [
  'All',
  'Northeast',
  'Southeast',
  'Midwest',
  'Southwest',
  'West Coast',
  'International',
];

const graduationYears = [
  'All',
  '2024',
  '2025',
  '2026',
  '2027',
  '2028',
  '2029',
];

const collegeLeagues = [
  'All',
  'NJCAA D1',
  'NJCAA D2',
  'NJCAA D3',
  // Add more college leagues here as needed
];



function CollegeLandingPage({ onApplyFilters, onBack }) {
  const [type, setType] = useState('transfer'); // 'transfer', 'highschool', 'international'
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [academicLevel, setAcademicLevel] = useState('All');
  const [graduationYear, setGraduationYear] = useState('All');
  const [selectedLeague, setSelectedLeague] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const [highSchoolPlayers, setHighSchoolPlayers] = useState([]);
  const [activeSelect, setActiveSelect] = useState('');
  const [hoveredSelect, setHoveredSelect] = useState('');
  const [claimedFilter, setClaimedFilter] = useState('all'); // 'all' | 'claimed' | 'unclaimed'
  const [selectedEligibility, setSelectedEligibility] = useState('All');
  const [selectedAwards, setSelectedAwards] = useState('All');
  const [minGpa, setMinGpa] = useState('All');

  // Fetch high school players for dynamic filter options
  useEffect(() => {
    if (type === 'highschool') {
      fetch(`${apiBaseUrl}/api/players`)
        .then(res => res.json())
        .then(data => {
          setHighSchoolPlayers((data.players || []).filter(p => p.type === 'highschool'));
        });
    }
  }, [type]);

  // Fetch all players to populate claimed filter options
  const [allPlayers, setAllPlayers] = useState([]);
  useEffect(() => {
    fetch(`${apiBaseUrl}/api/players`)
      .then(res => res.json())
      .then(data => {
        setAllPlayers(data.players || []);
      });
  }, []);

  // Compute claimed filter options from all players
  const claimedPositions = useMemo(() => {
    const positions = new Set();
    allPlayers.forEach(p => { 
      if (p.claimed && p.position) positions.add(p.position); 
    });
    return ['All', ...Array.from(positions).sort()];
  }, [allPlayers]);

  const claimedLeagues = useMemo(() => {
    const leagues = new Set();
    allPlayers.forEach(p => { 
      if (p.claimed && p.league) leagues.add(p.league); 
    });
    return ['All', ...Array.from(leagues).sort()];
  }, [allPlayers]);

  const claimedEligibilities = useMemo(() => {
    const eligibilities = new Set();
    allPlayers.forEach(p => { 
      if (p.claimed && p.eligibility) eligibilities.add(p.eligibility); 
    });
    return ['All', ...Array.from(eligibilities).sort()];
  }, [allPlayers]);

  const claimedAwardsList = useMemo(() => {
    const awards = new Set();
    allPlayers.forEach(p => { 
      if (p.claimed && p.awards) awards.add(p.awards); 
    });
    return ['All', ...Array.from(awards).sort()];
  }, [allPlayers]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'highschool') {
      onApplyFilters({
        type,
        state: stateFilter,
        grad_year: graduationYear,
        position: selectedPosition,
        claimedFilter,
      });
    } else if (type === 'transfer') {
      if (claimedFilter === 'claimed') {
        onApplyFilters({
          type,
          position: selectedPosition,
          league: selectedLeague,
          eligibility: selectedEligibility,
          awards: selectedAwards,
          minGpa,
          claimedFilter,
        });
      } else {
        onApplyFilters({
          type,
          position: selectedPosition,
          academicLevel,
          league: selectedLeague,
          claimedFilter,
        });
      }
    } else {
      onApplyFilters({ type, claimedFilter });
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
    <div style={bgStyle}>
      <div className="mainContainer" style={{ marginTop: 0 }}>
        <h1 style={headlineStyle}>Find your next player</h1>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="filtersRow" style={{ display: 'flex', flexWrap: 'wrap', gap: 48, marginTop: 48, marginBottom: 0, justifyContent: 'center', width: '100%' }}>
            {/* Claimed/Unclaimed Filter */}
            <div style={filterGroup}>
              <label style={labelStyle}>Claimed Status</label>
              <select
                value={claimedFilter}
                onChange={e => setClaimedFilter(e.target.value)}
                style={getSelectStyle('claimedFilter')}
                onFocus={()=>setActiveSelect('claimedFilter')}
                onBlur={()=>setActiveSelect('')}
                onMouseEnter={()=>setHoveredSelect('claimedFilter')}
                onMouseLeave={()=>setHoveredSelect('')}
              >
                <option value="all">All</option>
                <option value="claimed">Claimed</option>
                <option value="unclaimed">Unclaimed</option>
              </select>
            </div>
            {/* Type Dropdown */}
            <div style={filterGroup}>
              <label style={labelStyle}>Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                style={selectStyle}
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
            {/* Claimed-specific filters */}
            {claimedFilter === 'claimed' && type === 'transfer' && (
              <>
                <div style={filterGroup}>
                  <label style={labelStyle}>Position</label>
                  <select
                    style={getSelectStyle('position')}
                    value={selectedPosition}
                    onChange={e => setSelectedPosition(e.target.value)}
                    onFocus={()=>setActiveSelect('position')}
                    onBlur={()=>setActiveSelect('')}
                    onMouseEnter={()=>setHoveredSelect('position')}
                    onMouseLeave={()=>setHoveredSelect('')}
                  >
                    {claimedPositions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                <div style={filterGroup}>
                  <label style={labelStyle}>League</label>
                  <select
                    style={getSelectStyle('league')}
                    value={selectedLeague}
                    onChange={e => setSelectedLeague(e.target.value)}
                    onFocus={() => setActiveSelect('league')}
                    onBlur={() => setActiveSelect('')}
                    onMouseEnter={() => setHoveredSelect('league')}
                    onMouseLeave={() => setHoveredSelect('')}
                  >
                    {claimedLeagues.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div style={filterGroup}>
                  <label style={labelStyle}>Eligibility</label>
                  <select
                    style={getSelectStyle('eligibility')}
                    value={selectedEligibility}
                    onChange={e => setSelectedEligibility(e.target.value)}
                    onFocus={() => setActiveSelect('eligibility')}
                    onBlur={() => setActiveSelect('')}
                    onMouseEnter={() => setHoveredSelect('eligibility')}
                    onMouseLeave={() => setHoveredSelect('')}
                  >
                    {claimedEligibilities.map(el => (
                      <option key={el} value={el}>{el}</option>
                    ))}
                  </select>
                </div>
                <div style={filterGroup}>
                  <label style={labelStyle}>Awards</label>
                  <select
                    style={getSelectStyle('awards')}
                    value={selectedAwards}
                    onChange={e => setSelectedAwards(e.target.value)}
                    onFocus={() => setActiveSelect('awards')}
                    onBlur={() => setActiveSelect('')}
                    onMouseEnter={() => setHoveredSelect('awards')}
                    onMouseLeave={() => setHoveredSelect('')}
                  >
                    {claimedAwardsList.map(aw => (
                      <option key={aw} value={aw}>{aw}</option>
                    ))}
                  </select>
                </div>
                <div style={filterGroup}>
                  <label style={labelStyle}>Minimum GPA</label>
                  <select
                    style={getSelectStyle('minGpa')}
                    value={minGpa}
                    onChange={e => setMinGpa(e.target.value)}
                    onFocus={() => setActiveSelect('minGpa')}
                    onBlur={() => setActiveSelect('')}
                    onMouseEnter={() => setHoveredSelect('minGpa')}
                    onMouseLeave={() => setHoveredSelect('')}
                  >
                    {['All', '2.0', '2.5', '3.0', '3.5', '4.0'].map(gpa => (
                      <option key={gpa} value={gpa}>{gpa}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {/* Unclaimed-specific filters */}
            {(claimedFilter === 'unclaimed' || claimedFilter === 'all') && type === 'transfer' && (
              <>
                <div style={filterGroup}>
                  <label style={labelStyle}>Position</label>
                  <select
                    style={getSelectStyle('position')}
                    value={selectedPosition}
                    onChange={e => setSelectedPosition(e.target.value)}
                    onFocus={()=>setActiveSelect('position')}
                    onBlur={()=>setActiveSelect('')}
                    onMouseEnter={()=>setHoveredSelect('position')}
                    onMouseLeave={()=>setHoveredSelect('')}
                  >
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                <div style={filterGroup}>
                  <label style={labelStyle}>League</label>
                  <select
                    style={getSelectStyle('league')}
                    value={selectedLeague}
                    onChange={e => setSelectedLeague(e.target.value)}
                    onFocus={() => setActiveSelect('league')}
                    onBlur={() => setActiveSelect('')}
                    onMouseEnter={() => setHoveredSelect('league')}
                    onMouseLeave={() => setHoveredSelect('')}
                  >
                    {collegeLeagues.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div style={filterGroup}>
                  <label style={labelStyle}>Academic Year</label>
                  <select
                    style={getSelectStyle('academicLevel')}
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
              </>
            )}
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
                  value={graduationYear}
                  onChange={e => setGraduationYear(e.target.value)}
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
                  value={selectedPosition}
                  onChange={e => setSelectedPosition(e.target.value)}
                  style={getSelectStyle('position')}
                  onFocus={()=>setActiveSelect('position')}
                  onBlur={()=>setActiveSelect('')}
                  onMouseEnter={()=>setHoveredSelect('position')}
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
          <div style={{ height: 96 }} />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <button type="submit" style={buttonStyle}>
              Find Players
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CollegeLandingPage; 