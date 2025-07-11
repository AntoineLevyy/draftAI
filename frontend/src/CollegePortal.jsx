import React, { useState } from 'react';

const GENDERS = ['All', 'Female', 'Male'];
const STATES = [
  'All', 'Pennsylvania', 'California', 'Texas', 'New York', 'Florida', 'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'
  // Add more as needed
];
const POSITIONS = [
  'All', 'F', 'MF', 'D', 'GK'
  // Add more as needed
];

const COLUMN_MAP = [
  { key: 'name', label: 'Name' },
  { key: 'club', label: 'Club' },
  { key: 'position', label: 'Position' },
  { key: 'graduation_year', label: 'Graduation' },
  { key: 'committed', label: 'Committed' },
  { key: 'state', label: 'State' },
  { key: 'highlights', label: 'Highlights' },
  { key: 'contact_details', label: 'Contact Details' },
];

const selectStyle = {
  padding: '0.75rem 2.5rem 0.75rem 1.5rem',
  borderRadius: '0.75rem',
  border: '1px solid #ccc',
  fontSize: '1rem',
  background: `rgba(255,255,255,0.8) url('data:image/svg+xml;utf8,<svg fill="%236f6fff" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7.293 8.293a1 1 0 011.414 0L10 9.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z"/></svg>') no-repeat right 1rem center/1.2em auto`,
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  outline: 'none',
  minWidth: 160,
  margin: '0 0.5rem',
  cursor: 'pointer',
};

const labelStyle = {
  fontWeight: 600,
  marginBottom: 8,
  display: 'block',
  color: '#222',
};

const buttonStyle = {
  marginTop: 24,
  padding: '0.9rem 2.5rem',
  borderRadius: '2rem',
  border: 'none',
  background: 'linear-gradient(90deg, #4f8cff 0%, #6f6fff 100%)',
  color: 'white',
  fontWeight: 700,
  fontSize: '1.2rem',
  letterSpacing: 1,
  boxShadow: '0 4px 16px rgba(79,140,255,0.15)',
  cursor: 'pointer',
  transition: 'background 0.2s, transform 0.1s',
  outline: 'none',
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',
};

const backButtonStyle = {
  position: 'absolute',
  top: '2rem',
  left: '2rem',
  padding: '0.7rem 1.5rem',
  borderRadius: '2rem',
  border: 'none',
  background: 'linear-gradient(90deg, #6c757d 0%, #495057 100%)',
  color: 'white',
  fontWeight: 600,
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  outline: 'none',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const highlightsButtonStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  border: 'none',
  background: 'linear-gradient(90deg, #ff6b6b 0%, #ff8e8e 100%)',
  color: 'white',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  outline: 'none',
};

const contactButtonStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  border: 'none',
  background: 'linear-gradient(90deg, #28a745 0%, #20c997 100%)',
  color: 'white',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  outline: 'none',
};

const containerStyle = {
  minHeight: '100vh',
  width: '100vw',
  background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 50%, #e0f7fa 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
};

const cardStyle = {
  background: 'rgba(255,255,255,0.18)',
  borderRadius: 24,
  boxShadow: '0 2px 8px rgba(79,140,255,0.04)',
  padding: '2.5rem 2.5rem 2rem 2.5rem',
  maxWidth: 1400,
  width: '100%',
  margin: '2rem 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backdropFilter: 'blur(2px)',
};

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  background: 'white',
  borderRadius: 16,
  padding: '2rem',
  maxWidth: 600,
  width: '90%',
  maxHeight: '80vh',
  overflow: 'auto',
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
};

const videoItemStyle = {
  border: '1px solid #e0e7ff',
  borderRadius: 8,
  padding: '1rem',
  marginBottom: '1rem',
  background: '#f7faff',
};

const contactInfoStyle = {
  border: '1px solid #d4edda',
  borderRadius: 8,
  padding: '1rem',
  marginBottom: '1rem',
  background: '#d1ecf1',
  color: '#0c5460',
  whiteSpace: 'pre-wrap',
  lineHeight: '1.6',
};

