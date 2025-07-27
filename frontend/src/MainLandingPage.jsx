import React, { useState } from 'react';
import { apiBaseUrl } from './config';
import { useAuth } from './AuthContext';

// Import images
import naiaLogo from '../assets/images/naia_logo.svg';
import ncaaLogo from '../assets/images/ncaa_logo.png';
import njcaaLogo from '../assets/images/njcaa_logo.png';
import viewsImg from '../assets/images/views.png';
import filtersImg from '../assets/images/filters.png';
import messagesImg from '../assets/images/messages.png';
import savedPlayersImg from '../assets/images/saved_players.png';

const bgStyle = {
  width: '100%',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '0',
  overflow: 'hidden',
  position: 'relative',
};

// Add subtle animated background elements
const bgPattern = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.05) 0%, transparent 50%)',
  pointerEvents: 'none',
};

const heroSection = {
  width: '100%',
  minHeight: '70vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6rem 2rem 4rem 2rem',
  boxSizing: 'border-box',
  background: 'none',
  position: 'relative',
  zIndex: 2,
  '@media (max-width: 768px)': {
    padding: '4rem 1rem 2rem 1rem',
    minHeight: '60vh',
  },
};

const heroHeader = {
  fontWeight: 700,
  fontSize: 'clamp(2.5rem, 5vw, 4.4rem)',
  marginBottom: '1.5rem',
  letterSpacing: '-0.03em',
  textAlign: 'center',
  lineHeight: 1.06,
  maxWidth: 1000,
  color: '#f8fafc',
  textShadow: '0 4px 20px rgba(0,0,0,0.3)',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const heroHighlight = {
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  display: 'inline-block',
  position: 'relative',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const heroSubheader = {
  fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
  color: '#cbd5e1',
  marginBottom: '3.5rem',
  fontWeight: 400,
  lineHeight: '1.6',
  textAlign: 'center',
  maxWidth: 800,
  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  letterSpacing: '0.005em',
};

const ctaButton = {
  padding: '1.2rem 3rem',
  borderRadius: '50px',
  border: 'none',
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  color: 'white',
  fontWeight: 700,
  fontSize: '1.1rem',
  cursor: 'pointer',
  boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0,0,0,0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  outline: 'none',
  letterSpacing: '0.02em',
  marginBottom: '1.5rem',
  position: 'relative',
  overflow: 'hidden',
};

const ctaButtonHover = {
  transform: 'translateY(-2px)',
  boxShadow: '0 12px 35px rgba(239, 68, 68, 0.4), 0 4px 12px rgba(0,0,0,0.15)',
};

const featuresSection = {
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto',
  padding: '6rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  zIndex: 2,
  '@media (max-width: 768px)': {
    padding: '4rem 1rem',
  },
};

const featuresTitle = {
  fontWeight: 700,
  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
  textAlign: 'center',
  marginBottom: '1rem',
  letterSpacing: '-0.03em',
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  display: 'inline-block',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const featuresSubtitle = {
  fontSize: '1.1rem',
  color: '#94a3b8',
  textAlign: 'center',
  marginBottom: '4rem',
  maxWidth: 600,
  lineHeight: '1.6',
  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontWeight: 400,
  letterSpacing: '0.005em',
};

const featuresGrid = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2.5rem',
  width: '100%',
  maxWidth: 800,
  alignItems: 'center',
};

const featureCard = {
  background: 'rgba(30, 41, 59, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  padding: '2rem',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxSizing: 'border-box',
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  minHeight: '300px',
  gap: '1rem',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    padding: '1.5rem',
    minHeight: 'auto',
    gap: '1.5rem',
  },
};

const featureCardHover = {
  transform: 'translateY(-8px)',
  boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2)',
  border: '1px solid rgba(239, 68, 68, 0.4)',
};

const featureImage = {
  display: 'flex',
  flexDirection: 'row',
  gap: '1rem',
  flexShrink: 0,
  width: 400,
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
  '@media (max-width: 768px)': {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
  },
};

