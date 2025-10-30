// services/customerEmailService.js

import apiClient from './apiClient';

/**
 * Customer Email Service
 * Handles customer email addresses
 * Endpoints: /customer-emails/
 */

export const customerEmailService = {
  /**
   * Get all customer emails
   * @param {Object} params - Query parameters (customer_contact, email_type, is_primary, page, page_size)
   * @returns {Promise} List of customer emails
   */
  getAll: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /customer-emails/ with params:', params);
      const response = await apiClient.get('/customer-emails/', params);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerEmailService.getAll:', error);
      throw error;
    }
  },

  /**
   * Get customer email by ID
   * @param {string} id - Email ID
   * @returns {Promise} Customer email details
   */
  getById: async (id) => {
    try {
      console.log('📞 API Call: GET /customer-emails/' + id);
      const response = await apiClient.get(`/customer-emails/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerEmailService.getById:', error);
      throw error;
    }
  },

  /**
   * Get emails for a specific customer contact
   * @param {string} customerContactId - Customer Contact ID
   * @returns {Promise} List of customer emails
   */
  getByCustomerContact: async (customerContactId) => {
    try {
      console.log('📞 API Call: GET /customer-emails/ for contact:', customerContactId);
      const response = await apiClient.get('/customer-emails/', { customer_contact: customerContactId });
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerEmailService.getByCustomerContact:', error);
      throw error;
    }
  },

  /**
   * Create new customer email
   * @param {Object} data - Email data { customer_contact, email, email_type, is_primary, notes }
   * @returns {Promise} Created customer email
   */
  create: async (data) => {
    try {
      console.log('📞 API Call: POST /customer-emails/', data);
      const response = await apiClient.post('/customer-emails/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerEmailService.create:', error);
      throw error;
    }
  },

  /**
   * Update customer email (full update)
   * @param {string} id - Email ID
   * @param {Object} data - Complete email data
   * @returns {Promise} Updated customer email
   */
  update: async (id, data) => {
    try {
      console.log('📞 API Call: PUT /customer-emails/' + id, data);
      const response = await apiClient.put(`/customer-emails/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerEmailService.update:', error);
      throw error;
    }
  },

  /**
   * Update customer email (partial update)
   * @param {string} id - Email ID
   * @param {Object} data - Partial email data
   * @returns {Promise} Updated customer email
   */
  updatePartial: async (id, data) => {
    try {
      console.log('📞 API Call: PATCH /customer-emails/' + id, data);
      const response = await apiClient.patch(`/customer-emails/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerEmailService.updatePartial:', error);
      throw error;
    }
  },

  /**
   * Delete customer email
   * @param {string} id - Email ID
   * @returns {Promise} Deletion confirmation
   */
  delete: async (id) => {
    try {
      console.log('📞 API Call: DELETE /customer-emails/' + id);
      const response = await apiClient.delete(`/customer-emails/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerEmailService.delete:', error);
      throw error;
    }
  },

  /**
   * Set email as primary
   * @param {string} id - Email ID
   * @returns {Promise} Updated email
   */
  setPrimary: async (id) => {
    try {
      console.log('📞 API Call: PATCH /customer-emails/' + id + ' (set primary)');
      const response = await apiClient.patch(`/customer-emails/${id}/`, { is_primary: true });
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerEmailService.setPrimary:', error);
      throw error;
    }
  },
};

export default customerEmailService;
