// services/customerService.js

import apiClient from './apiClient';

export const customerService = {
  // Simple CRUD operations
  getAll: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /customers/ with params:', params);
      const response = await apiClient.get('/customers/', params); // FIXED: Direct params
      console.log('📥 Raw Response:', response);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getAll:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/customers/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getById:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await apiClient.post('/customers/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in create:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/customers/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in update:', error);
      throw error;
    }
  },

  updatePartial: async (id, data) => {
    try {
      const response = await apiClient.patch(`/customers/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in updatePartial:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/customers/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in delete:', error);
      throw error;
    }
  },

  // FINALLY FIXED: Nested operations - PASS PARAMS DIRECTLY
  getAllNested: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /customers-nested/ with params:', params);
      
      // FIXED: Pass params DIRECTLY, not wrapped in { params }
      const response = await apiClient.get('/customers-nested/', params);
      
      console.log('📥 Raw Response for nested:', response);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getAllNested:', error);
      throw error;
    }
  },

  getByIdNested: async (id) => {
    try {
      const response = await apiClient.get(`/customers-nested/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getByIdNested:', error);
      throw error;
    }
  },

  createNested: async (data) => {
    try {
      const response = await apiClient.post('/customers-nested/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in createNested:', error);
      throw error;
    }
  },

  updateNested: async (id, data) => {
    try {
      const response = await apiClient.put(`/customers-nested/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in updateNested:', error);
      throw error;
    }
  },

  updateNestedPartial: async (id, data) => {
    try {
      const response = await apiClient.patch(`/customers-nested/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in updateNestedPartial:', error);
      throw error;
    }
  },

  deleteNested: async (id) => {
    try {
      const response = await apiClient.delete(`/customers-nested/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in deleteNested:', error);
      throw error;
    }
  },
};
