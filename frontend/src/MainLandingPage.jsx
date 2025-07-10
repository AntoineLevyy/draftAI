import React, { useState } from 'react';

const bgStyle = {
  minHeight: '100vh',
  width: '100%',
  background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 40%, #c7d2fe 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
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
  flex: 1,
  marginTop: '-6rem',
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

const optionsContainer = {
  display: 'flex',
  flexDirection: 'row',
  gap: '2rem',
  width: '100%',
  justifyContent: 'center',
  marginBottom: '1.5rem',
  alignItems: 'flex-start',
};

const optionCard = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: 300,
  flex: 1,
  maxWidth: 350,
  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(79,140,255,0.1) 50%, rgba(111,111,255,0.1) 100%)',
  borderRadius: '24px',
  padding: '2.5rem 2rem',
  border: '1px solid rgba(255,255,255,0.2)',
  cursor: 'pointer',
  transition: 'all 0.4s ease',
  boxShadow: '0 12px 40px rgba(79,140,255,0.08)',
  backdropFilter: 'blur(20px)',
  position: 'relative',
  overflow: 'hidden',
};

const optionCardHover = {
  transform: 'translateY(-8px)',
  border: '1px solid rgba(255,255,255,0.3)',
  boxShadow: '0 20px 60px rgba(79,140,255,0.15)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(79,140,255,0.15) 50%, rgba(111,111,255,0.15) 100%)',
};

const optionTitle = {
  fontSize: '1.75rem',
  fontWeight: 700,
  color: '#374151',
  marginBottom: '0.5rem',
  letterSpacing: '-0.5px',
  textAlign: 'center'
};

const optionDescription = {
  fontSize: '1rem',
  color: '#64748b',
  lineHeight: '1.4',
  marginBottom: '0',
  textAlign: 'center'
};

const optionFeatures = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  textAlign: 'left'
};

const featureItem = {
  color: '#64748b',
  fontSize: '0.9rem',
  marginBottom: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const featureIcon = {
  fontSize: '1.2rem',
  color: '#4ade80'
};

function MainLandingPage({ onSelectCoachType }) {
  const [hoveredOption, setHoveredOption] = useState(null);

  const handleClubCoaches = () => {
    onSelectCoachType('club');
  };

  const handleCollegeCoaches = () => {
    onSelectCoachType('college');
  };

  return (
    <div style={bgStyle}>
      <div style={mainContainer}>
        <h1 style={headlineStyle}>Find your next player</h1>
        
        <div style={optionsContainer}>
          {/* Club Coaches Option */}
          <div 
            style={{
              ...optionCard,
              ...(hoveredOption === 'club' ? optionCardHover : {})
            }}
            onMouseEnter={() => setHoveredOption('club')}
            onMouseLeave={() => setHoveredOption(null)}
            onClick={handleClubCoaches}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(79,140,255,0.05) 0%, transparent 50%, rgba(111,111,255,0.05) 100%)',
              borderRadius: '24px',
              pointerEvents: 'none'
            }} />
            <h2 style={optionTitle}>For Club Coaches</h2>
            <p style={optionDescription}>
              Professional talent across North American leagues
            </p>
          </div>

          {/* College Coaches Option */}
          <div 
            style={{
              ...optionCard,
              ...(hoveredOption === 'college' ? optionCardHover : {})
            }}
            onMouseEnter={() => setHoveredOption('college')}
            onMouseLeave={() => setHoveredOption(null)}
            onClick={handleCollegeCoaches}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(111,111,255,0.05) 0%, transparent 50%, rgba(56,189,248,0.05) 100%)',
              borderRadius: '24px',
              pointerEvents: 'none'
            }} />
            <h2 style={optionTitle}>For College Coaches</h2>
            <p style={optionDescription}>
              Student-athletes for your college program
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainLandingPage; 