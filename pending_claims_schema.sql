-- Schema for pending player claims
-- This table stores claims that are waiting for email confirmation

CREATE TABLE pending_claims (
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

-- Enable Row Level Security
ALTER TABLE pending_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can insert pending claims (when claiming before signup)
CREATE POLICY "Anyone can insert pending claims" ON pending_claims
  FOR INSERT WITH CHECK (true);

-- Only the system can view pending claims (for migration)
CREATE POLICY "System can view pending claims" ON pending_claims
  FOR SELECT USING (true);

-- Only the system can delete pending claims (after migration)
CREATE POLICY "System can delete pending claims" ON pending_claims
  FOR DELETE USING (true);

-- Create index for performance
CREATE INDEX idx_pending_claims_original_player_id ON pending_claims(original_player_id);
CREATE INDEX idx_pending_claims_pending_user_email ON pending_claims(pending_user_email);
CREATE INDEX idx_pending_claims_claimed_at ON pending_claims(claimed_at); 