// services/interactionNoteService.js

import apiClient from './apiClient';

/**
 * Interaction Note Service
 * Endpoints: /interaction-notes/
 */
export const interactionNoteService = {
  // List all interaction notes (supports filters like interaction, author, created_at__gte, created_at__lte)
  getAll: async (params = {}) => {
    const response = await apiClient.get('/interaction-notes/', params);
    return response.data || response;
  },

  // Retrieve a specific note
  getById: async (id) => {
    const response = await apiClient.get(`/interaction-notes/${id}/`);
    return response.data || response;
  },

  // Convenience: list notes for a specific interaction
  getByInteraction: async (interactionId, params = {}) => {
    const response = await apiClient.get('/interaction-notes/', { ...params, interaction: interactionId });
    return response.data || response;
  },

  // Create a new note
  create: async (data) => {
    const response = await apiClient.post('/interaction-notes/', data);
    return response.data || response;
  },

  // Full update
  update: async (id, data) => {
    const response = await apiClient.put(`/interaction-notes/${id}/`, data);
    return response.data || response;
  },

  // Partial update
  updatePartial: async (id, data) => {
    const response = await apiClient.patch(`/interaction-notes/${id}/`, data);
    return response.data || response;
  },

  // Delete
  delete: async (id) => {
    const response = await apiClient.delete(`/interaction-notes/${id}/`);
    return response.data || response;
  },
};

export default interactionNoteService;
