// src/utils/constants.js
import Constants from 'expo-constants';

export const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'https://interaction-tracker-api-133046591892.us-central1.run.app/api/v1';

export default { API_BASE_URL };
