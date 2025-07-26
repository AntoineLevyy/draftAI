import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { getSavedPlayers, unsavePlayer } from './services/saveService';
import { supabase } from './supabase';
import './USLPlayerCards.css';
import CollegePlayerCard from './CollegePlayerCards';
import PlayerDetailModalCard from './PlayerDetailModalCard';
import Chat from './Chat';
import { createConversation } from './services/chatService';
import { getUnreadCount } from './services/chatService';

const Profile = ({ onBack }) => {
  const { user, signOut } = useAuth();
  const [savedPlayers, setSavedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUnsaveModal, setShowUnsaveModal] = useState(false);
  const [playerToUnsave, setPlayerToUnsave] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState(null);
  const [tab, setTab] = useState('profile'); // 'profile', 'saved', or 'messages'
  const [userProfile, setUserProfile] = useState({
    userType: 'Coach',
    name: '',
    team: '',
    email: user?.email || '',
    subscription: 'Yearly ($1,800/yr)'
  });
  const [editProfile, setEditProfile] = useState({ name: '', team: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadSavedPlayers();
    loadUserProfile();
    loadUnreadCount();
  }, []);

  // Load unread count periodically
  useEffect(() => {
    const interval = setInterval(loadUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

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
      await unsavePlayer(playerToUnsave);
      setSavedPlayers(prev => prev.filter(p => p.player_id !== playerToUnsave.player_id));
      setShowUnsaveModal(false);
      setPlayerToUnsave(null);
    } catch (error) {
      console.error('Error unsaving player:', error);
      alert('Failed to remove player. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // After successful sign out, navigate to main landing page
      if (onBack) onBack();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileSave = async () => {
    try {
      setSavingProfile(true);
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: editProfile.name,
          team: editProfile.team
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setUserProfile(prev => ({
        ...prev,
        name: editProfile.name,
        team: editProfile.team
      }));
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMessagePlayer = async (savedPlayer) => {
    try {
      console.log('Starting conversation with player:', savedPlayer);
      console.log('Player claimed_by_user_id:', savedPlayer.claimed_by_user_id);
      console.log('Full savedPlayer object:', savedPlayer);
      
      // Get the claimed user ID for this player
      const claimedUserId = savedPlayer.claimed_by_user_id;
      if (!claimedUserId) {
        alert('This player has not claimed their profile yet. You can only message players who have claimed their profiles.');
        return;
      }

      console.log('Creating conversation with claimed user ID:', claimedUserId);

      // Create or get existing conversation
      const result = await createConversation(claimedUserId);
      console.log('Conversation created:', result);
      
      // Switch to messages tab
      setTab('messages');
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to start conversation: ' + error.message);
    }
  };

  const tabButtonStyle = (active) => ({
    padding: '12px 24px',
    margin: '0 8px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    background: active ? 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)' : 'rgba(0,0,0,0.7)',
    color: active ? 'white' : '#fff',
    position: 'relative'
  });

  // Process saved players for display
  const processedSavedPlayers = useMemo(() => {
    return savedPlayers.map(savedPlayer => {
      const player = savedPlayer.player_data;
      
      // Try to get the current player data from the main player list to check claimed status
      // We'll use the player_id to find the current version
      const currentPlayerData = window.currentPlayerData?.find(p => 
        String(p.playerId) === String(savedPlayer.player_id) || 
        String(p.id) === String(savedPlayer.player_id)
      );
      
      const processedPlayer = {
        id: savedPlayer.id,
        player_id: savedPlayer.player_id,
        player: currentPlayerData || player, // Use current data if available, fallback to saved data
        playerName: (currentPlayerData?.name || player.name || player.Name || 'Unknown'),
        image: (currentPlayerData?.photo_url || player.photo_url || '/default-player.png'),
        club: (currentPlayerData?.team || player.team || player['Current School'] || 'Unknown'),
        league: (currentPlayerData?.league || player.league || player['Division Transferring From'] || 'Unknown'),
        position: (currentPlayerData?.position || player.position || player.Position || 'Unknown'),
        goals: (currentPlayerData?.goals || player.goals || 'N/A'),
        assists: (currentPlayerData?.assists || player.assists || 'N/A'),
        matches: (currentPlayerData?.matches || player.matches || 'N/A'),
        claimed_by_user_id: currentPlayerData?.claimed_by_user_id || player.claimed_by_user_id
      };
      
      return processedPlayer;
    });
  }, [savedPlayers]); // Keep only savedPlayers as dependency to prevent flickering

  // Remove the early return for messages - we'll render it within the main layout

  // --- Styles ---
  const containerStyle = {
    flex: 1,
    width: '100%',
    background: 'linear-gradient(135deg, #18181b 0%, #111 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1rem',
    minHeight: '100vh',
    color: '#fff'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 1200,
    marginBottom: '2rem'
  };

  const backButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    transition: 'background 0.2s'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: 900,
    color: '#fff',
    margin: 0
  };

  const tabContainerStyle = {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'center'
  };

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

  const inputStyle = {
    ...valueStyle,
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid #ef4444',
    borderRadius: 8,
    padding: '0.5rem',
    color: '#fff'
  };

  const saveButtonStyle = {
    ...signOutButtonStyle,
    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
    marginLeft: 16
  };

  const editButtonStyle = {
    ...signOutButtonStyle,
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    marginLeft: 16
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem'
  };

  const unreadBadgeStyle = {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#dc3545',
    color: '#fff',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '10px',
    minWidth: '16px',
    textAlign: 'center',
    fontWeight: 'bold'
  };

  const actionButtonsContainerStyle = {
    display: 'flex',
    gap: '8px',
    flexDirection: 'column'
  };

  const messageButtonStyle = {
    background: 'linear-gradient(90deg, #007bff 0%, #0056b3 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button style={backButtonStyle} onClick={onBack}>← Back</button>
        <h1 style={titleStyle}>Profile</h1>
      </div>

      {/* Tab Navigation */}
      <div style={tabContainerStyle}>
        <button 
          style={tabButtonStyle(tab === 'profile')} 
          onClick={() => setTab('profile')}
        >
          Account Details
        </button>
        {userProfile.userType === 'Coach' && (
          <button 
            style={tabButtonStyle(tab === 'saved')} 
            onClick={() => setTab('saved')}
          >
            Saved Players
          </button>
        )}
        <button 
          style={tabButtonStyle(tab === 'messages')} 
          onClick={() => setTab('messages')}
        >
          Messages
          {unreadCount > 0 && (
            <span style={unreadBadgeStyle}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Profile Details Section */}
      {tab === 'profile' && (
        <div style={profileSectionStyle}>
          <h2 style={sectionTitleStyle}>Profile Details</h2>
          <div style={profileGridStyle}>
            <div style={profileItemStyle}>
              <label style={labelStyle}>Type</label>
              <div style={valueStyle}>{userProfile.userType}</div>
            </div>
            <div style={profileItemStyle}>
              <label style={labelStyle}>Name</label>
              {editProfile.name !== null ? (
                <input
                  type="text"
                  value={editProfile.name}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, name: e.target.value }))}
                  style={inputStyle}
                />
              ) : (
                <div style={valueStyle}>{userProfile.name}</div>
              )}
            </div>
            <div style={profileItemStyle}>
              <label style={labelStyle}>Team</label>
              {editProfile.team !== null ? (
                <input
                  type="text"
                  value={editProfile.team}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, team: e.target.value }))}
                  style={inputStyle}
                />
              ) : (
                <div style={valueStyle}>{userProfile.team}</div>
              )}
            </div>
            <div style={profileItemStyle}>
              <label style={labelStyle}>Email</label>
              <div style={emailStyle}>{userProfile.email}</div>
            </div>
            <div style={profileItemStyle}>
              <label style={labelStyle}>Subscription</label>
              <div style={valueStyle}>{userProfile.subscription}</div>
            </div>
          </div>
          <div style={actionButtonsStyle}>
            {editProfile.name !== null ? (
              <>
                <button style={saveButtonStyle} onClick={handleProfileSave} disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save'}
                </button>
                <button style={cancelButtonStyle} onClick={() => setEditProfile({ name: null, team: null })}>
                  Cancel
                </button>
              </>
            ) : (
              <button style={editButtonStyle} onClick={() => setEditProfile({ name: userProfile.name, team: userProfile.team })}>
                Edit Profile
              </button>
            )}
            <button style={signOutButtonStyle} onClick={handleSignOut}>
              Log Out
            </button>
          </div>
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
                    <th style={thStyle}>Actions</th>
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
                        <div style={actionButtonsContainerStyle}>
                          {savedPlayer.claimed_by_user_id && (
                            <button 
                              style={messageButtonStyle}
                              onClick={() => handleMessagePlayer(savedPlayer)}
                            >
                              Message
                            </button>
                          )}
                          <button 
                            style={unsaveButtonStyle}
                            onClick={() => handleUnsaveClick({ ...savedPlayer.player, player_id: savedPlayer.player_id })}
                          >
                            Unsave
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Messages Section */}
      {tab === 'messages' && (
        <div style={savedPlayersSectionStyle}>
          <Chat embedded={true} />
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