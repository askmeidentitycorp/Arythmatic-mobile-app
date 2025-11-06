// services/roleService.js

import apiClient from './apiClient';

/**
 * Role Service
 * Handles all role-related API operations
 * Endpoints: /roles/
 */

export const roleService = {
  /**
   * Get all roles
   * @param {Object} params - Query parameters (search, page, page_size, etc.)
   * @returns {Promise} List of roles
   */
  getAll: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /roles/ with params:', params);
      const response = await apiClient.get('/roles/', params);
      console.log('📥 Roles Response:', response);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in roleService.getAll:', error);
      throw error;
    }
  },

  /**
   * Get a single role by ID
   * @param {string} id - Role ID
   * @returns {Promise} Role details
   */
  getById: async (id) => {
    try {
      console.log('📞 API Call: GET /roles/' + id);
      const response = await apiClient.get(`/roles/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in roleService.getById:', error);
      throw error;
    }
  },

  /**
   * Create a new role
   * @param {Object} data - Role data { name, description, permissions, etc. }
   * @returns {Promise} Created role
   */
  create: async (data) => {
    try {
      console.log('📞 API Call: POST /roles/', data);
      const response = await apiClient.post('/roles/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in roleService.create:', error);
      throw error;
    }
  },

  /**
   * Update a role (full update)
   * @param {string} id - Role ID
   * @param {Object} data - Complete role data
   * @returns {Promise} Updated role
   */
  update: async (id, data) => {
    try {
      console.log('📞 API Call: PUT /roles/' + id, data);
      const response = await apiClient.put(`/roles/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in roleService.update:', error);
      throw error;
    }
  },

  /**
   * Update a role (partial update)
   * @param {string} id - Role ID
   * @param {Object} data - Partial role data
   * @returns {Promise} Updated role
   */
  updatePartial: async (id, data) => {
    try {
      console.log('📞 API Call: PATCH /roles/' + id, data);
      const response = await apiClient.patch(`/roles/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in roleService.updatePartial:', error);
      throw error;
    }
  },

  /**
   * Delete a role
   * @param {string} id - Role ID
   * @returns {Promise} Deletion confirmation
   */
  delete: async (id) => {
    try {
      console.log('📞 API Call: DELETE /roles/' + id);
      const response = await apiClient.delete(`/roles/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in roleService.delete:', error);
      throw error;
    }
  },

  /**
   * Assign role to user/sales rep
   * @param {string} roleId - Role ID
   * @param {string} userId - User/Sales Rep ID
   * @returns {Promise} Assignment confirmation
   */
  assignToUser: async (roleId, userId) => {
    try {
      console.log('📞 API Call: POST /roles/' + roleId + '/assign/', { user_id: userId });
      const response = await apiClient.post(`/roles/${roleId}/assign/`, {
        user_id: userId,
      });
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in roleService.assignToUser:', error);
      throw error;
    }
  },

  /**
   * Get users with a specific role
   * @param {string} roleId - Role ID
   * @returns {Promise} List of users with this role
   */
  getUsersByRole: async (roleId, params = {}) => {
    try {
      console.log('📞 API Call: GET /roles/' + roleId + '/users/', params);
      const response = await apiClient.get(`/roles/${roleId}/users/`, params);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in roleService.getUsersByRole:', error);
      throw error;
    }
  },
};

export default roleService;
