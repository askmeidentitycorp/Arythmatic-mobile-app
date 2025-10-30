// services/customerContactService.js

import apiClient from './apiClient';

/**
 * Customer Contact Service
 * Handles customer contact details (business info, website, social links)
 * Endpoints: /customer-contacts/
 */

export const customerContactService = {
  /**
   * Get all customer contacts
   * @param {Object} params - Query parameters (customer, search, page, page_size)
   * @returns {Promise} List of customer contacts
   */
  getAll: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /customer-contacts/ with params:', params);
      const response = await apiClient.get('/customer-contacts/', params);
      console.log('📥 Customer Contacts Response:', response);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerContactService.getAll:', error);
      throw error;
    }
  },

  /**
   * Get customer contact by ID
   * @param {string} id - Contact ID
   * @returns {Promise} Customer contact details
   */
  getById: async (id) => {
    try {
      console.log('📞 API Call: GET /customer-contacts/' + id);
      const response = await apiClient.get(`/customer-contacts/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerContactService.getById:', error);
      throw error;
    }
  },

  /**
   * Get contact details for a specific customer
   * @param {string} customerId - Customer ID
   * @returns {Promise} Customer contact details
   */
  getByCustomerId: async (customerId) => {
    try {
      console.log('📞 API Call: GET /customer-contacts/ for customer:', customerId);
      const response = await apiClient.get('/customer-contacts/', { customer: customerId });
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerContactService.getByCustomerId:', error);
      throw error;
    }
  },

  /**
   * Create new customer contact
   * @param {Object} data - Contact data { customer, business_name, website, linkedin_url, etc. }
   * @returns {Promise} Created customer contact
   */
  create: async (data) => {
    try {
      console.log('📞 API Call: POST /customer-contacts/', data);
      const response = await apiClient.post('/customer-contacts/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerContactService.create:', error);
      throw error;
    }
  },

  /**
   * Update customer contact (full update)
   * @param {string} id - Contact ID
   * @param {Object} data - Complete contact data
   * @returns {Promise} Updated customer contact
   */
  update: async (id, data) => {
    try {
      console.log('📞 API Call: PUT /customer-contacts/' + id, data);
      const response = await apiClient.put(`/customer-contacts/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerContactService.update:', error);
      throw error;
    }
  },

  /**
   * Update customer contact (partial update)
   * @param {string} id - Contact ID
   * @param {Object} data - Partial contact data
   * @returns {Promise} Updated customer contact
   */
  updatePartial: async (id, data) => {
    try {
      console.log('📞 API Call: PATCH /customer-contacts/' + id, data);
      const response = await apiClient.patch(`/customer-contacts/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerContactService.updatePartial:', error);
      throw error;
    }
  },

  /**
   * Delete customer contact
   * @param {string} id - Contact ID
   * @returns {Promise} Deletion confirmation
   */
  delete: async (id) => {
    try {
      console.log('📞 API Call: DELETE /customer-contacts/' + id);
      const response = await apiClient.delete(`/customer-contacts/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerContactService.delete:', error);
      throw error;
    }
  },
};

export default customerContactService;
