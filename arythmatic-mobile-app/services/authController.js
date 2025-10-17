// services/authController.js
import { AUTH_PROVIDER, AUTH_PROVIDERS } from '../constants/authConfig';

// Import providers
import {
  signInTest,
  signOutTest,
  getCurrentUserTest,
  refreshTokenTest,
  isAuthenticatedTest,
} from './authProvider/testProvider';

import {
  signInMSAL,
  signOutMSAL,
  getCurrentUserMSAL,
  refreshTokenMSAL,
  isAuthenticatedMSAL,
} from './authProvider/msalProvider';

/**
 * Auth Controller
 * Provides a unified interface for all authentication providers
 * Routes calls to the appropriate provider based on AUTH_PROVIDER config
 */

class AuthController {
  constructor() {
    this.currentProvider = AUTH_PROVIDER;
    console.log('🔐 AuthController: Initialized with provider:', this.currentProvider);
  }

  /**
   * Sign in with credentials (test) or interactive flow (MSAL)
   */
  async signIn(credentials = {}) {
    try {
      console.log('🔐 AuthController: Sign in requested with provider:', this.currentProvider);

      switch (this.currentProvider) {
        case AUTH_PROVIDERS.TEST:
          const { username, password } = credentials;
          if (!username || !password) {
            throw new Error('Username and password are required for test login');
          }
          return await signInTest(username, password);

        case AUTH_PROVIDERS.MSAL:
          return await signInMSAL();

        case AUTH_PROVIDERS.OIDC:
          throw new Error('OIDC provider not implemented yet');

        default:
          throw new Error(`Unknown auth provider: ${this.currentProvider}`);
      }
    } catch (error) {
      console.error('❌ AuthController: Sign in failed:', error.message);
      throw error;
    }
  }

  /**
   * Sign out from current provider
   */
  async signOut() {
    try {
      console.log('🔐 AuthController: Sign out requested with provider:', this.currentProvider);

      switch (this.currentProvider) {
        case AUTH_PROVIDERS.TEST:
          return await signOutTest();

        case AUTH_PROVIDERS.MSAL:
          return await signOutMSAL();

        case AUTH_PROVIDERS.OIDC:
          throw new Error('OIDC provider not implemented yet');

        default:
          throw new Error(`Unknown auth provider: ${this.currentProvider}`);
      }
    } catch (error) {
      console.error('❌ AuthController: Sign out failed:', error.message);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    try {
      switch (this.currentProvider) {
        case AUTH_PROVIDERS.TEST:
          return await getCurrentUserTest();

        case AUTH_PROVIDERS.MSAL:
          return await getCurrentUserMSAL();

        case AUTH_PROVIDERS.OIDC:
          throw new Error('OIDC provider not implemented yet');

        default:
          throw new Error(`Unknown auth provider: ${this.currentProvider}`);
      }
    } catch (error) {
      console.error('❌ AuthController: Get current user failed:', error.message);
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    try {
      console.log('🔐 AuthController: Token refresh requested with provider:', this.currentProvider);

      switch (this.currentProvider) {
        case AUTH_PROVIDERS.TEST:
          return await refreshTokenTest();

        case AUTH_PROVIDERS.MSAL:
          return await refreshTokenMSAL();

        case AUTH_PROVIDERS.OIDC:
          throw new Error('OIDC provider not implemented yet');

        default:
          throw new Error(`Unknown auth provider: ${this.currentProvider}`);
      }
    } catch (error) {
      console.error('❌ AuthController: Token refresh failed:', error.message);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      switch (this.currentProvider) {
        case AUTH_PROVIDERS.TEST:
          return await isAuthenticatedTest();

        case AUTH_PROVIDERS.MSAL:
          return await isAuthenticatedMSAL();

        case AUTH_PROVIDERS.OIDC:
          throw new Error('OIDC provider not implemented yet');

        default:
          return false;
      }
    } catch (error) {
      console.error('❌ AuthController: Authentication check failed:', error.message);
      return false;
    }
  }

  /**
   * Get current provider info
   */
  getProviderInfo() {
    return {
      provider: this.currentProvider,
      isTestMode: this.currentProvider === AUTH_PROVIDERS.TEST,
      isMSAL: this.currentProvider === AUTH_PROVIDERS.MSAL,
      isOIDC: this.currentProvider === AUTH_PROVIDERS.OIDC,
    };
  }

  /**
   * Get supported authentication methods for current provider
   */
  getSupportedMethods() {
    switch (this.currentProvider) {
      case AUTH_PROVIDERS.TEST:
        return {
          hasUsernamePassword: true,
          hasInteractiveLogin: false,
          hasSilentLogin: false,
          hasLogout: true,
        };

      case AUTH_PROVIDERS.MSAL:
        return {
          hasUsernamePassword: false,
          hasInteractiveLogin: true,
          hasSilentLogin: true,
          hasLogout: true,
        };

      case AUTH_PROVIDERS.OIDC:
        return {
          hasUsernamePassword: false,
          hasInteractiveLogin: true,
          hasSilentLogin: true,
          hasLogout: true,
        };

      default:
        return {
          hasUsernamePassword: false,
          hasInteractiveLogin: false,
          hasSilentLogin: false,
          hasLogout: false,
        };
    }
  }
}

// Create singleton instance
const authController = new AuthController();

// Export singleton instance
export default authController;

// Export class for testing
export { AuthController };