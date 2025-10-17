import apiClient from './apiClient';

export const paymentService = {
  getAll: (params) => apiClient.get('/payments', params),
  getById: (id) => apiClient.get(`/payments/${id}`),
  create: (data) => apiClient.post('/payments', data),
  update: (id, data) => apiClient.put(`/payments/${id}`, data),
  delete: (id) => apiClient.delete(`/payments/${id}`),
  processPayment: (id) => apiClient.post(`/payments/${id}/process`),
  refundPayment: (id) => apiClient.post(`/payments/${id}/refund`),
  voidPayment: (id) => apiClient.post(`/payments/${id}/void`),
  exportPayments: (params) => apiClient.get('/payments/export', params),
};
