-- Auto-Create Profile Trigger for OAuth Users
-- Run this in Supabase SQL Editor

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

-- Step 4: Create profiles for existing users without one
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
