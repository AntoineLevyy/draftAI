import React, { useState } from 'react';
import MainLandingPage from './MainLandingPage';
import CollegeLandingPage from './CollegeLandingPage';
import CollegePlayerCards from './CollegePlayerCards';
import draftmeLogo from '../assets/images/cst_logo.png';
import { AuthProvider, useAuth } from './AuthContext';
import LoginModal from './LoginModal';

const headerStyle = {
  width: '100%',
  background: 'rgba(0,0,0,0.95)',
  borderBottom: '2px solid #b91c1c', // red accent
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

const headerButtonsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const signInButtonStyle = {
  padding: '0.5rem 1.25rem',
  borderRadius: '1.5rem',
  border: '2px solid #b91c1c',
  background: 'rgba(0,0,0,0.7)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  outline: 'none',
  letterSpacing: '0.01em',
};

const getStartedButtonStyle = {
  padding: '0.5rem 1.5rem',
  borderRadius: '1.5rem',
  border: 'none',
  background: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)',
  color: 'white',
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(185,28,28,0.3)',
  transition: 'all 0.2s ease',
  outline: 'none',
  letterSpacing: '0.01em',
};



const logoContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};

const logoImageStyle = {
  height: '4rem',
  width: 'auto',
};

const logoTextStyle = {
  fontWeight: 900,
  fontSize: '1.5rem',
  letterSpacing: '-1px',
  color: '#fff',
  textShadow: '0 2px 16px rgba(0,0,0,0.18)',
};

const footerStyle = {
  width: '100%',
  background: 'rgba(0,0,0,0.95)',
  borderTop: '2px solid #b91c1c', // red accent
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
  color: '#fff',
  fontSize: '0.95rem',
  lineHeight: '1.4',
  marginBottom: '0.25rem',
};

const footerLink = {
  color: '#ef4444',
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
  background: 'linear-gradient(135deg, #18181b 0%, #111 100%)', // black gradient
  overflow: 'hidden',
};

function AppContent() {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'college'
  const [filters, setFilters] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState('signin');
  const { user, signOut } = useAuth();

  const handleApplyFilters = (selectedFilters) => {
    setFilters(selectedFilters);
    setCurrentView('college');
  };

  const handleBack = () => {
    if (filters) {
      setFilters(null);
      setCurrentView('main');
    } else {
      setCurrentView('main');
    }
  };

  const handleSignInClick = () => {
    setLoginMode('signin');
    setShowLoginModal(true);
  };

  const handleGetStartedClick = () => {
    setLoginMode('signup');
    setShowLoginModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  let mainContent = null;
  if (currentView === 'main') {
    mainContent = <MainLandingPage onApplyFilters={handleApplyFilters} />;
  } else if (currentView === 'college' && filters) {
    mainContent = <CollegePlayerCards filters={filters} onBack={handleBack} onShowSignupModal={handleSignInClick} />;
  } else if (currentView === 'college') {
    mainContent = <CollegeLandingPage onApplyFilters={handleApplyFilters} onBack={handleBack} />;
  }

  return (
    <div style={appContainerStyle}>
      <header style={headerStyle}>
        <div style={headerInner}>
          <a 
            href="#" 
            style={logoContainerStyle}
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
            <img src={draftmeLogo} alt="CST logo" style={logoImageStyle} />
          </a>
          <div style={headerButtonsStyle}>
            {user ? (
              <button 
                style={signInButtonStyle}
                onClick={handleSignOut}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(79,140,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(79,140,255,0.1)';
                }}
              >
                Sign Out
              </button>
            ) : (
              <>
                <button 
                  style={signInButtonStyle}
                  onClick={handleSignInClick}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(79,140,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(79,140,255,0.1)';
                  }}
                >
                  Sign In
                </button>
                <button 
                  style={getStartedButtonStyle}
                  onClick={handleGetStartedClick}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(16,185,129,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 16px rgba(16,185,129,0.3)';
                  }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main style={mainContentStyle}>
        {mainContent}
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
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        mode={loginMode}
        setMode={setLoginMode}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
