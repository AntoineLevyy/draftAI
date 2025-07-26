-- Schema for claimed player profiles
-- This table stores profiles that have been claimed by players

CREATE TABLE claimed_profiles (
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

-- Enable Row Level Security
ALTER TABLE claimed_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Create index for performance
CREATE INDEX idx_claimed_profiles_original_player_id ON claimed_profiles(original_player_id);
CREATE INDEX idx_claimed_profiles_claimed_by_user_id ON claimed_profiles(claimed_by_user_id);
CREATE INDEX idx_claimed_profiles_position ON claimed_profiles(position);
CREATE INDEX idx_claimed_profiles_division ON claimed_profiles(division_transferring_from);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_claimed_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_claimed_profiles_updated_at
  BEFORE UPDATE ON claimed_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_claimed_profiles_updated_at(); 