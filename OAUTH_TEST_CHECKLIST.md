# ✅ OAuth2 Testing Checklist

## Pre-Testing Verification

### Google OAuth Configuration ✓
- [ ] Google Cloud project created
- [ ] OAuth consent screen configured (External)
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized JavaScript origins added:
  - [ ] `https://jkpeuejmhlccnpyorxfz.supabase.co`
  - [ ] `http://localhost:3000`
  - [ ] `https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app`
- [ ] Authorized redirect URI added:
  - [ ] `https://jkpeuejmhlccnpyorxfz.supabase.co/auth/v1/callback`
- [ ] Client ID copied
- [ ] Client Secret copied

### GitHub OAuth Configuration ✓
- [ ] GitHub OAuth App created
- [ ] Homepage URL set: `https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app`
- [ ] Authorization callback URL set: `https://jkpeuejmhlccnpyorxfz.supabase.co/auth/v1/callback`
- [ ] Client Secret generated
- [ ] Client ID copied
- [ ] Client Secret copied

### Supabase Configuration ✓
- [ ] Google provider enabled in Supabase
- [ ] Google Client ID added to Supabase
- [ ] Google Client Secret added to Supabase
- [ ] GitHub provider enabled in Supabase
- [ ] GitHub Client ID added to Supabase
- [ ] GitHub Client Secret added to Supabase
- [ ] Site URL configured: `https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app`
- [ ] Redirect URLs added:
  - [ ] `http://localhost:3000/**`
  - [ ] `https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app/**`

---

## Testing Phase 1: Google OAuth

### Production Environment
- [ ] Open: https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app
- [ ] Verify "Sign in with Google" button visible
- [ ] Click "Sign in with Google"
- [ ] Select Google account
- [ ] Grant permissions if prompted
- [ ] Verify redirect back to app
- [ ] Verify logged in (user info displayed)
- [ ] Check Supabase Dashboard → Authentication → Users
- [ ] Verify new user created with Google provider
- [ ] Verify user email matches Google account
- [ ] Check `profiles` table for new profile
- [ ] Verify profile data populated (name, email)
- [ ] Test logout
- [ ] Test login again with same Google account
- [ ] Verify instant login (no re-authorization)

### Local Development
- [ ] Start dev server: `npm run dev`
- [ ] Open: http://localhost:3000
- [ ] Click "Sign in with Google"
- [ ] Verify same flow works locally
- [ ] Verify user persists in Supabase

### Google OAuth Error Cases
- [ ] Try logging in with different Google account
- [ ] Verify creates separate user
- [ ] Test clicking "Sign in with Google" when already logged in
- [ ] Test browser back button during OAuth flow
- [ ] Test with browser in incognito mode

---

## Testing Phase 2: GitHub OAuth

### Production Environment
- [ ] Open: https://constructai-5-d11h4xy4m-adrian-b7e84541.vercel.app
- [ ] Logout if logged in
- [ ] Verify "Sign in with GitHub" button visible
- [ ] Click "Sign in with GitHub"
- [ ] Authorize application
- [ ] Verify redirect back to app
- [ ] Verify logged in (user info displayed)
- [ ] Check Supabase Dashboard → Authentication → Users
- [ ] Verify new user created with GitHub provider
- [ ] Verify user email matches GitHub account
- [ ] Check `profiles` table for new profile
- [ ] Verify profile data populated
- [ ] Test logout
- [ ] Test login again with same GitHub account
- [ ] Verify instant login (no re-authorization)

### Local Development
- [ ] Open: http://localhost:3000
- [ ] Click "Sign in with GitHub"
- [ ] Verify same flow works locally
- [ ] Verify user persists in Supabase

### GitHub OAuth Error Cases
- [ ] Try logging in with different GitHub account
- [ ] Verify creates separate user
- [ ] Test clicking "Sign in with GitHub" when already logged in
- [ ] Test browser back button during OAuth flow
- [ ] Test with browser in incognito mode

---

## Testing Phase 3: Multi-Provider Linking

### Same Email Different Providers
- [ ] Register with email/password using: test@example.com
- [ ] Logout
- [ ] Try logging in with Google using same email
- [ ] Verify behavior (Supabase may link or create separate user)
- [ ] Check Supabase users table
- [ ] Document behavior

### Different Emails Same User
- [ ] Login with Google (email1@gmail.com)
- [ ] Logout
- [ ] Login with GitHub (email2@github.com)
- [ ] Verify creates two separate accounts
- [ ] Check both appear in Supabase

---

## Testing Phase 4: User Experience

### Dashboard Access
- [ ] Login with Google
- [ ] Verify redirected to correct dashboard
- [ ] Verify user role assigned correctly
- [ ] Check profile data populated
- [ ] Test navigation to different pages
- [ ] Verify session persists across pages

