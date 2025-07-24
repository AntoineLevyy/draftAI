import React from 'react';
import { apiBaseUrl } from './config';

const bgStyle = {
  width: '100%',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #18181b 0%, #111 100%)', // black gradient
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '0',
  overflow: 'hidden',
};

const heroSection = {
  width: '100%',
  minHeight: '60vh', // reduced height
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start', // top align
  padding: '5.5rem 1rem 0 1rem', // more top padding
  boxSizing: 'border-box',
  background: 'none',
};

const heroHeader = {
  fontWeight: 900,
  fontSize: '3.5rem',
  marginBottom: '2.2rem',
  letterSpacing: '-1px',
  textAlign: 'center',
  lineHeight: 1.08,
  maxWidth: 900,
  color: '#fff',
  textShadow: '0 2px 16px rgba(0,0,0,0.18)',
};

const heroHighlight = {
  background: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  display: 'inline-block',
};

const heroSubheader = {
  fontSize: '1.5rem',
  color: '#fff',
  marginBottom: '3rem',
  fontWeight: 400,
  lineHeight: '1.4',
  textAlign: 'center',
  maxWidth: 700,
  textShadow: '0 2px 16px rgba(0,0,0,0.18)',
};

const ctaButton = {
  padding: '1rem 2.5rem',
  borderRadius: '2rem',
  border: 'none',
  background: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)',
  color: 'white',
  fontWeight: 800,
  fontSize: '1.15rem',
  cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(185,28,28,0.18)',
  transition: 'all 0.2s ease',
  outline: 'none',
  letterSpacing: '0.01em',
  marginBottom: '1.2rem',
};

const featuresSection = {
  width: '100%',
  maxWidth: 1100,
  display: 'flex',
  flexDirection: 'row',
  gap: '2.5rem',
  margin: '0 auto',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '40vh',
  boxSizing: 'border-box',
  padding: '1.5rem 0 2rem 0',
};

const featureCard = {
  width: 320,
  minWidth: 320,
  maxWidth: 320,
  minHeight: 340,
  height: 340,
  background: 'rgba(24,24,27,0.95)', // dark card
  borderRadius: '24px',
  padding: '2.5rem 2rem',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: '2px solid #b91c1c',
  transition: 'box-shadow 0.2s',
  boxSizing: 'border-box',
};

const featureImage = {
  width: 80,
  height: 80,
  borderRadius: '16px',
  background: 'rgba(185,28,28,0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2.5rem',
  marginBottom: '1.5rem',
  color: '#b91c1c',
};

const featureTitle = {
  fontSize: '1.35rem',
  fontWeight: 700,
  color: '#fff',
  marginBottom: '0.5rem',
  textAlign: 'center',
};

const featureSubtitle = {
  fontSize: '1.05rem',
  color: '#fff',
  lineHeight: '1.5',
  textAlign: 'center',
  marginBottom: 0,
  opacity: 0.85,
};

// Responsive: stack features vertically on small screens
const featuresSectionResponsive = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2.5rem',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto',
  width: '100%',
  maxWidth: 500,
  minHeight: '40vh', // even less
  boxSizing: 'border-box',
  padding: '1.5rem 0 2rem 0', // even less
};

const featuresTitle = {
  fontWeight: 900,
  fontSize: '2.6rem',
  textAlign: 'center',
  marginBottom: '2.2rem',
  letterSpacing: '-0.5px',
  background: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  display: 'inline-block',
};

// Pricing section style
const pricingSection = {
  width: '100%',
  maxWidth: 520,
  margin: '4.5rem auto 0 auto',
  background: 'rgba(24,24,27,0.95)', // dark background
  borderRadius: 18,
  boxShadow: '0 2px 24px rgba(0,0,0,0.18)',
  padding: '2.7rem 2.5rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: 'none',
  marginBottom: '5rem', // more space before footer
};

const pricingTitle = {
  fontWeight: 800,
  fontSize: '2rem',
  marginBottom: '2.5rem',
  background: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  textAlign: 'center',
};

const pricingCard = {
  borderRadius: '18px',
  background: 'rgba(24,24,27,0.98)', // dark card
  boxShadow: '0 4px 32px rgba(0,0,0,0.13)',
  padding: '2.2rem 3.5rem',
  minWidth: 220,
  minHeight: 120,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '1.2rem',
  color: '#fff',
  marginBottom: 0,
  boxSizing: 'border-box',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s, border 0.2s',
  border: '1.5px solid #b91c1c',
};

