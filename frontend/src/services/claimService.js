import { supabase } from '../supabase';

/**
 * Save a claimed profile to the database
 * @param {Object} claimData - The form data from the claim form
 * @param {Object} originalPlayer - The original unclaimed player data
 * @param {string} userId - The user ID who claimed the profile
 * @returns {Promise<Object>} The saved claimed profile
 */
export const saveClaimedProfile = async (claimData, originalPlayer, userId) => {
  try {
    const { data, error } = await supabase
      .from('claimed_profiles')
      .insert({
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
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving claimed profile:', error);
      throw error;
    }

    return data;
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
    const { data, error } = await supabase
      .from('claimed_profiles')
      .select('*')
      .eq('claimed_by_user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching claimed profile:', error);
      throw error;
    }

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
    const { data, error } = await supabase
      .from('claimed_profiles')
      .select('id')
      .eq('original_player_id', originalPlayerId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking if profile is claimed:', error);
      throw error;
    }

    return !!data; // Returns true if profile exists, false otherwise
  } catch (error) {
    console.error('Error in isProfileAlreadyClaimed:', error);
    throw error;
  }
}; 