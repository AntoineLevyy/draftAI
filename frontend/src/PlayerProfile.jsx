import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';
import { getClaimedProfileByUserId } from './services/claimService';
import PlayerDetailModalCard from './PlayerDetailModalCard';
import { apiBaseUrl } from './config';
import Chat from './Chat';
import { getUnreadCount } from './services/chatService';

const PlayerProfile = ({ onBack }) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState(null);
  const [tab, setTab] = useState('profile'); // 'profile' or 'messages'
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadPlayerProfile();
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

  const loadPlayerProfile = async () => {
    try {
      setLoading(true);
      
      const profileData = await getClaimedProfileByUserId(user.id);
      if (profileData) {
        setProfile(profileData);
        setEditData({
          name: profileData.name || '',
          position: profileData.position || '',
          current_school: profileData.current_school || '',
          division_transferring_from: profileData.division_transferring_from || '',
          email_address: profileData.email_address || '',
          years_of_eligibility_left: profileData.years_of_eligibility_left || '',
          gpa: profileData.gpa || '',
          individual_awards: profileData.individual_awards || '',
          college_accolades: profileData.college_accolades || '',
          highlights: profileData.highlights || '',
          full_game_link: profileData.full_game_link || '',
          height: profileData.height || '',
          weight: profileData.weight || '',
          credit_hours_taken: profileData.credit_hours_taken || '',
          available: profileData.available || '',
          nationality: profileData.nationality || '',
          year_of_birth: profileData.year_of_birth || '',
          finances: profileData.finances || '',
          why_player_is_transferring: profileData.why_player_is_transferring || ''
        });
      }
      
    } catch (error) {
      console.error('Error loading player profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Use backend API to update the profile
      const response = await fetch(`${apiBaseUrl}/api/update-claimed-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_id: profile.id,
          updates: editData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      await loadPlayerProfile(); // Reload to get updated data
      setEditMode(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: profile.name || '',
      position: profile.position || '',
      current_school: profile.current_school || '',
      division_transferring_from: profile.division_transferring_from || '',
      email_address: profile.email_address || '',
      years_of_eligibility_left: profile.years_of_eligibility_left || '',
      gpa: profile.gpa || '',
      individual_awards: profile.individual_awards || '',
      college_accolades: profile.college_accolades || '',
      highlights: profile.highlights || '',
      full_game_link: profile.full_game_link || '',
      height: profile.height || '',
      weight: profile.weight || '',
      credit_hours_taken: profile.credit_hours_taken || '',
      available: profile.available || '',
      nationality: profile.nationality || '',
      year_of_birth: profile.year_of_birth || '',
      finances: profile.finances || '',
      why_player_is_transferring: profile.why_player_is_transferring || ''
    });
    setEditMode(false);
  };

  const handleViewProfile = () => {
    // Convert profile data to player card format
    const playerCardData = {
      playerId: profile.original_player_id,
      claimed: true,
      type: 'transfer',
      name: profile.name,
      position: profile.position,
      photo_url: '',
      source: 'database',
      // Put all the detailed data in the 'raw' object as expected by PlayerDetailModalCard
      raw: {
        'Name': profile.name,
        'Position': profile.position,
        'Current School': profile.current_school,
        'Division Transferring From': profile.division_transferring_from,
        'Email Address': profile.email_address,
        'Years of Eligibility Left': profile.years_of_eligibility_left,
        'GPA': profile.gpa ? String(profile.gpa) : '',
        'Individual Awards': profile.individual_awards || '',
        'College Accolades': profile.college_accolades || '',
        'Highlights': profile.highlights || '',
        'Full 90 min Game Link': profile.full_game_link || '',
        'Height': profile.height || '',
        'Weight (lbs)': profile.weight || '',
        'Credit Hours Taken when you will transfer': profile.credit_hours_taken || '',
        'Available': profile.available || '',
        'Nationality': profile.nationality || '',
        'Year of Birth': profile.year_of_birth || '',
        'Finances': profile.finances || '',
        'Why Player is Transferring': profile.why_player_is_transferring || ''
      }
    };
    
    setSelectedPlayerForModal(playerCardData);
    setShowPlayerModal(true);
  };

  const handleUnclaimProfile = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to unclaim your profile? This will remove your profile from the claimed players list and make it available for other players to claim. This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    try {
      const response = await fetch(`${apiBaseUrl}/api/unclaim-profile`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_id: profile.id,
          user_id: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unclaim profile');
      }

      // Sign out the user and redirect to forplayers page
      await supabase.auth.signOut();
      window.location.href = '/forplayers';
      
    } catch (error) {
      console.error('Error unclaiming profile:', error);
      alert('Failed to unclaim profile. Please try again.');
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #18181b 0%, #111 100%)',
    color: 'white',
    padding: '20px',
    fontFamily: 'Inter, system-ui, sans-serif'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: '20px',
    marginBottom: '35px',
    paddingBottom: '20px',
    borderBottom: '1px solid #333'
  };

  const titleStyle = {
    fontSize: '1.8rem',
    fontWeight: '700',
    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
    textAlign: 'left'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '15px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    marginBottom: '15px'
  };

  const sectionTitleStyle = {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#ef4444'
  };

  const fieldStyle = {
    marginBottom: '12px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: '4px'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: 'white',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '60px',
    resize: 'vertical'
  };

  const buttonStyle = {
    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginRight: '10px'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const valueStyle = {
    fontSize: '14px',
    color: 'white',
    padding: '8px 12px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '10px',
    marginTop: '12px',
    justifyContent: 'flex-end'
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const unclaimButtonStyle = {
    background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '12px',
    width: '100%'
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

  const tabContainerStyle = {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'center'
  };

  const profileSectionStyle = {
    ...cardStyle,
    marginBottom: '15px'
  };

  const sectionStyle = {
    marginBottom: '15px'
  };

  const subsectionTitleStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#ef4444'
  };

  const fieldGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px'
  };

  const saveButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
  };

  const cancelButtonStyle = {
    ...secondaryButtonStyle,
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const editButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)'
  };

  const viewButtonStyle = {
    ...secondaryButtonStyle,
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const unclaimSectionStyle = {
    marginTop: '15px',
    textAlign: 'center'
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '100px 20px'
  };

  const errorStyle = {
    textAlign: 'center',
    padding: '100px 20px'
  };

  const backButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(90deg, #6b7280 0%, #4b5563 100%)'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>Loading your profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Player Profile</h1>
        </div>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '18px', color: '#9ca3af', marginBottom: '20px' }}>
              No claimed profile found. You need to claim a profile first.
            </div>
            <button 
              style={buttonStyle} 
              onClick={() => {
                // Navigate to the claim flow
                window.location.href = '/#forplayers';
              }}
            >
              Claim Your Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Remove the early return for messages - we'll render it within the main layout

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Player Profile</h1>
      </div>

      {/* Tab Navigation */}
      <div style={tabContainerStyle}>
        <button 
          style={tabButtonStyle(tab === 'profile')} 
          onClick={() => setTab('profile')}
        >
          Profile Details
        </button>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '15px' }}>
            <div style={actionButtonsStyle}>
              {editMode ? (
                <>
                  <button style={saveButtonStyle} onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button style={cancelButtonStyle} onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button style={editButtonStyle} onClick={() => setEditMode(true)}>
                    Edit Profile
                  </button>
                  <button style={viewButtonStyle} onClick={handleViewProfile}>
                    View Profile Card
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Personal and Academic Information - Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '20px' }}>
            {/* Personal Information */}
            <div style={sectionStyle}>
              <h3 style={subsectionTitleStyle}>Personal</h3>
              <div style={fieldGridStyle}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.name}</div>
                  )}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Nationality</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.nationality}
                      onChange={(e) => setEditData({...editData, nationality: e.target.value})}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.nationality || 'Not specified'}</div>
                  )}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Year of Birth</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.year_of_birth}
                      onChange={(e) => setEditData({...editData, year_of_birth: e.target.value})}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.year_of_birth || 'Not specified'}</div>
                  )}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Height</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.height}
                      onChange={(e) => setEditData({...editData, height: e.target.value})}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.height || 'Not specified'}</div>
                  )}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Weight</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.weight}
                      onChange={(e) => setEditData({...editData, weight: e.target.value})}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.weight || 'Not specified'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div style={sectionStyle}>
              <h3 style={subsectionTitleStyle}>Academic</h3>
              <div style={fieldGridStyle}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Position</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.position}
                      onChange={(e) => setEditData({...editData, position: e.target.value})}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.position}</div>
                  )}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>GPA</label>
                  {editMode ? (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={editData.gpa}
                      onChange={(e) => setEditData({...editData, gpa: e.target.value})}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.gpa || 'Not specified'}</div>
                  )}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Credit Hours</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.credit_hours_taken}
                      onChange={(e) => setEditData({...editData, credit_hours_taken: e.target.value})}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.credit_hours_taken || 'Not specified'}</div>
                  )}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Years of Eligibility Left</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.years_of_eligibility_left}
                      onChange={(e) => setEditData({...editData, years_of_eligibility_left: e.target.value})}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.years_of_eligibility_left || 'Not specified'}</div>
                  )}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Finances</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.finances}
                      onChange={(e) => setEditData({...editData, finances: e.target.value})}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.finances || 'Not specified'}</div>
                  )}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Available</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.available}
                      onChange={(e) => setEditData({...editData, available: e.target.value})}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.available || 'Not specified'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Athletic and Contact Information - Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '20px' }}>
            {/* Athletic Information */}
            <div style={sectionStyle}>
              <h3 style={subsectionTitleStyle}>Athletic</h3>
              <div style={fieldGridStyle}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Current School</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.current_school}
                      onChange={(e) => setEditData({...editData, current_school: e.target.value})}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.current_school}</div>
                  )}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Division Transferring From</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.division_transferring_from}
                      onChange={(e) => setEditData({...editData, division_transferring_from: e.target.value})}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.division_transferring_from}</div>
                  )}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Individual Awards</label>
                  {editMode ? (
                    <textarea
                      value={editData.individual_awards}
                      onChange={(e) => setEditData({...editData, individual_awards: e.target.value})}
                      style={textareaStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.individual_awards || 'Not specified'}</div>
                  )}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>College Accolades</label>
                  {editMode ? (
                    <textarea
                      value={editData.college_accolades}
                      onChange={(e) => setEditData({...editData, college_accolades: e.target.value})}
                      style={textareaStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.college_accolades || 'Not specified'}</div>
                  )}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Why Player is Transferring</label>
                  {editMode ? (
                    <textarea
                      value={editData.why_player_is_transferring}
                      onChange={(e) => setEditData({...editData, why_player_is_transferring: e.target.value})}
                      style={textareaStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.why_player_is_transferring || 'Not specified'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div style={sectionStyle}>
              <h3 style={subsectionTitleStyle}>Contact</h3>
              <div style={fieldGridStyle}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Email Address</label>
                  {editMode ? (
                    <input
                      type="email"
                      value={editData.email_address}
                      onChange={(e) => setEditData({...editData, email_address: e.target.value})}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.email_address}</div>
                  )}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Highlights</label>
                  {editMode ? (
                    <textarea
                      value={editData.highlights}
                      onChange={(e) => setEditData({...editData, highlights: e.target.value})}
                      style={textareaStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.highlights || 'Not specified'}</div>
                  )}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Full Game Link</label>
                  {editMode ? (
                    <input
                      type="url"
                      value={editData.full_game_link}
                      onChange={(e) => setEditData({...editData, full_game_link: e.target.value})}
                      style={inputStyle}
                    />
                  ) : (
                    <div style={valueStyle}>{profile.full_game_link || 'Not specified'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Unclaim Profile Button */}
          <div style={unclaimSectionStyle}>
            <button style={unclaimButtonStyle} onClick={handleUnclaimProfile}>
              Unclaim Profile
            </button>
          </div>
        </div>
      )}

      {/* Messages Section */}
      {tab === 'messages' && (
        <div style={profileSectionStyle}>
          <Chat embedded={true} />
        </div>
      )}

      {/* Player Modal */}
      {showPlayerModal && selectedPlayerForModal && (
        <div style={modalStyle} onClick={() => setShowPlayerModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PlayerDetailModalCard player={selectedPlayerForModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerProfile; 