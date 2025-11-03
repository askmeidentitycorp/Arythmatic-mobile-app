// services/interactionStatusHistoryService.js

import apiClient from './apiClient';

/**
 * Interaction Status History Service
 * Endpoints: /interaction-status-history/
 */
export const interactionStatusHistoryService = {
  // List all interaction status history records (supports filters like interaction, status, changed_at__gte/lte)
  getAll: async (params = {}) => {
    const response = await apiClient.get('/interaction-status-history/', params);
    return response.data || response;
  },

  // Retrieve a specific status history record
  getById: async (id) => {
    const response = await apiClient.get(`/interaction-status-history/${id}/`);
    return response.data || response;
  },

  // Convenience: list history for a specific interaction
  getByInteraction: async (interactionId, params = {}) => {
    const response = await apiClient.get('/interaction-status-history/', { ...params, interaction: interactionId });
    return response.data || response;
  },
};

export default interactionStatusHistoryService;
