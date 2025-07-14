import { supabase } from '../supabase';

export const savePlayer = async (player, playerType = 'pro') => {
  try {
    console.log('=== SAVE PLAYER DEBUG ===');
    console.log('savePlayer called with:', { player, playerType });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create a standardized player object
    // For pro players, use the profile.playerID as the unique identifier
    // For college players, use playerId field if available, otherwise fall back to id or name
    const playerId = playerType === 'pro' 
      ? (player.profile?.playerProfile?.playerID || player.id || player.name)
      : (player.playerId);
    
    const playerData = {
      user_id: user.id,
      player_id: String(playerId), // Ensure consistent string format
      player_name: player.profile?.playerProfile?.playerName || player.name,
      team_name: player.profile?.playerProfile?.club || player.club?.name || player.team,
      league: player.league || 'Unknown',
      position: player.profile?.playerProfile?.playerMainPosition || player.position,
      player_type: playerType, // 'pro' or 'college'
      saved_at: new Date().toISOString(),
      player_data: player // Store the full player object for future reference
    };

    console.log('Attempting to save player data:', playerData);
    console.log('Player ID being saved:', playerData.player_id, 'Type:', typeof playerData.player_id);

    const { data, error } = await supabase
      .from('saved_players')
      .insert([playerData]);

    if (error) {
      // Handle duplicate save gracefully
      if (error.code === '23505') {
        console.log('Player already saved, this is fine');
        return { success: true, data: null, alreadySaved: true };
      }
      console.error('Supabase error saving player:', error);
      throw error;
    }

    console.log('Player saved successfully:', data);
    clearSavedPlayersCache(); // Clear cache after saving
    console.log('Cache cleared, returning success');
    return { success: true, data };
  } catch (error) {
    console.error('Error in savePlayer:', error);
    throw error;
  }
};

export const unsavePlayer = async (player, playerType = 'pro') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // For pro players, use the profile.playerID as the unique identifier
    // For college players, use playerId only (do not fall back to id or name)
    const playerId = playerType === 'pro' 
      ? String(player.profile?.playerProfile?.playerID || player.id || player.name)
      : String(player.playerId);

    const { error } = await supabase
      .from('saved_players')
      .delete()
      .eq('user_id', user.id)
      .eq('player_id', playerId)
      .eq('player_type', playerType);

    if (error) {
      console.error('Error unsaving player:', error);
      throw error;
    }

    clearSavedPlayersCache(); // Clear cache after unsaving
    console.log('Cache cleared after unsave, returning success');
    return { success: true };
  } catch (error) {
    console.error('Error in unsavePlayer:', error);
    throw error;
  }
};

export const getSavedPlayers = async (playerType = null) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    let query = supabase
      .from('saved_players')
      .select('*')
      .eq('user_id', user.id);

    if (playerType) {
      query = query.eq('player_type', playerType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching saved players:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getSavedPlayers:', error);
    throw error;
  }
};

// Cache for saved players to avoid repeated database calls
let savedPlayersCachePro = new Set();
let savedPlayersCacheCollege = new Set();
let cacheExpiryPro = 0;
let cacheExpiryCollege = 0;
const CACHE_DURATION = 30000; // 30 seconds

export const getSavedPlayersBatch = async (playerType = 'pro') => {
  try {
    console.log(`getSavedPlayersBatch called for playerType: ${playerType}`);
    const now = Date.now();
    
    // Use the appropriate cache based on player type
    const cache = playerType === 'college' ? savedPlayersCacheCollege : savedPlayersCachePro;
    const cacheExpiry = playerType === 'college' ? cacheExpiryCollege : cacheExpiryPro;
    
    // Return cached data if still valid
    if (now < cacheExpiry && cache.size > 0) {
      console.log(`Using cached saved players for ${playerType}:`, Array.from(cache));
      return Array.from(cache);
    }
    
    console.log(`Cache expired or empty for ${playerType}, fetching fresh data...`);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log(`No user found for ${playerType}, returning empty array`);
      return [];
    }

    const { data, error } = await supabase
      .from('saved_players')
      .select('player_id')
      .eq('user_id', user.id)
      .eq('player_type', playerType);

    if (error) {
      console.error(`Error fetching saved players batch for ${playerType}:`, error);
      return [];
    }

    console.log(`Raw data from database for ${playerType}:`, data);

    // Update the appropriate cache
    const newCache = new Set(data.map(item => String(item.player_id)));
    if (playerType === 'college') {
      savedPlayersCacheCollege = newCache;
      cacheExpiryCollege = now + CACHE_DURATION;
    } else {
      savedPlayersCachePro = newCache;
      cacheExpiryPro = now + CACHE_DURATION;
    }
    
    console.log(`Updated cache with fresh data for ${playerType}:`, Array.from(newCache));
    // console.log(`Player IDs from database for ${playerType}:`, data.map(item => ({ player_id: item.player_id, type: typeof item.player_id })));

    return Array.from(newCache);
  } catch (error) {
    console.error(`Error in getSavedPlayersBatch for ${playerType}:`, error);
    return [];
  }
};

export const isPlayerSaved = async (player, playerType = 'pro') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    // For pro players, use the profile.playerID as the unique identifier
    // For college players, use playerId only (do not fall back to id or name)
    const playerId = playerType === 'pro' 
      ? String(player.profile?.playerProfile?.playerID || player.id || player.name)
      : String(player.playerId);

    // Check the appropriate cache first
    if (playerType === 'pro' && savedPlayersCachePro.has(playerId)) {
      return true;
    }
    if (playerType === 'college' && savedPlayersCacheCollege.has(playerId)) {
      return true;
    }

    // If not in cache, do a single check
    const { data, error } = await supabase
      .from('saved_players')
      .select('id')
      .eq('user_id', user.id)
      .eq('player_id', playerId)
      .eq('player_type', playerType)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking if player is saved:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isPlayerSaved:', error);
    return false;
  }
};

// Clear cache when user signs out or when a player is saved/unsaved
export const clearSavedPlayersCache = () => {
  console.log('Clearing saved players cache. Previous cache size:', savedPlayersCachePro.size, savedPlayersCacheCollege.size);
  savedPlayersCachePro.clear();
  savedPlayersCacheCollege.clear();
  cacheExpiryPro = 0;
  cacheExpiryCollege = 0;
  console.log('Cache cleared successfully');
}; 