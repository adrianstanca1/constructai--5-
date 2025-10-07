# 🔍 Check OAuth User Creation

## What Happened

1. ✅ You clicked "Sign in with Google"
2. ✅ Google authenticated you
3. ✅ Redirected back to app
4. ❌ But you're not logged in (back to login screen)

## Why This Happens

**User exists in auth.users BUT profile missing in profiles table!**

---

## 🔧 Check and Fix

### Step 1: Check if User Exists in Auth

1. **Go to:** https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/users
2. **Look for:** Your Google email in the users list
3. **Check provider:** Should say "google"
4. **Copy the User ID** (UUID like: 12345678-1234-1234-1234-123456789012)

### Step 2: Check if Profile Exists

1. **Go to:** https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/editor
2. **Open table:** `profiles`
3. **Look for:** Your user ID
4. **If missing:** Profile doesn't exist! (This is the problem)

### Step 3: Create Profile Manually

**Run this SQL in Supabase SQL Editor:**

```sql
-- Replace USER_ID_HERE with your actual ID from Step 1
-- Replace YOUR_EMAIL with your Google email

INSERT INTO profiles (id, email, name, role, created_at)
VALUES (
  'USER_ID_HERE',           -- Your user ID from auth.users
  'YOUR_EMAIL@gmail.com',   -- Your Google email
  'Your Name',              -- Your name
  'project_manager',        -- Default role
  NOW()
)
ON CONFLICT (id) DO NOTHING;
```

**Or find all users without profiles and create them:**

```sql
-- Find users missing profiles
SELECT
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name' as name
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Create profiles for all users without one
INSERT INTO profiles (id, email, name, role, created_at)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  'project_manager',
  NOW()
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL;
```

### Step 4: Try Login Again

1. **Refresh browser:** http://localhost:3000
2. **Click "Sign in with Google"**
3. **Should work now!** ✅

---

## 🤖 Better Solution: Auto-Create Profile

We need a database trigger to auto-create profiles!

**Run this SQL:**

```sql
-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'project_manager',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**This will:**
- ✅ Auto-create profile when user registers
- ✅ Auto-create profile when user uses OAuth
- ✅ No manual intervention needed

---

## 🧪 Test After Fix

1. **Delete your OAuth user** (optional - for clean test)
   - Go to: https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/users
   - Find your user
   - Click ... → Delete

2. **Try OAuth again**
   - Click "Sign in with Google"
   - Should auto-create profile
   - Should login successfully! ✅

---

## ✅ Success Indicators

After the fix:
- ✅ Login with Google → Profile created automatically
- ✅ Dashboard loads with your data
- ✅ No "invalid credentials" error
- ✅ No redirect back to login

---

**Run the trigger SQL first, then try logging in again!** 🚀
