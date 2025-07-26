-- Chat System Schema for Coaches and Players
-- Run this in your Supabase SQL editor

-- 1. Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id BIGSERIAL PRIMARY KEY,
  coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one conversation per coach-player pair
  UNIQUE(coach_id, player_id)
);

-- 2. Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure sender is either the coach or player in the conversation
  CONSTRAINT valid_sender CHECK (
    sender_id IN (
      SELECT coach_id FROM conversations WHERE id = conversation_id
      UNION
      SELECT player_id FROM conversations WHERE id = conversation_id
    )
  )
);

-- 3. Create unread_messages table for tracking unread counts
CREATE TABLE IF NOT EXISTS unread_messages (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
  unread_count INTEGER DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One record per user per conversation
  UNIQUE(user_id, conversation_id)
);

-- 4. Enable Row Level Security on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE unread_messages ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for conversations
-- Users can view conversations they're part of
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    auth.uid() = coach_id OR auth.uid() = player_id
  );

-- Coaches can create conversations with players
CREATE POLICY "Coaches can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() = coach_id AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'userType' = 'Coach'
    )
  );

-- 6. RLS Policies for messages
-- Users can view messages in conversations they're part of
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_id 
      AND (conversations.coach_id = auth.uid() OR conversations.player_id = auth.uid())
    )
  );

-- Users can send messages in conversations they're part of
CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_id 
      AND (conversations.coach_id = auth.uid() OR conversations.player_id = auth.uid())
    )
  );

-- Users can update their own messages (for marking as read)
CREATE POLICY "Users can update messages in their conversations" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_id 
      AND (conversations.coach_id = auth.uid() OR conversations.player_id = auth.uid())
    )
  );

-- 7. RLS Policies for unread_messages
-- Users can view their own unread message counts
CREATE POLICY "Users can view their unread messages" ON unread_messages
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own unread message counts
CREATE POLICY "Users can update their unread messages" ON unread_messages
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert unread message records
CREATE POLICY "System can insert unread messages" ON unread_messages
  FOR INSERT WITH CHECK (true);

-- 8. Create indexes for performance
CREATE INDEX idx_conversations_coach_id ON conversations(coach_id);
CREATE INDEX idx_conversations_player_id ON conversations(player_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);

CREATE INDEX idx_unread_messages_user_id ON unread_messages(user_id);
CREATE INDEX idx_unread_messages_conversation_id ON unread_messages(conversation_id);

-- 9. Functions for managing unread counts
CREATE OR REPLACE FUNCTION update_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update unread count for the other user in the conversation
  INSERT INTO unread_messages (user_id, conversation_id, unread_count, last_read_at)
  SELECT 
    CASE 
      WHEN NEW.sender_id = c.coach_id THEN c.player_id
      ELSE c.coach_id
    END,
    NEW.conversation_id,
    COALESCE(um.unread_count, 0) + 1,
    um.last_read_at
  FROM conversations c
  LEFT JOIN unread_messages um ON 
    um.user_id = CASE 
      WHEN NEW.sender_id = c.coach_id THEN c.player_id
      ELSE c.coach_id
    END AND um.conversation_id = NEW.conversation_id
  WHERE c.id = NEW.conversation_id
  ON CONFLICT (user_id, conversation_id) 
  DO UPDATE SET 
    unread_count = unread_messages.unread_count + 1,
    updated_at = NOW();
  
  -- Update conversation updated_at timestamp
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger to automatically update unread counts when messages are inserted
CREATE TRIGGER update_unread_count_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_unread_count();

-- 11. Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(conv_id BIGINT, user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Mark all messages in the conversation as read for this user
  UPDATE messages 
  SET is_read = TRUE 
  WHERE conversation_id = conv_id 
    AND sender_id != user_uuid 
    AND is_read = FALSE;
  
  -- Reset unread count for this user in this conversation
  UPDATE unread_messages 
  SET unread_count = 0, last_read_at = NOW(), updated_at = NOW()
  WHERE conversation_id = conv_id AND user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- 12. Function to get total unread count for a user
CREATE OR REPLACE FUNCTION get_total_unread_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE((
    SELECT SUM(unread_count) 
    FROM unread_messages 
    WHERE user_id = user_uuid
  ), 0);
END;
$$ LANGUAGE plpgsql;

-- 13. Verify the setup
SELECT 'Chat system tables created successfully' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages', 'unread_messages'); 