# Test Credentials for ConstructAI

## 🧪 Testing Registration

### Step 1: Register a New User

Open http://localhost:3000 and click "Register" or "Sign Up"

**Test Account Details:**
```
Email: admin@constructai.test
Password: Admin123!@#
Name: Admin Test User
Role: company_admin (or super_admin)
```

### Step 2: Verify Registration

After submitting:
1. **Check browser console** (F12 → Console) for any errors
2. **Check Supabase Dashboard:**
   - Go to Authentication → Users
   - You should see the new user
3. **Should redirect** to dashboard after successful registration

### Step 3: Check Profile Created

In Supabase:
1. Go to Table Editor → profiles
2. You should see a profile row with:
   - ID matching the user ID
   - Name, email, role filled in
   - company_id (may be null for first user)

---

## 🔐 Testing Login

After registration, try logging out and logging back in:

```
Email: admin@constructai.test
Password: Admin123!@#
```

Should:
- ✅ Successfully authenticate
- ✅ Redirect to appropriate dashboard
- ✅ Show user info in UI

---

## 🎯 Testing RBAC (Role-Based Access)

Create multiple users with different roles:

### Super Admin
```
Email: superadmin@test.com
Password: Super123!@#
Role: super_admin
```
**Can access:** Everything

### Company Admin
```
Email: companyadmin@test.com
Password: Company123!@#
Role: company_admin
```
**Can access:** Company-level features

### Project Manager
```
Email: pm@test.com
Password: PM123!@#
Role: project_manager
```
**Can access:** Project management features

### Supervisor
```
Email: supervisor@test.com
Password: Super123!@#
Role: supervisor
```
**Can access:** Site supervision features

### Operative
```
Email: worker@test.com
Password: Worker123!@#
Role: operative
```
**Can access:** Limited to assigned tasks

---

## 📊 Testing Data Persistence

### Test Creating a Project

1. Login as company_admin or super_admin
2. Navigate to Projects
3. Click "New Project"
4. Fill in:
   ```
   Name: Test Construction Project
   Description: Testing data persistence
   Start Date: Today
   Budget: 100000
   ```
5. Submit

**Verify:**
- Project appears in list
- Refresh page - project still there
- Check Supabase: Table Editor → projects

### Test Creating a Task

1. Open the project
2. Go to Tasks
3. Create new task:
   ```
   Title: Test Task 1
   Description: Testing task creation
   Priority: high
   Status: pending
   ```
4. Submit

**Verify:**
- Task appears in list
- Refresh page - task persists
- Check Supabase: Table Editor → tasks

---

## 🐛 Common Issues & Solutions

### Issue: "Supabase is not configured"
**Solution:**
- Restart dev server: Ctrl+C then `npm run dev`
- Check `.env.local` has correct values
- Clear browser cache

### Issue: Can't register/login
**Solution:**
- Check browser console for errors
- Verify Email provider is enabled in Supabase
- Check Supabase logs: Logs → Auth Logs

### Issue: "Failed to fetch"
**Solution:**
- Verify Supabase URL and key in `.env.local`
- Check network tab in DevTools
- Ensure RLS policies are created

### Issue: User created but no profile
**Solution:**
- Check if app has code to create profile on signup
- Manually create profile in Supabase if needed
- Check SQL triggers

### Issue: "Row level security policy"
**Solution:**
- Verify RLS policies were created
- Check user is authenticated
- Try logging out and back in

---

## ✅ Success Checklist

- [ ] Can register new user
- [ ] User appears in Supabase Auth → Users
- [ ] Profile created in profiles table
- [ ] Can login with credentials
- [ ] Dashboard loads after login
- [ ] Can create a project
- [ ] Project persists after refresh
- [ ] Can create a task
- [ ] Task persists after refresh
- [ ] Different roles see different dashboards
- [ ] No console errors
- [ ] No RLS policy violations

---

## 🎯 Current Test Status

**Supabase Project:** jkpeuejmhlccnpyorxfz
**Environment:** Development
**App URL:** http://localhost:3000

**Next Steps:**
1. Test user registration
2. Verify authentication flow
3. Test data persistence
4. Test RBAC
5. Deploy to production (Vercel)

---

## 📞 Need Help?

- Check browser console (F12)
- Check Supabase Logs
- Review `SUPABASE_SETUP.md`
- Review `CURRENT_STATUS.md`