const featureTitle = {
  fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
  fontWeight: 700,
  color: '#f8fafc',
  marginBottom: '1rem',
  textAlign: 'left',
  letterSpacing: '-0.02em',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const featureSubtitle = {
  fontSize: '0.98rem',
  color: '#cbd5e1',
  lineHeight: '1.6',
  textAlign: 'center',
  marginBottom: 0,
  opacity: 0.9,
  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontWeight: 400,
  letterSpacing: '0.005em',
};

const pricingSection = {
  width: '100%',
  maxWidth: 600,
  margin: '4rem auto 6rem auto',
  padding: '3rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  zIndex: 2,
  '@media (max-width: 768px)': {
    padding: '2rem 1rem',
    margin: '2rem auto 4rem auto',
  },
};

const pricingTitle = {
  fontWeight: 700,
  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
  textAlign: 'center',
  marginBottom: '1rem',
  letterSpacing: '-0.03em',
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  display: 'inline-block',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const pricingSubtitle = {
  fontSize: '1.02rem',
  color: '#94a3b8',
  textAlign: 'center',
  marginBottom: '2rem',
  maxWidth: 400,
  lineHeight: '1.6',
  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontWeight: 400,
  letterSpacing: '0.005em',
};

const pricingCard = {
  borderRadius: '20px',
  background: 'rgba(30, 41, 59, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)',
  padding: '2.5rem 2rem',
  minWidth: 280,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '1.1rem',
  color: '#f8fafc',
  marginBottom: '0',
  boxSizing: 'border-box',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  position: 'relative',
  overflow: 'hidden',
};

const pricingCardHover = {
  transform: 'translateY(-4px)',
  boxShadow: '0 16px 40px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
  border: '1px solid rgba(239, 68, 68, 0.4)',
};

const pricingHighlight = {
  color: '#ef4444',
  fontWeight: 800,
  fontSize: '2.5rem',
  marginBottom: '0.5rem',
  letterSpacing: '-0.02em',
};

const pricingPeriod = {
  color: '#94a3b8',
  fontSize: '1rem',
  marginBottom: '2rem',
  fontWeight: 500,
};

const pricingButton = {
  marginTop: '1rem',
  padding: '1rem 2.5rem',
  borderRadius: '50px',
  border: 'none',
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  color: 'white',
  fontWeight: 700,
  fontSize: '1rem',
  letterSpacing: '0.02em',
  boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0,0,0,0.1)',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  outline: 'none',
  display: 'block',
  position: 'relative',
  overflow: 'hidden',
};

const pricingButtonHover = {
  transform: 'translateY(-2px)',
  boxShadow: '0 12px 35px rgba(239, 68, 68, 0.4), 0 4px 12px rgba(0,0,0,0.15)',
};

const contactSection = {
  width: '100%',
  maxWidth: 800,
  margin: '4rem auto 6rem auto',
  padding: '3rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  zIndex: 2,
  '@media (max-width: 768px)': {
    padding: '2rem 1rem',
    margin: '2rem auto 4rem auto',
  },
};

const contactTitle = {
  fontWeight: 700,
  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
  textAlign: 'center',
  marginBottom: '1rem',
  letterSpacing: '-0.03em',
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  display: 'inline-block',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const contactSubtitle = {
  fontSize: '1.02rem',
  color: '#94a3b8',
  textAlign: 'center',
  marginBottom: '2rem',
  maxWidth: 400,
  lineHeight: '1.6',
  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontWeight: 400,
  letterSpacing: '0.005em',
};

const contactButton = {
  padding: '1.2rem 3rem',
  borderRadius: '50px',
  border: 'none',
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  color: 'white',
  fontWeight: 700,
  fontSize: '1.1rem',
  cursor: 'pointer',
  boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0,0,0,0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  outline: 'none',
  letterSpacing: '0.02em',
  marginBottom: '1.5rem',
  position: 'relative',
  overflow: 'hidden',
};

const contactButtonHover = {
  transform: 'translateY(-2px)',
  boxShadow: '0 12px 35px rgba(239, 68, 68, 0.4), 0 4px 12px rgba(0,0,0,0.15)',
};

const contactFormStyle = {
  width: '100%',
  maxWidth: 500,
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const contactInputStyle = {
  padding: '1rem 1.5rem',
  borderRadius: '12px',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  background: 'rgba(30, 41, 59, 0.8)',
  color: '#f8fafc',
  fontSize: '1rem',
  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  outline: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

const contactTextareaStyle = {
  ...contactInputStyle,
  minHeight: '120px',
  resize: 'vertical',
  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const contactSubmitButton = {
  padding: '1.2rem 3rem',
  borderRadius: '50px',
  border: 'none',
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  color: 'white',
  fontWeight: 700,
  fontSize: '1.1rem',
  cursor: 'pointer',
  boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0,0,0,0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  outline: 'none',
  letterSpacing: '0.02em',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const successMessage = {
  color: '#10b981',
  textAlign: 'center',
  fontSize: '1rem',
  fontWeight: 600,
  marginTop: '1rem',
  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const contactErrorMessage = {
  color: '#ef4444',
  textAlign: 'center',
  fontSize: '1rem',
  fontWeight: 600,
  marginTop: '1rem',
  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const errorMessage = {
  color: '#ef4444',
  fontWeight: 600,
  fontSize: '0.9rem',
  marginTop: '1rem',
  textAlign: 'center',
};

const imageModalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.9)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  cursor: 'pointer',
};

const imageModalContent = {
  maxWidth: '90vw',
  maxHeight: '90vh',
  objectFit: 'contain',
  borderRadius: '12px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
};

function MainLandingPage({ onApplyFilters }) {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = React.useState(false);
  const [pricingLoading, setPricingLoading] = React.useState('');
  const [pricingError, setPricingError] = React.useState('');
  const [hoveredCard, setHoveredCard] = React.useState(null);
  const [hoveredButton, setHoveredButton] = React.useState(null);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [contactForm, setContactForm] = React.useState({
    name: '',
    email: '',
    inquiry: ''
  });
  const [contactLoading, setContactLoading] = React.useState(false);
  const [contactSuccess, setContactSuccess] = React.useState(false);
  const [contactError, setContactError] = React.useState('');
  
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  
  const handleCtaClick = () => {
    const userType = user?.user_metadata?.userType;
    if (userType === 'Player') {
      alert('Players cannot access the coach portal. Please use the "For Players" section to claim your profile.');
      return;
    }
    if (onApplyFilters) onApplyFilters(null);
  };

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

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactError('');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          inquiry: contactForm.inquiry,
          to: 'antoine.levy27@gmail.com'
        }),
      });
      
      if (response.ok) {
        setContactSuccess(true);
        setContactForm({ name: '', email: '', inquiry: '' });
      } else {
        const error = await response.json();
        setContactError(error.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setContactError('Network error. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

  const features = [
    {
      id: 'transfers',
      title: 'Complete Player Database',
      leagueLogos: [naiaLogo, ncaaLogo, njcaaLogo],
      featureIcons: ['⚽', '📹', '🎓'],
      items: [
        'Players from all leagues: NCAA, NAIA, NJCAA, CCCAA',
        'Personal, athletic & academic details',
        'Highlight videos & game clips',
        'High School & International Players (WIP)'
      ]
    },
    {
      id: 'search',
      title: 'Advanced Search & Filters',
      images: [filtersImg, viewsImg],
      items: [
        'Find players based on specific criteria',
        'Discover new talent with ease'
      ]
    },
    {
      id: 'tracking',
      title: 'Recruiting Management',
      images: [savedPlayersImg, messagesImg],
      items: [
        'Save players you\'re interested in',
        'Message players directly',
        'Track your entire recruiting process'
      ]
    }
  ];

  return (
    <div style={bgStyle}>
      <div style={bgPattern}></div>
      
      {/* Hero Section */}
      <section style={heroSection}>
        <h1 style={heroHeader}>
          Find your next college player<br />
          <span style={heroHighlight}>in seconds</span>
        </h1>
        <div style={heroSubheader}>
          The only complete portal with comprehensive player information across NJCAA, NCAA, and NAIA leagues.
        </div>
        <button 
          style={{
            ...ctaButton,
            ...(hoveredButton === 'cta' ? ctaButtonHover : {})
          }} 
          onClick={handleCtaClick}
          onMouseEnter={() => setHoveredButton('cta')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          Start Free Trial
        </button>
      </section>

      {/* Features Section */}
      <section style={featuresSection}>
        <h2 style={featuresTitle}>All in One College Soccer Transfer Portal</h2>
        <p style={featuresSubtitle}>
          The most comprehensive transfer portal designed specifically for college coaches
        </p>
        <div style={featuresGrid}>
          {features.map((feature, index) => (
            <div 
              key={feature.id}
              style={{
                ...featureCard,
                ...(hoveredCard === feature.id ? featureCardHover : {})
              }}
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={featureTitle}>{feature.title}</h3>
                <ul style={{
                  ...featureSubtitle,
                  textAlign: 'left',
                  paddingLeft: '0',
                  margin: 0,
                  listStyle: 'none',
                }}>
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} style={{ marginBottom: itemIndex < feature.items.length - 1 ? '0.8rem' : 0, position: 'relative', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: '#ef4444', marginRight: '0.8rem', fontSize: '1.2rem', lineHeight: 1 }}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
                <div style={featureImage}>
                  {feature.id === 'transfers' ? (
                    <>
                      {/* League Logos Column */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        {feature.leagueLogos.map((logo, logoIndex) => (
                          <img
                            key={logoIndex}
                            src={logo}
                            alt=""
                            style={{
                              width: isMobile ? '60px' : '100px',
                              maxWidth: isMobile ? '60px' : '100px',
                              height: isMobile ? '60px' : '100px',
                              maxHeight: isMobile ? '60px' : '100px',
                              objectFit: 'contain',
                              borderRadius: '12px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.1)',
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                            onError={(e) => {
                              console.warn(`Failed to load logo: ${logo}`);
                              e.target.style.display = 'none';
                            }}
                            onClick={() => {
                              setSelectedImage(logo);
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.05)';
                              e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            }}
                          />
                        ))}
                      </div>
                      {/* Feature Icons Column */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        {feature.featureIcons.map((icon, iconIndex) => (
                          <div
                            key={iconIndex}
                            style={{
                              width: '100px',
                              height: '100px',
                              borderRadius: '12px',
                              background: 'rgba(30, 41, 59, 0.8)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: icon === '⚽' ? (isMobile ? '2rem' : '3rem') : (isMobile ? '1.5rem' : '2.5rem'),
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                            onClick={() => {
                              setSelectedImage(icon);
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.05)';
                              e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            }}
                          >
                            {icon}
            </div>
                        ))}
          </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                      {feature.images.map((image, imageIndex) => (
                        <img
                          key={imageIndex}
                          src={image}
                          alt=""
                          style={{
                            width: isMobile ? '280px' : '350px',
                            height: 'auto',
                            objectFit: 'contain',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                          onError={(e) => {
                            console.warn(`Failed to load image: ${image}`);
                            e.target.style.display = 'none';
                          }}
                          onClick={() => {
                            setSelectedImage(image);
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.05)';
                            e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                          }}
                        />
                      ))}
            </div>
                  )}
          </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section style={pricingSection}>
        <h2 style={pricingTitle}>Simple Pricing</h2>
        <p style={pricingSubtitle}>
          Get unlimited access to the most comprehensive transfer portal
        </p>
        <div 
          style={{
            ...pricingCard,
            ...(hoveredCard === 'pricing' ? pricingCardHover : {})
          }}
          onMouseEnter={() => setHoveredCard('pricing')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={pricingHighlight}>$1,800</div>
          <div style={pricingPeriod}>per year</div>
          <button
            style={{
              ...pricingButton,
              ...(hoveredButton === 'pricing' ? pricingButtonHover : {})
            }}
            onClick={() => handlePricingClick('yearly')}
            onMouseEnter={() => setHoveredButton('pricing')}
            onMouseLeave={() => setHoveredButton(null)}
            disabled={pricingLoading === 'yearly'}
          >
            {pricingLoading === 'yearly' ? 'Redirecting…' : 'Get Started Today'}
          </button>
          {pricingError && <div style={errorMessage}>{pricingError}</div>}
        </div>
      </section>

      {/* Contact Us Section */}
      <section style={contactSection}>
        <h2 style={contactTitle}>Contact Us</h2>
        <p style={contactSubtitle}>
          Have questions? We're here to help you find the perfect players for your team.
        </p>
        
        {contactSuccess ? (
          <div style={successMessage}>
            Thank you! Your message has been sent successfully. We'll get back to you soon.
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} style={contactFormStyle}>
            <input
              type="text"
              placeholder="Your Name"
              value={contactForm.name}
              onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
              style={contactInputStyle}
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={contactForm.email}
              onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
              style={contactInputStyle}
              required
            />
            <textarea
              placeholder="Your Message"
              value={contactForm.inquiry}
              onChange={(e) => setContactForm(prev => ({ ...prev, inquiry: e.target.value }))}
              style={contactTextareaStyle}
              required
            />
            <button
              type="submit"
              style={{
                ...contactSubmitButton,
                ...(hoveredButton === 'contact' ? contactButtonHover : {}),
                opacity: contactLoading ? 0.7 : 1,
                cursor: contactLoading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={() => !contactLoading && setHoveredButton('contact')}
              onMouseLeave={() => setHoveredButton(null)}
              disabled={contactLoading}
            >
              {contactLoading ? 'Sending...' : 'Send Message'}
            </button>
            {contactError && <div style={contactErrorMessage}>{contactError}</div>}
          </form>
        )}
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          style={imageModalOverlay}
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt=""
            style={imageModalContent}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default MainLandingPage; 