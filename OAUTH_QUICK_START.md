# 🚀 OAuth2 Quick Start Guide

## Setup Order (Complete This First)

### Step 1: Google OAuth (15 minutes)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Sign in with your Google account

2. **Create/Select Project**
   - Click project dropdown at top
   - Click "NEW PROJECT"
   - Name: `ConstructAI`
   - Click "CREATE"

3. **Configure OAuth Consent Screen**
   - Go to: **APIs & Services → OAuth consent screen**
   - Select: **External**
   - Click **CREATE**

   **Fill in required fields:**
   ```
   App name: ConstructAI
   User support email: [your-email@gmail.com]
   Developer contact email: [your-email@gmail.com]
   ```

   - Click **SAVE AND CONTINUE**
   - Skip "Scopes" → **SAVE AND CONTINUE**
   - Skip "Test users" → **SAVE AND CONTINUE**
   - Click **BACK TO DASHBOARD**

4. **Create OAuth Credentials**
   - Go to: **APIs & Services → Credentials**
   - Click **+ CREATE CREDENTIALS**
   - Select **OAuth client ID**
   - Application type: **Web application**
   - Name: `ConstructAI Web Client`

   **Add URLs:**
   ```
   Authorized JavaScript origins:
   https://jkpeuejmhlccnpyorxfz.supabase.co
   http://localhost:3000
   https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app

   Authorized redirect URIs:
   https://jkpeuejmhlccnpyorxfz.supabase.co/auth/v1/callback
   ```

   - Click **CREATE**

5. **Copy Your Credentials**
   - **Client ID** (looks like: 123456789-abc123.apps.googleusercontent.com)
   - **Client Secret** (random string)
   - **SAVE THESE** - you'll need them next!

---

### Step 2: GitHub OAuth (10 minutes)

1. **Go to GitHub Developer Settings**
   - Visit: https://github.com/settings/developers
   - Or: GitHub → Settings → Developer settings → OAuth Apps

2. **Create New OAuth App**
   - Click **New OAuth App**

   **Fill in:**
   ```
   Application name: ConstructAI
   Homepage URL: https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app
   Application description: Construction Management Platform
   Authorization callback URL: https://jkpeuejmhlccnpyorxfz.supabase.co/auth/v1/callback
   ```

   - Click **Register application**

3. **Generate Client Secret**
   - Click **Generate a new client secret**
   - **Copy both:**
     - **Client ID** (visible on page)
     - **Client Secret** (shown only once!)

---

### Step 3: Configure Supabase (5 minutes)

1. **Go to Supabase Auth Providers**
   - Visit: https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/providers

2. **Enable Google Provider**
   - Find "Google" section
   - Toggle **ON**
   - Paste **Client ID** from Google
   - Paste **Client Secret** from Google
   - Click **Save**

3. **Enable GitHub Provider**
   - Find "GitHub" section
   - Toggle **ON**
   - Paste **Client ID** from GitHub
   - Paste **Client Secret** from GitHub
   - Click **Save**

4. **Configure Site URL**
   - Go to: https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/url-configuration
   - Set **Site URL** to: `https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app`
   - Add **Redirect URLs**:
     ```
     http://localhost:3000/**
     https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app/**
     ```
   - Click **Save**

---

## ✅ Testing (5 minutes)

### Test Google Login

1. Open: https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app
2. Click **"Sign in with Google"** button
3. Select your Google account
4. Should redirect back and log you in automatically
5. Check: https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/users
6. Your user should appear!

### Test GitHub Login

1. Open: https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app
2. Click **"Sign in with GitHub"** button
3. Authorize the application
4. Should redirect back and log you in automatically
5. Check Supabase users - new user should appear!

---

## 🐛 Common Issues

### "redirect_uri_mismatch"
**Fix:** Make sure callback URL is exactly:
```
https://jkpeuejmhlccnpyorxfz.supabase.co/auth/v1/callback
```
No trailing slash, must be HTTPS

### "Access denied"
**Fix:** Make sure OAuth consent screen is configured and saved

### "Invalid client"
**Fix:** Double-check Client ID and Secret in Supabase match exactly

---

## 📋 Quick Reference

**Supabase Callback URL (use everywhere):**
```
https://jkpeuejmhlccnpyorxfz.supabase.co/auth/v1/callback
```

**Production URL:**
```
https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app
```

**Supabase Auth Settings:**
```
https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/providers
```

---

## ✨ What Happens After Setup

When users click "Sign in with Google" or "Sign in with GitHub":

1. User clicks OAuth button
2. Redirected to Google/GitHub
3. User authorizes the app
4. Redirected back to your app
5. Supabase creates user account automatically
6. Profile created in `profiles` table
7. User logged in and sent to dashboard

**The code is already ready!** OAuth buttons will work immediately after configuration.

---

**Total Setup Time:** ~30 minutes
**Difficulty:** Easy
**Status:** Ready to configure
