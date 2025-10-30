// api/authService.js
/**
 * Authentication Service
 * Handles login, logout, and token management
 * 
 * CURRENT STATE: Uses mock authentication
 * FUTURE STATE: Will use real ROPG or Microsoft OAuth
 * 
 * MIGRATION STRATEGY:
 * This file is structured so you can switch authentication methods
 * by changing ONE line: export { mockAuth as authService }
 * to: export { realAuth as authService }
 * 
 * WHY THIS APPROACH:
 * - Consuming code (AuthContext, screens) doesn't change
 * - Easy to test both flows during migration
 * - Clear separation of concerns
 */

import { post } from './client';
import { secureStorage, StorageKeys } from '../utils/storage';

/**
 * ==================================================================
 * MOCK AUTHENTICATION (CURRENT)
 * ==================================================================
 * Used while waiting for real ROPG credentials
 * Simulates token-based auth with local validation
 */

const MOCK_USERS = [
  {
    id: 1,
    username: 'test@test.com',
    password: 'password123',
    name: 'Test User',
    email: 'test@test.com',
    role: 'admin',
  },
  {
    id: 2,
    username: 'demo@demo.com',
    password: 'demo123',
    name: 'Demo User',
    email: 'demo@demo.com',
    role: 'user',
  },
];

/**
 * Generate a mock token (simulates backend JWT/token)
 */
const generateMockToken = (user) => {
  // In real world, this would be a JWT from backend
  // Format: mock-{userId}-{timestamp}-{random}
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `mock-${user.id}-${timestamp}-${random}`;
};

const mockAuth = {
  /**
   * Mock login
   * Simulates API call that returns access/refresh tokens
   */
  login: async (username, password) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find user
    const user = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Generate mock tokens
    const accessToken = generateMockToken(user);
    const refreshToken = generateMockToken({ ...user, type: 'refresh' });

    // Store tokens securely
    await secureStorage.setItem(StorageKeys.ACCESS_TOKEN, accessToken);
    await secureStorage.setItem(StorageKeys.REFRESH_TOKEN, refreshToken);

    // Store user data
    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    await secureStorage.setItem(StorageKeys.USER_DATA, userData);

    if (__DEV__) {
      console.log('✅ Mock Login successful:', userData);
      console.log('🔑 Mock Token:', accessToken.substring(0, 20) + '...');
    }

    return {
      user: userData,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  },

  /**
   * Mock logout
   * Clears all auth data
   */
  logout: async () => {
    await secureStorage.removeItem(StorageKeys.ACCESS_TOKEN);
    await secureStorage.removeItem(StorageKeys.REFRESH_TOKEN);
    await secureStorage.removeItem(StorageKeys.USER_DATA);

    if (__DEV__) {
      console.log('✅ Mock Logout successful');
    }
  },

  /**
   * Get current user from storage
   */
  getCurrentUser: async () => {
    try {
      const token = await secureStorage.getItem(StorageKeys.ACCESS_TOKEN);
      const userData = await secureStorage.getItem(StorageKeys.USER_DATA);

      if (token && userData) {
        return {
          user: userData,
          accessToken: token,
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      return null;
    }
  },

  /**
   * Mock token refresh
   * In real app, this would call /auth/token/refresh/
   */
  refreshToken: async () => {
    const refreshToken = await secureStorage.getItem(StorageKeys.REFRESH_TOKEN);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Generate new access token
    const userData = await secureStorage.getItem(StorageKeys.USER_DATA);
    const newAccessToken = generateMockToken(userData);

    await secureStorage.setItem(StorageKeys.ACCESS_TOKEN, newAccessToken);

    if (__DEV__) {
      console.log('✅ Mock Token refreshed');
    }

    return {
      user: userData,
      tokens: {
        accessToken: newAccessToken,
        refreshToken,
      },
    };
  },
};

/**
 * ==================================================================
 * REAL AUTHENTICATION (FUTURE)
 * ==================================================================
 * Will be used when ROPG credentials are available
 * Uncomment and configure when ready
 */

const realAuth = {
  /**
   * Real login using DRF token authentication
   * Endpoint: POST /auth/token/obtain/
   */
  login: async (username, password) => {
    try {
      // UNCOMMENT WHEN READY:
      /*
      const response = await post('/auth/token/obtain/', {
        username,
        password,
      });

      const { access, refresh, user } = response;

      // Store tokens securely
      await secureStorage.setItem(StorageKeys.ACCESS_TOKEN, access);
      await secureStorage.setItem(StorageKeys.REFRESH_TOKEN, refresh);
      await secureStorage.setItem(StorageKeys.USER_DATA, user);

      if (__DEV__) {
        console.log('✅ Real Login successful:', user);
      }

      return {
        user,
        tokens: {
          accessToken: access,
          refreshToken: refresh,
        },
      };
      */

      // FOR NOW: Throw error to remind you to implement
      throw new Error('Real authentication not yet configured. Please use mock auth.');
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  /**
   * Real logout
   * Optionally call backend to invalidate token
   */
  logout: async () => {
    try {
      // UNCOMMENT if you have a logout endpoint:
      // await post('/auth/logout/');

      // Clear local storage
      await secureStorage.removeItem(StorageKeys.ACCESS_TOKEN);
      await secureStorage.removeItem(StorageKeys.REFRESH_TOKEN);
      await secureStorage.removeItem(StorageKeys.USER_DATA);

      if (__DEV__) {
        console.log('✅ Real Logout successful');
      }
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Clear local storage anyway
      await secureStorage.clear();
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    try {
      const token = await secureStorage.getItem(StorageKeys.ACCESS_TOKEN);
      const userData = await secureStorage.getItem(StorageKeys.USER_DATA);

      if (token && userData) {
        return {
          user: userData,
          accessToken: token,
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      return null;
    }
  },

  /**
   * Real token refresh
   * Endpoint: POST /auth/token/refresh/
   */
  refreshToken: async () => {
    try {
      // UNCOMMENT WHEN READY:
      /*
      const refreshToken = await secureStorage.getItem(StorageKeys.REFRESH_TOKEN);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await post('/auth/token/refresh/', {
        refresh: refreshToken,
      });

      const { access } = response;

      await secureStorage.setItem(StorageKeys.ACCESS_TOKEN, access);

      const userData = await secureStorage.getItem(StorageKeys.USER_DATA);

      if (__DEV__) {
        console.log('✅ Real Token refreshed');
      }

      return {
        user: userData,
        tokens: {
          accessToken: access,
          refreshToken,
        },
      };
      */

      throw new Error('Token refresh not yet configured');
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      throw error;
    }
  },
};

/**
 * ==================================================================
 * EXPORT - SWITCH HERE TO MIGRATE
 * ==================================================================
 * 
 * CURRENT: Using mock auth
 * TO MIGRATE: Change to realAuth when backend is ready
 */

// 🔥 CHANGE THIS LINE TO SWITCH AUTH MODES
export const authService = mockAuth;
// export const authService = realAuth; // <- Use this when real auth is ready

export default authService;

// Export both for testing
export { mockAuth, realAuth };