### Profile Management
- [ ] Check user profile page
- [ ] Verify OAuth provider shown (Google/GitHub icon)
- [ ] Verify user can update profile info
- [ ] Verify user cannot change email (managed by OAuth)
- [ ] Test profile update saves correctly

### Session Management
- [ ] Login with OAuth
- [ ] Close browser
- [ ] Reopen and navigate to app
- [ ] Verify still logged in (session persisted)
- [ ] Test logout
- [ ] Verify fully logged out
- [ ] Test login again

---

## Testing Phase 5: Error Handling

### Configuration Errors
- [ ] Remove Client ID from Supabase (temporarily)
- [ ] Try OAuth login
- [ ] Verify error message displayed
- [ ] Restore Client ID
- [ ] Verify works again

### Network Errors
- [ ] Start OAuth flow
- [ ] Turn off network mid-flow
- [ ] Verify error handling
- [ ] Turn network back on
- [ ] Retry login

### User Cancellation
- [ ] Click "Sign in with Google"
- [ ] Click "Cancel" in Google auth popup
- [ ] Verify returns to app gracefully
- [ ] Verify no partial user created
- [ ] Same test with GitHub

---

## Testing Phase 6: Security

### Callback URL Validation
- [ ] Check network tab during OAuth flow
- [ ] Verify callback URL matches configured URL
- [ ] Verify no sensitive data in URL parameters
- [ ] Check tokens are handled securely

### Token Management
- [ ] Check browser storage for tokens
- [ ] Verify tokens are httpOnly or secure
- [ ] Test token refresh on expiration
- [ ] Verify logout clears all tokens

### CSRF Protection
- [ ] Check OAuth state parameter
- [ ] Verify state parameter validated
- [ ] Test replaying OAuth callback
- [ ] Verify protected against CSRF

---

## Testing Phase 7: Browser Compatibility

### Chrome
- [ ] Google OAuth
- [ ] GitHub OAuth
- [ ] Session persistence
- [ ] Logout

### Firefox
- [ ] Google OAuth
- [ ] GitHub OAuth
- [ ] Session persistence
- [ ] Logout

### Safari
- [ ] Google OAuth
- [ ] GitHub OAuth
- [ ] Session persistence
- [ ] Logout

### Edge
- [ ] Google OAuth
- [ ] GitHub OAuth
- [ ] Session persistence
- [ ] Logout

### Mobile Browsers (Bonus)
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Test responsive OAuth flow

---

## Testing Phase 8: Performance

### Load Time
- [ ] Measure time from click to logged in
- [ ] Should be < 3 seconds
- [ ] Test with slow 3G connection
- [ ] Verify reasonable performance

### Concurrent Users
- [ ] Multiple users login with OAuth simultaneously
- [ ] Verify no conflicts
- [ ] Check Supabase rate limits
- [ ] All users created correctly

---

## Known Issues to Watch For

### Google OAuth
- ⚠️ "redirect_uri_mismatch" - Check callback URL exactly matches
- ⚠️ "access_denied" - Check consent screen configured
- ⚠️ "invalid_client" - Check Client ID/Secret

### GitHub OAuth
- ⚠️ "redirect_uri_mismatch" - Check callback URL
- ⚠️ "Application suspended" - Check GitHub app status
- ⚠️ "Bad verification code" - Timing issue, retry

### Supabase
- ⚠️ "Invalid provider" - Check provider enabled
- ⚠️ "Email already registered" - Check email uniqueness settings
- ⚠️ "Callback URL mismatch" - Check URL configuration

---

## Post-Testing Cleanup

### Test Users
- [ ] Review all test users in Supabase
- [ ] Delete unnecessary test accounts
- [ ] Keep 1-2 for future testing

### OAuth Apps
- [ ] Review Google OAuth app usage
- [ ] Review GitHub OAuth app usage
- [ ] Check for any errors in logs

### Documentation
- [ ] Document any issues found
- [ ] Update setup guide if needed
- [ ] Note any browser-specific issues

---

## Success Criteria

**OAuth is fully working when:**
- ✅ Google OAuth works in production
- ✅ GitHub OAuth works in production
- ✅ Both work in local development
- ✅ Users can register via OAuth
- ✅ Users can login via OAuth
- ✅ Sessions persist correctly
- ✅ Profiles auto-created
- ✅ No console errors
- ✅ Smooth redirect flow
- ✅ Error handling works
- ✅ All major browsers supported

---

## Testing Completion Report

**Date Tested:** _________________
**Tester:** _____________________
**Environment:** Production / Local
**Result:** Pass / Fail
**Issues Found:** ________________
**Notes:** ______________________

---

**Estimated Testing Time:** 2-3 hours (complete testing)
**Quick Test:** 15 minutes (basic flow only)

**Priority Tests:**
1. Google OAuth login (production)
2. GitHub OAuth login (production)
3. Session persistence
4. Profile creation
5. Logout

Complete these 5 tests first, then proceed with comprehensive testing.
