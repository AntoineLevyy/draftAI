-- Fix existing pending_claims table
-- Run this in your Supabase SQL editor

-- 1. Drop existing policies that might conflict
DROP POLICY IF EXISTS "Anyone can insert pending claims" ON pending_claims;
DROP POLICY IF EXISTS "System can view pending claims" ON pending_claims;
DROP POLICY IF EXISTS "System can delete pending claims" ON pending_claims;

-- 2. Create the correct policies
-- Anyone can insert pending claims (when claiming before signup)
CREATE POLICY "Anyone can insert pending claims" ON pending_claims
  FOR INSERT WITH CHECK (true);

-- Only the system can view pending claims (for migration)
CREATE POLICY "System can view pending claims" ON pending_claims
  FOR SELECT USING (true);

-- Only the system can delete pending claims (after migration)
CREATE POLICY "System can delete pending claims" ON pending_claims
  FOR DELETE USING (true);

-- 3. Ensure claimed_profiles table exists and has correct policies
DROP POLICY IF EXISTS "Players can view their own claimed profile" ON claimed_profiles;
DROP POLICY IF EXISTS "Players can update their own claimed profile" ON claimed_profiles;
DROP POLICY IF EXISTS "Coaches can view all claimed profiles" ON claimed_profiles;
DROP POLICY IF EXISTS "System can insert claimed profiles" ON claimed_profiles;

-- Players can view their own claimed profile
CREATE POLICY "Players can view their own claimed profile" ON claimed_profiles
  FOR SELECT USING (auth.uid() = claimed_by_user_id);

-- Players can update their own claimed profile
CREATE POLICY "Players can update their own claimed profile" ON claimed_profiles
  FOR UPDATE USING (auth.uid() = claimed_by_user_id);

-- Coaches can view all claimed profiles (for recruiting)
CREATE POLICY "Coaches can view all claimed profiles" ON claimed_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'userType' = 'Coach'
    )
  );

-- Only the system can insert claimed profiles (when claim process completes)
CREATE POLICY "System can insert claimed profiles" ON claimed_profiles
  FOR INSERT WITH CHECK (true);

-- 4. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_pending_claims_original_player_id ON pending_claims(original_player_id);
CREATE INDEX IF NOT EXISTS idx_pending_claims_pending_user_email ON pending_claims(pending_user_email);
CREATE INDEX IF NOT EXISTS idx_pending_claims_claimed_at ON pending_claims(claimed_at);

CREATE INDEX IF NOT EXISTS idx_claimed_profiles_original_player_id ON claimed_profiles(original_player_id);
CREATE INDEX IF NOT EXISTS idx_claimed_profiles_claimed_by_user_id ON claimed_profiles(claimed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_claimed_profiles_position ON claimed_profiles(position);
CREATE INDEX IF NOT EXISTS idx_claimed_profiles_division ON claimed_profiles(division_transferring_from);

-- 5. Verify the setup
SELECT 'Tables and policies fixed successfully' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('pending_claims', 'claimed_profiles'); 