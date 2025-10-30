// services/customerAddressService.js

import apiClient from './apiClient';

/**
 * Customer Address Service
 * Handles customer addresses
 * Endpoints: /customer-addresses/
 */

export const customerAddressService = {
  getAll: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /customer-addresses/ with params:', params);
      const response = await apiClient.get('/customer-addresses/', params);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerAddressService.getAll:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/customer-addresses/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerAddressService.getById:', error);
      throw error;
    }
  },

  getByCustomerContact: async (customerContactId) => {
    try {
      const response = await apiClient.get('/customer-addresses/', { customer_contact: customerContactId });
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerAddressService.getByCustomerContact:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      console.log('📞 API Call: POST /customer-addresses/', data);
      const response = await apiClient.post('/customer-addresses/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerAddressService.create:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/customer-addresses/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerAddressService.update:', error);
      throw error;
    }
  },

  updatePartial: async (id, data) => {
    try {
      const response = await apiClient.patch(`/customer-addresses/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerAddressService.updatePartial:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/customer-addresses/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerAddressService.delete:', error);
      throw error;
    }
  },

  setPrimary: async (id) => {
    try {
      const response = await apiClient.patch(`/customer-addresses/${id}/`, { is_primary: true });
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in customerAddressService.setPrimary:', error);
      throw error;
    }
  },
};

export default customerAddressService;
