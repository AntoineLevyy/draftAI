import React, { useState } from 'react';
import { apiBaseUrl } from './config';

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
};

const modalContentStyle = {
  background: 'rgba(24,24,27,0.98)', // dark modal
  borderRadius: 18,
  padding: '2rem 1.2rem',
  maxWidth: 340,
  width: '95%',
  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: '1.5px solid #b91c1c',
  boxSizing: 'border-box',
};

const titleStyle = {
  fontSize: '1.7rem',
  fontWeight: 800,
  marginBottom: '2rem',
  textAlign: 'center',
  background: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
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
  maxWidth: 220,
  background: 'rgba(24,24,27,0.98)',
  borderRadius: '18px',
  padding: '1.5rem 1rem',
  border: '1.5px solid #b91c1c',
  cursor: 'pointer',
  transition: 'all 0.3s',
  boxShadow: '0 4px 16px rgba(185,28,28,0.10)',
  position: 'relative',
  overflow: 'hidden',
};

const optionTitle = {
  fontSize: '1.2rem',
  fontWeight: 700,
  color: '#fff',
  marginBottom: '0.5rem',
  letterSpacing: '-0.5px',
  textAlign: 'center',
};

const priceStyle = {
  fontSize: '1.5rem',
  fontWeight: 800,
  color: '#ef4444',
  marginBottom: '0.5rem',
  textAlign: 'center',
};

const descStyle = {
  fontSize: '0.98rem',
  color: '#64748b',
  lineHeight: '1.4',
  marginBottom: '0',
  textAlign: 'center',
};

const buttonStyle = {
  width: '100%',
  padding: '0.9rem 0',
  borderRadius: '2rem',
  border: 'none',
  background: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)',
  color: 'white',
  fontWeight: 800,
  fontSize: '1.1rem',
  letterSpacing: 1,
  boxShadow: '0 4px 16px rgba(185,28,28,0.18)',
  cursor: 'pointer',
  transition: 'background 0.2s, transform 0.1s',
  outline: 'none',
  marginBottom: '1.2rem',
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