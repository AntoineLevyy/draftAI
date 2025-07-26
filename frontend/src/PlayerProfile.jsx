import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';
import { getClaimedProfileByUserId } from './services/claimService';
import PlayerDetailModalCard from './PlayerDetailModalCard';
import { apiBaseUrl } from './config';

const PlayerProfile = ({ onBack }) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState(null);

  useEffect(() => {
    if (user) {
      loadPlayerProfile();
    }
  }, [user]);

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
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '40px',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '1px solid #333'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
    textAlign: 'center'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '30px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    marginBottom: '30px'
  };

  const sectionTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#ef4444'
  };

  const fieldStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px',
    transition: 'all 0.2s ease'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical'
  };

  const buttonStyle = {
    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginRight: '12px'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const valueStyle = {
    fontSize: '16px',
    color: 'white',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
    justifyContent: 'center'
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
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '20px',
    width: '100%'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div style={{ fontSize: '18px', color: '#9ca3af' }}>Loading your profile...</div>
        </div>
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

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Player Profile</h1>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px' }}>
          <div style={actionButtonsStyle}>
            {!editMode ? (
              <>
                <button style={buttonStyle} onClick={() => setEditMode(true)}>
                  Edit Profile
                </button>
                <button style={secondaryButtonStyle} onClick={handleViewProfile}>
                  View Profile Card
                </button>
              </>
            ) : (
              <>
                <button style={buttonStyle} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button style={secondaryButtonStyle} onClick={handleCancel}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Personal Information */}
          <div>
            <h3 style={{ ...sectionTitleStyle, fontSize: '1.2rem', marginBottom: '15px' }}>Personal</h3>
            
            <div style={fieldStyle}>
              <label style={labelStyle}>Name</label>
              {editMode ? (
                <input
                  style={inputStyle}
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  placeholder="Your full name"
                />
              ) : (
                <div style={valueStyle}>{profile.name || 'Not provided'}</div>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Position</label>
              {editMode ? (
                <input
                  style={inputStyle}
                  value={editData.position}
                  onChange={(e) => setEditData({...editData, position: e.target.value})}
                  placeholder="e.g., Forward, Midfielder"
                />
              ) : (
                <div style={valueStyle}>{profile.position || 'Not provided'}</div>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Nationality</label>
              {editMode ? (
                <input
                  style={inputStyle}
                  value={editData.nationality}
                  onChange={(e) => setEditData({...editData, nationality: e.target.value})}
                  placeholder="e.g., American"
                />
              ) : (
                <div style={valueStyle}>{profile.nationality || 'Not provided'}</div>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Year of Birth</label>
              {editMode ? (
                <input
                  style={inputStyle}
                  value={editData.year_of_birth}
                  onChange={(e) => setEditData({...editData, year_of_birth: e.target.value})}
                  placeholder="e.g., 2003"
                />
              ) : (
                <div style={valueStyle}>{profile.year_of_birth || 'Not provided'}</div>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Height</label>
              {editMode ? (
                <input
                  style={inputStyle}
                  value={editData.height}
                  onChange={(e) => setEditData({...editData, height: e.target.value})}
                  placeholder="e.g., 6'2&quot;"
                />
              ) : (
                <div style={valueStyle}>{profile.height || 'Not provided'}</div>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Weight (lbs)</label>
              {editMode ? (
                <input
                  style={inputStyle}
                  value={editData.weight}
                  onChange={(e) => setEditData({...editData, weight: e.target.value})}
                  placeholder="e.g., 180"
                />
              ) : (
                <div style={valueStyle}>{profile.weight || 'Not provided'}</div>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 style={{ ...sectionTitleStyle, fontSize: '1.2rem', marginBottom: '15px' }}>Academic</h3>
            
            <div style={fieldStyle}>
              <label style={labelStyle}>GPA</label>
              {editMode ? (
                <input
                  style={inputStyle}
                  value={editData.gpa}
                  onChange={(e) => setEditData({...editData, gpa: e.target.value})}
                  placeholder="e.g., 3.5"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                />
              ) : (
                <div style={valueStyle}>{profile.gpa || 'Not provided'}</div>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Credit Hours Taken</label>
              {editMode ? (
                <input
                  style={inputStyle}
                  value={editData.credit_hours_taken}
                  onChange={(e) => setEditData({...editData, credit_hours_taken: e.target.value})}
                  placeholder="e.g., 45"
                />
              ) : (
                <div style={valueStyle}>{profile.credit_hours_taken || 'Not provided'}</div>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Years of Eligibility Left</label>
              {editMode ? (
                <input
                  style={inputStyle}
                  value={editData.years_of_eligibility_left}
                  onChange={(e) => setEditData({...editData, years_of_eligibility_left: e.target.value})}
                  placeholder="e.g., 2"
                />
              ) : (
                <div style={valueStyle}>{profile.years_of_eligibility_left || 'Not provided'}</div>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Finances</label>
              {editMode ? (
                <input
                  style={inputStyle}
                  value={editData.finances}
                  onChange={(e) => setEditData({...editData, finances: e.target.value})}
                  placeholder="Financial requirements or preferences"
                />
              ) : (
                <div style={valueStyle}>{profile.finances || 'Not provided'}</div>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Available</label>
              {editMode ? (
                <input
                  style={inputStyle}
                  value={editData.available}
                  onChange={(e) => setEditData({...editData, available: e.target.value})}
                  placeholder="e.g., Immediately"
                />
              ) : (
                <div style={valueStyle}>{profile.available || 'Not provided'}</div>
              )}
            </div>
          </div>

          {/* Athletic Information */}
          <div>
            <h3 style={{ ...sectionTitleStyle, fontSize: '1.2rem', marginBottom: '15px' }}>Athletic</h3>
            
            <div style={fieldStyle}>
              <label style={labelStyle}>Current School</label>
              {editMode ? (
                <input
                  style={inputStyle}
                  value={editData.current_school}
                  onChange={(e) => setEditData({...editData, current_school: e.target.value})}
                  placeholder="Your current school"
                />
              ) : (
                <div style={valueStyle}>{profile.current_school || 'Not provided'}</div>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Division Transferring From</label>
              {editMode ? (
                <input
                  style={inputStyle}
                  value={editData.division_transferring_from}
                  onChange={(e) => setEditData({...editData, division_transferring_from: e.target.value})}
                  placeholder="e.g., NJCAA D1"
                />
              ) : (
                <div style={valueStyle}>{profile.division_transferring_from || 'Not provided'}</div>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Individual Awards</label>
              {editMode ? (
                <textarea
                  style={textareaStyle}
                  value={editData.individual_awards}
                  onChange={(e) => setEditData({...editData, individual_awards: e.target.value})}
                  placeholder="List your individual awards and achievements"
                />
              ) : (
                <div style={valueStyle}>{profile.individual_awards || 'Not provided'}</div>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>College Accolades</label>
              {editMode ? (
                <textarea
                  style={textareaStyle}
                  value={editData.college_accolades}
                  onChange={(e) => setEditData({...editData, college_accolades: e.target.value})}
                  placeholder="List your college accolades"
                />
              ) : (
                <div style={valueStyle}>{profile.college_accolades || 'Not provided'}</div>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Why Player is Transferring</label>
              {editMode ? (
                <textarea
                  style={textareaStyle}
                  value={editData.why_player_is_transferring}
                  onChange={(e) => setEditData({...editData, why_player_is_transferring: e.target.value})}
                  placeholder="Explain why you are transferring"
                />
              ) : (
                <div style={valueStyle}>{profile.why_player_is_transferring || 'Not provided'}</div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 style={{ ...sectionTitleStyle, fontSize: '1.2rem', marginBottom: '15px' }}>Contact</h3>
            
            <div style={fieldStyle}>
              <label style={labelStyle}>Email Address</label>
              {editMode ? (
                <input
                  style={inputStyle}
                  value={editData.email_address}
                  onChange={(e) => setEditData({...editData, email_address: e.target.value})}
                  placeholder="Your email address"
                />
              ) : (
                <div style={valueStyle}>{profile.email_address || 'Not provided'}</div>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Highlights</label>
              {editMode ? (
                <textarea
                  style={textareaStyle}
                  value={editData.highlights}
                  onChange={(e) => setEditData({...editData, highlights: e.target.value})}
                  placeholder="Describe your highlights and achievements"
                />
              ) : (
                <div style={valueStyle}>{profile.highlights || 'Not provided'}</div>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Full Game Link</label>
              {editMode ? (
                <input
                  style={inputStyle}
                  value={editData.full_game_link}
                  onChange={(e) => setEditData({...editData, full_game_link: e.target.value})}
                  placeholder="URL to your full game footage"
                />
              ) : (
                <div style={valueStyle}>{profile.full_game_link || 'Not provided'}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unclaim Profile Button */}
      <div style={cardStyle}>
        <button 
          style={unclaimButtonStyle}
          onClick={handleUnclaimProfile}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Unclaim Profile
        </button>
      </div>

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