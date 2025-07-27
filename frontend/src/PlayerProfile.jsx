import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';
import { getClaimedProfileByUserId } from './services/claimService';
import PlayerDetailModalCard from './PlayerDetailModalCard';
import { apiBaseUrl } from './config';
import Chat from './Chat';
import { getUnreadCount } from './services/chatService';
import './USLPlayerCards.css';

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
    // Convert profile data to player card format using the same structure as CollegePlayerCards
    const playerCardData = {
      claimed: true,
      playerId: profile.original_player_id || profile.id,
      name: profile.name,
      position: profile.position,
      awards: profile.individual_awards || '',
      eligibility: profile.years_of_eligibility_left || '',
      email: profile.email_address || '',
      team: profile.current_school || '',
      league: profile.division_transferring_from || '',
      year: profile.year_of_birth || '',
      photo_url: profile.photo_url || '',
      claimed_by_user_id: profile.user_id || null,
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
        'Why Player is Transferring': profile.why_player_is_transferring || '',
        'X Username': profile.x_username || '',
        'Instagram Username': profile.instagram_username || ''
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

      // Sign out the user and redirect to coaches section
      await supabase.auth.signOut();
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error unclaiming profile:', error);
      alert('Failed to unclaim profile. Please try again.');
    }
  };

  // --- Styles ---
  const containerStyle = {
    flex: 1,
    width: '100%',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1rem',
    minHeight: '100vh',
    color: '#f8fafc',
    fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 1200,
    marginBottom: '2.5rem',
    position: 'relative',
  };

  const backButtonStyle = {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    fontSize: '0.95rem',
    cursor: 'pointer',
    padding: '0.7rem 1.2rem',
    borderRadius: '50px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: '600',
    letterSpacing: '0.02em',
    position: 'absolute',
    left: '0',
    top: '50%',
    transform: 'translateY(-50%)',
  };

  const titleStyle = {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: '700',
    color: '#f8fafc',
    margin: 0,
    fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    letterSpacing: '-0.02em',
    textAlign: 'center',
  };

  const cardStyle = {
    width: '100%',
    maxWidth: 1200,
    background: 'rgba(30, 41, 59, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2.5rem',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    padding: '0.8rem 1.8rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    letterSpacing: '0.02em',
    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
  };

  const secondaryButtonStyle = {
    background: 'rgba(30, 41, 59, 0.8)',
    color: '#cbd5e1',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '50px',
    padding: '0.8rem 1.8rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    letterSpacing: '0.02em',
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '1rem',
  };

  const fieldStyle = {
    marginBottom: '15px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  const valueStyle = {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#f8fafc',
    fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '0.9rem 1.2rem',
    fontSize: '1rem',
    color: '#f8fafc',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '60px',
    resize: 'vertical'
  };

  const sectionTitleStyle = {
    fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: '2rem',
    borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
    paddingBottom: '1rem',
    fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    letterSpacing: '-0.02em',
  };



  const unclaimButtonStyle = {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    padding: '0.8rem 1.8rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    letterSpacing: '0.02em',
    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
    marginTop: '1.5rem',
    width: '100%'
  };

  const tabButtonStyle = (active) => ({
    padding: '0.8rem 1.5rem',
    margin: '0 0.5rem',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: active ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'rgba(30, 41, 59, 0.8)',
    color: active ? 'white' : '#cbd5e1',
    position: 'relative',
    fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    letterSpacing: '0.02em',
    boxShadow: active ? '0 4px 16px rgba(239, 68, 68, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
  });

  const unreadBadgeStyle = {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    backgroundColor: '#ef4444',
    color: '#fff',
    borderRadius: '50%',
    padding: '3px 6px',
    fontSize: '10px',
    minWidth: '18px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
  };

  const tabContainerStyle = {
    marginBottom: '2.5rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
  };

  const profileSectionStyle = {
    width: '100%',
    maxWidth: 1200,
    background: 'rgba(30, 41, 59, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2.5rem',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  };

  const saveButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
  };

  const cancelButtonStyle = {
    ...secondaryButtonStyle,
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  };

  const editButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
  };

  const viewButtonStyle = {
    ...secondaryButtonStyle,
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '100px 20px',
    fontSize: '1.2rem',
    color: '#cbd5e1',
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

  const unclaimSectionStyle = {
    marginTop: '15px',
    textAlign: 'center'
  };

  const errorStyle = {
    textAlign: 'center',
    padding: '100px 20px'
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
                // Navigate to the coaches section
                window.location.href = '/';
              }}
            >
              For Coaches
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
        <button style={backButtonStyle} onClick={onBack}>← Back</button>
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
                  <label style={labelStyle}>Profile Photo</label>
                  {editMode ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setEditData({...editData, photo_url: e.target.result});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{
                          ...inputStyle,
                          padding: '8px',
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                          border: '2px dashed #374151',
                          cursor: 'pointer'
                        }}
                      />
                      <small style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                        Upload a professional headshot or action photo
                      </small>
                    </div>
                  ) : (
                    <div style={valueStyle}>
                      {profile.photo_url ? (
                        <img 
                          src={profile.photo_url} 
                          alt="Profile" 
                          style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                      ) : (
                        'No photo uploaded'
                      )}
                    </div>
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
        <div className="player-modal-overlay" onClick={() => setShowPlayerModal(false)}>
          <div className="player-modal">
            <button className="close-modal-button" onClick={() => setShowPlayerModal(false)}>×</button>
            <PlayerDetailModalCard player={selectedPlayerForModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerProfile; 