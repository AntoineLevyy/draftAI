import { apiBaseUrl } from '../config';
import { supabase } from '../supabase';

/**
 * Save a claimed profile to the database via backend API
 * @param {Object} claimData - The form data from the claim form
 * @param {Object} originalPlayer - The original unclaimed player data
 * @param {string} userId - The user ID who claimed the profile
 * @returns {Promise<Object>} The saved claimed profile
 */
export const saveClaimedProfile = async (claimData, originalPlayer, userId) => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/save-claimed-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original_player_id: originalPlayer.playerId || originalPlayer.id,
        claimed_by_user_id: userId,
        
        // Personal Information
        name: claimData.name,
        nationality: claimData.nationality,
        year_of_birth: claimData.yearOfBirth,
        height: claimData.height,
        weight: claimData.weight,
        position: claimData.position,
        
        // Academic Information
        gpa: claimData.gpa ? parseFloat(claimData.gpa) : null,
        credit_hours_taken: claimData.creditHours,
        finances: claimData.finances,
        available: claimData.available,
        
        // Athletic Information
        current_school: claimData.currentSchool,
        division_transferring_from: claimData.divisionTransferringFrom,
        years_of_eligibility_left: claimData.yearsOfEligibilityLeft,
        individual_awards: claimData.individualAwards,
        college_accolades: claimData.collegeAccolades,
        
        // Contact & Media
        email_address: claimData.emailAddress,
        highlights: claimData.highlights,
        full_game_link: claimData.fullGameLink,
        why_player_is_transferring: claimData.whyPlayerIsTransferring,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || 'Failed to save claimed profile';
      
      // If it's a 409 (conflict), it might be a timing issue with user creation
      if (response.status === 409) {
        throw new Error(errorMessage);
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error in saveClaimedProfile:', error);
    throw error;
  }
};

/**
 * Get all claimed profiles (for coaches to view)
 * @returns {Promise<Array>} Array of claimed profiles
 */
export const getClaimedProfiles = async () => {
  try {
    const { data, error } = await supabase
      .from('claimed_profiles')
      .select('*')
      .order('claimed_at', { ascending: false });

    if (error) {
      console.error('Error fetching claimed profiles:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getClaimedProfiles:', error);
    throw error;
  }
};

/**
 * Get a specific claimed profile by user ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} The claimed profile
 */
export const getClaimedProfileByUserId = async (userId) => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/get-claimed-profile/${userId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No profile found
      }
      const errorData = await response.json();
      const errorMessage = errorData.error || 'Failed to fetch claimed profile';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getClaimedProfileByUserId:', error);
    throw error;
  }
};

/**
 * Update a claimed profile
 * @param {string} profileId - The profile ID to update
 * @param {Object} updates - The fields to update
 * @returns {Promise<Object>} The updated profile
 */
export const updateClaimedProfile = async (profileId, updates) => {
  try {
    const { data, error } = await supabase
      .from('claimed_profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      console.error('Error updating claimed profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateClaimedProfile:', error);
    throw error;
  }
};

/**
 * Check if a player profile has already been claimed
 * @param {string} originalPlayerId - The original player ID
 * @returns {Promise<boolean>} True if already claimed
 */
export const isProfileAlreadyClaimed = async (originalPlayerId) => {
  try {
    // For now, we'll check against the players API to see if the player is marked as claimed
    const response = await fetch(`${apiBaseUrl}/api/players?type=transfer`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch players');
    }

    const data = await response.json();
    const player = data.players.find(p => (p.playerId || p.id) === originalPlayerId);
    
    return player ? player.claimed : false;
  } catch (error) {
    console.error('Error in isProfileAlreadyClaimed:', error);
    throw error;
  }
};

/**
 * Migrate pending claims to claimed_profiles after email confirmation
 * @param {string} userId - The confirmed user ID
 * @param {string} email - The user's email address
 * @returns {Promise<Object>} Migration result
 */
export const migratePendingClaims = async (userId, email) => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/migrate-pending-claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        email: email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || 'Failed to migrate pending claims';
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error in migratePendingClaims:', error);
    throw error;
  }
}; 