import apiClient from './apiClient';

export const paymentService = {
  getAll: (params) => apiClient.get('/payments/', params),
  getById: (id) => apiClient.get(`/payments/${id}/`),
  create: (data) => apiClient.post('/payments/', data),
  update: (id, data) => apiClient.put(`/payments/${id}/`, data),
  delete: (id) => apiClient.delete(`/payments/${id}/`),
  processPayment: (id) => apiClient.post(`/payments/${id}/process/`),
  refundPayment: (id) => apiClient.post(`/payments/${id}/refund/`),
  voidPayment: (id) => apiClient.post(`/payments/${id}/void/`),
  exportPayments: (params) => apiClient.get('/payments/export/', params),
  
  // Get payment counts and totals
  getCounts: async () => {
    try {
      console.log('📊 Fetching payment counts from API...');
      // Fetch all payments to calculate accurate counts
      const response = await apiClient.get('/payments/', { page: 1, page_size: 10000 });
      const payments = response?.results || response?.data?.results || [];
      
      console.log(`📊 Retrieved ${payments.length} payments for counting`);
      
      const counts = {
        total: payments.length,
        totalValue: 0,
        successful: 0,
        failed: 0,
        pending: 0,
        voided: 0,
      };
      
      payments.forEach(payment => {
        const amount = parseFloat(payment.amount) || 0;
        counts.totalValue += amount;
        
        const status = (payment.status || 'pending').toLowerCase();
        if (status === 'success' || status === 'successful' || status === 'completed') {
          counts.successful += amount;
        } else if (status === 'failed') {
          counts.failed += amount;
        } else if (status === 'voided' || status === 'void' || status === 'cancelled') {
          counts.voided += amount;
        } else {
          counts.pending += amount;
        }
      });
      
      console.log('📊 Payment counts calculated:', {
        total: counts.total,
        totalValue: counts.totalValue.toFixed(2),
        successful: counts.successful.toFixed(2),
        failed: counts.failed.toFixed(2),
        voided: counts.voided.toFixed(2)
      });
      
      return counts;
    } catch (error) {
      console.error('❌ Error fetching payment counts:', error);
      throw error;
    }
  },
};
