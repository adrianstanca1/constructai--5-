# OAuth2 Setup Guide for ConstructAI

## 🔐 Overview

This guide will help you set up OAuth2 authentication with Google and GitHub for ConstructAI.

---

## 🌐 Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/apis/credentials

2. **Select or Create a Project**
   - Click on project dropdown
   - Create new project or select existing one
   - Name: "ConstructAI" (or your choice)

3. **Configure OAuth Consent Screen**
   - Go to: APIs & Services → OAuth consent screen
   - Select **External** user type
   - Click **Create**

   **Fill in details:**
   ```
   App name: ConstructAI
   User support email: your-email@domain.com
   Developer contact: your-email@domain.com
   ```

   - Click **Save and Continue**
   - Skip "Scopes" → **Save and Continue**
   - Skip "Test users" → **Save and Continue**

4. **Create OAuth 2.0 Client ID**
   - Go to: APIs & Services → Credentials
   - Click **+ CREATE CREDENTIALS**
   - Select **OAuth client ID**
   - Application type: **Web application**

   **Configure:**
   ```
   Name: ConstructAI Web Client

   Authorized JavaScript origins:
   - https://jkpeuejmhlccnpyorxfz.supabase.co
   - http://localhost:3000 (for testing)
   - https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app

   Authorized redirect URIs:
   - https://jkpeuejmhlccnpyorxfz.supabase.co/auth/v1/callback
   ```

   - Click **Create**

5. **Copy Credentials**
   - You'll see a popup with:
     - Client ID (looks like: 123456-abc.apps.googleusercontent.com)
     - Client Secret (long string)
   - **SAVE THESE!** You'll need them next

### Step 2: Configure Google OAuth in Supabase

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/providers

2. **Find Google Provider**
   - Scroll to "Google" section
   - Click to expand

3. **Enable and Configure**
   - Toggle **Enable Sign in with Google** to ON
   - Paste **Client ID** from Google Cloud Console
   - Paste **Client Secret** from Google Cloud Console
   - Click **Save**

### Step 3: Get Supabase Callback URL

Copy this URL and add it to Google Cloud Console if not already added:
```
https://jkpeuejmhlccnpyorxfz.supabase.co/auth/v1/callback
```

---

## 🐙 GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. **Go to GitHub Settings**
   - URL: https://github.com/settings/developers
   - Or: GitHub → Settings → Developer settings → OAuth Apps

2. **Click "New OAuth App"**

3. **Fill in Application Details**
   ```
   Application name: ConstructAI

   Homepage URL: https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app

   Application description: Construction Management Platform

   Authorization callback URL: https://jkpeuejmhlccnpyorxfz.supabase.co/auth/v1/callback
   ```

4. **Click "Register application"**

5. **Generate Client Secret**
   - Click **Generate a new client secret**
   - Copy both:
     - Client ID (visible on page)
     - Client Secret (only shown once - save it!)

### Step 2: Configure GitHub OAuth in Supabase

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/providers

2. **Find GitHub Provider**
   - Scroll to "GitHub" section
   - Click to expand

3. **Enable and Configure**
   - Toggle **Enable Sign in with GitHub** to ON
   - Paste **Client ID** from GitHub
   - Paste **Client Secret** from GitHub
   - Click **Save**

---

## 🔧 Update Site URL in Supabase

### Configure Redirect URLs

1. **Go to Authentication Settings**
   - URL: https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/url-configuration

2. **Update Site URL**
   ```
   Production: https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app
   ```

3. **Add Redirect URLs**
   Add both development and production URLs:
   ```
   http://localhost:3000/**
   https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app/**
   ```

4. **Click Save**

---

## 🔄 Update Application Code (Already Done!)

The application already has OAuth buttons ready. They will automatically work once you configure the providers above.

### Login Screen Features:
- ✅ Email/Password login
- ✅ Google OAuth button (will activate after setup)
- ✅ GitHub OAuth button (will activate after setup)
- ✅ Register new account
- ✅ Password recovery (via email)

---

## 🧪 Testing OAuth

### Test Google Login

1. Open: https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app
2. Click **"Sign in with Google"**
3. Select Google account
4. Grant permissions
5. Should redirect back to app and auto-login
6. Check Supabase Dashboard → Authentication → Users
7. New user should appear

### Test GitHub Login

