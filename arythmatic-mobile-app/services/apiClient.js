// services/apiClient.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/authConfig';
import { handleFetchError, ApiError } from '../utils/errorHandler';
import Constants from 'expo-constants';
import { emitUnauthorized } from '../utils/authEvents';

export const BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || "https://interaction-tracker-api-133046591892.us-central1.run.app/api/v1";

class ApiClient {
  constructor() {
    this.baseURL = BASE_URL;
    this.token = null;
  }

  async getToken() {
    if (this.token) {
      return this.token;
    }
    this.token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return this.token;
  }

  async setToken(token) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Token ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      if (__DEV__) {
        console.log(`🚀 API Request: ${config.method || 'GET'} ${url}`);
        console.log(`🔑 Token present: ${token ? 'Yes' : 'No'}`);
        if (token) {
          console.log(`🔑 Token preview: ${token.substring(0, 20)}...`);
        }
      }

      const response = await fetch(url, config);
      if (__DEV__) {
        console.log(`📡 API Response: ${response.status} ${response.statusText}`);
      }

      if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Clearing token and notifying auth context');
        await this.setToken(null);
        emitUnauthorized('401');
        throw new Error('Authentication required - Token may be expired or invalid');
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (__DEV__) console.log('❌ Error Response Data:', errorData);
          if (errorData.detail) errorMessage = errorData.detail;
          else if (errorData.message) errorMessage = errorData.message;
          else if (errorData.error) errorMessage = errorData.error;
          else if (errorData.non_field_errors) errorMessage = errorData.non_field_errors[0];
        } catch (e) {
          if (__DEV__) console.log('❌ Could not parse error response as JSON');
        }
        throw new Error(errorMessage);
      }

      if (response.status === 204) return null;

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (__DEV__) console.log('✅ API Response Data:', JSON.stringify(data, null, 2));
        return data;
      }

      const textData = await response.text();
      if (__DEV__) console.log('📄 API Response Text:', textData);
      return textData;
    } catch (error) {
      const normalized = handleFetchError(error instanceof Error ? error : new Error(String(error)));
      console.error('❌ API Error:', normalized.message);
      throw normalized;
    }
  }

  // FIXED: Proper parameter handling
  get(endpoint, params = {}) {
    let url = endpoint;
    
    if (Object.keys(params).length > 0) {
      // FIXED: Clean parameters first
      const cleanParams = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = String(value);
        }
      });

      // FIXED: Build query string properly
      const queryString = Object.entries(cleanParams)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
        
      url += `?${queryString}`;
      
      if (__DEV__) {
        console.log(`🔍 FIXED GET with clean params:`, cleanParams);
        console.log(`🔗 FIXED Final URL: ${this.baseURL}${url}`);
      }
    }

    return this.request(url, { method: 'GET' });
  }

  post(endpoint, data) {
    if (__DEV__) console.log('📤 POST Data:', JSON.stringify(data, null, 2));
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  put(endpoint, data) {
    if (__DEV__) console.log('📤 PUT Data:', JSON.stringify(data, null, 2));
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  patch(endpoint, data) {
    if (__DEV__) console.log('📤 PATCH Data:', JSON.stringify(data, null, 2));
    return this.request(endpoint, {
      method: 'PATCH',
      body: data,
    });
  }

  delete(endpoint) {
    if (__DEV__) console.log('🗑️ DELETE request to:', endpoint);
    return this.request(endpoint, { method: 'DELETE' });
  }

  async testConnection() {
    try {
      console.log('🧪 Testing API connection...');
      const data = await this.get('/test/');
      console.log('✅ API connection successful:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ API connection failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testAuth() {
    try {
      console.log('🔐 Testing authentication...');
      const data = await this.get('/auth/test/');
      console.log('✅ Authentication test successful:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Authentication test failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export default new ApiClient();
