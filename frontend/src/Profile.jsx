import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { getSavedPlayers, unsavePlayer } from './services/saveService';
import { supabase } from './supabase';
import './USLPlayerCards.css';
import CollegePlayerCard from './CollegePlayerCards';
import PlayerDetailModalCard from './PlayerDetailModalCard';

const Profile = ({ onBack }) => {
  const { user, signOut } = useAuth();
  const [savedPlayers, setSavedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUnsaveModal, setShowUnsaveModal] = useState(false);
  const [playerToUnsave, setPlayerToUnsave] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState(null);
  const [tab, setTab] = useState('profile'); // 'profile' or 'saved'
  const [userProfile, setUserProfile] = useState({
    userType: 'Coach',
    name: '',
    team: '',
    email: user?.email || '',
    subscription: 'Yearly ($1,800/yr)'
  });
  const [editProfile, setEditProfile] = useState({ name: '', team: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    loadSavedPlayers();
    loadUserProfile();
  }, []);

  const loadSavedPlayers = async () => {
    try {
      const players = await getSavedPlayers();
      setSavedPlayers(players);
    } catch (error) {
      console.error('Error loading saved players:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      if (!user) return;
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      }
      if (profile) {
        setUserProfile({
          userType: profile.user_type || 'Coach',
          name: profile.name || user?.user_metadata?.full_name || 'Not set',
          team: profile.team || 'Not set',
          email: profile.email || user?.email || '',
          subscription: profile.subscription || 'Yearly ($1,800/yr)'
        });
        setEditProfile({
          name: profile.name || '',
          team: profile.team || ''
        });
      } else {
        setUserProfile({
          userType: 'Coach',
          name: user?.user_metadata?.full_name || 'Not set',
          team: 'Not set',
          email: user?.email || '',
          subscription: 'Yearly ($1,800/yr)'
        });
        setEditProfile({ name: '', team: '' });
        await supabase.from('user_profiles').insert({
          user_id: user.id,
          user_type: 'Coach',
          name: user?.user_metadata?.full_name || 'Not set',
          team: 'Not set',
          email: user?.email || '',
          subscription: 'Yearly ($1,800/yr)'
        });
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setUserProfile({
        userType: 'Coach',
        name: user?.user_metadata?.full_name || 'Not set',
        team: 'Not set',
        email: user?.email || '',
        subscription: 'Yearly ($1,800/yr)'
      });
      setEditProfile({ name: '', team: '' });
    }
  };

  const handleUnsaveClick = (player) => {
    setPlayerToUnsave(player);
    setShowUnsaveModal(true);
  };

  const confirmUnsave = async () => {
    try {
      const playerForUnsave = {
        ...playerToUnsave,
        playerId: playerToUnsave.player_id || playerToUnsave.playerId
      };
      await unsavePlayer(playerForUnsave);
      setSavedPlayers(prev => prev.filter(p => p.player_id !== playerToUnsave.player_id));
      setShowUnsaveModal(false);
      setPlayerToUnsave(null);
      setShowPlayerModal(false);
    } catch (error) {
      console.error('Error unsaving player:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      if (onBack) onBack();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Memoize the processed saved players to prevent unnecessary re-renders
  const processedSavedPlayers = useMemo(() => {
    return savedPlayers.map((savedPlayer) => {
      const player = savedPlayer.player_data || {};
      return {
        id: savedPlayer.id,
        player_id: savedPlayer.player_id,
        playerName: player.name || '-',
        club: player.team || player.currentSchool || '-',
        league: player.league || player.division || '-',
        position: player.position || '-',
        goals: player.goals ?? player.raw?.goals ?? '-',
        assists: player.assists ?? player.raw?.assists ?? '-',
        matches: player.matches ?? player.raw?.matches ?? '-',
        image: player.image || '/default-player.png',
        player: player
      };
    });
  }, [savedPlayers]);

  // Save profile edits
  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      await supabase.from('user_profiles').update({
        name: editProfile.name,
        team: editProfile.team
      }).eq('user_id', user.id);
      setUserProfile((prev) => ({ ...prev, name: editProfile.name, team: editProfile.team }));
    } catch (error) {
      alert('Failed to save profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // --- Styles ---
  const tabButtonStyle = (active) => ({
    padding: '0.7rem 2.2rem',
    borderRadius: '1.5rem',
    border: 'none',
    background: active ? 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)' : 'rgba(0,0,0,0.7)',
    color: active ? 'white' : '#fff',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    marginRight: '1rem',
    marginBottom: '1.5rem',
    outline: 'none',
    letterSpacing: '0.01em',
    boxShadow: active ? '0 4px 16px rgba(185,28,28,0.3)' : 'none',
    transition: 'all 0.2s',
  });

  const profileSectionStyle = {
    width: '100%',
    maxWidth: 600,
    background: 'rgba(24,24,27,0.95)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2.5rem',
    border: '1px solid rgba(239,68,68,0.2)'
  };

  const savedPlayersSectionStyle = {
    width: '100%',
    maxWidth: 1200,
    background: 'rgba(24,24,27,0.95)',
    borderRadius: '16px',
    padding: '2rem',
    border: '1px solid rgba(239,68,68,0.2)'
  };

  const sectionTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#ef4444',
    marginBottom: '1.5rem',
    borderBottom: '2px solid rgba(239,68,68,0.3)',
    paddingBottom: '0.5rem'
  };

  const profileGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem'
  };

  const profileItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  };

  const labelStyle = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const valueStyle = {
    fontSize: '1.1rem',
    fontWeight: 500,
    color: '#fff'
  };

  const emailStyle = {
    fontSize: '1.1rem',
    fontWeight: 500,
    color: '#9ca3af',
    fontStyle: 'italic'
  };

  const signOutButtonStyle = {
    background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s',
    marginTop: '1rem'
  };

  const tableStyle = {
    width: '100%',
    minWidth: 900,
    borderCollapse: 'collapse',
    background: 'rgba(24,24,27,0.95)',
    borderRadius: '12px',
    overflow: 'hidden'
  };

  const thStyle = {
    background: 'rgba(239,68,68,0.1)',
    color: '#ef4444',
    fontWeight: 600,
    padding: '1rem',
    textAlign: 'left',
    borderBottom: '1px solid rgba(239,68,68,0.2)'
  };

  const tdStyle = {
    padding: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    cursor: 'pointer'
  };

  const playerImageStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover'
  };

  const unsaveButtonStyle = {
    background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s'
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const modalContentStyle = {
    background: '#232326',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center'
  };

  const cancelButtonStyle = {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    margin: '0.5rem'
  };

  return (
    <div style={{ flex: 1, width: '100%', background: 'linear-gradient(135deg, #18181b 0%, #111 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', minHeight: '100vh', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1200, marginBottom: '2rem' }}>
        <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1rem', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '8px', transition: 'background 0.2s' }} onClick={onBack}>
          ← Back
        </button>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', margin: 0 }}>Profile</h1>
        <div style={{ width: '80px' }}></div>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
        <button style={tabButtonStyle(tab === 'profile')} onClick={() => setTab('profile')}>Account Details</button>
        <button style={tabButtonStyle(tab === 'saved')} onClick={() => setTab('saved')}>Saved Players</button>
      </div>

      {/* Profile Details Section */}
      {tab === 'profile' && (
        <div style={profileSectionStyle}>
          <h2 style={sectionTitleStyle}>Account Details</h2>
          <div style={profileGridStyle}>
            <div style={profileItemStyle}>
              <span style={labelStyle}>Type</span>
              <span style={valueStyle}>{userProfile.userType}</span>
            </div>
            <div style={profileItemStyle}>
              <span style={labelStyle}>Name</span>
              <input
                type="text"
                value={editProfile.name}
                onChange={e => setEditProfile({ ...editProfile, name: e.target.value })}
                style={{ ...valueStyle, background: 'rgba(0,0,0,0.2)', border: '1px solid #ef4444', borderRadius: 8, padding: '0.5rem', color: '#fff' }}
              />
            </div>
            <div style={profileItemStyle}>
              <span style={labelStyle}>Team</span>
              <input
                type="text"
                value={editProfile.team}
                onChange={e => setEditProfile({ ...editProfile, team: e.target.value })}
                style={{ ...valueStyle, background: 'rgba(0,0,0,0.2)', border: '1px solid #ef4444', borderRadius: 8, padding: '0.5rem', color: '#fff' }}
              />
            </div>
            <div style={profileItemStyle}>
              <span style={labelStyle}>Email</span>
              <span style={emailStyle}>{userProfile.email}</span>
            </div>
            <div style={profileItemStyle}>
              <span style={labelStyle}>Subscription</span>
              <span style={valueStyle}>{userProfile.subscription}</span>
            </div>
          </div>
          <button style={signOutButtonStyle} onClick={handleSignOut}>
            Sign Out
          </button>
          <button
            style={{ ...signOutButtonStyle, background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', marginLeft: 16 }}
            onClick={handleProfileSave}
            disabled={savingProfile}
          >
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}

      {/* Saved Players Section */}
      {tab === 'saved' && userProfile.userType === 'Coach' && (
        <div style={savedPlayersSectionStyle}>
          <h2 style={sectionTitleStyle}>Saved Players ({savedPlayers.length})</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading saved players...</div>
          ) : savedPlayers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
              No saved players yet. Start saving players from the player cards!
            </div>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '60vh', overflowY: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Image</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Club</th>
                    <th style={thStyle}>League</th>
                    <th style={thStyle}>Position</th>
                    <th style={thStyle}>Goals</th>
                    <th style={thStyle}>Assists</th>
                    <th style={thStyle}>Matches</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {processedSavedPlayers.map((savedPlayer) => (
                    <tr key={`${savedPlayer.id}-${savedPlayer.player_id}`} style={{ cursor: 'pointer' }} onClick={() => { setSelectedPlayerForModal(savedPlayer.player); setShowPlayerModal(true); }}>
                      <td style={tdStyle} onClick={e => e.stopPropagation()}>
                        <img 
                          src={savedPlayer.image} 
                          alt={savedPlayer.playerName}
                          style={playerImageStyle}
                          onError={(e) => {
                            e.target.src = '/default-player.png';
                          }}
                        />
                      </td>
                      <td style={tdStyle}>{savedPlayer.playerName}</td>
                      <td style={tdStyle}>{savedPlayer.club}</td>
                      <td style={tdStyle}>{savedPlayer.league}</td>
                      <td style={tdStyle}>{savedPlayer.position}</td>
                      <td style={tdStyle}>{savedPlayer.goals}</td>
                      <td style={tdStyle}>{savedPlayer.assists}</td>
                      <td style={tdStyle}>{savedPlayer.matches}</td>
                      <td style={tdStyle} onClick={e => e.stopPropagation()}>
                        <button 
                          style={unsaveButtonStyle}
                          onClick={() => handleUnsaveClick({ ...savedPlayer.player, player_id: savedPlayer.player_id })}
                        >
                          Unsave
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Unsave Confirmation Modal */}
      {showUnsaveModal && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Remove Saved Player</h3>
            <p style={{ marginBottom: '1.5rem', color: '#9ca3af' }}>
              Are you sure you want to remove <strong>{playerToUnsave?.name}</strong> from your saved players?
            </p>
            <div>
              <button style={unsaveButtonStyle} onClick={confirmUnsave}>
                Yes, Remove
              </button>
              <button style={cancelButtonStyle} onClick={() => setShowUnsaveModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player Modal */}
      {showPlayerModal && selectedPlayerForModal && (
        <div className="player-modal-overlay" onClick={() => setShowPlayerModal(false)}>
          <div className="player-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal-button" onClick={() => setShowPlayerModal(false)}>×</button>
            <PlayerDetailModalCard player={selectedPlayerForModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 