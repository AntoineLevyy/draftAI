import React, { useState } from 'react';
import { supabase } from './supabase';
import { migratePendingClaims } from './services/claimService';

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  padding: '20px',
};

const modalStyle = {
  background: 'rgba(30, 41, 59, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  padding: '2.5rem 2rem',
  maxWidth: '450px',
  width: '100%',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
};

const titleStyle = {
  color: '#f8fafc',
  fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
  fontWeight: '700',
  textAlign: 'center',
  marginBottom: '0.5rem',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  letterSpacing: '-0.02em',
};

const subtitleStyle = {
  color: '#94a3b8',
  fontSize: '0.95rem',
  textAlign: 'center',
  marginBottom: '2rem',
  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  lineHeight: '1.5',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.2rem',
};

const inputStyle = {
  padding: '0.9rem 1.2rem',
  borderRadius: '12px',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  backgroundColor: 'rgba(15, 23, 42, 0.8)',
  color: '#f8fafc',
  fontSize: '0.95rem',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const buttonStyle = {
  padding: '1rem 2rem',
  borderRadius: '50px',
  border: 'none',
  fontSize: '0.95rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  color: '#fff',
  marginTop: '0.5rem',
  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  letterSpacing: '0.02em',
  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
};

const errorStyle = {
  color: '#ef4444',
  fontSize: '0.85rem',
  textAlign: 'center',
  marginTop: '0.5rem',
  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontWeight: '500',
};

const successStyle = {
  color: '#10b981',
  fontSize: '0.85rem',
  textAlign: 'center',
  marginTop: '0.5rem',
  fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontWeight: '500',
};

const PlayerSignupModal = ({ isOpen, onClose, onSuccess, claimData }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            userType: 'Player',
            name: claimData?.name || '',
            team: claimData?.currentSchool || '',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        throw authError;
      }

      console.log('Auth data:', authData);
      console.log('User email confirmed:', authData.user?.email_confirmed_at);
      console.log('Session:', authData.session);

      // Always call onSuccess, even if email is not confirmed
      // The backend will handle saving to pending_claims if user is not confirmed
      setSuccess('Account created successfully!');
      
      // Call onSuccess with the user data
      if (onSuccess) {
        onSuccess(authData.user, claimData);
      }
      
      // If email is confirmed, migrate any pending claims
      if (authData.user && authData.user.email_confirmed_at) {
        try {
          await migratePendingClaims(authData.user.id, email);
          console.log('Successfully migrated pending claims');
        } catch (migrationError) {
          console.warn('Failed to migrate pending claims:', migrationError);
          // Don't fail the signup if migration fails
        }
      }

      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>Create Player Account</h2>
        <p style={subtitleStyle}>
          Complete your profile claim by creating your player account
        </p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={inputStyle}
            required
          />

          <button 
            type="submit" 
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Player Account'}
          </button>

          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default PlayerSignupModal; 