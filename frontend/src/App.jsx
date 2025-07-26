import React, { useState } from 'react';
import MainLandingPage from './MainLandingPage';
import CollegeLandingPage from './CollegeLandingPage';
import CollegePlayerCards from './CollegePlayerCards';
import Profile from './Profile';
import PlayerProfile from './PlayerProfile';
import ForPlayersLanding from './ForPlayersLanding';
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
  const [currentView, setCurrentView] = useState(() => {
    // Check URL on initial load
    const path = window.location.pathname;
    if (path === '/forplayers') return 'forplayers';
    if (path === '/claim') return 'claim';
    return 'main';
  });
  const [filters, setFilters] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState('signin');
  const { user, signOut } = useAuth();

  // Check if user is a player
  const isPlayer = user?.user_metadata?.userType === 'Player';

  // Redirect players to appropriate pages if they try to access restricted areas
  React.useEffect(() => {
    if (isPlayer && currentView !== 'forplayers' && currentView !== 'profile' && currentView !== 'claim') {
      // Players should only access forplayers, profile, and claim pages
      setCurrentView('forplayers');
      window.history.pushState({}, '', '/forplayers');
    }
  }, [isPlayer, currentView]);

  // Handle authentication state changes
  React.useEffect(() => {
    if (user && currentView === 'claim') {
      // If user logs in while on claim page, redirect them to their profile
      const userType = user?.user_metadata?.userType;
      if (userType === 'Player') {
        setCurrentView('profile');
        window.history.pushState({}, '', '/profile');
      }
    }
  }, [user, currentView]);

  const handleApplyFilters = (selectedFilters) => {
    // Only coaches should be able to access the college section
    if (isPlayer) {
      alert('Players cannot access the coach portal. Please use the "For Players" section to claim your profile.');
      return;
    }
    setFilters(selectedFilters);
    setCurrentView('college');
  };

  const handleBack = () => {
    if (currentView === 'profile') {
      // For players, go back to forplayers page
      if (isPlayer) {
        setCurrentView('forplayers');
        window.history.pushState({}, '', '/forplayers');
      } else {
        setCurrentView('main');
        window.history.pushState({}, '', '/');
      }
    } else if (currentView === 'forplayers') {
      // For players, stay on forplayers page
      if (isPlayer) {
        return;
      }
      setCurrentView('main');
      window.history.pushState({}, '', '/');
    } else if (currentView === 'claim') {
      setCurrentView('forplayers');
      window.history.pushState({}, '', '/forplayers');
    } else if (filters) {
      setFilters(null);
      setCurrentView('main');
      window.history.pushState({}, '', '/');
    } else {
      setCurrentView('main');
      window.history.pushState({}, '', '/');
    }
  };

  const handleProfileClick = () => {
    console.log('User data:', user);
    console.log('User metadata:', user?.user_metadata);
    console.log('User type:', user?.user_metadata?.userType);
    setCurrentView('profile');
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

  const handleForPlayersClick = () => {
    setCurrentView('forplayers');
    window.history.pushState({}, '', '/forplayers');
  };

  const handleClaimClick = () => {
    // Only allow claim flow for logged-out users
    if (user) {
      if (isPlayer) {
        alert('You already have a profile. You cannot claim another profile.');
        return;
      } else {
        alert('Coaches cannot claim player profiles. Please use the coach portal to view players.');
        return;
      }
    }
    setCurrentView('claim');
    window.history.pushState({}, '', '/claim');
  };

  const handleProfileRedirect = () => {
    setCurrentView('profile');
  };

  // Handle browser back/forward buttons
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/forplayers') {
        setCurrentView('forplayers');
      } else if (path === '/claim') {
        setCurrentView('claim');
      } else {
        // For players, redirect to forplayers if they try to access main page
        if (isPlayer) {
          setCurrentView('forplayers');
          window.history.pushState({}, '', '/forplayers');
        } else {
          setCurrentView('main');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isPlayer]);

  let mainContent = null;
  if (currentView === 'main') {
    // Players should not see the main landing page
    if (isPlayer) {
      mainContent = <ForPlayersLanding onClaimClick={handleClaimClick} />;
    } else {
      mainContent = <MainLandingPage onApplyFilters={handleApplyFilters} />;
    }
  } else if (currentView === 'college' && filters) {
    mainContent = <CollegePlayerCards filters={filters} onBack={handleBack} onShowSignupModal={handleSignInClick} />;
  } else if (currentView === 'college') {
    mainContent = <CollegeLandingPage onApplyFilters={handleApplyFilters} onBack={handleBack} />;
  } else if (currentView === 'profile') {
    // Check if user is a player or coach
    const userType = user?.user_metadata?.userType;
    if (userType === 'Player') {
      mainContent = <PlayerProfile onBack={handleBack} />;
    } else {
      mainContent = <Profile onBack={handleBack} />;
    }
  } else if (currentView === 'forplayers') {
    mainContent = <ForPlayersLanding onClaimClick={handleClaimClick} />;
  } else if (currentView === 'claim') {
    mainContent = <CollegePlayerCards filters={{ type: 'transfer', claimed: false }} onBack={handleBack} onShowSignupModal={handleSignInClick} isClaimMode={true} />;
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
              <>
                <button 
                  style={signInButtonStyle}
                  onClick={handleProfileClick}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(79,140,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(79,140,255,0.1)';
                  }}
                >
                  Profile
                </button>
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
              </>
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
            <br />
            {/* Only show "For Players" button for logged-out users and coaches */}
            {!user || !isPlayer ? (
              <button 
                onClick={handleForPlayersClick}
                style={{
                  ...footerLink,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  padding: '0.25rem 0',
                  marginTop: '0.5rem'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                For Players
              </button>
            ) : null}
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
