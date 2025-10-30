# 🔐 Authentication Transition Guide
**From Mock to Real ROPC (Resource Owner Password Credentials)**

---

## ✅ Current Status: MOCK MODE (Development)

Your app is currently using **mock authentication** which is the **RIGHT approach** while waiting for backend integration details!

### What You Have Now:
```javascript
// testProvider.js
const USE_REAL_API = false; // Currently in MOCK mode
```

**Benefits of Mock Mode:**
- ✅ Full UI/UX development without blocking
- ✅ Team can test features independently
- ✅ No dependency on backend availability
- ✅ Fast development iteration

---

## 🚀 When Backend Is Ready: Transition Steps

### Step 1: Get ROPC Details from Backend Team

Ask your backend developer for:

```
📋 Required Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Token Endpoint:    /auth/token/obtain/
2. Request Format:    { "username": "...", "password": "..." }
3. Response Format:   { "token": "...", "refresh": "..." }
4. Token Type:        "Token" or "Bearer"
5. Token Lifetime:    How long until expiration?
6. Refresh Endpoint:  /auth/refresh/ or /auth/token/refresh/
7. Validation Endpoint: /auth/validate/ (if available)
8. User Profile Endpoint: /auth/me/ or /users/me/ (if available)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 2: Update Configuration

**Option A: Simple Toggle (Quickest)**
```javascript
// services/authProvider/testProvider.js
const USE_REAL_API = true; // ← Change this to true
```

**Option B: Environment Variable (Recommended)**
```env
# .env
AUTH_MODE=real  # Change from "mock" to "real"
```

Then update `testProvider.js`:
```javascript
import Constants from 'expo-constants';

const USE_REAL_API = Constants.expoConfig?.extra?.AUTH_MODE === 'real' || 
                     process.env.AUTH_MODE === 'real';
```

### Step 3: Test Real API Login

1. **Start your backend server** (or use staging/dev environment)
2. **Change `USE_REAL_API = true`**
3. **Try logging in** with real credentials
4. **Check console logs** for API calls:
   ```
   🔧 Auth Mode: REAL API
   🌐 Calling real API: POST /auth/token/obtain/
   🚀 API Request: POST https://your-api.com/api/v1/auth/token/obtain/
   ```

### Step 4: Handle Backend Response Format

Your backend might return different formats. Update the code accordingly:

**Format 1: Django Token Authentication (Most Common)**
```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
}
```

**Format 2: JWT with Refresh**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Format 3: Full User Response**
```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Adjust the code in testProvider.js (line 97):**
```javascript
// Adjust based on your backend response format
const { token, refresh, user: apiUser, access } = response;

// Handle different response formats
const accessToken = token || access;
const refreshToken = refresh || response.refresh_token;
```

---

## 🎯 Recommended Approach: Hybrid System

Keep **both mock and real** authentication working:

### Why Hybrid?
1. ✅ Backend team can develop independently
2. ✅ Frontend team never blocked
3. ✅ Easy demo/testing without backend
4. ✅ Graceful fallback if API is down

### How It Works:
```javascript
// testProvider.js - Already implemented!
if (USE_REAL_API) {
  try {
    // Try real API first
    return await callRealAPI();
  } catch (error) {
    // Fall back to mock if API fails
    return await mockAuth();
  }
}
```

---

## 📋 Backend Integration Checklist

### Before Switching to Real API:

- [ ] **Backend server is running** and accessible
- [ ] **API base URL** is correct in your config
- [ ] **Test credentials** are available (username/password)
- [ ] **Token endpoint** is confirmed: `/auth/token/obtain/`
- [ ] **CORS is enabled** on backend (if calling from web)
- [ ] **Response format** matches expectations
- [ ] **Token header format** confirmed (`Token` or `Bearer`)

### Test These Scenarios:

- [ ] **Valid login** - Returns token successfully
- [ ] **Invalid login** - Returns 400/401 with error message
- [ ] **Token works** - Can call protected endpoints
- [ ] **Token expiry** - Handles expired tokens gracefully
- [ ] **Refresh token** - Can refresh access token
- [ ] **Logout** - Invalidates token on backend

