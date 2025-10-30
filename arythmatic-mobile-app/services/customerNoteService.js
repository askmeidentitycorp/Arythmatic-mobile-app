// services/customerNoteService.js

import apiClient from './apiClient';

/**
 * Customer Note Service
 * Handles customer notes and comments
 * Endpoints: /customer-notes/
 */

export const customerNoteService = {
  getAll: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /customer-notes/ with params:', params);
      const response = await apiClient.get('/customer-notes/', params);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerNoteService.getAll:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/customer-notes/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerNoteService.getById:', error);
      throw error;
    }
  },

  getByCustomerContact: async (customerContactId) => {
    try {
      const response = await apiClient.get('/customer-notes/', { customer_contact: customerContactId });
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerNoteService.getByCustomerContact:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      console.log('📞 API Call: POST /customer-notes/', data);
      const response = await apiClient.post('/customer-notes/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerNoteService.create:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/customer-notes/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerNoteService.update:', error);
      throw error;
    }
  },

  updatePartial: async (id, data) => {
    try {
      const response = await apiClient.patch(`/customer-notes/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerNoteService.updatePartial:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/customer-notes/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerNoteService.delete:', error);
      throw error;
    }
  },

  /**
   * Pin/unpin a note
   * @param {string} id - Note ID
   * @param {boolean} pinned - Whether to pin or unpin
   * @returns {Promise} Updated note
   */
  setPinned: async (id, pinned = true) => {
    try {
      const response = await apiClient.patch(`/customer-notes/${id}/`, { is_pinned: pinned });
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerNoteService.setPinned:', error);
      throw error;
    }
  },
};

export default customerNoteService;
