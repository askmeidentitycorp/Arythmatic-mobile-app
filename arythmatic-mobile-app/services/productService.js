// services/productService.js

import apiClient from './apiClient';

export const productService = {
  // Regular CRUD operations - FIXED: Pass params directly
  getAll: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /products/ with params:', params);
      const response = await apiClient.get('/products/', params); // FIXED: Direct params
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
      const response = await apiClient.get(`/products/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getById:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await apiClient.post('/products/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in create:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/products/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in update:', error);
      throw error;
    }
  },

  updatePartial: async (id, data) => {
    try {
      const response = await apiClient.patch(`/products/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in updatePartial:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/products/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in delete:', error);
      throw error;
    }
  },

  // FIXED: Nested operations - Pass params directly
  getAllNested: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /products-nested/ with params:', params);
      
      // FIXED: Pass params directly, not wrapped in { params }
      const response = await apiClient.get('/products-nested/', params);
      
      console.log('📥 Raw Response for nested:', response);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getAllNested:', error);
      throw error;
    }
  },

  getByIdNested: async (id) => {
    try {
      const response = await apiClient.get(`/products-nested/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getByIdNested:', error);
      throw error;
    }
  },

  createNested: async (data) => {
    try {
      const response = await apiClient.post('/products-nested/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in createNested:', error);
      throw error;
    }
  },

  updateNested: async (id, data) => {
    try {
      const response = await apiClient.put(`/products-nested/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in updateNested:', error);
      throw error;
    }
  },

  updateNestedPartial: async (id, data) => {
    try {
      const response = await apiClient.patch(`/products-nested/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in updateNestedPartial:', error);
      throw error;
    }
  },

  deleteNested: async (id) => {
    try {
      const response = await apiClient.delete(`/products-nested/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in deleteNested:', error);
      throw error;
    }
  },
};
