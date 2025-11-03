// services/salesRepRoleService.js

import apiClient from './apiClient';

/**
 * Sales Rep Roles
 * Endpoints: /sales-rep-roles/
 * - GET  /sales-rep-roles/                 — List all role assignments
 * - POST /sales-rep-roles/                 — Assign role to sales rep
 * - DELETE /sales-rep-roles/{id}/          — Remove role assignment
 */
export const salesRepRoleService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/sales-rep-roles/', params);
    return response.data || response;
  },

  // Create a new role assignment; expected fields usually include { sales_rep: id, role: id }
  create: async (data) => {
    const response = await apiClient.post('/sales-rep-roles/', data);
    return response.data || response;
  },

  // Remove a role assignment by its id
  delete: async (id) => {
    const response = await apiClient.delete(`/sales-rep-roles/${id}/`);
    return response.data || response;
  },
};

export default salesRepRoleService;
