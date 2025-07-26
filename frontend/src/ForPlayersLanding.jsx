import React from 'react';

const heroSection = {
  width: '100%',
  maxWidth: 900,
  margin: '0 auto',
  padding: '5rem 1rem 3rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
};

const heroHeader = {
  fontWeight: 900,
  fontSize: '3.2rem',
  color: '#fff',
  marginBottom: '1.2rem',
  letterSpacing: '-1.5px',
  lineHeight: 1.1,
};

const heroSubheader = {
  fontSize: '1.25rem',
  color: '#9ca3af',
  marginBottom: '2.5rem',
  fontWeight: 500,
  lineHeight: 1.5,
  maxWidth: 600,
};

const ctaButton = {
  background: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '2rem',
  padding: '1.1rem 3.2rem',
  fontSize: '1.25rem',
  fontWeight: 800,
  letterSpacing: 1,
  boxShadow: '0 4px 16px rgba(185,28,28,0.18)',
  cursor: 'pointer',
  transition: 'background 0.2s, transform 0.1s',
  outline: 'none',
  marginTop: '1.5rem',
};

const ForPlayersLanding = ({ onClaimClick }) => (
  <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #18181b 0%, #111 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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