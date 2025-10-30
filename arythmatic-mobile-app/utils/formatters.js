// utils/formatters.js
/**
 * Data Formatters
 * Transform API responses into UI-ready formats
 * 
 * WHY: APIs often return data in formats optimized for transport (snake_case, ISO dates).
 * These formatters normalize data for consistent UI rendering.
 */

/**
 * Format date string to readable format
 * @param {string} dateString - ISO date string
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }

    const {
      includeTime = false,
      format = 'short', // 'short', 'long', 'relative'
    } = options;

    if (format === 'relative') {
      return getRelativeTime(date);
    }

    const dateOptions = {
      year: 'numeric',
      month: format === 'long' ? 'long' : 'short',
      day: 'numeric',
    };

    if (includeTime) {
      dateOptions.hour = '2-digit';
      dateOptions.minute = '2-digit';
    }

    return date.toLocaleDateString('en-US', dateOptions);
  } catch (error) {
    console.error('❌ Date formatting error:', error);
    return dateString;
  }
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {Date} date - Date to format
 * @returns {string} Relative time string
 */
const getRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (e.g., 'USD')
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '-';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('❌ Currency formatting error:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatCompactNumber = (num) => {
  if (num === null || num === undefined) return '-';
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format for US numbers (adjust as needed)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

/**
 * Convert snake_case to camelCase
 * @param {string} str - String to convert
 * @returns {string} camelCase string
 */
export const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * Convert camelCase to snake_case
 * @param {string} str - String to convert
 * @returns {string} snake_case string
 */
export const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Transform object keys from snake_case to camelCase
 * @param {Object} obj - Object to transform
 * @returns {Object} Transformed object
 */
export const keysToCamel = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => keysToCamel(item));
  }
  
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = snakeToCamel(key);
      acc[camelKey] = keysToCamel(obj[key]);
      return acc;
    }, {});
  }
  
  return obj;
};

/**
 * Transform object keys from camelCase to snake_case
 * @param {Object} obj - Object to transform
 * @returns {Object} Transformed object
 */
export const keysToSnake = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => keysToSnake(item));
  }
  
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = camelToSnake(key);
      acc[snakeKey] = keysToSnake(obj[key]);
      return acc;
    }, {});
  }
  
  return obj;
};

/**
 * Format customer for display
 * @param {Object} customer - Customer object from API
 * @returns {Object} Formatted customer
 */
export const formatCustomer = (customer) => {
  if (!customer) return null;
  
  return {
    ...customer,
    fullName: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.company_name || 'N/A',
    displayName: customer.company_name || `${customer.first_name} ${customer.last_name}`,
    createdAt: formatDate(customer.created_at),
    updatedAt: formatDate(customer.updated_at),
  };
};

/**
 * Format product for display
 * @param {Object} product - Product object from API
 * @returns {Object} Formatted product
 */
export const formatProduct = (product) => {
  if (!product) return null;
  
  return {
    ...product,
    price: formatCurrency(product.price, product.currency),
    createdAt: formatDate(product.created_at),
    updatedAt: formatDate(product.updated_at),
  };
};

/**
 * Format payment for display
 * @param {Object} payment - Payment object from API
 * @returns {Object} Formatted payment
 */
export const formatPayment = (payment) => {
  if (!payment) return null;
  
  return {
    ...payment,
    amount: formatCurrency(payment.amount, payment.currency),
    paymentDate: formatDate(payment.payment_date),
    createdAt: formatDate(payment.created_at),
  };
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default {
  formatDate,
  formatCurrency,
  formatCompactNumber,
  formatPhoneNumber,
  snakeToCamel,
  camelToSnake,
  keysToCamel,
  keysToSnake,
  formatCustomer,
  formatProduct,
  formatPayment,
  truncate,
  capitalize,
};
