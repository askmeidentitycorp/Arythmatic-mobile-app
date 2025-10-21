// services/authProvider/msalProvider.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MSAL_CONFIG, STORAGE_KEYS } from '../../constants/authConfig';

/**
 * Microsoft MSAL Authentication Provider
 * Provides Microsoft Entra ID authentication using @azure/msal-react-native
 */

// MSAL client instance (will be initialized)
let msalClient = null;

/**
 * Initialize MSAL client
 * Note: This would use @azure/msal-react-native in a real implementation
 * For now, we'll provide a mock implementation that simulates MSAL
 */
const initializeMSAL = async () => {
  if (msalClient) {
    return msalClient;
  }

  try {
    // In a real implementation, you would do:
    // import { PublicClientApplication } from '@azure/msal-react-native';
    // msalClient = new PublicClientApplication({
    //   clientId: MSAL_CONFIG.clientId,
    //   authority: MSAL_CONFIG.authority,
    //   ...other config
    // });

    // Mock MSAL client for development
    msalClient = {
      acquireTokenSilent: mockAcquireTokenSilent,
      acquireTokenInteractive: mockAcquireTokenInteractive,
      signOut: mockSignOut,
      getAllAccounts: mockGetAllAccounts,
    };

    console.log('🔐 MSAL: Client initialized');
    return msalClient;
  } catch (error) {
    console.error('❌ MSAL: Initialization failed:', error.message);
    throw error;
  }
};

// Mock MSAL functions (replace with real MSAL when implementing)
const mockAcquireTokenInteractive = async (request) => {
  // Simulate user interaction delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    accessToken: 'msal-access-token-' + Date.now(),
    account: {
      homeAccountId: 'msal-account-' + Date.now(),
      localAccountId: 'local-account-id',
      username: 'user@company.com',
      name: 'Microsoft User',
    },
    idToken: 'msal-id-token-' + Date.now(),
    scopes: request.scopes || ['openid', 'profile', 'email'],
    expiresOn: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  };
};

const mockAcquireTokenSilent = async (request) => {
  // Simulate silent token acquisition
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    accessToken: 'msal-access-token-silent-' + Date.now(),
    account: request.account,
    idToken: 'msal-id-token-silent-' + Date.now(),
    scopes: request.scopes || ['openid', 'profile', 'email'],
    expiresOn: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  };
};

const mockSignOut = async (account) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

const mockGetAllAccounts = async () => {
  const storedAccount = await AsyncStorage.getItem(STORAGE_KEYS.MSAL_ACCOUNT);
  return storedAccount ? [JSON.parse(storedAccount)] : [];
};

/**
 * Sign in with Microsoft MSAL
 */
export const signInMSAL = async () => {
  try {
    console.log('🔐 MSAL: Starting interactive sign-in...');
    
    const client = await initializeMSAL();
    
    const request = {
      scopes: MSAL_CONFIG.scopes,
    };

    const result = await client.acquireTokenInteractive(request);
    
    if (!result || !result.account) {
      throw new Error('Sign-in was cancelled or failed');
    }

    // Extract user information
    const user = {
      id: result.account.localAccountId,
      email: result.account.username,
      name: result.account.name || result.account.username,
      displayName: result.account.name || result.account.username,
      roles: ['user'], // Would extract from token claims in real implementation
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(result.account.name || result.account.username)}&background=0078d4&color=fff`,
    };

    const tokens = {
      accessToken: result.accessToken,
      idToken: result.idToken,
      expiresAt: result.expiresOn.getTime(),
      tokenType: 'Bearer',
      scopes: result.scopes,
    };

    // Store tokens and account
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, result.accessToken],
      [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
      [STORAGE_KEYS.AUTH_PROVIDER, 'msal'],
      [STORAGE_KEYS.MSAL_ACCOUNT, JSON.stringify(result.account)],
    ]);

    console.log('✅ MSAL: Sign-in successful for:', user.email);
    return { user, tokens, account: result.account };
  } catch (error) {
    console.error('❌ MSAL: Sign-in failed:', error.message);
    throw error;
  }
};

/**
 * Sign out from Microsoft MSAL
 */
export const signOutMSAL = async () => {
  try {
    console.log('🔐 MSAL: Starting sign-out...');
    
    const client = await initializeMSAL();
    const accounts = await client.getAllAccounts();
    
    if (accounts && accounts.length > 0) {
      await client.signOut(accounts[0]);
    }

    // Clear stored data
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.AUTH_PROVIDER,
      STORAGE_KEYS.MSAL_ACCOUNT,
    ]);

    console.log('✅ MSAL: Sign-out successful');
    return true;
  } catch (error) {
    console.error('❌ MSAL: Sign-out failed:', error.message);
    throw error;
  }
};

/**
 * Get current user from MSAL
 */
export const getCurrentUserMSAL = async () => {
  try {
    const [token, userData, accountData] = await AsyncStorage.multiGet([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.MSAL_ACCOUNT,
    ]);

    const accessToken = token[1];
    const user = userData[1] ? JSON.parse(userData[1]) : null;
    const account = accountData[1] ? JSON.parse(accountData[1]) : null;

    if (!accessToken || !user || !account) {
      return null;
    }

    // Try to refresh token silently if needed
    try {
      const client = await initializeMSAL();
      const request = {
        scopes: MSAL_CONFIG.scopes,
        account: account,
      };

      const result = await client.acquireTokenSilent(request);
      
      // Update stored token if refreshed
      if (result.accessToken !== accessToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, result.accessToken);
      }

      return { user, accessToken: result.accessToken, account };
    } catch (silentError) {
      console.warn('🔐 MSAL: Silent token acquisition failed:', silentError.message);
      return { user, accessToken, account };
    }
  } catch (error) {
    console.error('❌ MSAL: Get current user failed:', error.message);
    return null;
  }
};

/**
 * Refresh access token silently
 */
export const refreshTokenMSAL = async () => {
  try {
    const accountData = await AsyncStorage.getItem(STORAGE_KEYS.MSAL_ACCOUNT);
    
    if (!accountData) {
      throw new Error('No MSAL account found');
    }

    const account = JSON.parse(accountData);
    const client = await initializeMSAL();
    
    const request = {
      scopes: MSAL_CONFIG.scopes,
      account: account,
    };

    const result = await client.acquireTokenSilent(request);
    
    const tokens = {
      accessToken: result.accessToken,
      idToken: result.idToken,
      expiresAt: result.expiresOn.getTime(),
      tokenType: 'Bearer',
      scopes: result.scopes,
    };

    // Update stored token
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, result.accessToken);

    console.log('✅ MSAL: Token refresh successful');
    return { tokens };
  } catch (error) {
    console.error('❌ MSAL: Token refresh failed:', error.message);
    throw error;
  }
};

/**
 * Check if user is authenticated with MSAL
 */
export const isAuthenticatedMSAL = async () => {
  const currentUser = await getCurrentUserMSAL();
  return !!currentUser;
};