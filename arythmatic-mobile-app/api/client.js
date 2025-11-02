// api/client.js
/**
 * Axios API Client
 * Centralized HTTP client with interceptors for auth and error handling
 * 
 * ARCHITECTURE DECISION:
 * - Uses axios for better interceptor support and request cancellation
 * - Supports BOTH mock tokens (current) and real DRF tokens (future)
 * - Token refresh logic can be added without changing consuming code
 * 
 * MIGRATION PATH:
 * 1. Currently uses mock tokens from secure storage
 * 2. When real auth is ready, just update the token format - same flow
 * 3. Add token refresh interceptor when needed (commented below)
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/authConfig';
import { handleAxiosError } from '../utils/errorHandler';
import Constants from 'expo-constants';

// API Configuration
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'https://interaction-tracker-api-133046591892.us-central1.run.app/api/v1';

/**
 * Create axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request Interceptor
 * Attaches authentication token to every request
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get token from global auth storage (single source of truth)
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (token) {
        // DRF uses "Token" prefix for token authentication
        // Works for both mock and real tokens
        config.headers.Authorization = `Token ${token}`;
        
        if (__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
          console.log(`🔑 Token attached: ${token.substring(0, 10)}...`);
        }
      } else {
        if (__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url} (no auth)`);
        }
      }

      return config;
    } catch (error) {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles errors and token refresh (future)
 */
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (__DEV__) {
        console.warn('⚠️ 401 Unauthorized - Token may be invalid or expired');
      }

      // FUTURE: Token refresh logic
      // Uncomment and implement when real ROPG auth is available
      /*
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Get refresh token
          const refreshToken = await secureStorage.getItem(StorageKeys.REFRESH_TOKEN);
          
          if (refreshToken) {
            // Call refresh endpoint
            const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
              refresh: refreshToken,
            });
            
            const { access } = response.data;
            
            // Store new access token
            await secureStorage.setItem(StorageKeys.ACCESS_TOKEN, access);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Token ${access}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login
          await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          
          // You can emit an event here to trigger logout in AuthContext
          // eventEmitter.emit('auth:logout');
          
          return Promise.reject(refreshError);
        }
      }
      */

      // For now, just clear invalid token
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    // Convert to standardized error
    const apiError = handleAxiosError(error);
    return Promise.reject(apiError);
  }
);

/**
 * Helper methods for common request types
 */

/**
 * GET request
 * @param {string} url - Endpoint URL
 * @param {Object} config - Axios config
 * @returns {Promise} Response data
 */
export const get = async (url, config = {}) => {
  const response = await apiClient.get(url, config);
  return response.data;
};

/**
 * POST request
 * @param {string} url - Endpoint URL
 * @param {Object} data - Request body
 * @param {Object} config - Axios config
 * @returns {Promise} Response data
 */
export const post = async (url, data, config = {}) => {
  const response = await apiClient.post(url, data, config);
  return response.data;
};

/**
 * PUT request
 * @param {string} url - Endpoint URL
 * @param {Object} data - Request body
 * @param {Object} config - Axios config
 * @returns {Promise} Response data
 */
export const put = async (url, data, config = {}) => {
  const response = await apiClient.put(url, data, config);
  return response.data;
};

/**
 * PATCH request
 * @param {string} url - Endpoint URL
 * @param {Object} data - Request body
 * @param {Object} config - Axios config
 * @returns {Promise} Response data
 */
export const patch = async (url, data, config = {}) => {
  const response = await apiClient.patch(url, data, config);
  return response.data;
};

/**
 * DELETE request
 * @param {string} url - Endpoint URL
 * @param {Object} config - Axios config
 * @returns {Promise} Response data
 */
export const del = async (url, config = {}) => {
  const response = await apiClient.delete(url, config);
  return response.data;
};

/**
 * Upload file (multipart/form-data)
 * @param {string} url - Endpoint URL
 * @param {FormData} formData - Form data with files
 * @param {Object} config - Axios config
 * @returns {Promise} Response data
 */
export const upload = async (url, formData, config = {}) => {
  const response = await apiClient.post(url, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Export client instance for advanced usage
export default apiClient;