1. Open: https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app
2. Click **"Sign in with GitHub"**
3. Authorize the application
4. Should redirect back to app and auto-login
5. Check Supabase Dashboard → Authentication → Users
6. New user should appear

### Test Local Development

1. Start dev server: `npm run dev`
2. Open: http://localhost:3000
3. Test both Google and GitHub login
4. Should work identically to production

---

## 📋 Configuration Checklist

### Google OAuth ✓
- [ ] Created Google Cloud Project
- [ ] Configured OAuth consent screen
- [ ] Created OAuth 2.0 Client ID
- [ ] Added authorized redirect URIs
- [ ] Copied Client ID and Secret
- [ ] Enabled in Supabase
- [ ] Tested login flow

### GitHub OAuth ✓
- [ ] Created GitHub OAuth App
- [ ] Set callback URL
- [ ] Generated Client Secret
- [ ] Copied Client ID and Secret
- [ ] Enabled in Supabase
- [ ] Tested login flow

### Supabase Configuration ✓
- [ ] Google provider enabled
- [ ] GitHub provider enabled
- [ ] Site URL configured
- [ ] Redirect URLs added
- [ ] Callback URL added to OAuth apps

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution:**
- Check that callback URL in Google/GitHub matches Supabase exactly:
  `https://jkpeuejmhlccnpyorxfz.supabase.co/auth/v1/callback`
- No trailing slashes
- HTTPS (not HTTP)

### Error: "Invalid OAuth credentials"
**Solution:**
- Double-check Client ID and Secret in Supabase
- Make sure they match what's in Google/GitHub
- Try regenerating credentials and updating

### Error: "Access denied"
**Solution:**
- Check OAuth consent screen is published
- Make sure your email is added as test user (for Google)
- Check scopes are correct

### OAuth button doesn't appear
**Solution:**
- Check browser console for errors
- Verify providers are enabled in Supabase
- Clear browser cache
- Check network tab for API calls

### User created but no profile
**Solution:**
- Check if profile trigger exists in database
- Manually create profile in Supabase
- Check application logs

---

## 🔒 Security Best Practices

1. **Keep Secrets Secret**
   - Never commit OAuth secrets to git
   - Use environment variables
   - Rotate secrets periodically

2. **Restrict Origins**
   - Only add necessary domains to authorized origins
   - Remove test/development URLs in production

3. **Monitor OAuth Apps**
   - Review authorized apps regularly
   - Check Supabase auth logs
   - Monitor for suspicious activity

4. **User Privacy**
   - Only request necessary scopes
   - Provide clear privacy policy
   - Allow users to disconnect OAuth

---

## 📱 User Experience

### After OAuth Setup Users Can:

1. **Sign up faster** - No need to remember passwords
2. **Login with one click** - Use existing Google/GitHub account
3. **Secure authentication** - OAuth 2.0 standard security
4. **Profile auto-fill** - Name/email from OAuth provider
5. **Link multiple providers** - Use both Google and GitHub

### Profile Creation

When users sign in with OAuth for the first time:
1. User authenticates with Google/GitHub
2. Supabase creates auth.users entry
3. App creates profile in profiles table
4. User redirected to appropriate dashboard based on role

---

## 🎯 Quick Reference

### Important URLs

**Google Cloud Console:**
https://console.cloud.google.com/apis/credentials

**GitHub OAuth Apps:**
https://github.com/settings/developers

**Supabase Auth Providers:**
https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/providers

**Supabase URL Configuration:**
https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/url-configuration

### Callback URL (Add to all OAuth apps)
```
https://jkpeuejmhlccnpyorxfz.supabase.co/auth/v1/callback
```

### Production URL
```
https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app
```

### Local Development URL
```
http://localhost:3000
```

---

## ✅ Success Criteria

OAuth setup is complete when:
- ✅ Google OAuth button works in production
- ✅ GitHub OAuth button works in production
- ✅ Both work in local development
- ✅ Users can sign up with OAuth
- ✅ Users can login with OAuth
- ✅ Profiles created automatically
- ✅ No console errors
- ✅ Redirect works smoothly

---

## 📞 Need Help?

- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **Google OAuth Docs:** https://developers.google.com/identity/protocols/oauth2
- **GitHub OAuth Docs:** https://docs.github.com/en/developers/apps/building-oauth-apps

---

**Created:** October 7, 2025
**For:** ConstructAI v5.0
**Status:** Ready to configure
