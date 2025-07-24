import { supabase } from '../supabase';

export const savePlayer = async (player) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const playerId = player.playerId;
    const playerData = {
      user_id: user.id,
      player_id: String(playerId),
      player_name: player.name,
      team_name: player.team,
      league: player.league || 'Unknown',
      position: player.position,
      player_type: 'college',
      saved_at: new Date().toISOString(),
      player_data: player
    };
    const { data, error } = await supabase
      .from('saved_players')
      .insert([playerData]);
    if (error) {
      if (error.code === '23505') return { success: true, data: null, alreadySaved: true };
      throw error;
    }
    clearSavedPlayersCache();
    return { success: true, data };
  } catch (error) {
    throw error;
  }
};

export const unsavePlayer = async (player) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const playerId = String(player.playerId);
    const { error } = await supabase
      .from('saved_players')
      .delete()
      .eq('user_id', user.id)
      .eq('player_id', playerId)
      .eq('player_type', 'college');
    if (error) throw error;
    clearSavedPlayersCache();
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const getSavedPlayers = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('saved_players')
      .select('*')
      .eq('user_id', user.id)
      .eq('player_type', 'college');
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

let savedPlayersCacheCollege = new Set();
let cacheExpiryCollege = 0;
const CACHE_DURATION = 30000;

export const getSavedPlayersBatch = async () => {
  try {
    const now = Date.now();
    if (now < cacheExpiryCollege && savedPlayersCacheCollege.size > 0) {
      return Array.from(savedPlayersCacheCollege);
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('saved_players')
      .select('player_id')
      .eq('user_id', user.id)
      .eq('player_type', 'college');
    if (error) return [];
    const newCache = new Set(data.map(item => String(item.player_id)));
    savedPlayersCacheCollege = newCache;
    cacheExpiryCollege = now + CACHE_DURATION;
    return Array.from(newCache);
  } catch (error) {
    return [];
  }
};

export const isPlayerSaved = async (player) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const playerId = String(player.playerId);
    if (savedPlayersCacheCollege.has(playerId)) return true;
    const { data, error } = await supabase
      .from('saved_players')
      .select('id')
      .eq('user_id', user.id)
      .eq('player_id', playerId)
      .eq('player_type', 'college')
      .single();
    if (error && error.code !== 'PGRST116') return false;
    return !!data;
  } catch (error) {
    return false;
  }
};

export const clearSavedPlayersCache = () => {
  savedPlayersCacheCollege.clear();
  cacheExpiryCollege = 0;
}; 