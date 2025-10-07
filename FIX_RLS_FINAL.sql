-- FINAL RLS FIX - Run this in Supabase SQL Editor
-- This will completely reset and fix RLS policies

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

-- Step 5: Test the fix
-- This should work now without errors:
SELECT * FROM profiles WHERE id = auth.uid();

-- Step 6: Verify policies were created
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

-- Step 7: Check if profile exists for your user
SELECT
    id,
    email,
    name,
    role,
    created_at
FROM profiles
WHERE id = '51604c40-23e4-44fe-b08d-e7490c1bfba6';

-- If no result, create it manually:
INSERT INTO profiles (id, email, name, role, created_at)
SELECT
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
    'project_manager',
    NOW()
FROM auth.users
WHERE id = '51604c40-23e4-44fe-b08d-e7490c1bfba6'
ON CONFLICT (id) DO UPDATE
SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();
