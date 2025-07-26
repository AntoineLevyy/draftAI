-- Complete setup for pending claims system
-- Run this in your Supabase SQL editor

-- 1. Create the pending_claims table
CREATE TABLE IF NOT EXISTS pending_claims (
  id BIGSERIAL PRIMARY KEY,
  original_player_id TEXT NOT NULL, -- ID from the original unclaimed player
  pending_user_email TEXT NOT NULL, -- Email address of the user claiming the profile
  
  -- Personal Information
  name TEXT NOT NULL,
  nationality TEXT,
  year_of_birth TEXT,
  height TEXT,
  weight TEXT,
  position TEXT NOT NULL,

  -- Academic Information
  gpa DECIMAL(3,2),
  credit_hours_taken TEXT,
  finances TEXT,
  available TEXT,

  -- Athletic Information
  current_school TEXT NOT NULL,
  division_transferring_from TEXT NOT NULL,
  years_of_eligibility_left TEXT,
  individual_awards TEXT,
  college_accolades TEXT,

  -- Contact & Media
  email_address TEXT NOT NULL,
  highlights TEXT,
  full_game_link TEXT,
  why_player_is_transferring TEXT,

  -- Metadata
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one pending claim per original player
  UNIQUE(original_player_id)
);

-- 2. Create the claimed_profiles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS claimed_profiles (
  id BIGSERIAL PRIMARY KEY,
  original_player_id TEXT NOT NULL, -- ID from the original unclaimed player
  claimed_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Personal Information
  name TEXT NOT NULL,
  nationality TEXT,
  year_of_birth TEXT,
  height TEXT,
  weight TEXT,
  position TEXT NOT NULL,

  -- Academic Information
  gpa DECIMAL(3,2),
  credit_hours_taken TEXT,
  finances TEXT,
  available TEXT,

  -- Athletic Information
  current_school TEXT NOT NULL,
  division_transferring_from TEXT NOT NULL,
  years_of_eligibility_left TEXT,
  individual_awards TEXT,
  college_accolades TEXT,

  -- Contact & Media
  email_address TEXT NOT NULL,
  highlights TEXT,
  full_game_link TEXT,
  why_player_is_transferring TEXT,

  -- Metadata
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one claim per original player
  UNIQUE(original_player_id)
);

-- 3. Enable Row Level Security on both tables
ALTER TABLE pending_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claimed_profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for pending_claims
-- Anyone can insert pending claims (when claiming before signup)
CREATE POLICY "Anyone can insert pending claims" ON pending_claims
  FOR INSERT WITH CHECK (true);

-- Only the system can view pending claims (for migration)
CREATE POLICY "System can view pending claims" ON pending_claims
  FOR SELECT USING (true);

-- Only the system can delete pending claims (after migration)
CREATE POLICY "System can delete pending claims" ON pending_claims
  FOR DELETE USING (true);

-- 5. RLS Policies for claimed_profiles
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

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pending_claims_original_player_id ON pending_claims(original_player_id);
CREATE INDEX IF NOT EXISTS idx_pending_claims_pending_user_email ON pending_claims(pending_user_email);
CREATE INDEX IF NOT EXISTS idx_pending_claims_claimed_at ON pending_claims(claimed_at);

CREATE INDEX IF NOT EXISTS idx_claimed_profiles_original_player_id ON claimed_profiles(original_player_id);
CREATE INDEX IF NOT EXISTS idx_claimed_profiles_claimed_by_user_id ON claimed_profiles(claimed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_claimed_profiles_position ON claimed_profiles(position);
CREATE INDEX IF NOT EXISTS idx_claimed_profiles_division ON claimed_profiles(division_transferring_from);

-- 7. Function to update the updated_at timestamp for claimed_profiles
CREATE OR REPLACE FUNCTION update_claimed_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_claimed_profiles_updated_at ON claimed_profiles;
CREATE TRIGGER update_claimed_profiles_updated_at
  BEFORE UPDATE ON claimed_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_claimed_profiles_updated_at();

-- 9. Verify the setup
SELECT 'Tables created successfully' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('pending_claims', 'claimed_profiles'); 