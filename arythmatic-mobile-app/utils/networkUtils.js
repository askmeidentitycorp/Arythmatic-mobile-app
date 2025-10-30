// utils/networkUtils.js
/**
 * Network Utilities
 * Helpers for checking network connectivity and managing offline state
 * 
 * WHY: Mobile apps need graceful offline handling. React Query works best
 * when it knows the network state upfront.
 */

import NetInfo from '@react-native-community/netinfo';

/**
 * Check if device is currently online
 * @returns {Promise<boolean>} Whether device is connected
 */
export const isOnline = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable !== false;
  } catch (error) {
    console.error('❌ Network check failed:', error);
    // Assume online if check fails (optimistic)
    return true;
  }
};

/**
 * Subscribe to network state changes
 * @param {Function} callback - Called with isConnected boolean
 * @returns {Function} Unsubscribe function
 */
export const onNetworkChange = (callback) => {
  return NetInfo.addEventListener((state) => {
    const connected = state.isConnected && state.isInternetReachable !== false;
    callback(connected);
  });
};

/**
 * Get detailed network information
 * @returns {Promise<Object>} Network state object
 */
export const getNetworkInfo = async () => {
  try {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type, // wifi, cellular, bluetooth, ethernet, wimax, vpn, other, unknown, none
      details: state.details,
    };
  } catch (error) {
    console.error('❌ Failed to get network info:', error);
    return {
      isConnected: false,
      isInternetReachable: false,
      type: 'unknown',
      details: null,
    };
  }
};

/**
 * Wait for network to become available
 * @param {number} timeout - Max time to wait in ms (default 10s)
 * @returns {Promise<boolean>} Whether network became available
 */
export const waitForNetwork = (timeout = 10000) => {
  return new Promise((resolve) => {
    let unsubscribe;
    let timeoutId;

    const cleanup = () => {
      if (unsubscribe) unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };

    // Check immediately
    isOnline().then((online) => {
      if (online) {
        cleanup();
        resolve(true);
        return;
      }

      // Listen for changes
      unsubscribe = onNetworkChange((connected) => {
        if (connected) {
          cleanup();
          resolve(true);
        }
      });

      // Timeout
      timeoutId = setTimeout(() => {
        cleanup();
        resolve(false);
      }, timeout);
    });
  });
};

/**
 * React Query network online checker
 * Used by React Query to determine if queries should run
 * @returns {boolean} Whether online
 */
export const reactQueryOnlineManager = () => {
  let isOnlineState = true;

  // Subscribe to network changes
  onNetworkChange((connected) => {
    isOnlineState = connected;
  });

  // Return checker function
  return () => isOnlineState;
};

export default {
  isOnline,
  onNetworkChange,
  getNetworkInfo,
  waitForNetwork,
  reactQueryOnlineManager,
};
