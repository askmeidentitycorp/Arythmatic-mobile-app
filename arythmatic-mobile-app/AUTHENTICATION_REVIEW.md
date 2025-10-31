# Authentication Architecture Review

## Executive Summary

The app uses a **hybrid authentication approach**: mock login with real API integration via a global access token. This is a temporary solution until Resource Owner Password Grant (ROPG) authentication becomes available from the backend API.

---

## Current Implementation: Mock Login + Global Token

### Architecture Overview

```
User Login (Mock) → AuthController → TestProvider → Global Token → API Calls
     ↓                    ↓               ↓               ↓            ↓
 Credentials      Routes to Test    Validates      Sets Token    Real Data
   Validated       Provider         Locally        in Storage    from API
```

### Key Components

#### 1. **testProvider.js** (Mock Authentication)
- **Location**: `services/authProvider/testProvider.js`
- **Purpose**: Provides mock authentication for development
- **Global Token**: `602a23070f1c92b8812773e645b7bf2f4a1cc4fc`
- **Mock Users**: 
  - `test@test.com` / `test123`
  - `admin@test.com` / `admin123`
  - `demo@demo.com` / `demo123`
  - `user@example.com` / `password123`

**Key Functions**:
- `signInTest()`: Validates credentials locally, returns global access token
- `signOutTest()`: Clears stored auth data
- `getCurrentUserTest()`: Retrieves stored user + token
- `refreshTokenTest()`: Refreshes mock tokens

**Token Logic**:
```javascript
if (GLOBAL_ACCESS_TOKEN && GLOBAL_ACCESS_TOKEN !== 'YOUR_GLOBAL_ACCESS_TOKEN_HERE') {
  // Use real API token
  accessToken = GLOBAL_ACCESS_TOKEN;
} else {
  // Fall back to mock token
  accessToken = generateMockToken(user);
}
```

#### 2. **authController.js** (Provider Router)
- **Location**: `services/authController.js`
- **Purpose**: Routes auth calls to appropriate provider (TEST, MSAL, OIDC)
- **Current Provider**: `TEST` (configured in `authConfig.js`)
- Supports multi-provider architecture for future ROPG/MSAL integration

#### 3. **AuthContext.js** (State Management)
- **Location**: `contexts/AuthContext.js`
- **Purpose**: Centralized auth state using React Context + useReducer
- **State**: `isAuthenticated`, `user`, `accessToken`, `isLoading`, `error`
- Initializes auth on app launch
- Sets token in apiClient after successful login

#### 4. **apiClient.js** (API Layer)
- **Location**: `services/apiClient.js`
- **Purpose**: HTTP client for all API requests
- **Base URL**: `https://interaction-tracker-api-133046591892.us-central1.run.app/api/v1`
- **Token Handling**: 
  - Retrieves token from AsyncStorage
  - Injects as `Authorization: Token <token>` header
  - Handles 401 responses (invalid/expired tokens)

**Token Flow**:
```javascript
async getToken() {
  if (this.token) return this.token;
  this.token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return this.token;
}

async request(endpoint, options = {}) {
  const token = await this.getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Token ${token}` }),
    },
  };
  // ... fetch request
}
```

---

## Future Implementation: ROPG (Resource Owner Password Grant)

### What is ROPG?

**Resource Owner Password Grant** (OAuth 2.0 Flow):
- User provides username + password to app
- App sends credentials directly to backend auth endpoint
- Backend validates credentials and returns real access token
- App uses token for API requests

### ROPG vs Current Mock Auth

| Aspect | Mock Auth (Current) | ROPG (Future) |
|--------|---------------------|---------------|
| **Credentials** | Validated locally in app | Validated by backend API |
| **Token** | Global token (all users share) | User-specific token |
| **Security** | Low (no real auth) | High (OAuth 2.0 standard) |
| **API Data** | Real data via shared token | Real data via user token |
| **User Sessions** | Mock users with mock IDs | Real users with real IDs |
| **Token Expiry** | Mock expiry (24h) | Real expiry from backend |
| **Refresh Tokens** | Mock refresh | Real refresh via OAuth |

### ROPG Implementation Plan

#### Step 1: Backend API Readiness
- [ ] Backend provides `/auth/token/` endpoint (ROPG)
- [ ] Backend returns `access_token`, `refresh_token`, `expires_in`
- [ ] Backend supports token refresh via `/auth/token/refresh/`

#### Step 2: Create ROPG Provider
Create `services/authProvider/ropgProvider.js`:

```javascript
export const signInROPG = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'password',
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  const { access_token, refresh_token, expires_in } = await response.json();
  
  // Fetch user profile with token
  const userResponse = await fetch(`${API_BASE_URL}/auth/me/`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  
  const user = await userResponse.json();

  // Store tokens
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.AUTH_TOKEN, access_token],
    [STORAGE_KEYS.REFRESH_TOKEN, refresh_token],
    [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
  ]);

  return { user, tokens: { accessToken: access_token, refreshToken: refresh_token } };
};
```

#### Step 3: Update authController.js
Add ROPG case to switch statements:

```javascript
case AUTH_PROVIDERS.ROPG:
  return await signInROPG(username, password);
