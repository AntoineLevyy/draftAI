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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  padding: '20px',
};

const modalStyle = {
  background: 'linear-gradient(135deg, #18181b 0%, #111 100%)',
  borderRadius: '16px',
  padding: '32px',
  maxWidth: '400px',
  width: '100%',
  border: '2px solid #b91c1c',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
};

const titleStyle = {
  color: '#fff',
  fontSize: '1.5rem',
  fontWeight: '700',
  textAlign: 'center',
  marginBottom: '8px',
};

const subtitleStyle = {
  color: '#9ca3af',
  fontSize: '0.9rem',
  textAlign: 'center',
  marginBottom: '32px',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const inputStyle = {
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #374151',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  color: '#fff',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease',
};

const buttonStyle = {
  padding: '12px 24px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  background: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)',
  color: '#fff',
  marginTop: '8px',
};

const errorStyle = {
  color: '#ef4444',
  fontSize: '0.8rem',
  textAlign: 'center',
  marginTop: '8px',
};

const successStyle = {
  color: '#10b981',
  fontSize: '0.8rem',
  textAlign: 'center',
  marginTop: '8px',
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