function CollegePortal({ onBack }) {
  const [gender, setGender] = useState('All');
  const [state, setState] = useState('All');
  const [position, setPosition] = useState('All');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [error, setError] = useState(null);
  const [highlightsModal, setHighlightsModal] = useState({ show: false, player: null, videos: [], loading: false, error: null });
  const [contactModal, setContactModal] = useState({ show: false, player: null, contactInfo: '', loading: false, error: null });

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setPlayers([]);
    try {
      // Use the correct API endpoint and filter for college players
      const res = await fetch('/api/players');
      if (!res.ok) throw new Error('Failed to fetch players');
      const data = await res.json();
      
      // Filter for college players (NJCAA leagues)
      let collegePlayers = data.players.filter(player => 
        player.league && player.league.startsWith('NJCAA')
      );
      
      // Apply additional filters
      if (gender !== 'All') {
        collegePlayers = collegePlayers.filter(player => 
          player.gender === gender
        );
      }
      
      if (state !== 'All') {
        collegePlayers = collegePlayers.filter(player => 
          player.state === state
        );
      }
      
      if (position !== 'All') {
        collegePlayers = collegePlayers.filter(player => 
          player.position === position
        );
      }
      
      setPlayers(collegePlayers);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHighlights = async (player) => {
    setHighlightsModal({ show: true, player, videos: [], loading: true, error: null });
    try {
      const res = await fetch(`/api/youtube-highlights?player_name=${encodeURIComponent(player.name)}&club_name=${encodeURIComponent(player.club || '')}`);
      const data = await res.json();
      
      if (res.status === 429 && data.quota_exceeded) {
        setHighlightsModal(prev => ({ 
          ...prev, 
          videos: [], 
          loading: false, 
          error: 'YouTube API quota exceeded. Please try again later or contact support.' 
        }));
      } else if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch highlights');
      } else {
        setHighlightsModal(prev => ({ ...prev, videos: data.videos, loading: false, error: null }));
      }
    } catch (e) {
      setHighlightsModal(prev => ({ 
        ...prev, 
        videos: [], 
        loading: false, 
        error: e.message 
      }));
    }
  };

  const handleContactDetails = async (player) => {
    setContactModal({ show: true, player, contactInfo: '', loading: true, error: null });
    try {
      // For now, show a placeholder message since the coach contact API doesn't exist
      const contactInfo = `Contact information for ${player.name} from ${player.club || 'Unknown Club'} is not available at this time. Please contact the college directly for more information.`;
      setContactModal(prev => ({ ...prev, contactInfo, loading: false, error: null }));
    } catch (e) {
      setContactModal(prev => ({ 
        ...prev, 
        contactInfo: '', 
        loading: false, 
        error: e.message 
      }));
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    if (!a[sortKey] && !b[sortKey]) return 0;
    if (!a[sortKey]) return 1;
    if (!b[sortKey]) return -1;
    if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
    return 0;
  });

  const renderCell = (col, player) => {
    if (col.key === 'highlights') {
      return (
        <button 
          onClick={() => handleHighlights(player)}
          style={highlightsButtonStyle}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          Highlights
        </button>
      );
    }
    if (col.key === 'contact_details') {
      return (
        <button 
          onClick={() => handleContactDetails(player)}
          style={contactButtonStyle}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          Contact
        </button>
      );
    }
    return player[col.key];
  };

  return (
    <div style={containerStyle}>
      <button onClick={onBack} style={backButtonStyle}>
        ← Back to Portal
      </button>
      
      <div style={cardStyle}>
        <h1 style={{ fontWeight: 800, fontSize: '2.5rem', marginBottom: 32, background: 'linear-gradient(90deg, #4f8cff, #6f6fff)', WebkitBackgroundClip: 'text', color: 'transparent' }}>College Coaches Portal</h1>
        <div style={{ display: 'flex', gap: 24, marginBottom: 0, justifyContent: 'center', width: '100%' }}>
          <div>
            <label style={labelStyle}>Gender
              <select value={gender} onChange={e => setGender(e.target.value)} style={selectStyle}>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
          </div>
          <div>
            <label style={labelStyle}>State
              <select value={state} onChange={e => setState(e.target.value)} style={selectStyle}>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>
          <div>
            <label style={labelStyle}>Position
              <select value={position} onChange={e => setPosition(e.target.value)} style={selectStyle}>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>
        </div>
        <button onClick={handleSearch} disabled={loading} style={buttonStyle}>
          {loading ? 'Searching...' : 'Search Players'}
        </button>
        {error && <div style={{ color: 'red', marginBottom: 16, marginTop: 16 }}>{error}</div>}
        {players.length > 0 && (
          <div style={{ overflowX: 'auto', width: '100%', marginTop: 32 }}>
            <table border="0" cellPadding={8} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(79,140,255,0.07)' }}>
              <thead>
                <tr>
                  {COLUMN_MAP.map(col => (
                    <th key={col.key} style={{ cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', padding: '1rem 1rem', background: 'linear-gradient(90deg, #e0e7ff, #e0f7fa)', color: '#333', borderBottom: '2px solid #e0e7ff' }} onClick={() => handleSort(col.key)}>
                      {col.label}
                      {sortKey === col.key ? (sortAsc ? ' ▲' : ' ▼') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#f7faff' : 'white' }}>
                    {COLUMN_MAP.map(col => (
                      <td key={col.key} style={{ padding: '1.2rem 1rem', fontSize: '1rem', color: '#222', lineHeight: '1.4' }}>
                        {renderCell(col, player)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Highlights Modal */}
      {highlightsModal.show && (
        <div style={modalStyle} onClick={() => setHighlightsModal({ show: false, player: null, videos: [], loading: false, error: null })}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1rem', color: '#333' }}>
              🎥 Highlights for {highlightsModal.player?.name}
            </h2>
            {highlightsModal.loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading highlights...</div>
            ) : highlightsModal.videos.length > 0 ? (
              <div>
                {highlightsModal.videos.map((video, index) => (
                  <div key={index} style={videoItemStyle}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                      <a href={video.video_url} target="_blank" rel="noopener noreferrer" style={{ color: '#4f8cff', textDecoration: 'none' }}>
                        {video.title}
                      </a>
                    </h3>
                    <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>
                       Channel: {video.channel}
                    </p>
                    <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>
                      📅 Published: {video.published_at}
                    </p>
                  </div>
                ))}
              </div>
            ) : highlightsModal.error ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545', background: '#f8d7da', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
                <strong>Error:</strong> {highlightsModal.error}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                No highlights found for this player.
              </div>
            )}
            <button 
              onClick={() => setHighlightsModal({ show: false, player: null, videos: [], loading: false, error: null })}
              style={{ 
                ...buttonStyle, 
                marginTop: '1rem',
                background: 'linear-gradient(90deg, #6c757d 0%, #495057 100%)',
                fontSize: '1rem',
                padding: '0.7rem 1.5rem'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Contact Details Modal */}
      {contactModal.show && (
        <div style={modalStyle} onClick={() => setContactModal({ show: false, player: null, contactInfo: '', loading: false, error: null })}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1rem', color: '#333' }}>
              📧 Coach Contact for {contactModal.player?.club}
            </h2>
            {contactModal.loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Finding coach contact details...</div>
            ) : contactModal.contactInfo ? (
              <div style={contactInfoStyle}>
                {contactModal.contactInfo.split('**').map((part, index) => 
                  index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                )}
              </div>
            ) : contactModal.error ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545', background: '#f8d7da', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
                <strong>Error:</strong> {contactModal.error}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                No contact details found for this team.
              </div>
            )}
            <button 
              onClick={() => setContactModal({ show: false, player: null, contactInfo: '', loading: false, error: null })}
              style={{ 
                ...buttonStyle, 
                marginTop: '1rem',
                background: 'linear-gradient(90deg, #6c757d 0%, #495057 100%)',
                fontSize: '1rem',
                padding: '0.7rem 1.5rem'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollegePortal;
