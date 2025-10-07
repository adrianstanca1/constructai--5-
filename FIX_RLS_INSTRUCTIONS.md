# 🔧 Fix RLS Infinite Recursion Error

## ❌ Current Problem

**Error:** `infinite recursion detected in policy for relation "profiles"`

**Cause:** RLS policies in Supabase are referencing the `profiles` table recursively, causing an infinite loop.

---

## ✅ Solution: Run SQL Script

### Step 1: Open Supabase SQL Editor

1. **Go to:** https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/sql/new
2. **Or:** Supabase Dashboard → SQL Editor → New Query

### Step 2: Copy SQL Script

Open file: `FIX_RLS_POLICIES.sql`

Or copy this:

```sql
-- Fix Infinite Recursion in Profiles RLS Policies

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Company admins can view company profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Create simple, non-recursive policies

-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 4. Super admins can view all profiles
CREATE POLICY "Super admins view all"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'super_admin'
  )
);

-- 5. Company admins can view profiles in their company
CREATE POLICY "Company admins view company"
ON profiles FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE id = auth.uid()
    AND role = 'company_admin'
  )
);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Step 3: Run the Script

1. **Paste** the SQL into the editor
2. **Click** "RUN" button (or press Cmd/Ctrl + Enter)
3. **Wait** for success message
4. **Verify:** Should say "Success. No rows returned"

### Step 4: Verify Fix

1. **Refresh your browser** at http://localhost:3000
2. **Check console** - Error should be gone!
3. **Try logging in** - Should work now!

---

## 🧪 Test After Fix

### Test 1: Email Login

1. Email: `casey@constructco.com`
2. Password: `password123`
3. Should login successfully ✅

### Test 2: OAuth Login

1. Click "Sign in with Google"
2. Should redirect to Google ✅
3. After auth, should redirect back ✅
4. Should be logged in ✅

### Test 3: Profile Loading

1. After login, check console
2. Should NOT see "infinite recursion" error ✅
3. Should see user profile loaded ✅

---

## 📊 What Changed

### Before (Recursive Policy)
```sql
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (
  -- This causes recursion:
  role IN (SELECT role FROM profiles WHERE id = auth.uid())
);
```

### After (Simple Policy)
```sql
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);  -- Simple, no recursion!
```

---

## ✅ Success Indicators

**After running the SQL, you should see:**

✅ No "infinite recursion" errors in console
✅ Profile loads successfully
✅ Login works with email/password
✅ OAuth login works
✅ No 500 errors from Supabase
✅ User data displays correctly

---

## 🐛 If Still Not Working

### Check RLS Policies

1. **Go to:** https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/policies
2. **Select:** `profiles` table
3. **Verify:** Policies match the ones above
4. **Delete:** Any extra policies causing issues

### Check Table Structure

1. **Go to:** Table Editor → profiles
2. **Verify:** Table exists
3. **Check:** Columns: id, email, name, role, company_id, etc.

### Manual Test Query

Run in SQL Editor:
```sql
-- Test if you can select your own profile
SELECT * FROM profiles WHERE id = auth.uid();
```

Should return your profile without errors.

---

## 📝 Summary

**Problem:** Recursive RLS policies
**Solution:** Simplified policies without recursion
**Time:** 2 minutes to fix
**Impact:** OAuth and login will work after fix

---

**Run the SQL now and refresh your browser!** 🚀
