// DEPRECATED: api/customerService.js
// Forwarding exports to services/customerService to avoid duplication.
export * from '../services/customerService';
export { customerService as default } from '../services/customerService';
/**
 * Customer Service
 * CRUD operations for customers
 * 
 * WHY SEPARATE FILES:
 * - Each entity has its own service for clear separation
 * - Easy to find and modify customer-specific logic
 * - Can add custom methods per entity without cluttering
 */

import { get, post, put, patch, del } from './client';
import { keysToSnake } from '../utils/formatters';

/**
 * Get all customers (simple)
 * @param {Object} params - Query parameters (page, search, etc.)
 * @returns {Promise<Array>} List of customers
 */
export const getCustomers = async (params = {}) => {
  return await get('/customers/', { params });
};

/**
 * Get all customers with nested data (addresses, contacts, etc.)
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} List of customers with nested data
 */
export const getCustomersNested = async (params = {}) => {
  return await get('/customers-nested/', { params });
};

/**
 * Get single customer by ID
 * @param {number} id - Customer ID
 * @returns {Promise<Object>} Customer object
 */
export const getCustomerById = async (id) => {
  return await get(`/customers/${id}/`);
};

/**
 * Get single customer with nested data
 * @param {number} id - Customer ID
 * @returns {Promise<Object>} Customer object with nested data
 */
export const getCustomerByIdNested = async (id) => {
  return await get(`/customers-nested/${id}/`);
};

/**
 * Create new customer
 * @param {Object} customerData - Customer data (camelCase or snake_case)
 * @returns {Promise<Object>} Created customer
 */
export const createCustomer = async (customerData) => {
  // Convert to snake_case for API
  const payload = keysToSnake(customerData);
  return await post('/customers/', payload);
};

/**
 * Create new customer with nested data
 * @param {Object} customerData - Customer data with nested objects
 * @returns {Promise<Object>} Created customer
 */
export const createCustomerNested = async (customerData) => {
  const payload = keysToSnake(customerData);
  return await post('/customers-nested/', payload);
};

/**
 * Update customer (full update)
 * @param {number} id - Customer ID
 * @param {Object} customerData - Complete customer data
 * @returns {Promise<Object>} Updated customer
 */
export const updateCustomer = async (id, customerData) => {
  const payload = keysToSnake(customerData);
  return await put(`/customers/${id}/`, payload);
};

/**
 * Update customer with nested data
 * @param {number} id - Customer ID
 * @param {Object} customerData - Complete customer data
 * @returns {Promise<Object>} Updated customer
 */
export const updateCustomerNested = async (id, customerData) => {
  const payload = keysToSnake(customerData);
  return await put(`/customers-nested/${id}/`, payload);
};

/**
 * Partial update customer
 * @param {number} id - Customer ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated customer
 */
export const patchCustomer = async (id, updates) => {
  const payload = keysToSnake(updates);
  return await patch(`/customers/${id}/`, payload);
};

/**
 * Partial update customer with nested data
 * @param {number} id - Customer ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated customer
 */
export const patchCustomerNested = async (id, updates) => {
  const payload = keysToSnake(updates);
  return await patch(`/customers-nested/${id}/`, payload);
};

/**
 * Delete customer
 * @param {number} id - Customer ID
 * @returns {Promise<void>}
 */
export const deleteCustomer = async (id) => {
  return await del(`/customers/${id}/`);
};

/**
 * Delete customer (nested endpoint)
 * @param {number} id - Customer ID
 * @returns {Promise<void>}
 */
export const deleteCustomerNested = async (id) => {
  return await del(`/customers-nested/${id}/`);
};
