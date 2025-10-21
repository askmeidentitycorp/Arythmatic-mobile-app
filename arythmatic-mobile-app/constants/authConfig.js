// constants/authConfig.js
import Constants from 'expo-constants';

/**
 * Authentication Configuration
 * Loads environment variables and provides configuration for auth providers
 */

// Get environment variables
const getEnvVar = (key, defaultValue = '') => {
  return Constants.expoConfig?.extra?.[key] || process.env[key] || defaultValue;
};

// Authentication Providers
export const AUTH_PROVIDERS = {
  TEST: 'test',
  MSAL: 'msal',
  OIDC: 'oidc', // For future extensibility
};

// Current auth provider from environment
export const AUTH_PROVIDER = getEnvVar('AUTH_PROVIDER', AUTH_PROVIDERS.TEST);

// Common Auth Configuration
export const AUTH_CONFIG = {
  scopes: getEnvVar('AUTH_SCOPES', 'openid,profile,email,offline_access').split(','),
  redirectUri: getEnvVar('AUTH_REDIRECT_URI', 'com.arythmatic.mobile://auth'),
  postLogoutRedirectUri: getEnvVar('AUTH_POST_LOGOUT_REDIRECT_URI', 'com.arythmatic.mobile://signout'),
};

// Microsoft MSAL Configuration
export const MSAL_CONFIG = {
  clientId: getEnvVar('MSAL_CLIENT_ID'),
  tenantId: getEnvVar('MSAL_TENANT_ID', 'common'),
  authority: `${getEnvVar('MSAL_AUTHORITY', 'https://login.microsoftonline.com')}/${getEnvVar('MSAL_TENANT_ID', 'common')}`,
  androidBrokerRedirectUri: getEnvVar('MSAL_ANDROID_BROKER_REDIRECT_URI'),
  iosBrokerRedirectUri: getEnvVar('MSAL_IOS_BROKER_REDIRECT_URI'),
  scopes: AUTH_CONFIG.scopes,
};

// Test Login Configuration
export const TEST_CONFIG = {
  enabled: getEnvVar('TEST_LOGIN_ENABLED', 'true') === 'true',
  defaultUsername: getEnvVar('TEST_DEFAULT_USERNAME', 'test@test.com'),
  defaultPassword: getEnvVar('TEST_DEFAULT_PASSWORD', 'password123'),
  validCredentials: [
    { username: 'test@test.com', password: 'password123' },
    { username: 'admin@test.com', password: 'admin123' },
    { username: 'demo@demo.com', password: 'demo123' },
  ],
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@arythmatic_auth_token',
  REFRESH_TOKEN: '@arythmatic_refresh_token',
  USER_DATA: '@arythmatic_user_data',
  AUTH_PROVIDER: '@arythmatic_auth_provider',
  MSAL_ACCOUNT: '@arythmatic_msal_account',
};

// Validate configuration
export const validateAuthConfig = () => {
  const errors = [];

  if (!AUTH_PROVIDER || !Object.values(AUTH_PROVIDERS).includes(AUTH_PROVIDER)) {
    errors.push(`Invalid AUTH_PROVIDER: ${AUTH_PROVIDER}. Must be one of: ${Object.values(AUTH_PROVIDERS).join(', ')}`);
  }

  if (AUTH_PROVIDER === AUTH_PROVIDERS.MSAL) {
    if (!MSAL_CONFIG.clientId) {
      errors.push('MSAL_CLIENT_ID is required when using MSAL provider');
    }
    if (!MSAL_CONFIG.authority) {
      errors.push('MSAL_AUTHORITY is required when using MSAL provider');
    }
  }

  return errors;
};

// Debug configuration (only in development)
export const debugConfig = () => {
  if (__DEV__) {
    console.log('🔐 Authentication Configuration:');
    console.log('  Provider:', AUTH_PROVIDER);
    console.log('  Config:', {
      authProvider: AUTH_PROVIDER,
      scopes: AUTH_CONFIG.scopes,
      redirectUri: AUTH_CONFIG.redirectUri,
      testMode: TEST_CONFIG.enabled,
      msalClientId: MSAL_CONFIG.clientId ? '***configured***' : 'not configured',
    });

    const configErrors = validateAuthConfig();
    if (configErrors.length > 0) {
      console.warn('⚠️ Configuration Errors:');
      configErrors.forEach(error => console.warn(`  - ${error}`));
    }
  }
};

// Initialize configuration
debugConfig();