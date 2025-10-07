-- COMPLETE RLS AND PROFILE FIX
-- Run this in Supabase SQL Editor to fix all authentication issues
-- This combines RLS policy fixes and auto-profile creation

-- ========================================
-- PART 1: FIX RLS POLICIES
-- ========================================

-- Step 1: Disable RLS temporarily to clean up
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', r.policyname);
    END LOOP;
END $$;

-- Step 3: Create simple, working policies

-- Policy 1: Users can read their own profile (SIMPLE - no recursion)
CREATE POLICY "enable_read_own_profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy 2: Users can update their own profile (SIMPLE)
CREATE POLICY "enable_update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 3: Users can insert their own profile (for new registrations)
CREATE POLICY "enable_insert_own_profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Policy 4: Public read for authenticated users (TEMPORARY - for testing)
-- This allows any authenticated user to read any profile
-- You can remove this later and make it more restrictive
CREATE POLICY "enable_read_all_authenticated"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Step 4: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PART 2: AUTO-CREATE PROFILE TRIGGER
-- ========================================

-- Step 1: Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert profile for new user
  INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    'project_manager',  -- Default role
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate key errors

  RETURN NEW;
END;
$$;

-- Step 2: Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- PART 3: CREATE PROFILES FOR EXISTING USERS
-- ========================================

-- Create profiles for existing users without one
INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
SELECT
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ),
  'project_manager',
  NOW(),
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- PART 4: VERIFICATION AND TESTING
-- ========================================

-- Verify policies were created
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'profiles';

-- Verify trigger was created
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Test: Count users vs profiles
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles;

-- Show all users and their profiles
SELECT
  u.id,
  u.email,
  u.created_at as user_created,
  p.name,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC;

-- Test the fix - this should work now without errors:
SELECT * FROM profiles WHERE id = auth.uid();
