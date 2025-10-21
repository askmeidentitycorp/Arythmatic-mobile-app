# 🔐 Arithmetic Mobile App - OIDC/MSAL Authentication Flow Chart

## 📋 Overview
This flowchart shows how the Arithmetic Mobile App integrates with **Microsoft Azure AD** using **OIDC (OpenID Connect)**, **MSAL (Microsoft Authentication Library)**, and handles **token lifecycle management**.

---

## 🚀 Complete Authentication Flow Diagram

```mermaid
flowchart TD
    Start([👤 User Opens App]) --> CheckToken{🔍 Check Stored Tokens}
    
    CheckToken -->|No Tokens| Login[🔐 Show Login Screen]
    CheckToken -->|Valid Access Token| Dashboard[📊 Load Dashboard]
    CheckToken -->|Expired Access Token| RefreshFlow[🔄 Token Refresh Flow]
    
    %% Login Flow
    Login --> MSLogin{🏢 Microsoft Sign-In}
    MSLogin -->|Traditional Login| EmailPassword[📧 Email/Password Form]
    MSLogin -->|SSO/OIDC| MSALAuth[🚀 MSAL Authentication]
    
    %% Email/Password Flow
    EmailPassword --> ValidateCredentials{✅ Validate Credentials}
    ValidateCredentials -->|Invalid| LoginError[❌ Show Error]
    ValidateCredentials -->|Valid| BackendAuth[🌐 Backend Authentication]
    LoginError --> Login
    
    %% MSAL Flow
    MSALAuth --> MSALInit[🔧 Initialize MSAL]
    MSALInit --> AcquireToken[📱 Acquire Token Silently]
    AcquireToken --> TokenSuccess{✅ Token Acquired?}
    
    TokenSuccess -->|No| InteractiveAuth[🖱️ Interactive Authentication]
    TokenSuccess -->|Yes| ValidateToken[🔍 Validate Token]
    
    InteractiveAuth --> MSLogin2[🏢 Microsoft Login Popup]
    MSLogin2 --> UserConsent[✋ User Consent Screen]
    UserConsent -->|Denied| LoginError2[❌ Access Denied]
    UserConsent -->|Approved| ReceiveTokens[🎫 Receive Tokens]
    LoginError2 --> Login
    
    %% Token Processing
    BackendAuth --> ReceiveTokens
    ValidateToken --> ReceiveTokens
    ReceiveTokens --> ParseTokens[📝 Parse JWT Tokens]
    
    ParseTokens --> StoreTokens[💾 Store Tokens Securely]
    StoreTokens --> ExtractClaims[📋 Extract User Claims]
    ExtractClaims --> Dashboard
    
    %% Token Refresh Flow
    RefreshFlow --> CheckRefreshToken{🔍 Check Refresh Token}
    CheckRefreshToken -->|Valid| RefreshAccess[🔄 Refresh Access Token]
    CheckRefreshToken -->|Invalid/Expired| Login
    
    RefreshAccess --> RefreshSuccess{✅ Refresh Successful?}
    RefreshSuccess -->|Yes| StoreNewTokens[💾 Store New Tokens]
    RefreshSuccess -->|No| Login
    StoreNewTokens --> Dashboard
    
    %% Dashboard Flow
    Dashboard --> UserAction{👆 User Action}
    UserAction -->|API Call| CheckTokenExpiry{⏰ Token Expired?}
    UserAction -->|Logout| LogoutFlow[🚪 Logout Flow]
    UserAction -->|App Navigation| Dashboard
    
    CheckTokenExpiry -->|Valid| MakeAPICall[🌐 Make API Call]
    CheckTokenExpiry -->|Expired| RefreshFlow
    
    MakeAPICall --> APISuccess{✅ API Success?}
    APISuccess -->|200 OK| UpdateUI[🔄 Update UI]
    APISuccess -->|401 Unauthorized| RefreshFlow
    APISuccess -->|Other Error| ShowError[❌ Show Error]
    
    UpdateUI --> Dashboard
    ShowError --> Dashboard
    
    %% Logout Flow
    LogoutFlow --> ClearTokens[🗑️ Clear Stored Tokens]
    ClearTokens --> MSALSignOut[🚪 MSAL Sign Out]
    MSALSignOut --> RevokeTokens[🚫 Revoke Tokens (Server)]
    RevokeTokens --> Login

    %% Error Handling
    subgraph ErrorHandling [⚠️ Error Handling]
        NetworkError[📡 Network Error] --> RetryLogin[🔄 Retry]
        ServerError[🖥️ Server Error] --> ShowErrorMsg[💬 Show Error Message]
        TokenError[🎫 Token Error] --> ClearCorruptTokens[🧹 Clear Corrupt Tokens]
        RetryLogin --> Login
        ShowErrorMsg --> Dashboard
        ClearCorruptTokens --> Login
    end

    %% Security Measures
    subgraph Security [🔒 Security Measures]
        BiometricAuth[👆 Biometric Authentication]
        SecureStorage[🔐 Keychain/Keystore Storage]
        CertificatePinning[📜 Certificate Pinning]
        TokenEncryption[🔐 Token Encryption]
    end

    %% Background Token Refresh
    subgraph Background [🔄 Background Operations]
        AppForeground[📱 App Comes to Foreground]
        ScheduledRefresh[⏰ Scheduled Token Refresh]
        AppForeground --> CheckTokenExpiry
        ScheduledRefresh --> RefreshFlow
    end

    style Start fill:#e1f5fe
    style Dashboard fill:#e8f5e8
    style Login fill:#fff3e0
    style MSALAuth fill:#f3e5f5
    style RefreshFlow fill:#e0f2f1
    style LogoutFlow fill:#ffebee
```

