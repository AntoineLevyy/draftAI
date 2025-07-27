import React, { useState } from 'react';
import { apiBaseUrl } from './config';

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
};

const modalContentStyle = {
  background: 'rgba(30, 41, 59, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  padding: '2.5rem 2rem',
  maxWidth: 400,
  width: '95%',
  boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
  color: '#f8fafc',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  boxSizing: 'border-box',
};

const titleStyle = {
  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
  fontWeight: 700,
  marginBottom: '2.5rem',
  textAlign: 'center',
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  letterSpacing: '-0.02em',
};

const optionsContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '2rem',
};

const optionCard = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: 280,
  background: 'rgba(15, 23, 42, 0.8)',
  borderRadius: '16px',
  padding: '2rem 1.5rem',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  position: 'relative',
  overflow: 'hidden',
};

const optionTitle = {
  fontSize: '1.2rem',
  fontWeight: 600,
  color: '#f8fafc',
  marginBottom: '0.8rem',
  letterSpacing: '-0.01em',
  textAlign: 'center',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const priceStyle = {
  fontSize: '1.8rem',
  fontWeight: 700,
  color: '#ef4444',
  marginBottom: '0.8rem',
  textAlign: 'center',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  letterSpacing: '-0.02em',
};

const descStyle = {
  fontSize: '0.95rem',
  color: '#94a3b8',
  lineHeight: '1.5',
  marginBottom: '0',
  textAlign: 'center',
  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const buttonStyle = {
  width: '100%',
  padding: '1rem 0',
  borderRadius: '50px',
  border: 'none',
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  color: 'white',
  fontWeight: 600,
  fontSize: '0.95rem',
  letterSpacing: '0.02em',
  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  outline: 'none',
  marginBottom: '1.5rem',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const backStyle = {
  marginTop: '1.2rem',
  color: '#4f8cff',
  background: 'none',
  border: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  cursor: 'pointer',
  textDecoration: 'underline',
};

const errorStyle = {
  color: '#ef4444',
  fontSize: '0.95rem',
  marginTop: '1rem',
  textAlign: 'center',
};

const memberships = [
  {
    key: 'yearly',
    title: 'Yearly',
    price: '$1,800/yr',
    desc: '',
  },
];

function MembershipOptions({ setMode, onClose }) {
  const [hovered, setHovered] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelect = async (membership) => {
    setLoading(true);
    setError('');
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
        setError(data.error || 'Could not start checkout.');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalContentStyle}>
        <h2 style={titleStyle}>Choose your membership</h2>
        <div style={optionsContainer}>
          {memberships.map(option => (
            <div
              key={option.key}
              style={optionCard}
              onClick={() => !loading && handleSelect(option.key)}
            >
              <div style={optionTitle}>{option.title}</div>
              <div style={priceStyle}>{option.price}</div>
            </div>
          ))}
        </div>
        {loading && <div style={{ marginTop: '1.5rem', color: '#10b981', fontWeight: 600 }}>Redirecting to secure checkout…</div>}
        {error && <div style={errorStyle}>{error}</div>}
        <button style={backStyle} onClick={() => setMode('signin')} disabled={loading}>
          Already a member? Sign in
        </button>
        <button style={{ ...backStyle, color: '#64748b', marginTop: 0 }} onClick={onClose} disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default MembershipOptions; 