// src/api/client.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';
import { STORAGE_KEYS } from '../../constants/authConfig';
import { handleAxiosError } from '../../utils/errorHandler';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      // Current backend expects Token prefix
      config.headers = config.headers || {};
      config.headers.Authorization = `Token ${token}`;
    }
  } catch {}
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Optional refresh can be added here when available
    throw handleAxiosError(error);
  }
);

export default apiClient;
