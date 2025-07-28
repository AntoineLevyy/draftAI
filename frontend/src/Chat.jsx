import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getConversations, getMessages, sendMessage, createConversation, deleteConversation } from './services/chatService';
import { supabase } from './supabase';

const Chat = ({ embedded = false }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        }, 
        (payload) => {
          // If we're in a conversation and the new message belongs to it
          if (selectedConversation && payload.new.conversation_id === selectedConversation.id) {
            setMessages(prev => [...prev, payload.new]);
          }
          // Reload conversations to update latest message and unread counts
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
      
      // Calculate total unread count
      const totalUnread = data.reduce((sum, conv) => sum + conv.unread_count, 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleConversationSelect = async (conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      setSending(true);
      
      // Create optimistic message
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        content: messageContent,
        created_at: new Date().toISOString(),
        is_optimistic: true // Flag to identify optimistic messages
      };
      
      // Add optimistic message to UI immediately
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Send message to server
      const sentMessage = await sendMessage(selectedConversation.id, messageContent);
      
      // Replace optimistic message with real message
      setMessages(prev => prev.map(msg => 
        msg.is_optimistic && msg.content === messageContent 
          ? { ...sentMessage, is_optimistic: false }
          : msg
      ));
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => 
        !(msg.is_optimistic && msg.content === messageContent)
      ));
      
      // Restore the message in input
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async (conversationId, event) => {
    event.stopPropagation(); // Prevent conversation selection
    
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteConversation(conversationId);
      
      // If the deleted conversation was selected, clear the selection
      if (selectedConversation && selectedConversation.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      
      // Reload conversations
      await loadConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div style={embedded ? embeddedContainerStyle : containerStyle}>
        {!embedded && (
          <div style={headerStyle}>
            <button style={backButtonStyle} onClick={onBack}>← Back</button>
            <h2 style={titleStyle}>Messages</h2>
          </div>
        )}
        <div style={loadingStyle}>Loading conversations...</div>
      </div>
    );
  }

  return (
    <div style={embedded ? embeddedContainerStyle : containerStyle}>
      {!embedded && (
        <div style={headerStyle}>
          <button style={backButtonStyle} onClick={onBack}>← Back</button>
          <h2 style={titleStyle}>Messages</h2>
        </div>
      )}

      <div style={contentStyle}>
        {/* Conversations List */}
        <div style={conversationsStyle}>
          <h3 style={sectionTitleStyle}>Conversations</h3>
          {conversations.length === 0 ? (
            <div style={emptyStateStyle}>
              <p>No conversations yet.</p>
              {user?.user_metadata?.userType === 'Coach' && (
                <p>Start a conversation by messaging a saved player.</p>
              )}
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                style={{
                  ...conversationItemStyle,
                  ...(selectedConversation?.id === conversation.id && selectedConversationStyle)
                }}
                onClick={() => handleConversationSelect(conversation)}
              >
                <div style={conversationHeaderStyle}>
                  <span style={conversationNameStyle}>
                    {conversation.other_user.name}
                  </span>
                  <div style={conversationActionsStyle}>
                    {conversation.unread_count > 0 && (
                      <span style={unreadBadgeStyle}>
                        {conversation.unread_count}
                      </span>
                    )}
                    <button
                      style={{
                        ...deleteButtonStyle,
                        ':hover': {
                          color: '#dc3545',
                          backgroundColor: 'rgba(220, 53, 69, 0.1)'
                        }
                      }}
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                      title="Delete conversation"
                      onMouseEnter={(e) => {
                        e.target.style.color = '#dc3545';
                        e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#888';
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div style={conversationPreviewStyle}>
                  {conversation.latest_message ? (
                    <>
                      <span style={conversationTextStyle}>
                        {conversation.latest_message.content.length > 50
                          ? conversation.latest_message.content.substring(0, 50) + '...'
                          : conversation.latest_message.content}
                      </span>
                      <span style={conversationTimeStyle}>
                        {formatTime(conversation.latest_message.created_at)}
                      </span>
                    </>
                  ) : (
                    <span style={conversationTextStyle}>No messages yet</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Messages Area */}
        <div style={messagesAreaStyle}>
          {selectedConversation ? (
            <>
              <div style={messagesHeaderStyle}>
                <div style={messagesHeaderLeftStyle}>
                  <h3 style={messagesTitleStyle}>
                    {selectedConversation.other_user.name}
                  </h3>
                  <span style={userTypeStyle}>
                    {selectedConversation.other_user.user_type}
                  </span>
                </div>
                <button
                  style={{
                    ...deleteButtonStyle,
                    color: '#dc3545'
                  }}
                  onClick={(e) => handleDeleteConversation(selectedConversation.id, e)}
                  title="Delete conversation"
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  🗑️
                </button>
              </div>

              <div style={messagesContainerStyle}>
                {messages.length === 0 ? (
                  <div style={emptyMessagesStyle}>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isOwnMessage = message.sender_id === user.id;
                    const showDate = index === 0 || 
                      formatDate(message.created_at) !== formatDate(messages[index - 1]?.created_at);

                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div style={dateDividerStyle}>
                            {formatDate(message.created_at)}
                          </div>
                        )}
                        <div style={{
                          ...messageStyle,
                          ...(isOwnMessage ? ownMessageStyle : otherMessageStyle)
                        }}>
                          <div style={messageContentStyle}>
                            {message.content}
                          </div>
                          <div style={messageTimeStyle}>
                            {formatTime(message.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={messageInputStyle}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  style={textareaStyle}
                  disabled={sending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  style={{
                    ...sendButtonStyle,
                    ...(sending && disabledButtonStyle)
                  }}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </>
          ) : (
            <div style={noSelectionStyle}>
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column'
};

const embeddedContainerStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '20px',
  paddingBottom: '15px',
  borderBottom: '1px solid #333'
};

const backButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#007bff',
  cursor: 'pointer',
  fontSize: '16px',
  marginRight: '15px',
  padding: '5px 10px',
  borderRadius: '5px',
  transition: 'background-color 0.2s'
};

const titleStyle = {
  margin: 0,
  fontSize: '24px',
  fontWeight: 'bold',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text'
};

const contentStyle = {
  display: 'flex',
  flex: 1,
  gap: '20px',
  minHeight: 0,
  maxHeight: '70vh', // Limit to 70% of viewport height
  overflow: 'hidden' // Prevent overflow
};

const conversationsStyle = {
  width: '300px',
  border: '1px solid #333',
  borderRadius: '8px',
  padding: '15px',
  backgroundColor: '#1a1a1a',
  overflowY: 'auto'
};

const sectionTitleStyle = {
  margin: '0 0 15px 0',
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#fff'
};

const emptyStateStyle = {
  textAlign: 'center',
  color: '#888',
  padding: '20px'
};

const conversationItemStyle = {
  padding: '12px',
  border: '1px solid #333',
  borderRadius: '6px',
  marginBottom: '10px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  backgroundColor: '#2a2a2a'
};

const selectedConversationStyle = {
  borderColor: '#007bff',
  backgroundColor: '#1e3a8a'
};

const conversationHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '5px'
};

const conversationActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const deleteButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#888',
  cursor: 'pointer',
  fontSize: '14px',
  padding: '2px',
  borderRadius: '4px',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ':hover': {
    color: '#dc3545',
    backgroundColor: 'rgba(220, 53, 69, 0.1)'
  }
};

const conversationNameStyle = {
  fontWeight: 'bold',
  color: '#fff',
  fontSize: '14px'
};

const unreadBadgeStyle = {
  backgroundColor: '#dc3545',
  color: '#fff',
  borderRadius: '50%',
  padding: '2px 6px',
  fontSize: '12px',
  minWidth: '18px',
  textAlign: 'center'
};

const conversationPreviewStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '12px'
};

const conversationTextStyle = {
  color: '#ccc',
  flex: 1,
  marginRight: '10px'
};

const conversationTimeStyle = {
  color: '#888',
  fontSize: '11px'
};

const messagesAreaStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid #333',
  borderRadius: '8px',
  backgroundColor: '#1a1a1a',
  maxHeight: '600px', // Limit overall height
  minHeight: '400px'  // Ensure minimum height
};

const messagesHeaderStyle = {
  padding: '15px',
  borderBottom: '1px solid #333',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const messagesHeaderLeftStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const messagesTitleStyle = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#fff'
};

const userTypeStyle = {
  backgroundColor: '#007bff',
  color: '#fff',
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '12px',
  textTransform: 'capitalize'
};

const messagesContainerStyle = {
  flex: 1,
  padding: '15px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxHeight: '400px', // Limit height to prevent infinite growth
  minHeight: '200px'  // Ensure minimum height for usability
};

const emptyMessagesStyle = {
  textAlign: 'center',
  color: '#888',
  padding: '20px'
};

const dateDividerStyle = {
  textAlign: 'center',
  color: '#888',
  fontSize: '12px',
  margin: '10px 0',
  position: 'relative'
};

const messageStyle = {
  maxWidth: '70%',
  padding: '10px 15px',
  borderRadius: '15px',
  marginBottom: '5px'
};

const ownMessageStyle = {
  alignSelf: 'flex-end',
  backgroundColor: '#007bff',
  color: '#fff',
  marginLeft: 'auto'
};

const otherMessageStyle = {
  alignSelf: 'flex-start',
  backgroundColor: '#333',
  color: '#fff'
};

const messageContentStyle = {
  marginBottom: '5px',
  wordWrap: 'break-word'
};

const messageTimeStyle = {
  fontSize: '11px',
  opacity: 0.7,
  textAlign: 'right'
};

const messageInputStyle = {
  padding: '15px',
  borderTop: '1px solid #333',
  display: 'flex',
  gap: '10px',
  alignItems: 'flex-end'
};

const textareaStyle = {
  flex: 1,
  padding: '10px',
  border: '1px solid #333',
  borderRadius: '6px',
  backgroundColor: '#2a2a2a',
  color: '#fff',
  resize: 'none',
  minHeight: '40px',
  maxHeight: '100px',
  fontFamily: 'inherit'
};

const sendButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
  transition: 'background-color 0.2s'
};

const disabledButtonStyle = {
  backgroundColor: '#666',
  cursor: 'not-allowed'
};

const noSelectionStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#888',
  fontSize: '16px'
};

const loadingStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#888',
  fontSize: '16px'
};

export default Chat; 