-- Delete ALL RLS Policies Manually
-- Run this FIRST, then run FIX_RLS_FINAL.sql

-- Disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop each policy by name (one by one to avoid errors)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Company admins can view company profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins view all" ON profiles;
DROP POLICY IF EXISTS "Company admins view company" ON profiles;
DROP POLICY IF EXISTS "enable_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "enable_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "enable_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "enable_read_all_authenticated" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

-- Verify all policies are gone
SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
-- Should return 0 rows

-- Now create the new simple policies
CREATE POLICY "simple_read_own"
ON profiles FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "simple_update_own"
ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "simple_insert_own"
ON profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- Temporary: Allow any authenticated user to read all profiles
-- (Remove this later for security)
CREATE POLICY "temp_read_all"
ON profiles FOR SELECT TO authenticated
USING (true);

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create profile for your OAuth user
INSERT INTO profiles (id, email, name, role, created_at, updated_at)
SELECT
    id,
    email,
    COALESCE(
        raw_user_meta_data->>'full_name',
        raw_user_meta_data->>'name',
        split_part(email, '@', 1)
    ),
    'project_manager',
    NOW(),
    NOW()
FROM auth.users
WHERE id = '51604c40-23e4-44fe-b08d-e7490c1bfba6'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Verify profile was created
SELECT id, email, name, role FROM profiles
WHERE id = '51604c40-23e4-44fe-b08d-e7490c1bfba6';

-- Should return 1 row with your profile!
