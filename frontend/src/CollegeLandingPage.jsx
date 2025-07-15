import React, { useState } from 'react';

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
  position: 'relative'
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
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [academicLevel, setAcademicLevel] = useState('All');
  const [graduationYear, setGraduationYear] = useState('All');
  const [selectedLeague, setSelectedLeague] = useState('All');
  const [activeSelect, setActiveSelect] = useState('');
  const [hoveredSelect, setHoveredSelect] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters({ 
      position: selectedPosition, 
      academicLevel, 
      graduationYear, 
      league: selectedLeague
    });
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
        style={backButtonStyle}
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
      <div className="mainContainer">
        <h1 style={headlineStyle}>Find your next player</h1>
        <form onSubmit={handleSubmit} style={{width: '100%'}}>
          <div className="filtersRow">
            <div style={filterGroup}>
              <label style={labelStyle} htmlFor="position">Position</label>
              <select
                style={getSelectStyle('position')}
                id="position"
                value={selectedPosition}
                onChange={e => setSelectedPosition(e.target.value)}
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

            {/* League Filter */}
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
              Find players
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CollegeLandingPage; 