// services/salesRepService.js

import apiClient from './apiClient';

export const salesRepService = {
  // Regular CRUD - FIXED: Pass params directly
  getAll: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /sales-reps/ with params:', params);
      const response = await apiClient.get('/sales-reps/', params); // FIXED: Direct params
      console.log('📥 API Response:', response);
      
      // Extract data from axios response
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
      console.log('📞 API Call: GET /sales-reps/' + id);
      const response = await apiClient.get(`/sales-reps/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getById:', error);
      throw error;
    }
  },

  // Analytics endpoints (these use params correctly)
  getSalesPerformance: async (params = {}) => {
    try {
      const response = await apiClient.get('/analytics/sales-performance/', params); // FIXED: Direct params
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getSalesPerformance:', error);
      throw error;
    }
  },

  getTeamPerformance: async (params = {}) => {
    try {
      const response = await apiClient.get('/analytics/team-performance/', params); // FIXED: Direct params
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getTeamPerformance:', error);
      throw error;
    }
  },

  // CRUD operations
  create: async (data) => {
    try {
      const response = await apiClient.post('/sales-reps/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in create:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/sales-reps/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in update:', error);
      throw error;
    }
  },

  updatePartial: async (id, data) => {
    try {
      console.log('📞 API Call: PATCH /sales-reps/' + id, data);
      const response = await apiClient.patch(`/sales-reps/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in updatePartial:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/sales-reps/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in delete:', error);
      throw error;
    }
  },

  // Territory and performance methods (these also use params)
  assignTerritory: async (id, territoryData) => {
    try {
      const response = await apiClient.post(`/sales-reps/${id}/assign-territory/`, territoryData);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in assignTerritory:', error);
      throw error;
    }
  },

  removeTerritory: async (id, territoryId) => {
    try {
      const response = await apiClient.delete(`/sales-reps/${id}/territories/${territoryId}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in removeTerritory:', error);
      throw error;
    }
  },

  getPerformance: async (id, params = {}) => {
    try {
      const response = await apiClient.get(`/sales-reps/${id}/performance/`, params); // FIXED: Direct params
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getPerformance:', error);
      throw error;
    }
  },

  bulkAssign: async (data) => {
    try {
      const response = await apiClient.post('/sales-reps/bulk-assign/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in bulkAssign:', error);
      throw error;
    }
  },
};
