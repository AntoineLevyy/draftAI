-- Simple pending_claims table creation
-- Run this in your Supabase SQL editor

-- Create the pending_claims table if it doesn't exist
CREATE TABLE IF NOT EXISTS pending_claims (
  id BIGSERIAL PRIMARY KEY,
  original_player_id TEXT NOT NULL,
  pending_user_email TEXT NOT NULL,
  name TEXT NOT NULL,
  nationality TEXT,
  year_of_birth TEXT,
  height TEXT,
  weight TEXT,
  position TEXT NOT NULL,
  gpa DECIMAL(3,2),
  credit_hours_taken TEXT,
  finances TEXT,
  available TEXT,
  current_school TEXT NOT NULL,
  division_transferring_from TEXT NOT NULL,
  years_of_eligibility_left TEXT,
  individual_awards TEXT,
  college_accolades TEXT,
  email_address TEXT NOT NULL,
  highlights TEXT,
  full_game_link TEXT,
  why_player_is_transferring TEXT,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(original_player_id)
);

-- Enable RLS
ALTER TABLE pending_claims ENABLE ROW LEVEL SECURITY;

-- Simple policy - allow all operations for now
CREATE POLICY "Allow all operations" ON pending_claims
  FOR ALL USING (true) WITH CHECK (true);

-- Create claimed_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS claimed_profiles (
  id BIGSERIAL PRIMARY KEY,
  original_player_id TEXT NOT NULL,
  claimed_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nationality TEXT,
  year_of_birth TEXT,
  height TEXT,
  weight TEXT,
  position TEXT NOT NULL,
  gpa DECIMAL(3,2),
  credit_hours_taken TEXT,
  finances TEXT,
  available TEXT,
  current_school TEXT NOT NULL,
  division_transferring_from TEXT NOT NULL,
  years_of_eligibility_left TEXT,
  individual_awards TEXT,
  college_accolades TEXT,
  email_address TEXT NOT NULL,
  highlights TEXT,
  full_game_link TEXT,
  why_player_is_transferring TEXT,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(original_player_id)
);

-- Enable RLS
ALTER TABLE claimed_profiles ENABLE ROW LEVEL SECURITY;

-- Simple policy - allow all operations for now
CREATE POLICY "Allow all operations" ON claimed_profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Verify tables were created
SELECT 'Tables created successfully' as status; 