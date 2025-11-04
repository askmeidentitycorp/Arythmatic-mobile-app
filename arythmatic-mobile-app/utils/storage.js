// utils/storage.js
/**
 * Secure Storage Utility
 * Provides encrypted storage for sensitive data (tokens, user info)
 * with automatic fallback to AsyncStorage for non-sensitive data
 * 
 * WHY: react-native-encrypted-storage uses device-level encryption
 * to protect tokens and credentials, meeting security best practices
 */

import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure storage methods for sensitive data (tokens, passwords)
 */
export const secureStorage = {
  /**
   * Store encrypted data
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be JSON stringified)
   */
  async setItem(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await EncryptedStorage.setItem(key, stringValue);
      if (__DEV__) console.log(`🔐 Secure: Stored ${key}`);
    } catch (error) {
      console.error(`❌ Secure Storage: Failed to store ${key}:`, error.message);
      throw new Error(`Failed to securely store ${key}`);
    }
  },

  /**
   * Retrieve encrypted data
   * @param {string} key - Storage key
   * @returns {Promise<any>} Parsed value or null
   */
  async getItem(key) {
    try {
      const value = await EncryptedStorage.getItem(key);
      if (!value) return null;
      
      // Try to parse as JSON, fallback to raw string
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`❌ Secure Storage: Failed to retrieve ${key}:`, error.message);
      return null;
    }
  },

  /**
   * Remove encrypted data
   * @param {string} key - Storage key
   */
  async removeItem(key) {
    try {
      await EncryptedStorage.removeItem(key);
      if (__DEV__) console.log(`🗑️ Secure: Removed ${key}`);
    } catch (error) {
      console.error(`❌ Secure Storage: Failed to remove ${key}:`, error.message);
    }
  },

  /**
   * Clear all encrypted storage
   */
  async clear() {
    try {
      await EncryptedStorage.clear();
      if (__DEV__) console.log('🗑️ Secure: Cleared all encrypted data');
    } catch (error) {
      console.error('❌ Secure Storage: Failed to clear:', error.message);
    }
  },
};

/**
 * Regular storage for non-sensitive data (preferences, cache)
 */
export const regularStorage = {
  async setItem(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (error) {
      console.error(`❌ Storage: Failed to store ${key}:`, error.message);
    }
  },

  async getItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`❌ Storage: Failed to retrieve ${key}:`, error.message);
      return null;
    }
  },

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`❌ Storage: Failed to remove ${key}:`, error.message);
    }
  },

  async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('❌ Storage: Failed to clear:', error.message);
    }
  },
};

/**
 * Storage keys for the application
 * Centralized to avoid typos and make refactoring easier
 */
export const StorageKeys = {
  // Auth tokens (encrypted)
  ACCESS_TOKEN: '@arythmatic_auth_token',
  REFRESH_TOKEN: '@arythmatic_refresh_token',
  
  // User data (encrypted)
  USER_DATA: '@arythmatic_user_data',
  AUTH_PROVIDER: '@arythmatic_auth_provider',
  
  // Mock auth state (encrypted for consistency)
  MOCK_AUTH_STATE: '@arythmatic_mock_auth_state',
  
  // Preferences (regular storage)
  THEME: '@arythmatic_theme',
  LANGUAGE: '@arythmatic_language',
  LAST_SYNC: '@arythmatic_last_sync',
};

export default {
  secure: secureStorage,
  regular: regularStorage,
  keys: StorageKeys,
};
