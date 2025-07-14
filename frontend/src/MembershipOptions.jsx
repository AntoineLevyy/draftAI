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

const modalStyle = {
  background: 'rgba(255, 255, 255, 0.97)',
  borderRadius: '20px',
  padding: '2.5rem 2rem',
  maxWidth: 420,
  width: '95%',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const titleStyle = {
  fontSize: '1.7rem',
  fontWeight: 800,
  marginBottom: '2rem',
  textAlign: 'center',
  background: 'linear-gradient(90deg, #10b981, #fbbf24 80%)',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
};

const optionsContainer = {
  display: 'flex',
  flexDirection: 'row',
  gap: '1.5rem',
  width: '100%',
  justifyContent: 'center',
  marginBottom: '2rem',
};

const optionCard = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: 150,
  flex: 1,
  maxWidth: 180,
  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(16,185,129,0.08) 100%)',
  borderRadius: '18px',
  padding: '1.5rem 1rem',
  border: '1.5px solid rgba(16,185,129,0.15)',
  cursor: 'pointer',
  transition: 'all 0.3s',
  boxShadow: '0 8px 24px rgba(16,185,129,0.07)',
  position: 'relative',
  overflow: 'hidden',
};

const optionCardHover = {
  transform: 'translateY(-6px) scale(1.04)',
  border: '2px solid #10b981',
  boxShadow: '0 16px 40px rgba(16,185,129,0.13)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(16,185,129,0.13) 100%)',
};

const optionTitle = {
  fontSize: '1.2rem',
  fontWeight: 700,
  color: '#374151',
  marginBottom: '0.5rem',
  letterSpacing: '-0.5px',
  textAlign: 'center',
};

const priceStyle = {
  fontSize: '1.5rem',
  fontWeight: 800,
  color: '#10b981',
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
  padding: '0.75rem 1rem',
  borderRadius: '12px',
  border: 'none',
  background: 'linear-gradient(90deg, #10b981 0%, #fbbf24 100%)',
  color: 'white',
  fontWeight: 700,
  fontSize: '1rem',
  cursor: 'pointer',
  marginTop: '2rem',
  transition: 'all 0.2s',
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
    key: 'monthly',
    title: 'Monthly',
    price: '$200/mo',
    desc: '',
  },
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
      <div style={modalStyle}>
        <h2 style={titleStyle}>Choose your membership</h2>
        <div style={optionsContainer}>
          {memberships.map(option => (
            <div
              key={option.key}
              style={{
                ...optionCard,
                ...(hovered === option.key ? optionCardHover : {}),
                opacity: loading ? 0.7 : 1,
                pointerEvents: loading ? 'none' : 'auto',
              }}
              onMouseEnter={() => setHovered(option.key)}
              onMouseLeave={() => setHovered(null)}
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