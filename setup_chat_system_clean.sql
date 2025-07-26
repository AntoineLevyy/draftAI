-- Clean setup for Chat System
-- This script will drop existing objects and recreate them safely
-- Run this in your Supabase SQL editor

-- 1. Drop existing functions and triggers first
DROP TRIGGER IF EXISTS update_unread_count_trigger ON messages;
DROP FUNCTION IF EXISTS update_unread_count();
DROP FUNCTION IF EXISTS mark_conversation_as_read(BIGINT, UUID);
DROP FUNCTION IF EXISTS get_total_unread_count(UUID);

-- 2. Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS unread_messages CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- 3. Drop existing user_profiles table and recreate it
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 4. Create user_profiles table
CREATE TABLE user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('Coach', 'Player')),
  name TEXT NOT NULL,
  team TEXT,
  email TEXT NOT NULL,
  subscription TEXT DEFAULT 'Yearly ($1,800/yr)',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one profile per user
  UNIQUE(user_id)
);

-- 5. Create conversations table
CREATE TABLE conversations (
  id BIGSERIAL PRIMARY KEY,
  coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one conversation per coach-player pair
  UNIQUE(coach_id, player_id)
);

-- 6. Create messages table
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create unread_messages table
CREATE TABLE unread_messages (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
  unread_count INTEGER DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One record per user per conversation
  UNIQUE(user_id, conversation_id)
);

-- 8. Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE unread_messages ENABLE ROW LEVEL SECURITY;

-- 9. Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Coaches can view all profiles" ON user_profiles;

DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Coaches can create conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON messages;

DROP POLICY IF EXISTS "Users can view their unread messages" ON unread_messages;
DROP POLICY IF EXISTS "Users can update their unread messages" ON unread_messages;
DROP POLICY IF EXISTS "System can insert unread messages" ON unread_messages;

-- 10. Create RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.user_type = 'Coach'
    )
  );

-- 11. Create RLS Policies for conversations
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    auth.uid() = coach_id OR auth.uid() = player_id
  );

CREATE POLICY "Coaches can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() = coach_id AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.user_type = 'Coach'
    )
  );

-- 12. Create RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_id 
      AND (conversations.coach_id = auth.uid() OR conversations.player_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_id 
      AND (conversations.coach_id = auth.uid() OR conversations.player_id = auth.uid())
    )
  );

CREATE POLICY "Users can update messages in their conversations" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_id 
      AND (conversations.coach_id = auth.uid() OR conversations.player_id = auth.uid())
    )
  );

-- 13. Create RLS Policies for unread_messages
CREATE POLICY "Users can view their unread messages" ON unread_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their unread messages" ON unread_messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert unread messages" ON unread_messages
  FOR INSERT WITH CHECK (true);

-- 14. Create indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_user_type ON user_profiles(user_type);

CREATE INDEX idx_conversations_coach_id ON conversations(coach_id);
CREATE INDEX idx_conversations_player_id ON conversations(player_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);

CREATE INDEX idx_unread_messages_user_id ON unread_messages(user_id);
CREATE INDEX idx_unread_messages_conversation_id ON unread_messages(conversation_id);

-- 15. Create functions
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- 16. Create triggers
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

CREATE TRIGGER update_unread_count_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_unread_count();

-- 17. Verify the setup
SELECT 'Chat system setup completed successfully' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'conversations', 'messages', 'unread_messages')
ORDER BY table_name; 