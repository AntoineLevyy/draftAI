import { apiBaseUrl } from '../config';
import { supabase } from '../supabase';

/**
 * Get the current user's access token
 */
const getAccessToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

/**
 * Get all conversations for the current user
 */
export const getConversations = async () => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error('No access token');

    const response = await fetch(`${apiBaseUrl}/api/chat/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch conversations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getConversations:', error);
    throw error;
  }
};

/**
 * Create a new conversation between coach and player
 */
export const createConversation = async (playerId) => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error('No access token');

    console.log('Creating conversation for player:', playerId, 'with token:', token.substring(0, 20) + '...');

    const response = await fetch(`${apiBaseUrl}/api/chat/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ player_id: playerId })
    });

    console.log('Create conversation response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Create conversation error:', errorData);
      throw new Error(errorData.error || 'Failed to create conversation');
    }

    const result = await response.json();
    console.log('Create conversation success:', result);
    return result;
  } catch (error) {
    console.error('Error in createConversation:', error);
    throw error;
  }
};

/**
 * Get all messages in a conversation
 */
export const getMessages = async (conversationId) => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error('No access token');

    const response = await fetch(`${apiBaseUrl}/api/chat/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch messages');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getMessages:', error);
    throw error;
  }
};

/**
 * Send a message in a conversation
 */
export const sendMessage = async (conversationId, content) => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error('No access token');

    const response = await fetch(`${apiBaseUrl}/api/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
};

/**
 * Get total unread message count for the current user
 */
export const getUnreadCount = async () => {
  try {
    const token = await getAccessToken();
    if (!token) return 0; // Return 0 if no token instead of throwing

    const response = await fetch(`${apiBaseUrl}/api/chat/unread-count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // Don't throw on 401/403, just return 0
      if (response.status === 401 || response.status === 403) {
        return 0;
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get unread count');
    }

    const data = await response.json();
    return data.unread_count || 0;
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    return 0; // Return 0 on error to avoid breaking the UI
  }
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (conversationId) => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error('No access token');

    const response = await fetch(`${apiBaseUrl}/api/chat/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete conversation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    throw error;
  }
}; 