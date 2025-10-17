// services/invoiceService.js

import apiClient from './apiClient';

export const invoiceService = {
  // Regular CRUD operations - FIXED: Pass params directly
  getAll: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /invoices/ with params:', params);
      const response = await apiClient.get('/invoices/', params); // FIXED: Direct params
      console.log('📥 Raw Response:', response);
      const data = response.data || response;
      console.log('✅ Extracted data:', data);
      return data;
    } catch (error) {
      console.error('❌ API Error in getAll:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/invoices/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getById:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await apiClient.post('/invoices/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in create:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/invoices/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in update:', error);
      throw error;
    }
  },

  updatePartial: async (id, data) => {
    try {
      const response = await apiClient.patch(`/invoices/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in updatePartial:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/invoices/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in delete:', error);
      throw error;
    }
  },

  // FIXED: Nested operations - Pass params directly
  getAllNested: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /invoices-nested/ with params:', params);
      
      // FIXED: Pass params directly, not wrapped in { params }
      const response = await apiClient.get('/invoices-nested/', params);
      
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getAllNested:', error);
      throw error;
    }
  },

  getByIdNested: async (id) => {
    try {
      const response = await apiClient.get(`/invoices-nested/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getByIdNested:', error);
      throw error;
    }
  },

  createNested: async (data) => {
    try {
      const response = await apiClient.post('/invoices-nested/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in createNested:', error);
      throw error;
    }
  },

  updateNested: async (id, data) => {
    try {
      const response = await apiClient.put(`/invoices-nested/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in updateNested:', error);
      throw error;
    }
  },

  updateNestedPartial: async (id, data) => {
    try {
      const response = await apiClient.patch(`/invoices-nested/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in updateNestedPartial:', error);
      throw error;
    }
  },

  deleteNested: async (id) => {
    try {
      const response = await apiClient.delete(`/invoices-nested/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in deleteNested:', error);
      throw error;
    }
  },

  // Invoice actions (these are fine as-is)
  sendInvoice: async (id) => {
    try {
      const response = await apiClient.post(`/invoices/${id}/send/`);
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  markAsPaid: async (id) => {
    try {
      const response = await apiClient.post(`/invoices/${id}/mark-paid/`);
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  generatePDF: async (id) => {
    try {
      const response = await apiClient.get(`/invoices/${id}/pdf/`, {
        responseType: 'blob'
      });
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },
};
