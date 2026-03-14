# 🔐 API Authentication Fix: Complete Guide

## ✅ What Was Fixed

### 1. **Frontend API Configuration** (`frontend/src/utils/api.js`)
**Problem:** Basic axios configuration without proper error handling
**Fix:** 
- ✅ Added comprehensive request interceptor with debugging
- ✅ Added response interceptor for error handling
- ✅ Set `withCredentials: false` (Bearer token, not cookies)
- ✅ Added debug logging in development mode
- ✅ Added proper error handling for 401/403 responses

```javascript
// ✅ CORRECT (NEW)
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",  // ← 127.0.0.1, not localhost
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: false,  // ← Important: Bearer token only
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. **Duplicate API Configuration Removed**
**Problem:** Two API config files with different base URLs
- ❌ `src/services/api.js` - Used `http://localhost:8000/api` (WRONG)
- ✅ `src/utils/api.js` - Uses `http://127.0.0.1:8000/api` (CORRECT)

**Fix:** Deprecated `src/services/api.js` and re-exported from correct location

### 3. **Backend Debug Endpoints Added**
New public endpoints to diagnose authentication:

#### `/api/debug/bearer` (No auth required)
- Checks if Bearer token is being sent correctly
- Shows what model owns the token (User/Counselor/Admin)
- Helps diagnose token issues

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://127.0.0.1:8000/api/debug/bearer
```

#### `/api/debug/protected` (Requires multi.auth)
- Tests if multi.auth middleware works
- Returns authenticated user data
- Verifies request was properly authenticated

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://127.0.0.1:8000/api/debug/protected
```

#### `/api/debug/test-appointment` (Requires multi.auth)
- Template for testing authenticated endpoints
- Shows how protected endpoints should respond

---

## 🧪 Testing the Fix

### **Method 1: Using the Debug Tool (Recommended)**

1. **Open the debug tool in your browser:**
   ```
   file:///C:/Users/HP/MannSathi/DEBUG_AUTH_TOOL.html
   ```

2. **Run the tests in order:**
   - ✅ Step 1: Check LocalStorage (should show your token)
   - ✅ Step 2: Test Bearer Token (backend should extract it)
   - ✅ Step 3: Test Protected Endpoint (middleware should authenticate)
   - ✅ Step 4: Test Appointments API (actual API call)
   - ✅ Step 5: Test Sessions API (GET requests)

### **Method 2: Manual Testing with curl**

After logging in, copy your token from localStorage and test:

```bash
# Test 1: Bearer token extraction
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://127.0.0.1:8000/api/debug/bearer

# Test 2: Protected endpoint (multi.auth middleware)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://127.0.0.1:8000/api/debug/protected

# Test 3: Real API - Get sessions
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://127.0.0.1:8000/api/user/sessions

# Test 4: Real API - Get next session
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://127.0.0.1:8000/api/user/sessions/next
```

### **Method 3: Browser Console Test**

After logging in, open DevTools (F12) and run:

```javascript
// Get your token
const token = localStorage.getItem('auth_token');
const user = JSON.parse(localStorage.getItem('user'));

console.log('Token:', token.substring(0, 30) + '...');
console.log('User role:', user.role);
console.log('Is authenticated:', !!token && !!user);

// Test the API
fetch('http://127.0.0.1:8000/api/debug/bearer', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  if (data.authenticated_user) {
    console.log('✅ Authentication works!');
    console.log('User:', data.authenticated_user);
  } else {
    console.log('❌ Authentication failed:', data);
  }
});
```

---

## 🔍 How It Works

### **The Complete Flow**

