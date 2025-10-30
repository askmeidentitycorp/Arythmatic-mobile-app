# Global Access Token Setup

## Current Configuration
Your app is configured to use a **global access token** for all API requests while login remains mocked.

## How to Configure

### Step 1: Get Your Token
Contact your API team to get the global access token for development.

### Step 2: Add the Token
1. Open file: `services/authProvider/testProvider.js`
2. Find line 9:
   ```javascript
   const GLOBAL_ACCESS_TOKEN = 'YOUR_GLOBAL_ACCESS_TOKEN_HERE'; // <-- PASTE YOUR TOKEN HERE
   ```
3. Replace `'YOUR_GLOBAL_ACCESS_TOKEN_HERE'` with your actual token:
   ```javascript
   const GLOBAL_ACCESS_TOKEN = 'abc123xyz456...'; // Your real token
   ```

### Step 3: Restart the App
```bash
npx expo start --clear
```

## How It Works

### Before Token Configuration:
- ✅ Login: Mock (uses test credentials)
- ❌ Data: Mock/Fallback data only
- ⚠️ Warning messages in console

### After Token Configuration:
- ✅ Login: Mock (uses test credentials)  
- ✅ Data: **Real API data**
- ✅ All CRUD operations work

## Test Credentials (Mock Login)
These credentials are validated locally, but use the global token for API:
- `admin@test.com` / `admin123`
- `test@test.com` / `password123`
- `demo@demo.com` / `demo123`
- `user@example.com` / `user123`

## Future: ROPG Authentication
Once ROPG (Resource Owner Password Grant) details are shared:
- Login will authenticate against the API
- Each user will get their own token
- The global token setup will be removed

## Troubleshooting

### Still seeing 401 errors?
- Check that you pasted the token correctly (no extra spaces)
- Verify the token hasn't expired
- Contact API team for a new token

### Not seeing real data?
- Check console for: `🔑 Using global access token for API requests`
- Should see: `✅ Global token configured successfully`
- If you see warnings about mock token, the token isn't configured

## File Location
```
services/authProvider/testProvider.js
Line 9: GLOBAL_ACCESS_TOKEN
```
