// services/entityTagService.js

import apiClient from './apiClient';

/**
 * Entity Tag Service
 * Handles tag assignment to entities (Customers, Products, Interactions)
 * Endpoints: /entity-tags/
 */

export const entityTagService = {
  /**
   * Get all entity-tag assignments
   * @param {Object} params - Query parameters (entity_type, entity_id, tag, page, page_size)
   * @returns {Promise} List of entity-tag assignments
   */
  getAll: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /entity-tags/ with params:', params);
      const response = await apiClient.get('/entity-tags/', params);
      console.log('📥 Entity Tags Response:', response);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in entityTagService.getAll:', error);
      throw error;
    }
  },

  /**
   * Get a single entity-tag assignment by ID
   * @param {string} id - Entity Tag ID
   * @returns {Promise} Entity tag details
   */
  getById: async (id) => {
    try {
      console.log('📞 API Call: GET /entity-tags/' + id);
      const response = await apiClient.get(`/entity-tags/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in entityTagService.getById:', error);
      throw error;
    }
  },

  /**
   * Assign a tag to an entity
   * @param {Object} data - { tag: tagId, entity_type: "Customer" | "Product" | "Interaction", entity_id: entityId }
   * @returns {Promise} Created entity-tag assignment
   */
  assignTag: async (data) => {
    try {
      console.log('📞 API Call: POST /entity-tags/', data);
      
      // Validate required fields
      if (!data.tag || !data.entity_type || !data.entity_id) {
        throw new Error('Missing required fields: tag, entity_type, entity_id');
      }

      // Validate entity_type
      const validTypes = ['Customer', 'Product', 'Interaction'];
      if (!validTypes.includes(data.entity_type)) {
        throw new Error(`Invalid entity_type. Must be one of: ${validTypes.join(', ')}`);
      }

      const response = await apiClient.post('/entity-tags/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in entityTagService.assignTag:', error);
      throw error;
    }
  },

  /**
   * Remove a tag assignment from an entity
   * @param {string} id - Entity Tag assignment ID
   * @returns {Promise} Deletion confirmation
   */
  removeTag: async (id) => {
    try {
      console.log('📞 API Call: DELETE /entity-tags/' + id);
      const response = await apiClient.delete(`/entity-tags/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in entityTagService.removeTag:', error);
      throw error;
    }
  },

  /**
   * Get all tags for a specific entity
   * @param {string} entityType - Entity type (Customer, Product, Interaction)
   * @param {string} entityId - Entity ID
   * @returns {Promise} List of tags assigned to this entity
   */
  getTagsForEntity: async (entityType, entityId) => {
    try {
      console.log(`📞 API Call: GET /entity-tags/ for ${entityType}/${entityId}`);
      const response = await apiClient.get('/entity-tags/', {
        entity_type: entityType,
        entity_id: entityId,
      });
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in entityTagService.getTagsForEntity:', error);
      throw error;
    }
  },

  /**
   * Get all entities with a specific tag
   * @param {string} tagId - Tag ID
   * @returns {Promise} List of entities with this tag
   */
  getEntitiesWithTag: async (tagId) => {
    try {
      console.log('📞 API Call: GET /entity-tags/ filtered by tag:', tagId);
      const response = await apiClient.get('/entity-tags/', { tag: tagId });
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in entityTagService.getEntitiesWithTag:', error);
      throw error;
    }
  },

  /**
   * Bulk assign multiple tags to an entity
   * @param {string} entityType - Entity type
   * @param {string} entityId - Entity ID
   * @param {Array<string>} tagIds - Array of tag IDs
   * @returns {Promise} Created assignments
   */
  bulkAssignTags: async (entityType, entityId, tagIds) => {
    try {
      console.log(`📞 API Call: POST /entity-tags/bulk-assign/`, {
        entity_type: entityType,
        entity_id: entityId,
        tags: tagIds,
      });

      const response = await apiClient.post('/entity-tags/bulk-assign/', {
        entity_type: entityType,
        entity_id: entityId,
        tags: tagIds,
      });
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in entityTagService.bulkAssignTags:', error);
      throw error;
    }
  },

  /**
   * Remove all tags from an entity
   * @param {string} entityType - Entity type
   * @param {string} entityId - Entity ID
   * @returns {Promise} Deletion confirmation
   */
  removeAllTags: async (entityType, entityId) => {
    try {
      console.log(`📞 API Call: DELETE /entity-tags/bulk-remove/`);
      const response = await apiClient.delete('/entity-tags/bulk-remove/', {
        entity_type: entityType,
        entity_id: entityId,
      });
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in entityTagService.removeAllTags:', error);
      throw error;
    }
  },
};

export default entityTagService;