```

#### Step 4: Update authConfig.js
Change provider:

```javascript
export const AUTH_PROVIDER = AUTH_PROVIDERS.ROPG; // was TEST
```

#### Step 5: Update apiClient.js
Change token format if needed (Bearer vs Token):

```javascript
Authorization: `Bearer ${token}` // instead of Token
```

---

## Global Access Token: Current Setup

### Token Information
- **Value**: `602a23070f1c92b8812773e645b7bf2f4a1cc4fc`
- **Location**: `testProvider.js` line 9
- **Type**: API Token (not user-specific)
- **Purpose**: Allows dev/test app to fetch real data without ROPG

### Token Usage Flow

1. **Login**: User enters mock credentials
2. **Validation**: App validates locally (no backend call)
3. **Token Assignment**: App assigns global token to user session
4. **Storage**: Token stored in AsyncStorage
5. **API Calls**: apiClient injects token in all requests
6. **Backend**: Backend validates token, returns real data

### Verification Checklist

✅ **Token is configured**: Set in `testProvider.js` line 9  
✅ **Token is stored**: Saved to AsyncStorage on login  
✅ **Token is retrieved**: apiClient reads from storage  
✅ **Token is injected**: Added to Authorization header  
✅ **Token format**: `Authorization: Token <token>` (not Bearer)  

### Token Security Notes

⚠️ **Current Limitations**:
- Token is hardcoded in source code (visible in version control)
- All users share the same token (no per-user permissions)
- No real authentication (mock credentials only)
- Token doesn't expire (no refresh flow)

🔒 **ROPG Will Improve**:
- User-specific tokens (per-user permissions)
- Real credential validation
- Token expiry + refresh mechanism
- No hardcoded secrets

---

## Authentication Flow Diagrams

### Current: Mock Auth + Global Token

```
┌─────────────┐
│   Login     │
│   Screen    │
└──────┬──────┘
       │ test@test.com / test123
       ▼
┌─────────────┐
│ testProvider│
│  .signIn()  │
└──────┬──────┘
       │ Validate locally
       ▼
┌─────────────┐
│   Return    │
│ Global Token│ 602a23070f1c92b8812773e645b7bf2f4a1cc4fc
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ AsyncStorage│ Store token + user
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  apiClient  │ Get token from storage
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  API Call   │ Authorization: Token 602a2307...
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Backend    │ Validate token → Return real data
└─────────────┘
```

### Future: ROPG

```
┌─────────────┐
│   Login     │
│   Screen    │
└──────┬──────┘
       │ user@example.com / password
       ▼
┌─────────────┐
│ ropgProvider│
│  .signIn()  │
└──────┬──────┘
       │ POST /auth/token/
       ▼
┌─────────────┐
│  Backend    │ Validate credentials
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Return    │ access_token: abc123xyz
│User+Token   │ refresh_token: refresh_abc
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ AsyncStorage│ Store user + tokens
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  apiClient  │ Get token from storage
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  API Call   │ Authorization: Bearer abc123xyz
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Backend    │ Validate user token → Return user data
└─────────────┘
```

---

## Code Locations Reference

| Component | File Path | Line(s) |
|-----------|-----------|---------|
| Global Token | `services/authProvider/testProvider.js` | 9 |
| Mock Users | `services/authProvider/testProvider.js` | 17-50 |
| Sign In Logic | `services/authProvider/testProvider.js` | 82-145 |
| Auth Controller | `services/authController.js` | All |
| Auth Context | `contexts/AuthContext.js` | All |
| API Client | `services/apiClient.js` | All |
| Token Injection | `services/apiClient.js` | 31-41 |
| Auth Config | `constants/authConfig.js` | All |

---

## Migration Checklist: Mock → ROPG

When ROPG becomes available:

- [ ] Get ROPG endpoint details from backend team
- [ ] Create `services/authProvider/ropgProvider.js`
- [ ] Implement `signInROPG()`, `signOutROPG()`, `getCurrentUserROPG()`
- [ ] Update `authController.js` to support ROPG provider
- [ ] Update `constants/authConfig.js` to set `AUTH_PROVIDER = 'ropg'`
- [ ] Update `apiClient.js` token format if needed (Bearer vs Token)
- [ ] Test login flow with real credentials
- [ ] Test token refresh flow
- [ ] Test API calls with user-specific tokens
- [ ] Remove global token from `testProvider.js`
- [ ] Update environment config to hide sensitive data

---

## Recommendations

### Short Term (Current Mock Auth)
✅ Keep global token for development  
✅ Use mock users for testing different roles  
✅ Monitor API calls to ensure token is injected  
✅ Document this architecture for team  

### Medium Term (Preparing for ROPG)
🔧 Keep testProvider as fallback for offline dev  
🔧 Design ROPG provider interface now  
🔧 Ensure authController supports provider switching  
🔧 Add config flag to toggle TEST vs ROPG  

### Long Term (ROPG Production)
🚀 Migrate to ROPG when backend is ready  
🚀 Remove hardcoded tokens from codebase  
🚀 Implement proper token refresh handling  
🚀 Add biometric auth as enhancement  
🚀 Consider OAuth Authorization Code flow for better security  

---

## Security Best Practices

### Current Environment
- ⚠️ Never commit real production tokens to Git
- ✅ Use .env files for sensitive config (not currently implemented)
- ✅ Current global token is dev/test only
- ✅ Backend should restrict dev token permissions

### Future ROPG Environment
- 🔒 Store tokens in secure storage (AsyncStorage encrypted)
- 🔒 Implement token refresh before expiry
- 🔒 Clear tokens on logout
- 🔒 Handle 401 responses gracefully
- 🔒 Never log tokens in production
- 🔒 Use HTTPS only (already enforced)

---

## Conclusion

The current mock auth + global token approach is a **pragmatic solution** for development. It allows:
- ✅ Frontend development without waiting for ROPG
- ✅ Testing with real API data
- ✅ Multiple mock users for role testing
- ✅ Easy migration path to ROPG

The architecture is **ROPG-ready**:
- Provider-based design supports multiple auth methods
- AuthController acts as abstraction layer
- apiClient handles token injection cleanly
- Migration requires minimal code changes

**Next Steps**: Continue with current approach until ROPG is available, then follow migration checklist above.
