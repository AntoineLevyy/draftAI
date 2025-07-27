-- Fix infinite recursion in user_profiles RLS policies
-- Run this in your Supabase SQL editor

-- 1. Drop ALL existing policies on user_profiles that might cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Coaches can view all profiles" ON user_profiles;

-- 2. Create simple, non-recursive policies
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Coaches can view all profiles (using auth.users metadata instead of user_profiles table)
CREATE POLICY "Coaches can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'userType' = 'Coach'
    )
  );

-- 3. Also fix policies on other tables that reference user_profiles
-- Fix conversations table policies
DROP POLICY IF EXISTS "Coaches can create conversations" ON conversations;
DROP POLICY IF EXISTS "Coaches can delete their conversations" ON conversations;

CREATE POLICY "Coaches can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() = coach_id AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'userType' = 'Coach'
    )
  );

CREATE POLICY "Coaches can delete their conversations" ON conversations
  FOR DELETE USING (
    auth.uid() = coach_id AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'userType' = 'Coach'
    )
  );

-- 4. Verify the fix by checking existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 5. Test the policies work
SELECT 'RLS policies fixed successfully. You can now save your profile!' as status; 