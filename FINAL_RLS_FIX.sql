-- FINAL RLS FIX FOR CONSTRUCTAI
-- Run this complete script in Supabase SQL Editor
-- This will fix all authentication and profile issues

-- ========================================
-- PART 1: FIX RLS POLICIES
-- ========================================

-- DISABLE RLS TEMPORARILY
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- DROP ALL EXISTING POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Company admins can view company profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "enable_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "enable_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "enable_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "enable_read_all_authenticated" ON profiles;

-- DROP THE NEW POLICIES TOO (in case they were created before)
DROP POLICY IF EXISTS "simple_read_own" ON profiles;
DROP POLICY IF EXISTS "simple_update_own" ON profiles;
DROP POLICY IF EXISTS "simple_insert_own" ON profiles;
DROP POLICY IF EXISTS "temp_read_all" ON profiles;

-- CREATE NEW SIMPLE POLICIES
CREATE POLICY "simple_read_own" ON profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "simple_update_own" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "simple_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "temp_read_all" ON profiles FOR SELECT TO authenticated USING (true);

-- RE-ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PART 2: CREATE PROFILE AUTO-CREATION TRIGGER
-- ========================================

-- CREATE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    'project_manager',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- CREATE TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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
-- PART 4: VERIFICATION
-- ========================================

-- Verify policies were created
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
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

-- Success message
SELECT 'RLS policies fixed and profile trigger created successfully!' as status;
