import React from 'react';

const heroSection = {
  width: '100%',
  maxWidth: 1000,
  margin: '0 auto',
  padding: '6rem 2rem 4rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
};

const heroHeader = {
  fontWeight: 700,
  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
  color: '#f8fafc',
  marginBottom: '1.5rem',
  letterSpacing: '-0.02em',
  lineHeight: 1.1,
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  textShadow: '0 4px 20px rgba(0,0,0,0.3)',
};

const heroSubheader = {
  fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
  color: '#cbd5e1',
  marginBottom: '3rem',
  fontWeight: 400,
  lineHeight: '1.6',
  maxWidth: 700,
  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
};

const ctaButton = {
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '50px',
  padding: '1.2rem 3rem',
  fontSize: '1.1rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
  boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  outline: 'none',
  marginTop: '1.5rem',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const ForPlayersLanding = ({ onClaimClick }) => (
  <div style={{ 
    minHeight: '100vh', 
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'relative',
  }}>
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.05) 0%, transparent 50%)',
      pointerEvents: 'none',
    }}></div>
    <section style={heroSection}>
      <h1 style={heroHeader}>Get recruited by your dream college</h1>
      <div style={heroSubheader}>
        Showcase your profile to 1000's of coaches and find your next offer
      </div>
      <button style={ctaButton} onClick={onClaimClick}>
        Claim Profile
      </button>
    </section>
  </div>
);

export default ForPlayersLanding; 