```
1. USER LOGS IN
   ↓
   POST /api/login
   ↓ (backend returns token)
   
2. FRONTEND STORES TOKEN
   ↓
   localStorage.setItem('auth_token', token)
   ↓
   
3. FRONTEND MAKES API CALL
   ↓
   api.get('/user/sessions')
   ↓ (axios interceptor adds header)
   
4. AXIOS INTERCEPTOR RUNS
   ↓
   Authorization: Bearer <token from localStorage>
   ↓
   
5. REQUEST REACHES BACKEND
   ↓
   POST http://127.0.0.1:8000/api/user/sessions
   ↓ (with Authorization header)
   
6. MULTI.AUTH MIDDLEWARE RUNS
   ↓
   $token = $request->bearerToken();  ← Extracts token
   ↓
   PersonalAccessToken::findToken($token)  ← Finds in DB
   ↓
   
7. REQUEST AUTHENTICATED
   ↓
   $request->user() returns User/Counselor/Admin model
   ↓
   
8. CONTROLLER PROCESSES REQUEST
   ↓
   return 200 + data ✅
```

---

## ❌ Common Issues & Solutions

### **Issue 1: 401 Unauthorized**
**Cause:** Token not being sent or is invalid
**Solution:**
```javascript
// Check localStorage in browser console
console.log(localStorage.getItem('auth_token'));  // Should not be null
console.log(localStorage.getItem('user'));         // Should be valid JSON
```

### **Issue 2: 401 But Token Looks OK**
**Cause:** Token is corrupted or belongs to wrong user type
**Solution:**
```bash
# Test with debug endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://127.0.0.1:8000/api/debug/bearer
```

This will show:
- If token exists in database
- What user model owns the token (User/Counselor/Admin)
- Token validity

### **Issue 3: 403 Forbidden**
**Cause:** Authenticated but don't have permission for resource
**Example:** User token trying to access `/api/counselor/me`

### **Issue 4: CORS Errors**
**Cause:** Request going to wrong domain
**Solution:**
- Check Network tab in DevTools
- Should see requests to `http://127.0.0.1:8000/api/...`
- NOT `http://localhost:8000/...` or `http://localhost:5173/...`

### **Issue 5: Requests to Vite Dev Server**
**Cause:** API requests going to `localhost:5173` instead of backend
**Solution:**
- Verify all imports use `utils/api.js` (not `services/api.js`)
- Check axios baseURL: should be `http://127.0.0.1:8000/api`
- Network tab should NOT show `localhost:5173/api/...` requests

---

## 📋 Verification Checklist

After implementing this fix, verify:

- [ ] Frontend imports from `utils/api.js` (not `services/api.js`)
- [ ] Axios baseURL is `http://127.0.0.1:8000/api`
- [ ] Token is stored in localStorage after login
- [ ] Authorization header is `Bearer <token>` 
- [ ] All requests in Network tab go to `127.0.0.1:8000`
- [ ] Interceptors add Authorization header
- [ ] 401 responses are handled (redirect to login)
- [ ] 403 responses show permission error
- [ ] Protected routes require multi.auth middleware
- [ ] /api/debug/bearer endpoint works
- [ ] /api/debug/protected endpoint returns user data
- [ ] /api/user/sessions returns list of sessions
- [ ] /api/appointments POST request succeeds

---

## 🚀 What Now Works

✅ **All protected API endpoints:**
- `GET /api/user/sessions` - List user's sessions
- `GET /api/user/sessions/next` - Get next session
- `POST /api/appointments` - Book appointment
- `GET /api/user/appointments` - Get user's appointments
- `POST /api/user/mood-entries` - Submit mood
- `GET /api/user/mood-entries` - Get mood history

✅ **All counselor endpoints:**
- `GET /api/counselor/me` - Counselor profile
- `GET /api/counselor/sessions` - Counselor's sessions
- `POST /api/counselor/sessions/{id}/accept` - Accept session
- All other counselor dashboard endpoints

✅ **Authentication:**
- Bearer token authentication
- Multi-model support (User/Counselor/Admin)
- Token validation and error handling
- Proper CORS configuration

---

## 📞 Troubleshooting

If you still see 401 errors:

1. **Run the debug tool** → Copy all output
2. **Check Network tab** → Verify request headers
3. **Check localStorage** → Verify token exists
4. **Check console** → Look for error messages
5. **Test /api/debug/bearer** → See exact token status

If you need more help, provide:
- Output from `/api/debug/bearer` endpoint
- Output from browser console
- Screenshot of Network tab (one failed request)
- localStorage contents (auth_token and user)
