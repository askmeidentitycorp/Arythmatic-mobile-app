// services/invoiceStatusHistoryService.js

import apiClient from './apiClient';

/**
 * Invoice Status History Service
 * Endpoints: /invoice-status-history/
 */
export const invoiceStatusHistoryService = {
  // List all invoice status history records (supports filters like invoice, status, changed_at__gte/lte)
  getAll: async (params = {}) => {
    const response = await apiClient.get('/invoice-status-history/', params);
    return response.data || response;
  },

  // Retrieve a specific status history record
  getById: async (id) => {
    const response = await apiClient.get(`/invoice-status-history/${id}/`);
    return response.data || response;
  },

  // Convenience: list history for a specific invoice
  getByInvoice: async (invoiceId, params = {}) => {
    const response = await apiClient.get('/invoice-status-history/', { ...params, invoice: invoiceId });
    return response.data || response;
  },
};

export default invoiceStatusHistoryService;
