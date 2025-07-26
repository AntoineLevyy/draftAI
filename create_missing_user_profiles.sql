-- Create missing user_profiles entries for claimed players
-- Run this in your Supabase SQL editor after running setup_chat_system_simple.sql

-- Insert user_profiles entries for players who have claimed profiles but don't have user_profiles
INSERT INTO user_profiles (user_id, user_type, name, email, created_at, updated_at)
SELECT DISTINCT
  cp.claimed_by_user_id as user_id,
  'Player' as user_type,
  cp.name,
  cp.email_address as email,
  NOW() as created_at,
  NOW() as updated_at
FROM claimed_profiles cp
WHERE cp.claimed_by_user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = cp.claimed_by_user_id
  );

-- Show how many profiles were created
SELECT COUNT(*) as profiles_created FROM user_profiles WHERE user_type = 'Player';

-- Show all player profiles
SELECT user_id, name, email, created_at FROM user_profiles WHERE user_type = 'Player' ORDER BY created_at DESC; 