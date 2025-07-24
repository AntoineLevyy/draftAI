import React, { useState } from 'react'
import { useAuth } from './AuthContext'
import MembershipOptions from './MembershipOptions';

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.7)',
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalContentStyle = {
  background: 'rgba(24,24,27,0.98)', // dark modal
  borderRadius: 18,
  padding: '2rem 1.2rem', // reduced padding
  maxWidth: 340, // reduced max width
  width: '95%',
  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: '1.5px solid #b91c1c',
  boxSizing: 'border-box', // ensure padding is included in width
};

const modalTitleStyle = {
  fontWeight: 800,
  fontSize: '1.7rem',
  marginBottom: '1.5rem',
  background: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  textAlign: 'center',
};

const inputStyle = {
  width: '100%',
  maxWidth: '100%', // never overflow modal
  padding: '0.7rem 0.9rem', // reduced padding
  borderRadius: '8px', // slightly less round
  border: '2px solid #b91c1c',
  fontSize: '1rem',
  background: 'rgba(24,24,27,0.95)',
  color: '#fff',
  fontWeight: 500,
  outline: 'none',
  marginBottom: '1rem', // slightly less margin
  transition: 'all 0.2s ease',
  boxShadow: 'none',
  boxSizing: 'border-box', // ensure padding is included in width
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

const switchModeStyle = {
  color: '#ef4444',
  fontWeight: 600,
  fontSize: '1rem',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  marginTop: 8,
  textDecoration: 'underline',
};

// Google/social button style
const googleButtonStyle = {
  width: '100%',
  padding: '0.8rem 0',
  borderRadius: '2rem',
  border: '2px solid #b91c1c',
  background: 'rgba(24,24,27,0.95)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '1.05rem',
  letterSpacing: 1,
  boxShadow: 'none',
  cursor: 'pointer',
  transition: 'background 0.2s, border 0.2s',
  outline: 'none',
  marginBottom: '1.2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
};

const closeButtonStyle = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: '#64748b',
  padding: '0.5rem',
  borderRadius: '50%',
  transition: 'all 0.2s ease',
}

const errorStyle = {
  color: '#ef4444',
  fontSize: '0.875rem',
  marginBottom: '1rem',
  textAlign: 'center',
}

const successStyle = {
  color: '#10b981',
  fontSize: '0.875rem',
  marginBottom: '1rem',
  textAlign: 'center',
}

const LoginModal = ({ isOpen, onClose, mode = 'signin', setMode }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        onClose()
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        setSuccess('Check your email for a confirmation link!')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
      onClose()
    } catch (error) {
      setError(error.message)
    }
  }

  if (!isOpen) return null

  // Show membership options instead of sign-up form
  if (mode === 'signup') {
    return (
      <MembershipOptions setMode={setMode} onClose={onClose} />
    );
  }

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose}>
          ×
        </button>
        
        <h2 style={modalTitleStyle}>
          {mode === 'signin' ? 'Sign In' : 'Get Started'}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
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

          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}

          <button 
            type="submit" 
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? 'Loading...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        {/* Add sign up link for sign in mode */}
        {mode === 'signin' && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ color: '#64748b', fontSize: '0.95em' }}>
              Don't have an account?{' '}
              <a
                href="#"
                style={{ color: '#ef4444', textDecoration: 'underline', cursor: 'pointer' }}
                onClick={e => { e.preventDefault(); setError(''); setSuccess(''); setEmail(''); setPassword(''); setLoading(false); if (setMode) setMode('signup'); }}
              >
                Sign up here.
              </a>
            </span>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span style={{ color: '#64748b' }}>or</span>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          style={googleButtonStyle}
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  )
}

export default LoginModal 