# 🔄 Clear Session and Reset OAuth

## Problem: Stuck on "Loading session..."

This happens when OAuth flow is interrupted or session is corrupted.

---

## ✅ Quick Fix (2 methods)

### Method 1: Clear Browser Storage (Fastest)

1. **Open DevTools:** Press F12
2. **Go to Application tab** (or Storage in Firefox)
3. **Expand "Local Storage"** in left sidebar
4. **Click on:** `http://localhost:3000`
5. **Right-click** and select **"Clear"**
6. **Expand "Session Storage"**
7. **Click on:** `http://localhost:3000`
8. **Right-click** and select **"Clear"**
9. **Go to Cookies**
10. **Delete all cookies** for localhost:3000
11. **Refresh page:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Method 2: Incognito/Private Window

1. **Open new Incognito window:** Cmd+Shift+N (Mac) or Ctrl+Shift+N (Windows)
2. **Go to:** http://localhost:3000
3. **Fresh session!** No cached data

---

## 🧪 Test After Clearing

### Test Email Login (Recommended First)

1. Open: http://localhost:3000
2. Use demo credentials:
   - Email: `casey@constructco.com`
   - Password: `password123`
3. Click "Sign In"
4. Should login immediately ✅

### Test OAuth (After Email Works)

1. Logout
2. Click "Sign in with Google" or "Sign in with GitHub"
3. Should redirect and work ✅

---

## 🔍 Check Console for Errors

After clearing and refreshing, check console (F12) for:

**Good signs:**
```
✅ Supabase client initialized successfully!
```

**Bad signs (tell me if you see these):**
```
❌ Error fetching profile
❌ Infinite recursion
❌ 500 Internal Server Error
```

---

## 💡 Alternative: Force Logout

If still stuck, run this in browser console:

```javascript
// Clear Supabase session
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

---

## 📋 Quick Commands

### Clear and Restart Server

```bash
cd "/Users/admin/Downloads/constructai (5)"
pkill -f "vite"
npm run dev
```

Then refresh browser.

---

**Try Method 1 (Clear Storage) first, then refresh!** 🚀
