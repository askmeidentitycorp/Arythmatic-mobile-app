// utils/errorHandler.js
/**
 * Centralized Error Handler
 * Provides consistent error formatting across the application
 * 
 * WHY: Different APIs return errors in different formats.
 * This normalizes them for consistent UI display and logging.
 */

/**
 * API Error class with standardized structure
 */
export class ApiError extends Error {
  constructor(message, statusCode = null, originalError = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Check if error is a network error
   */
  isNetworkError() {
    return !this.statusCode || this.statusCode === 0;
  }

  /**
   * Check if error is authentication related
   */
  isAuthError() {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  /**
   * Check if error is a server error
   */
  isServerError() {
    return this.statusCode >= 500;
  }

  /**
   * Check if error is a client error
   */
  isClientError() {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage() {
    if (this.isNetworkError()) {
      return 'Network error. Please check your connection and try again.';
    }
    if (this.isAuthError()) {
      return 'Authentication failed. Please log in again.';
    }
    if (this.isServerError()) {
      return 'Server error. Please try again later.';
    }
    return this.message || 'An unexpected error occurred.';
  }
}

/**
 * Parse error from axios response
 * @param {Error} error - Axios error object
 * @returns {ApiError} Standardized API error
 */
export const handleAxiosError = (error) => {
  // Network error (no response)
  if (!error.response) {
    if (error.request) {
      // Request made but no response received
      return new ApiError(
        'No response from server. Please check your internet connection.',
        0,
        error
      );
    }
    // Request setup error
    return new ApiError(
      'Failed to make request. Please try again.',
      0,
      error
    );
  }

  // HTTP error response
  const { status, data } = error.response;
  
  // Extract error message from various response formats
  let message = 'An error occurred';
  
  if (typeof data === 'string') {
    message = data;
  } else if (data) {
    // Try common error message fields
    message = 
      data.detail ||
      data.message ||
      data.error ||
      data.error_description ||
      (data.non_field_errors && data.non_field_errors[0]) ||
      (data.errors && JSON.stringify(data.errors)) ||
      `HTTP ${status} error`;
  }

  // Log in development
  if (__DEV__) {
    console.error('❌ API Error:', {
      status,
      message,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });
  }

  return new ApiError(message, status, error);
};

/**
 * Generic API error handler wrapper
 * Decides which parser to use based on error shape
 */
export const handleApiError = (error) => {
  // Axios style
  if (error?.isAxiosError || error?.response) {
    return handleAxiosError(error);
  }
  // Fetch / generic
  return handleFetchError(error);
};

/**
 * Parse error from fetch response
 * @param {Error} error - Fetch error object
 * @returns {ApiError} Standardized API error
 */
export const handleFetchError = (error) => {
  if (error instanceof ApiError) {
    return error;
  }

  // Network error
  if (error.message === 'Network request failed' || error.message.includes('Network')) {
    return new ApiError(
      'Network error. Please check your connection.',
      0,
      error
    );
  }

  // Generic error
  return new ApiError(
    error.message || 'An unexpected error occurred.',
    null,
    error
  );
};

/**
 * Handle React Query errors
 * @param {Error} error - Error from React Query
 * @returns {ApiError} Standardized API error
 */
export const handleQueryError = (error) => {
  if (error instanceof ApiError) {
    return error;
  }
  
  // Axios error
  if (error.isAxiosError) {
    return handleAxiosError(error);
  }

  // Generic error
  return new ApiError(
    error.message || 'Query failed',
    null,
    error
  );
};

/**
 * Display error to user (can be customized with toast/alert library)
 * @param {Error} error - Error to display
 * @param {Object} options - Display options
 */
export const displayError = (error, options = {}) => {
  const apiError = error instanceof ApiError ? error : new ApiError(error.message);
  const message = apiError.getUserMessage();

  if (__DEV__) {
    console.error('🚨 Display Error:', message);
  }

  // You can integrate with your toast/alert library here
  // For now, just log it
  if (options.showAlert) {
    // Alert.alert('Error', message);
  }

  return message;
};

/**
 * Retry logic helper
 * Determines if an error should trigger a retry
 * @param {Error} error - Error to check
 * @returns {boolean} Whether to retry
 */
export const shouldRetry = (error) => {
  const apiError = error instanceof ApiError ? error : handleQueryError(error);
  
  // Don't retry auth errors
  if (apiError.isAuthError()) {
    return false;
  }

  // Don't retry client errors (except 408 Request Timeout and 429 Too Many Requests)
  if (apiError.isClientError()) {
    return apiError.statusCode === 408 || apiError.statusCode === 429;
  }

  // Retry network errors and server errors
  return apiError.isNetworkError() || apiError.isServerError();
};

/**
 * Get retry delay based on attempt number
 * Implements exponential backoff
 * @param {number} attemptIndex - Zero-based attempt index
 * @returns {number} Delay in milliseconds
 */
export const getRetryDelay = (attemptIndex) => {
  return Math.min(1000 * 2 ** attemptIndex, 30000); // Max 30 seconds
};

export default {
  ApiError,
  handleAxiosError,
  handleFetchError,
  handleQueryError,
  handleApiError,
  displayError,
  shouldRetry,
  getRetryDelay,
};