const pricingHighlight = {
  color: '#ef4444',
  fontWeight: 800,
  fontSize: '2.2rem',
  marginBottom: 0,
};

const pricingButton = {
  marginTop: 24,
  padding: '0.9rem 2.5rem',
  borderRadius: '2rem',
  border: 'none',
  background: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)',
  color: 'white',
  fontWeight: 800,
  fontSize: '1.15rem',
  letterSpacing: 1,
  boxShadow: '0 4px 16px rgba(185,28,28,0.18)',
  cursor: 'pointer',
  transition: 'background 0.2s, transform 0.1s',
  outline: 'none',
  display: 'block',
};

function MainLandingPage({ onApplyFilters }) {
  const handleCtaClick = () => {
    // Go directly to college landing page
    if (onApplyFilters) onApplyFilters(null);
  };

  // Responsive: use window width to switch layout
  const [isMobile, setIsMobile] = React.useState(false);
  const [pricingLoading, setPricingLoading] = React.useState(''); // '' | 'monthly' | 'yearly'
  const [pricingError, setPricingError] = React.useState('');
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 800);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handlePricingClick = async (membership) => {
    setPricingLoading(membership);
    setPricingError('');
    try {
      const res = await fetch(`${apiBaseUrl}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membership }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPricingError(data.error || 'Could not start checkout.');
      }
    } catch (e) {
      setPricingError('Network error. Please try again.');
    } finally {
      setPricingLoading('');
    }
  };

  return (
    <div style={bgStyle}>
      {/* Hero Section - top aligned, with space for video below */}
      <section style={heroSection}>
        <h1 style={heroHeader}>
          Find your next college player<br />
          <span style={heroHighlight}>in seconds</span>
        </h1>
        <div style={heroSubheader}>
          For college coaches and scouts to easily identify and reach out to the players that fit their needs
        </div>
        <button style={ctaButton} onClick={handleCtaClick}>
          Try for free
        </button>
        {/* Embedded Vimeo Video */}
        <div style={{
          width: '100%',
          maxWidth: 900,
          aspectRatio: '16/9',
          margin: '2.5rem auto 0 auto',
          background: 'rgba(79,140,255,0.07)',
          borderRadius: '18px',
          boxShadow: '0 4px 24px rgba(79,140,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <iframe
            src="https://player.vimeo.com/video/1103822422?h=433d483fd4"
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: '18px', width: '100%', height: '100%' }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="DraftMe Demo"
          ></iframe>
        </div>
      </section>
      {/* Features Section - horizontal on desktop, vertical on mobile, always centered */}
      <section style={{
        ...isMobile ? featuresSectionResponsive : featuresSection,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: '4.5rem', // more vertical space between hero and features
        minHeight: undefined,
        paddingTop: 0,
      }}>
        <div style={featuresTitle}>Why draftme?</div>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '2.5rem',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto',
        }}>
          <div style={featureCard}>
            <div style={featureImage}>📊</div>
            <div style={featureTitle}>All data in one place</div>
            <div style={featureSubtitle}>
              Stop switching between transfer portals, stats sites, youtube and more
            </div>
          </div>
          <div style={featureCard}>
            <div style={featureImage}>🔎</div>
            <div style={featureTitle}>Easy Search</div>
            <div style={featureSubtitle}>
              Search for the player you need by filtering and smart search.
            </div>
          </div>
          <div style={featureCard}>
            <div style={featureImage}>📁</div>
            <div style={featureTitle}>Tracking</div>
            <div style={featureSubtitle}>
              Save all of the players and conversations you're having inside draftme to keep track of your recruiting process.
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section id="pricing" style={pricingSection}>
        <h2 style={pricingTitle}>Pricing</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={pricingCard}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.18rem', marginBottom: 8 }}>Yearly</div>
            <div style={pricingHighlight}>$1,800/yr</div>
            <button
              style={pricingButton}
              onClick={() => handlePricingClick('yearly')}
              disabled={pricingLoading === 'yearly'}
            >
              {pricingLoading === 'yearly' ? 'Redirecting…' : 'Get Started'}
            </button>
            {pricingError && <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '1rem', marginTop: 8 }}>{pricingError}</div>}
          </div>
        </div>
      </section>
    </div>
  );
}

export default MainLandingPage; 