---

## 🔧 Quick Switch Commands

### Switch to REAL API:
```javascript
// In testProvider.js line 7:
const USE_REAL_API = true;
```

### Switch to MOCK API:
```javascript
// In testProvider.js line 7:
const USE_REAL_API = false;
```

### Test Both Modes:
```javascript
// Log current mode on app startup
console.log('🔧 Auth Mode:', USE_REAL_API ? 'REAL API' : 'MOCK');
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "No token received from API"
**Cause:** Backend response format doesn't match
**Solution:** Check backend response format and adjust line 97 in testProvider.js

### Issue 2: "401 Unauthorized" on protected endpoints
**Cause:** Token header format wrong
**Solution:** Check if backend expects `Token` or `Bearer`
```javascript
// In apiClient.js
Authorization: `Token ${token}`  // Django style
// OR
Authorization: `Bearer ${token}` // JWT style
```

### Issue 3: "Network request failed"
**Cause:** Backend not running or URL wrong
**Solution:** 
- Check BASE_URL in apiClient.js
- Verify backend is running
- Check CORS settings

### Issue 4: "CORS policy error" (Web only)
**Cause:** Backend doesn't allow your frontend origin
**Solution:** Ask backend team to add your domain to CORS whitelist

---

## 🎨 User Experience During Transition

### Option 1: Silent Transition (Recommended)
```javascript
// Just switch USE_REAL_API = true
// Users won't notice any difference
```

### Option 2: Show Auth Mode in UI
```javascript
// LoginScreen.js
<Text style={styles.devInfo}>
  {USE_REAL_API ? '🌐 Live API' : '🎭 Mock Mode'}
</Text>
```

### Option 3: Settings Toggle
```javascript
// Let developers toggle in app
<Switch
  value={useRealAPI}
  onValueChange={setUseRealAPI}
/>
```

---

## 📝 Questions to Ask Backend Team

When you receive the ROPC details, confirm:

1. **Endpoint URL**
   ```
   Q: Is it /auth/token/obtain/ or /auth/token/ ?
   Expected: /auth/token/obtain/
   ```

2. **Request Body**
   ```
   Q: What field names for credentials?
   Expected: { "username": "...", "password": "..." }
   OR: { "email": "...", "password": "..." }
   ```

3. **Response Format**
   ```
   Q: What does successful response look like?
   Expected: { "token": "..." }
   OR: { "access": "...", "refresh": "..." }
   ```

4. **Token Header**
   ```
   Q: Do I use "Token" or "Bearer" prefix?
   Expected: Authorization: Token abc123
   OR: Authorization: Bearer abc123
   ```

5. **Token Lifetime**
   ```
   Q: How long is the token valid?
   Expected: 24 hours, 7 days, etc.
   ```

6. **Refresh Mechanism**
   ```
   Q: How do I refresh expired tokens?
   Expected: POST /auth/refresh/ with refresh_token
   ```

7. **User Profile**
   ```
   Q: Does login return user data or do I fetch separately?
   Expected: Returned in login response OR GET /users/me/
   ```

---

## ✅ Your Current Setup is PERFECT

**What you're doing RIGHT:**
1. ✅ Mock authentication for development
2. ✅ Clean separation between mock and real API
3. ✅ Proper token storage (AsyncStorage)
4. ✅ Good error handling
5. ✅ Easy to switch when ready

**You don't need to change anything until backend is ready!**

---

## 🚀 When You're Ready to Switch:

```javascript
// Step 1: Update this one line
const USE_REAL_API = true;

// Step 2: Test login
// Step 3: Check console logs
// Step 4: Verify token works on other endpoints
// Step 5: Deploy!
```

---

## 📞 Need Help?

**Before switching:**
- ✅ Keep using mock mode
- ✅ Continue developing features
- ✅ Test UI/UX flows

**After backend provides details:**
- 📧 Confirm endpoint formats
- 🧪 Test in development first
- 📊 Monitor console logs
- ✅ Gradually roll out to production

---

**Your current approach is industry best practice!** 🎉

Keep developing with mock auth until backend team provides the ROPC configuration.