---

## 🔧 Technical Implementation Details

### 1. **📦 Required Dependencies**

```json
{
  "dependencies": {
    "@azure/msal-react-native": "^3.0.0",
    "@react-native-async-storage/async-storage": "^1.19.0",
    "react-native-keychain": "^8.1.0",
    "react-native-app-auth": "^7.0.0",
    "jwt-decode": "^3.1.2",
    "react-native-biometrics": "^3.0.1"
  }
}
```

### 2. **🏗️ MSAL Configuration**

```javascript
// config/msalConfig.js
export const msalConfig = {
  auth: {
    clientId: 'YOUR_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
    redirectUri: 'msauth://com.yourapp.arithmetic',
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        console.log(`MSAL Log: ${message}`);
      },
    },
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
};

export const tokenRequest = {
  scopes: ['User.Read'],
};
```

### 3. **🔐 Token Storage Service**

```javascript
// services/tokenStorage.js
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class SecureTokenStorage {
  // Store tokens securely
  static async storeTokens(accessToken, refreshToken, idToken) {
    try {
      // Store sensitive tokens in Keychain/Keystore
      await Keychain.setInternetCredentials(
        'arithmetic_app_tokens',
        'user_tokens',
        JSON.stringify({
          accessToken,
          refreshToken,
          idToken,
          timestamp: Date.now(),
        })
      );
      
      // Store non-sensitive data in AsyncStorage
      await AsyncStorage.setItem('token_metadata', JSON.stringify({
        tokenType: 'Bearer',
        expiresAt: this.getTokenExpiry(accessToken),
        scope: 'User.Read openid profile email',
      }));
    } catch (error) {
      throw new Error('Failed to store tokens securely');
    }
  }

  // Retrieve tokens
  static async getTokens() {
    try {
      const credentials = await Keychain.getInternetCredentials('arithmetic_app_tokens');
      if (credentials) {
        return JSON.parse(credentials.password);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Clear all tokens
  static async clearTokens() {
    try {
      await Keychain.resetInternetCredentials('arithmetic_app_tokens');
      await AsyncStorage.removeItem('token_metadata');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }
}
```

### 4. **🔄 Token Refresh Service**

```javascript
// services/tokenRefreshService.js
import { PublicClientApplication } from '@azure/msal-react-native';
import { SecureTokenStorage } from './tokenStorage';

export class TokenRefreshService {
  constructor(msalInstance) {
    this.msalInstance = msalInstance;
    this.refreshThreshold = 5 * 60 * 1000; // 5 minutes before expiry
  }

  async refreshTokenIfNeeded() {
    const tokens = await SecureTokenStorage.getTokens();
    if (!tokens) return null;

    const { accessToken, refreshToken } = tokens;
    const tokenExpiry = this.getTokenExpiry(accessToken);
    const now = Date.now();

    // Check if token needs refresh
    if (now >= (tokenExpiry - this.refreshThreshold)) {
      return await this.refreshAccessToken(refreshToken);
    }

    return accessToken;
  }

  async refreshAccessToken(refreshToken) {
    try {
      const tokenRequest = {
        scopes: ['User.Read'],
        refreshToken: refreshToken,
      };

      const response = await this.msalInstance.acquireTokenSilent(tokenRequest);
      
      // Store new tokens
      await SecureTokenStorage.storeTokens(
        response.accessToken,
        response.refreshToken || refreshToken,
        response.idToken
      );

      return response.accessToken;
    } catch (error) {
      // If silent refresh fails, user needs to re-authenticate
      await SecureTokenStorage.clearTokens();
      throw new Error('Token refresh failed - re-authentication required');
    }
  }
}
```

### 5. **🌐 API Service with Token Management**

