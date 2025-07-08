import React, { useState } from 'react';
import LandingPage from './LandingPage';
import PlayerCards from './USLPlayerCards';

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
  padding: '2rem 0',
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
  fontSize: '0.95rem',
  lineHeight: '1.6',
  marginBottom: '0.5rem',
};

const footerLink = {
  color: '#4f8cff',
  textDecoration: 'none',
  transition: 'opacity 0.2s',
};

const mainContentStyle = {
  minHeight: '100vh',
  width: '100%',
  boxSizing: 'border-box',
  paddingTop: '80px',
};

function App() {
  const [filters, setFilters] = useState(null);

  const handleApplyFilters = (selectedFilters) => {
    setFilters(selectedFilters);
  };

  const handleBack = () => {
    setFilters(null);
  };

  return (
          <div>
      <header style={headerStyle}>
        <div style={headerInner}>
          <a 
            href="#" 
            style={logoStyle}
            onClick={(e) => {
              e.preventDefault();
              if (filters) {
                handleBack();
              }
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}
          >
            Draft AI
          </a>
          <div></div>
        </div>
      </header>
      <main style={mainContentStyle}>
        {filters ? (
          <PlayerCards filters={filters} onBack={handleBack} />
        ) : (
          <LandingPage onApplyFilters={handleApplyFilters} />
        )}
      </main>
      <footer style={footerStyle}>
        <div style={footerContent}>
          <p style={footerText}>
            © 2024 Draft AI. All rights reserved. | 
            <a 
              href="mailto:antoine.levy27@gmail.com" 
              style={footerLink}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Contact: antoine.levy27@gmail.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
