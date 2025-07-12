import React, { useState } from 'react';
import MainLandingPage from './MainLandingPage';
import LandingPage from './LandingPage';
import CollegeLandingPage from './CollegeLandingPage';
import PlayerCards from './USLPlayerCards';
import CollegePlayerCards from './CollegePlayerCards';

const headerStyle = {
  width: '100%',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '1.1rem 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1000,
};

const headerInner = {
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 2rem',
};



const logoStyle = {
  fontWeight: 900,
  fontSize: '1.5rem',
  letterSpacing: '-1px',
  background: 'linear-gradient(90deg, #4f8cff, #6f6fff 60%, #38bdf8 100%)',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};

const footerStyle = {
  width: '100%',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '1rem 0',
  position: 'relative',
  zIndex: 10,
};

const footerContent = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '0 2rem',
  textAlign: 'center',
};

const footerText = {
  color: '#64748b',
  fontSize: '0.85rem',
  lineHeight: '1.4',
  marginBottom: '0.25rem',
};

const footerLink = {
  color: '#4f8cff',
  textDecoration: 'none',
  transition: 'opacity 0.2s',
};

const mainContentStyle = {
  flex: 1,
  width: '100%',
  boxSizing: 'border-box',
  paddingTop: '80px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const appContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width: '100%',
  overflow: 'hidden',
};

function App() {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'club', 'college'
  const [filters, setFilters] = useState(null);

  const handleSelectCoachType = (coachType) => {
    setCurrentView(coachType);
  };

  const handleApplyFilters = (selectedFilters) => {
    setFilters(selectedFilters);
  };

  const handleBack = () => {
    if (filters) {
      setFilters(null);
    } else {
      setCurrentView('main');
    }
  };

  // Determine which player view to show based on currentView
  let playerView = null;
  if (filters) {
    if (currentView === 'club') {
      playerView = <PlayerCards filters={filters} onBack={handleBack} />;
    } else if (currentView === 'college') {
      playerView = <CollegePlayerCards filters={filters} onBack={handleBack} />;
    }
  }

  // Determine if we're on a landing page (no scroll needed) or player cards page (scroll needed)
  const isLandingPage = !filters && (currentView === 'main' || currentView === 'club' || currentView === 'college');
  
  const dynamicMainContentStyle = {
    ...mainContentStyle,
    overflow: isLandingPage ? 'hidden' : 'visible',
  };

  const dynamicAppContainerStyle = {
    ...appContainerStyle,
    overflow: isLandingPage ? 'hidden' : 'visible',
  };

  return (
    <div style={dynamicAppContainerStyle}>
      <header style={headerStyle}>
        <div style={headerInner}>
          <a 
            href="#" 
            style={logoStyle}
            onClick={(e) => {
              e.preventDefault();
              handleBack();
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}
          >
            draftme
          </a>

          <div></div>
        </div>
      </header>
      <main style={dynamicMainContentStyle}>
        {currentView === 'main' && (
          <MainLandingPage onSelectCoachType={handleSelectCoachType} />
        )}
        {currentView === 'club' && !filters && (
          <LandingPage onApplyFilters={handleApplyFilters} onBack={handleBack} />
        )}
        {currentView === 'college' && !filters && (
          <CollegeLandingPage onApplyFilters={handleApplyFilters} onBack={handleBack} />
        )}
        {playerView}
      </main>
      <footer style={footerStyle}>
        <div style={footerContent}>
          <p style={footerText}>
            © 2025 draftme. All rights reserved.
            <br />
            <a 
              href="mailto:antoine@draftme.app" 
              style={footerLink}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Contact: antoine@draftme.app
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