```javascript
// services/apiService.js
export class AuthenticatedAPIService {
  constructor(baseURL, tokenRefreshService) {
    this.baseURL = baseURL;
    this.tokenRefreshService = tokenRefreshService;
  }

  async makeAuthenticatedRequest(endpoint, options = {}) {
    let accessToken = await this.tokenRefreshService.refreshTokenIfNeeded();
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle token expiry
    if (response.status === 401) {
      // Try to refresh token and retry once
      accessToken = await this.tokenRefreshService.refreshTokenIfNeeded();
      headers['Authorization'] = `Bearer ${accessToken}`;
      
      return fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });
    }

    return response;
  }
}
```

---

## 🔐 Security Considerations

### 1. **Token Storage Security**
- ✅ Store tokens in device Keychain/Keystore
- ✅ Encrypt tokens with device hardware security
- ✅ Never store tokens in plain text or AsyncStorage
- ✅ Implement token expiry checks

### 2. **Network Security**
- ✅ Use HTTPS only for all API calls
- ✅ Implement certificate pinning
- ✅ Validate SSL certificates
- ✅ Use secure redirect URIs

### 3. **App Security**
- ✅ Implement biometric authentication for app access
- ✅ Auto-lock app when backgrounded
- ✅ Prevent screenshots of sensitive screens
- ✅ Implement root/jailbreak detection

### 4. **Token Management**
- ✅ Implement proper token refresh logic
- ✅ Handle token expiry gracefully
- ✅ Revoke tokens on logout
- ✅ Monitor for suspicious token usage

---

## 🚦 State Management Flow

```javascript
// hooks/useAuthFlow.js
export const useAuthFlow = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    tokens: null,
    loading: true,
    error: null,
  });

  const authenticateUser = async () => {
    try {
      // Check existing tokens
      const tokens = await SecureTokenStorage.getTokens();
      if (tokens && !isTokenExpired(tokens.accessToken)) {
        setAuthState({
          isAuthenticated: true,
          user: parseUserFromToken(tokens.idToken),
          tokens,
          loading: false,
          error: null,
        });
        return;
      }

      // Try silent authentication
      const msalResponse = await msalInstance.acquireTokenSilent(tokenRequest);
      if (msalResponse) {
        await SecureTokenStorage.storeTokens(
          msalResponse.accessToken,
          msalResponse.refreshToken,
          msalResponse.idToken
        );
        setAuthState({
          isAuthenticated: true,
          user: msalResponse.account,
          tokens: msalResponse,
          loading: false,
          error: null,
        });
        return;
      }

      // Require interactive authentication
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        tokens: null,
        loading: false,
        error: error.message,
      });
    }
  };

  return { authState, authenticateUser };
};
```

---

## 📊 Token Lifecycle Events

| Event | Action | Token State |
|-------|--------|-------------|
| App Launch | Check stored tokens | Validate & refresh if needed |
| User Login | Acquire new tokens | Store securely |
| API Call | Check token expiry | Refresh if < 5 min remaining |
| Token Expired | Silent refresh | Update stored tokens |
| Refresh Failed | Interactive auth | Clear tokens, show login |
| User Logout | Revoke tokens | Clear all stored data |
| App Background | Schedule refresh | Maintain token validity |
| Network Error | Retry with backoff | Handle gracefully |

---

## 🧪 Testing Scenarios

### 1. **Happy Path Testing**
- ✅ Fresh installation → MSAL login → Dashboard access
- ✅ Token refresh → Continued app usage
- ✅ Logout → Clean token cleanup

### 2. **Error Scenarios**
- ❌ Network failure during authentication
- ❌ Token corruption in storage
- ❌ Backend authentication failure
- ❌ User denies consent
- ❌ Token refresh failure

### 3. **Edge Cases**
- 🔄 App backgrounded during authentication
- 🔄 Device clock changes affecting token expiry
- 🔄 Multiple app instances
- 🔄 Biometric authentication failure

---

## 🚀 Implementation Roadmap

### Phase 1: Basic OIDC/MSAL Integration
1. Install MSAL dependencies
2. Configure Azure AD app registration
3. Implement basic MSAL authentication
4. Replace current login flow

### Phase 2: Token Management
1. Implement secure token storage
2. Add token refresh logic
3. Handle API authentication headers
4. Add error handling

### Phase 3: Security Enhancements
1. Add biometric authentication
2. Implement certificate pinning
3. Add session management
4. Security testing

### Phase 4: Production Readiness
1. Performance optimization
2. Monitoring and logging
3. User experience polish
4. Documentation and training

---

This comprehensive authentication flow ensures your Arithmetic Mobile App will have enterprise-grade security with Microsoft Azure AD integration, proper token lifecycle management, and excellent user experience! 🚀