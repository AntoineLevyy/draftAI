-- Fix RLS policies for saved_players table
-- Run this in your Supabase SQL Editor

-- Enable RLS if not already enabled
ALTER TABLE saved_players ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if they exist)
DROP POLICY IF EXISTS "Users can view their own saved players" ON saved_players;
DROP POLICY IF EXISTS "Users can insert their own saved players" ON saved_players;
DROP POLICY IF EXISTS "Users can update their own saved players" ON saved_players;
DROP POLICY IF EXISTS "Users can delete their own saved players" ON saved_players;

-- Create new policies with proper UUID comparison
CREATE POLICY "Users can view their own saved players" ON saved_players
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved players" ON saved_players
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved players" ON saved_players
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved players" ON saved_players
  FOR DELETE USING (auth.uid() = user_id);

-- Verify the policies
SELECT policyname, cmd, permissive FROM pg_policies WHERE tablename = 'saved_players'; 