// services/api.js

// Use environment variables for configuration
const BASE_URL = process.env.REACT_APP_API_URL || 
  "https://interaction-tracker-api-133046591892.us-central1.run.app/api/v1";

// Token management
const getToken = () => localStorage.getItem('auth_token');
const setToken = (token) => localStorage.setItem('auth_token', token);
const removeToken = () => localStorage.removeItem('auth_token');

// Default headers
const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() && { Authorization: `Token ${getToken()}` })
});

// API endpoints
export const ENDPOINTS = {
  auth: {
    login: '/auth/token/obtain/',
    refresh: '/auth/token/refresh/',
    logout: '/auth/logout/',
  },
  overview: '/analytics/overview/',
  salesReps: {
    list: '/sales-reps/',
    metrics: '/sales-reps/metrics/',
    detail: (id) => `/sales-reps/${id}/`,
  },
  customers: {
    list: '/customers/',
    metrics: '/customers/metrics/',
    detail: (id) => `/customers/${id}/`,
    nested: '/customers-nested/',
  },
  interactions: {
    list: '/interactions/',
    detail: (id) => `/interactions/${id}/`,
    nested: '/interactions-nested/',
  },
  products: {
    list: '/products/',
    detail: (id) => `/products/${id}/`,
    nested: '/products-nested/',
  },
  invoices: {
    list: '/invoices/',
    detail: (id) => `/invoices/${id}/`,
    nested: '/invoices-nested/',
  },
};

// Generic API request function
export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: getDefaultHeaders(),
    ...options,
  };

  // Add abort controller for request cancellation
  const controller = new AbortController();
  config.signal = controller.signal;

  try {
    const response = await fetch(url, config);
    
    // Handle authentication errors
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry original request with new token
        config.headers.Authorization = `Token ${getToken()}`;
        return fetch(url, config);
      }
      // If refresh fails, redirect to login
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request was aborted');
      throw new Error('Request cancelled');
    }
    console.error('API request failed:', error);
    throw error;
  }
}

// Token refresh function
async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    const response = await fetch(`${BASE_URL}${ENDPOINTS.auth.refresh}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      setToken(data.access);
      return true;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
  return false;
}

// Convenience methods
export async function getJSON(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  return apiRequest(url.pathname + url.search, { method: 'GET' });
}

export async function postJSON(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function putJSON(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function patchJSON(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteJSON(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}

// Authentication functions
export async function login(username, password) {
  const response = await postJSON(ENDPOINTS.auth.login, { username, password });
  setToken(response.access);
  localStorage.setItem('refresh_token', response.refresh);
  return response;
}

export async function logout() {
  try {
    await postJSON(ENDPOINTS.auth.logout);
  } finally {
    removeToken();
    localStorage.removeItem('refresh_token');
  }
}

// Request cancellation utility
export function createAbortController() {
  return new AbortController();
}