# 403 Forbidden Error: Authentication Debugging Guide

## 🔍 Root Cause Analysis

A **403 Forbidden** means:
- ✅ Your request REACHED the server
- ✅ Your token WAS VALIDATED
- ❌ But the token doesn't grant access to this resource

In your case, the CounselorDashboardController checks:
```php
if (!($user instanceof Counselor)) {
    return response()->json(['message' => 'Unauthorized'], 403);
}
```

This means **the wrong type of user is authenticated**. You might be logged in as a regular **User** instead of a **Counselor**.

---

## 🛠️ Step-by-Step Debugging

### Step 1: Check Your Current Token
Open browser DevTools → Application → Local Storage, and verify:
- `auth_token` exists
- `user` contains a counselor object (not a regular user)

Expected:
```json
{
  "id": 1,
  "name": "Aashna Shrestha",
  "email": "aashna.shrestha@mannsathi.com",
  "role": "counselor",  // ← Important
  "hospital_id": 1,
  "status": "APPROVED"
}
```

### Step 2: Test Token Validity
Open a new tab and paste this URL:
```
http://127.0.0.1:8000/api/debug/auth
```

Then in the address bar, manually add the Authorization header using Postman or curl:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://127.0.0.1:8000/api/debug/auth
```

**Expected Response:**
```json
{
  "has_token": true,
  "token_valid": true,
  "tokenable_type": "App\\Models\\Counselor",
  "is_counselor": true,
  "is_user": false
}
```

**If you see `is_counselor: false`:**
- Your token belongs to a User model, not a Counselor model
- You logged in via the wrong endpoint (`/user/login` instead of `/counselor/login`)
- **Solution:** Clear localStorage and log in again via `/counselor/login`

### Step 3: Clear All Auth State
Run this in browser console:
```javascript
// Clear all auth-related data
localStorage.removeItem("auth_token");
localStorage.removeItem("user");
localStorage.removeItem("counselor");
localStorage.removeItem("counselor_online");

// Clear session storage too
sessionStorage.clear();

// Restart the app
window.location.reload();
```

### Step 4: Log In Again via Correct Endpoint
1. Navigate to `http://localhost:5173/counselor/login`
2. Use one of these test accounts:
   - Email: `aashna.shrestha@mannsathi.com`
   - Email: `ramesh.karki@mannsathi.com`
3. Password: whatever you set during counselor registration
4. Verify redirect to `/counselor/dashboard`

### Step 5: Test API Calls Again
In browser console (Network tab open), run:
```javascript
const token = localStorage.getItem('auth_token');
const user = JSON.parse(localStorage.getItem('user'));

console.log('Token:', token);
console.log('User role:', user?.role);
console.log('Is Counselor?', user?.role === 'counselor');

// Try the API call
fetch('http://127.0.0.1:8000/api/counselor/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(console.log);
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: Multiple Tabs with Different Logins
**Problem:** One tab logged in as User, another as Counselor
**Solution:** 
- Close all other browser tabs
- Clear ALL local/session storage
- Delete all cookies for localhost
- Log in fresh

### Issue 2: Token Expired or Corrupted
**Problem:** Token stored but invalid
**Solution:**
- Clear localStorage
- Log in again
- The new token should work

### Issue 3: Wrong Endpoint Used
**Problem:** Used `/api/login` (User) instead of `/api/counselor/login`
**Solution:**
- Clear auth state
- Navigate to `/counselor/login` page
- Log in with counselor credentials

### Issue 4: Middleware Not Recognizing Counselor
**Problem:** `multi.auth` middleware isn't finding the Counselor model
**Solution:**
- Run migrations: `php artisan migrate`
- Check counselor table exists: `php artisan tinker`
- Verify Counselor model: `DB::table('counselors')->first();`

---

## 🔧 Backend Diagnostics

If frontend debugging doesn't help, run these on the backend:

### Check Counselor Exists
```bash
cd backend
php artisan tinker
DB::table('counselors')->select('id', 'email', 'status')->get();
# Should show: ID | EMAIL | STATUS (APPROVED)
```

### Check Token Created
```bash
DB::table('personal_access_tokens')->where('tokenable_type', 'App\\Models\\Counselor')->get();
# Should show tokens for your counselor
```

### Check Middleware
```bash
php artisan route:list --path=counselor/me
# Should show: GET|HEAD api/counselor/me ... multi.auth
```

---

## 📊 Expected Flow

```
1. [Frontend] POST /api/counselor/login
   ↓ (email + password)
2. [Backend] CounselorAuthController.login()
   ↓ (creates token->plainTextToken)
3. [Frontend] localStorage.setItem('auth_token', token)
   ↓
4. [Frontend] api.get('/counselor/me')
   ↓ (includes Authorization: Bearer token)
5. [Backend] multi.auth middleware
   ↓ (finds PersonalAccessToken, gets tokenable=Counselor model)
6. [Backend] $request->user() returns Counselor instance
   ↓
7. [Backend] CounselorDashboardController.me()
   ↓ (checks instanceof Counselor → PASS)
8. [Backend] returns 200 + counselor data ✅
```

---

## 🚀 Quick Fix Checklist

- [ ] Clear browser cache and cookies for localhost
- [ ] Close all browser tabs except one
- [ ] Clear localStorage: `localStorage.clear()`
- [ ] Navigate to `/counselor/login` (NOT `/login`)
- [ ] Log in with counselor email
- [ ] Verify localStorage has `user.role = 'counselor'`
- [ ] Refresh dashboard
- [ ] Check Network tab for 200 responses instead of 403

---

## 📞 Still Not Working?

Provide these diagnostics:
1. Output from `/api/debug/auth` (with your actual token)
2. Output from `DB::table('counselors')->select('id', 'email', 'status')->get();`
3. Output from `DB::table('personal_access_tokens')->latest()->first();`
4. Which email you used to log in
5. Browser console errors (if any)
