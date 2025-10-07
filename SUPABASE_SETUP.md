# Supabase Setup Guide for ConstructAI

## Prerequisites
- Supabase account (https://supabase.com)
- Project created in Supabase

## Step 1: Get Supabase Credentials

1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL
   - Anon/Public Key

## Step 2: Update Environment Variables

Edit `.env.local` file:

```bash
GEMINI_API_KEY=AIzaSyBMGlpgkQlsTMQC6ldoYWKvtV7cvKURUxQ

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Create Database Schema

Run this SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'company_admin', 'project_manager', 'supervisor', 'operative', 'accountant', 'foreman', 'contractor')),
  avatar TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  budget NUMERIC(15, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date DATE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for projects
CREATE POLICY "Users can view projects in their company" ON projects
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks in their company projects" ON tasks
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN profiles pr ON pr.company_id = p.company_id
      WHERE pr.id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
```

## Step 4: Enable Authentication

1. Go to Authentication → Providers
2. Enable Email provider
3. (Optional) Enable OAuth providers (Google, GitHub)

## Step 5: Test Connection

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Try to register/login
4. Check browser console for errors

## Troubleshooting

### "Supabase is not configured"
- Check that environment variables are set correctly
- Restart the dev server after changing `.env.local`

### "Failed to initialize Supabase client"
- Verify Project URL is correct
- Verify Anon Key is correct
- Check network connectivity

### Authentication issues
- Make sure Email provider is enabled in Supabase
- Check Row Level Security policies
- Verify user exists in auth.users table

## Current Status

✅ Environment variables configured
✅ Supabase client initialized
⚠️ Database schema needs to be created in Supabase
⚠️ Replace demo credentials with real Supabase project

## Next Steps

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema above in SQL Editor
3. Update `.env.local` with real credentials
4. Test authentication flow
