# ConstructAI Setup Checklist

## 🎯 Setup Progress

### Phase 1: Supabase Project Creation ⏳

#### Step 1: Create Supabase Project
- [ ] Go to https://supabase.com/dashboard
- [ ] Click "New Project"
- [ ] Fill in details:
  - **Name:** constructai-production (or your choice)
  - **Database Password:** Choose a strong password
  - **Region:** Choose closest to you
  - **Pricing Plan:** Free tier is fine for testing
- [ ] Click "Create new project"
- [ ] Wait 2-3 minutes for project setup

#### Step 2: Get Credentials
Once project is ready:
- [ ] Go to Settings → API
- [ ] Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
- [ ] Copy **anon/public key** (long string starting with `eyJ...`)

#### Step 3: Update Environment Variables
- [ ] Open `.env.local` in this project
- [ ] Replace these values:
```bash
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-actual-anon-key
```
- [ ] Save the file
- [ ] Restart dev server: Stop (Ctrl+C) and run `npm run dev`

---

### Phase 2: Database Setup 📊

#### Step 4: Create Database Schema
- [ ] In Supabase Dashboard, go to **SQL Editor**
- [ ] Click "New Query"
- [ ] Copy ALL SQL from `SUPABASE_SETUP.md` (starting from `CREATE EXTENSION...`)
- [ ] Paste into SQL Editor
- [ ] Click "Run" or press Ctrl/Cmd + Enter
- [ ] Verify success (should see "Success. No rows returned")

#### Step 5: Verify Tables Created
- [ ] Go to **Table Editor** in Supabase
- [ ] Should see these tables:
  - companies
  - profiles
  - projects
  - tasks

---

### Phase 3: Authentication Setup 🔐

#### Step 6: Enable Email Authentication
- [ ] Go to **Authentication → Providers**
- [ ] Ensure **Email** is enabled (should be by default)
- [ ] (Optional) Configure email templates in Authentication → Email Templates

#### Step 7: (Optional) Enable OAuth Providers
If you want Google/GitHub login:
- [ ] Go to Authentication → Providers
- [ ] Click on Google/GitHub
- [ ] Follow instructions to get Client ID/Secret
- [ ] Enable the provider

---

### Phase 4: Testing 🧪

#### Step 8: Test Registration
- [ ] Open http://localhost:3000
- [ ] Click "Register" or "Sign Up"
- [ ] Create a test account:
  - Email: test@example.com
  - Password: Test123!@#
  - Name: Test User
  - Role: Select any role
- [ ] Submit form
- [ ] Check email for confirmation (if email confirmation enabled)
- [ ] Verify registration in Supabase: Authentication → Users

#### Step 9: Test Login
- [ ] Try to login with registered account
- [ ] Should redirect to dashboard
- [ ] Check browser console for errors (F12 → Console)

#### Step 10: Verify Data Persistence
- [ ] Create a test project in the app
- [ ] Refresh the page
- [ ] Project should still be there
- [ ] Check Supabase: Table Editor → projects

---

### Phase 5: Troubleshooting 🔧

#### Common Issues:

**❌ "Supabase is not configured"**
- Solution: Check environment variables in `.env.local`
- Solution: Restart dev server after changing `.env.local`

**❌ "Failed to fetch" or CORS errors**
- Solution: Check Project URL is correct
- Solution: Check API key is the **anon** key, not service role key

**❌ "Row level security policy violated"**
- Solution: Make sure you ran the RLS policies SQL
- Solution: Check Authentication → Policies in Supabase

**❌ Can't register/login**
- Solution: Check Authentication → Providers (Email must be enabled)
- Solution: Check browser console for specific error
- Solution: Try disabling email confirmation temporarily

**❌ "Invalid API key"**
- Solution: Copy the key again from Settings → API
- Solution: Make sure no extra spaces in `.env.local`

---

### Phase 6: Production Deployment 🚀

#### Step 11: Prepare for Deployment
- [ ] Test all features locally
- [ ] Fix any remaining bugs
- [ ] Update README with deployment info

#### Step 12: Deploy to Vercel
- [ ] Run `npm run build` to test build
- [ ] Commit changes to git
- [ ] Push to GitHub
- [ ] Connect to Vercel
- [ ] Add environment variables in Vercel
- [ ] Deploy

---

## 📋 Quick Reference

### Your Credentials
```bash
# Fill these in after creating Supabase project:
Project Name: ___________________________
Project URL: ____________________________
Anon Key: _______________________________
Database Password: ______________________
```

### Useful Links
- Supabase Dashboard: https://supabase.com/dashboard
- Supabase Docs: https://supabase.com/docs
- Local App: http://localhost:3000

---

## ✅ Completion Checklist

Before marking setup as complete, verify:
- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Environment variables updated
- [ ] Can register new user
- [ ] Can login with user
- [ ] Data persists after refresh
- [ ] No console errors
- [ ] All tables visible in Supabase

---

**Current Status:** 🔴 Waiting for Supabase project creation

**Next Action:** Create Supabase project at https://supabase.com/dashboard/new
