// services/authProvider/testProvider.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TEST_CONFIG, STORAGE_KEYS } from '../../constants/authConfig';

const API_BASE_URL = 'https://interaction-tracker-api-133046591892.us-central1.run.app/api/v1';

// Global access token for development (will be replaced with ROPG once available)
// TODO: Replace this with actual ROPG authentication when available
const GLOBAL_ACCESS_TOKEN = '602a23070f1c92b8812773e645b7bf2f4a1cc4fc';

/**
 * Test Authentication Provider
 * Provides mock authentication for development and testing
 */

// Mock user profiles
const MOCK_USERS = {
  'test@test.com': {
    id: '1',
    email: 'test@test.com',
    name: 'Test User',
    displayName: 'Test User',
    roles: ['user'],
    avatar: 'https://ui-avatars.com/api/?name=Test+User&background=6B5CE7&color=fff',
  },
  'admin@test.com': {
    id: '2', 
    email: 'admin@test.com',
    name: 'Admin User',
    displayName: 'Admin User',
    roles: ['admin', 'user'],
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=31C76A&color=fff',
  },
  'demo@demo.com': {
    id: '3',
    email: 'demo@demo.com', 
    name: 'Demo User',
    displayName: 'Demo User',
    roles: ['user'],
    avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=F4B740&color=fff',
  },
  'user@example.com': {
    id: '4',
    email: 'user@example.com',
    name: 'Example User',
    displayName: 'Example User',
    roles: ['user'],
    avatar: 'https://ui-avatars.com/api/?name=Example+User&background=9C27B0&color=fff',
  },
};

// Generate mock JWT token
const generateMockToken = (user) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iss: 'arythmatic-test-auth',
    aud: 'arythmatic-mobile-app',
  };

  // Simple base64 encoding (not secure, just for testing)
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = btoa(`mock-signature-${user.id}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return `refresh_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sign in with test credentials
 */
export const signInTest = async (username, password) => {
  try {
    console.log('🧪 Test Auth: Attempting sign-in for:', username);
    
    // Validate credentials locally first
    const validCredential = TEST_CONFIG.validCredentials.find(
      cred => cred.username === username && cred.password === password
    );

    if (!validCredential) {
      throw new Error('Invalid username or password');
    }

    // Get user profile
    const user = MOCK_USERS[username];
    if (!user) {
      throw new Error('User profile not found');
    }

    // Use global access token (mock login, real data)
    let accessToken, refreshToken;
    
    if (GLOBAL_ACCESS_TOKEN && GLOBAL_ACCESS_TOKEN !== 'YOUR_GLOBAL_ACCESS_TOKEN_HERE') {
      // Use the global token provided by the API team
      console.log('🔑 Using global access token for API requests');
      accessToken = GLOBAL_ACCESS_TOKEN;
      refreshToken = generateRefreshToken(user);
      console.log('✅ Global token configured successfully');
    } else {
      // No global token configured - use mock token and warn user
      console.warn('⚠️⚠️⚠️ GLOBAL_ACCESS_TOKEN not configured! ⚠️⚠️⚠️');
      console.warn('📝 To use real API data:');
      console.warn('   1. Open: services/authProvider/testProvider.js');
      console.warn('   2. Replace: GLOBAL_ACCESS_TOKEN = \'YOUR_GLOBAL_ACCESS_TOKEN_HERE\'');
      console.warn('   3. With your actual token from the API team');
      console.warn('⚠️ Using mock token - app will show fallback data only');
      accessToken = generateMockToken(user);
      refreshToken = generateRefreshToken(user);
    }

    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    const tokens = {
      accessToken,
      refreshToken,
      expiresAt,
      tokenType: 'Bearer',
    };

    // Store tokens
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
      [STORAGE_KEYS.AUTH_PROVIDER, 'test'],
    ]);

    console.log('✅ Test Auth: Sign-in successful for:', user.email);
    return { user, tokens };
  } catch (error) {
    console.error('❌ Test Auth: Sign-in failed:', error.message);
    throw error;
  }
};

/**
 * Sign out and clear stored data
 */
export const signOutTest = async () => {
  try {
    console.log('🧪 Test Auth: Signing out...');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Clear stored data
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.AUTH_PROVIDER,
    ]);

    console.log('✅ Test Auth: Sign-out successful');
    return true;
  } catch (error) {
    console.error('❌ Test Auth: Sign-out failed:', error.message);
    throw error;
  }
};

/**
 * Get current user from stored data
 */
export const getCurrentUserTest = async () => {
  try {
    const [token, userData] = await AsyncStorage.multiGet([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);

    const accessToken = token[1];
    const user = userData[1] ? JSON.parse(userData[1]) : null;

    if (!accessToken || !user) {
      return null;
    }

    // Check token expiration
    try {
      const payloadBase64 = accessToken.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < now) {
        console.log('🧪 Test Auth: Token expired, clearing session');
        await signOutTest();
        return null;
      }
    } catch (tokenError) {
      console.warn('🧪 Test Auth: Token validation error:', tokenError.message);
      return null;
    }

    return { user, accessToken };
  } catch (error) {
    console.error('❌ Test Auth: Get current user failed:', error.message);
    return null;
  }
};

/**
 * Refresh access token
 */
export const refreshTokenTest = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

    if (!refreshToken || !userData) {
      throw new Error('No refresh token or user data found');
    }

    const user = JSON.parse(userData);
    
    // Generate new tokens
    const accessToken = generateMockToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000);

    const tokens = {
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt,
      tokenType: 'Bearer',
    };

    // Update stored tokens
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken],
    ]);

    console.log('✅ Test Auth: Token refresh successful');
    return { tokens };
  } catch (error) {
    console.error('❌ Test Auth: Token refresh failed:', error.message);
    throw error;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticatedTest = async () => {
  const currentUser = await getCurrentUserTest();
  return !!currentUser;
};