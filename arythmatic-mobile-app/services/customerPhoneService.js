// services/customerPhoneService.js

import apiClient from './apiClient';

/**
 * Customer Phone Service
 * Handles customer phone numbers
 * Endpoints: /customer-phones/
 */

export const customerPhoneService = {
  getAll: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /customer-phones/ with params:', params);
      const response = await apiClient.get('/customer-phones/', params);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerPhoneService.getAll:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/customer-phones/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerPhoneService.getById:', error);
      throw error;
    }
  },

  getByCustomerContact: async (customerContactId) => {
    try {
      const response = await apiClient.get('/customer-phones/', { customer_contact: customerContactId });
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerPhoneService.getByCustomerContact:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      console.log('📞 API Call: POST /customer-phones/', data);
      const response = await apiClient.post('/customer-phones/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerPhoneService.create:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/customer-phones/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerPhoneService.update:', error);
      throw error;
    }
  },

  updatePartial: async (id, data) => {
    try {
      const response = await apiClient.patch(`/customer-phones/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerPhoneService.updatePartial:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/customer-phones/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerPhoneService.delete:', error);
      throw error;
    }
  },

  setPrimary: async (id) => {
    try {
      const response = await apiClient.patch(`/customer-phones/${id}/`, { is_primary: true });
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerPhoneService.setPrimary:', error);
      throw error;
    }
  },
};

export default customerPhoneService;
