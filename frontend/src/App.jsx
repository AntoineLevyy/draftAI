import React, { useState, useEffect } from 'react';
import MainLandingPage from './MainLandingPage';
import CollegeLandingPage from './CollegeLandingPage';
import CollegePlayerCards from './CollegePlayerCards';
import Profile from './Profile';
import PlayerProfile from './PlayerProfile';
import ForPlayersLanding from './ForPlayersLanding';
import draftmeLogo from '../assets/images/cst_logo.png';
import { AuthProvider, useAuth } from './AuthContext';
import LoginModal from './LoginModal';
import { getUnreadCount } from './services/chatService';

const headerStyle = {
  width: '100%',
  background: 'rgba(15, 23, 42, 0.95)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
  padding: '1.2rem 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1000,
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
};

const headerInner = {
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 2rem',
  '@media (max-width: 768px)': {
    padding: '0 1rem',
  },
};

const headerButtonsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.2rem',
};

const signInButtonStyle = {
  padding: '0.7rem 1.5rem',
  borderRadius: '50px',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  background: 'rgba(30, 41, 59, 0.8)',
  color: '#f8fafc',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  outline: 'none',
  letterSpacing: '0.02em',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const getStartedButtonStyle = {
  padding: '0.7rem 1.8rem',
  borderRadius: '50px',
  border: 'none',
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  color: 'white',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  outline: 'none',
  letterSpacing: '0.02em',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const logoContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'opacity 0.3s ease',
};

const logoImageStyle = {
  height: '3.5rem',
  width: 'auto',
};

const logoTextStyle = {
  fontWeight: 700,
  fontSize: '1.6rem',
  letterSpacing: '-0.02em',
  color: '#f8fafc',
  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  '@media (max-width: 768px)': {
    fontSize: '1.2rem',
  },
};

const footerStyle = {
  width: '100%',
  background: 'rgba(15, 23, 42, 0.95)',
  backdropFilter: 'blur(10px)',
  borderTop: '1px solid rgba(239, 68, 68, 0.2)',
  padding: '1.5rem 0',
  position: 'relative',
  zIndex: 10,
};

const footerContent = {
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 2rem',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    gap: '1.5rem',
    textAlign: 'center',
  },
};

const footerText = {
  color: '#cbd5e1',
  fontSize: '0.9rem',
  lineHeight: '1.5',
  marginBottom: '0.5rem',
  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontWeight: 400,
};

const footerLink = {
  color: '#ef4444',
  textDecoration: 'none',
  transition: 'opacity 0.3s ease',
  fontWeight: 600,
};

const mainContentStyle = {
  flex: 1,
  width: '100%',
  boxSizing: 'border-box',
  paddingTop: '90px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const appContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width: '100%',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
  overflow: 'hidden',
};

const unreadBadgeStyle = {
  position: 'absolute',
  top: '-6px',
  right: '-6px',
  backgroundColor: '#ef4444',
  color: '#fff',
  borderRadius: '50%',
  padding: '3px 6px',
  fontSize: '10px',
  minWidth: '18px',
  textAlign: 'center',
  fontWeight: 'bold',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
};

const profileButtonContainerStyle = {
  position: 'relative',
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
  const [unreadCount, setUnreadCount] = useState(0);

  // Load unread count periodically
  useEffect(() => {
    if (user) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  // Check if user is a player
  // Default to Coach if userType is undefined (for existing users)
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
    try {
      await signOut();
      // After successful sign out, navigate to main landing page
      setCurrentView('main');
      window.history.pushState({}, '', '/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleForPlayersClick = () => {
    setCurrentView('forplayers');
    window.history.pushState({}, '', '/forplayers');
  };

  const handleForCoachesClick = () => {
    setCurrentView('main');
    window.history.pushState({}, '', '/');
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
    // Default to Coach if userType is undefined (for existing users)
    const userType = user?.user_metadata?.userType;
    if (userType === 'Player') {
      mainContent = <PlayerProfile onBack={handleBack} />;
    } else {
      // Default to Coach profile for undefined userType or Coach
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
                <div style={profileButtonContainerStyle}>
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
                  {unreadCount > 0 && (
                    <span style={unreadBadgeStyle}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
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
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={footerText}>
              © 2025 College Soccer Recruitment Portal. All rights reserved.
              <br />
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
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* Only show navigation button for logged-out users */}
            {!user && (
              <button 
                onClick={currentView === 'forplayers' ? handleForCoachesClick : handleForPlayersClick}
                style={{
                  ...footerLink,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  padding: '0.25rem 0',
                  margin: 0
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                {currentView === 'forplayers' ? 'For Coaches' : 'For Players'}
              </button>
            )}
          </div>
          <div style={{ flex: 1, display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
            <a 
              href="https://x.com/CSTransfer" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                ...footerLink,
                fontSize: '1.5rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.8';
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              𝕏
            </a>
            <a 
              href="https://www.linkedin.com/company/college-soccer-transfer-portal/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                ...footerLink,
                fontSize: '1.5rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.8';
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              in
            </a>
          </div>
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
