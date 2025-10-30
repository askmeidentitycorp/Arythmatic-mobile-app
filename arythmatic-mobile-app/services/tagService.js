// services/tagService.js

import apiClient from './apiClient';

/**
 * Tag Service
 * Handles all tag-related API operations
 * Endpoints: /tags/
 */

export const tagService = {
  /**
   * Get all tags
   * @param {Object} params - Query parameters (search, category, page, page_size, etc.)
   * @returns {Promise} List of tags
   */
  getAll: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /tags/ with params:', params);
      const response = await apiClient.get('/tags/', params);
      console.log('📥 Tags Response:', response);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in tagService.getAll:', error);
      throw error;
    }
  },

  /**
   * Get a single tag by ID
   * @param {string} id - Tag ID
   * @returns {Promise} Tag details
   */
  getById: async (id) => {
    try {
      console.log('📞 API Call: GET /tags/' + id);
      const response = await apiClient.get(`/tags/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in tagService.getById:', error);
      throw error;
    }
  },

  /**
   * Create a new tag
   * @param {Object} data - Tag data { name, category, color, description }
   * @returns {Promise} Created tag
   */
  create: async (data) => {
    try {
      console.log('📞 API Call: POST /tags/', data);
      const response = await apiClient.post('/tags/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in tagService.create:', error);
      throw error;
    }
  },

  /**
   * Update a tag (full update)
   * @param {string} id - Tag ID
   * @param {Object} data - Complete tag data
   * @returns {Promise} Updated tag
   */
  update: async (id, data) => {
    try {
      console.log('📞 API Call: PUT /tags/' + id, data);
      const response = await apiClient.put(`/tags/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in tagService.update:', error);
      throw error;
    }
  },

  /**
   * Update a tag (partial update)
   * @param {string} id - Tag ID
   * @param {Object} data - Partial tag data
   * @returns {Promise} Updated tag
   */
  updatePartial: async (id, data) => {
    try {
      console.log('📞 API Call: PATCH /tags/' + id, data);
      const response = await apiClient.patch(`/tags/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in tagService.updatePartial:', error);
      throw error;
    }
  },

  /**
   * Delete a tag
   * @param {string} id - Tag ID
   * @returns {Promise} Deletion confirmation
   */
  delete: async (id) => {
    try {
      console.log('📞 API Call: DELETE /tags/' + id);
      const response = await apiClient.delete(`/tags/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in tagService.delete:', error);
      throw error;
    }
  },

  /**
   * Get tags by category
   * @param {string} category - Tag category
   * @returns {Promise} List of tags in category
   */
  getByCategory: async (category) => {
    try {
      console.log('📞 API Call: GET /tags/ filtered by category:', category);
      const response = await apiClient.get('/tags/', { category });
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in tagService.getByCategory:', error);
      throw error;
    }
  },

  /**
   * Get all tag categories
   * @returns {Promise} List of unique categories
   */
  getCategories: async () => {
    try {
      console.log('📞 API Call: GET /tags/categories/');
      const response = await apiClient.get('/tags/categories/');
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in tagService.getCategories:', error);
      throw error;
    }
  },

  /**
   * Bulk create tags
   * @param {Array} tags - Array of tag objects
   * @returns {Promise} Created tags
   */
  bulkCreate: async (tags) => {
    try {
      console.log('📞 API Call: POST /tags/bulk/', tags);
      const response = await apiClient.post('/tags/bulk/', { tags });
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in tagService.bulkCreate:', error);
      throw error;
    }
  },
};

export default tagService;
