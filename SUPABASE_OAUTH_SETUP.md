# 🔐 Supabase OAuth Configuration Guide

**Project:** ConstructAI v5.0
**Supabase Project ID:** jkpeuejmhlccnpyorxfz
**Date:** October 7, 2025

---

## 📋 Prerequisites

Before configuring Supabase, you need:

### From Google Cloud Console
- ✅ Google OAuth Client ID
- ✅ Google OAuth Client Secret

### From GitHub
- ✅ GitHub OAuth App Client ID
- ✅ GitHub OAuth App Client Secret

**Don't have these yet?** Follow the setup guides:
- `OAUTH_SETUP_GUIDE.md` - Detailed instructions
- `OAUTH_QUICK_START.md` - Quick 30-minute setup

---

## 🚀 Step-by-Step Configuration

### Step 1: Access Supabase Auth Providers

1. **Open Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/providers
   ```

2. **You should see the Authentication Providers page**
   - List of all available providers
   - Google, GitHub, Apple, Facebook, etc.

---

### Step 2: Configure Google OAuth Provider

#### 2.1 Find Google Provider

1. **Scroll down** to find "Google" section
2. **Click to expand** the Google configuration

#### 2.2 Enable Google OAuth

1. **Toggle the switch** to enable Google
   - Switch should turn blue/green
   - Status: "Enabled"

#### 2.3 Enter Google Credentials

**Paste your credentials from Google Cloud Console:**

1. **Client ID (for OAuth)**
   ```
   Paste your Google Client ID here
   Example: 123456789-abcdefgh.apps.googleusercontent.com
   ```

2. **Client Secret (for OAuth)**
   ```
   Paste your Google Client Secret here
   Example: GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ
   ```

#### 2.4 Optional Configuration

**Authorized Client IDs** (leave empty for now)
**Skip if user not found** (leave unchecked)

#### 2.5 Save Google Configuration

1. **Click "Save"** button at the bottom
2. **Wait for confirmation** - "Provider updated successfully"
3. **Verify:** Google provider should show as "Enabled"

---

### Step 3: Configure GitHub OAuth Provider

#### 3.1 Find GitHub Provider

1. **Scroll down** to find "GitHub" section
2. **Click to expand** the GitHub configuration

#### 3.2 Enable GitHub OAuth

1. **Toggle the switch** to enable GitHub
   - Switch should turn blue/green
   - Status: "Enabled"

#### 3.3 Enter GitHub Credentials

**Paste your credentials from GitHub Developer Settings:**

1. **Client ID**
   ```
   Paste your GitHub Client ID here
   Example: Iv1.a1b2c3d4e5f6g7h8
   ```

2. **Client Secret**
   ```
   Paste your GitHub Client Secret here
   Example: 1234567890abcdef1234567890abcdef12345678
   ```

#### 3.4 Save GitHub Configuration

1. **Click "Save"** button at the bottom
2. **Wait for confirmation** - "Provider updated successfully"
3. **Verify:** GitHub provider should show as "Enabled"

---

### Step 4: Configure Site URL

#### 4.1 Navigate to URL Configuration

1. **Go to Authentication Settings**
   ```
   https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/url-configuration
   ```

2. **You should see "URL Configuration" page**

#### 4.2 Set Site URL

**For localhost development:**
```
http://localhost:3000
```

**For production:**
```
https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app
```

**What to use?**
- If testing locally: use localhost URL
- If deploying: use production URL
- Can update later without issues

#### 4.3 Click "Save"

---

### Step 5: Configure Redirect URLs

#### 5.1 Add Redirect URLs

**In the same URL Configuration page:**

1. **Find "Redirect URLs" section**
2. **Click "Add Redirect URL"**

#### 5.2 Add Development URL

```
http://localhost:3000/**
```

**Important:** Include the `/**` at the end!

1. Paste the URL
2. Click "Add" or press Enter

#### 5.3 Add Production URL

```
https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app/**
```

**Important:** Include the `/**` at the end!

1. Click "Add Redirect URL" again
2. Paste the URL
3. Click "Add" or press Enter

#### 5.4 Verify Redirect URLs

You should now see:
- ✅ `http://localhost:3000/**`
- ✅ `https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app/**`

#### 5.5 Save Configuration

Click **"Save"** button

---

### Step 6: Verify Callback URL

#### 6.1 Check Callback URL

**Your Supabase callback URL is:**
```
https://jkpeuejmhlccnpyorxfz.supabase.co/auth/v1/callback
```

This URL should already be configured in:
- ✅ Google Cloud Console (Authorized redirect URIs)
- ✅ GitHub OAuth App (Authorization callback URL)

#### 6.2 If Not Configured

**Go back and add this URL to:**

**Google Cloud Console:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth Client ID
3. Add to "Authorized redirect URIs"
4. Save

**GitHub OAuth App:**
1. Go to: https://github.com/settings/developers
2. Select your OAuth App
3. Update "Authorization callback URL"
4. Save

---

## ✅ Configuration Checklist

### Supabase Configuration
- [ ] Google provider enabled
- [ ] Google Client ID entered
- [ ] Google Client Secret entered
- [ ] Google configuration saved
- [ ] GitHub provider enabled
- [ ] GitHub Client ID entered
- [ ] GitHub Client Secret entered
- [ ] GitHub configuration saved
- [ ] Site URL configured
- [ ] Redirect URLs added (localhost + production)
- [ ] Configuration saved

### External OAuth Apps
- [ ] Google Cloud Console: Callback URL added
- [ ] GitHub OAuth App: Callback URL added
- [ ] Credentials match exactly in Supabase

---

## 🧪 Testing After Configuration

### Test 1: Check Provider Status

1. **Go to:** https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/providers
2. **Verify:**
   - ✅ Google shows as "Enabled"
   - ✅ GitHub shows as "Enabled"

### Test 2: Test OAuth Login

1. **Open:** http://localhost:3000
2. **Click:** "Sign in with Google"
3. **Expected:** Redirected to Google login
4. **After login:** Redirected back to app
5. **Result:** Logged in successfully

### Test 3: Check User Creation

1. **Go to:** https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/users
2. **Verify:**
   - New user appears in list
   - Provider shows "google" or "github"
   - Email matches OAuth account

### Test 4: Check Profile Creation

1. **Go to:** https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/editor
2. **Open:** `profiles` table
3. **Verify:**
   - New profile exists
   - User ID matches auth.users
   - Email populated
   - Name populated (if available)

---

## 🐛 Common Issues & Solutions

### Issue: "OAuth provider not enabled"

**Symptoms:**
- Button click does nothing
- Console error: "Provider not enabled"

**Solution:**
1. Go to Supabase Auth Providers
2. Verify Google/GitHub toggle is ON
3. Make sure you clicked "Save"
4. Refresh your app

### Issue: "Invalid OAuth credentials"

**Symptoms:**
- Error message: "Invalid credentials"
- OAuth flow doesn't start

**Solution:**
1. Verify Client ID is correct
2. Verify Client Secret is correct
3. Check for extra spaces when copying
4. Try regenerating credentials
5. Update in Supabase

### Issue: "Redirect URI mismatch"

**Symptoms:**
- Error from Google/GitHub
- "redirect_uri_mismatch"
- Can't complete OAuth flow

**Solution:**
1. Verify callback URL exactly matches:
   ```
   https://jkpeuejmhlccnpyorxfz.supabase.co/auth/v1/callback
   ```
2. Check in Google Cloud Console
3. Check in GitHub OAuth App
4. No trailing slash
5. Must be HTTPS

### Issue: "Site URL not configured"

**Symptoms:**
- User redirected to wrong URL
- Lands on Supabase dashboard

**Solution:**
1. Go to Supabase → Auth → URL Configuration
2. Set Site URL to: http://localhost:3000 or production URL
3. Add redirect URLs with /**
4. Save configuration

### Issue: "User created but no profile"

**Symptoms:**
- User in auth.users table
- No matching profile in profiles table
- Can't access app features

**Solution:**
1. Check if profile trigger exists:
   ```sql
   -- This trigger should create profile automatically
   CREATE TRIGGER on_auth_user_created
   AFTER INSERT ON auth.users
   FOR EACH ROW
   EXECUTE FUNCTION handle_new_user();
   ```
2. If missing, manually create profile:
   ```sql
   INSERT INTO profiles (id, email, name, role)
   VALUES (
     '[user-id-from-auth-users]',
     '[user-email]',
     '[user-name]',
     'project_manager'
   );
   ```

### Issue: "CORS error"

**Symptoms:**
- Console error: "CORS policy"
- OAuth button doesn't work

**Solution:**
1. Check Site URL in Supabase
2. Verify redirect URLs include current domain
3. Make sure localhost:3000 is added
4. Clear browser cache
5. Try in incognito mode

---

## 🔍 Verification Steps

### 1. Provider Configuration

**Check each provider:**

```bash
# Google Provider
✅ Enabled: YES
✅ Client ID: Filled
✅ Client Secret: Filled
✅ Status: Active
```

```bash
# GitHub Provider
✅ Enabled: YES
✅ Client ID: Filled
✅ Client Secret: Filled
✅ Status: Active
```

### 2. URL Configuration

```bash
# Site URL
✅ Set to: http://localhost:3000 (or production URL)
✅ Saved: YES

# Redirect URLs
✅ http://localhost:3000/**
✅ https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app/**
✅ Saved: YES
```

### 3. External OAuth Apps

```bash
# Google Cloud Console
✅ OAuth Client ID created
✅ Callback URL added
✅ Credentials match Supabase

# GitHub OAuth App
✅ OAuth App created
✅ Callback URL added
✅ Credentials match Supabase
```

---

## 📊 Configuration Summary

### Supabase Project Details

**Project Name:** ConstructAI
**Project ID:** jkpeuejmhlccnpyorxfz
**Project URL:** https://jkpeuejmhlccnpyorxfz.supabase.co
**Callback URL:** https://jkpeuejmhlccnpyorxfz.supabase.co/auth/v1/callback

### OAuth Providers

| Provider | Status | Client ID | Client Secret |
|----------|--------|-----------|---------------|
| Google   | Enable | Required  | Required      |
| GitHub   | Enable | Required  | Required      |

### Application URLs

| Environment | URL | Redirect URL |
|-------------|-----|--------------|
| Development | http://localhost:3000 | http://localhost:3000/** |
| Production  | https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app | https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app/** |

---

## 🎯 Quick Commands

### View Auth Providers
```
https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/providers
```

### View URL Configuration
```
https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/url-configuration
```

### View Users
```
https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/users
```

### View Profiles Table
```
https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/editor
```

### View Auth Logs
```
https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/logs/auth-logs
```

---

## ✅ Final Checklist

Before testing OAuth:

- [ ] Logged into Supabase dashboard
- [ ] Navigated to Auth Providers page
- [ ] Enabled Google provider
- [ ] Entered Google Client ID
- [ ] Entered Google Client Secret
- [ ] Saved Google configuration
- [ ] Enabled GitHub provider
- [ ] Entered GitHub Client ID
- [ ] Entered GitHub Client Secret
- [ ] Saved GitHub configuration
- [ ] Configured Site URL
- [ ] Added localhost redirect URL
- [ ] Added production redirect URL
- [ ] Saved URL configuration
- [ ] Verified callback URL in Google
- [ ] Verified callback URL in GitHub
- [ ] Tested OAuth login (see OAUTH_TEST_CHECKLIST.md)

---

## 🎉 Success!

**When configuration is complete:**

1. ✅ Both providers show as "Enabled"
2. ✅ All credentials entered correctly
3. ✅ URLs configured properly
4. ✅ Callback URLs match everywhere
5. ✅ OAuth login works smoothly

**Test it now:**
```
http://localhost:3000
```

Click the OAuth buttons and authenticate!

---

## 📞 Need Help?

**Supabase Documentation:**
- Auth Providers: https://supabase.com/docs/guides/auth/social-login
- OAuth Guide: https://supabase.com/docs/guides/auth/social-login/auth-google

**Google OAuth Docs:**
- https://developers.google.com/identity/protocols/oauth2

**GitHub OAuth Docs:**
- https://docs.github.com/en/developers/apps/building-oauth-apps

**Supabase Support:**
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase

---

**Created:** October 7, 2025
**For:** ConstructAI v5.0
**Status:** Ready to configure

**⏱️ Estimated Time:** 10-15 minutes
**💻 Difficulty:** Easy
**🎯 Goal:** Enable OAuth login with Google and GitHub
