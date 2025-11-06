import apiClient from './apiClient';

export const paymentService = {
  getAll: (params) => apiClient.get('/payments/', params),
  getAllNested: (params) => apiClient.get('/payments-nested/', params),
  getById: (id) => apiClient.get(`/payments/${id}/`),
  getByIdNested: (id) => apiClient.get(`/payments-nested/${id}/`),
  create: (data) => apiClient.post('/payments/', data),
  update: (id, data) => apiClient.put(`/payments/${id}/`, data),
  delete: (id) => apiClient.delete(`/payments/${id}/`),
  processPayment: (id) => apiClient.post(`/payments/${id}/process/`),
  refundPayment: (id) => apiClient.post(`/payments/${id}/refund/`),
  voidPayment: (id) => apiClient.post(`/payments/${id}/void/`),
  exportPayments: (params) => apiClient.get('/payments/export/', params),
  
  // Get payment counts and totals
  // Implements aggregation logic for /payments-nested/ endpoint:
  // - Track total payments
  // - Split successful vs unsuccessful payments
  // - Cross-reference invoice and product data for financial reporting
  // Each payment includes: amount, currency, status, invoice (UUID), invoice_details (full invoice with line items)
  getCounts: async () => {
    try {
      console.log('📊 Fetching payment counts from API...');
      // Fetch ALL payments with pagination loop
      let allPayments = [];
      let page = 1;
      let hasMore = true;
      const pageSize = 100;
      
      while (hasMore) {
        const response = await apiClient.get('/payments-nested/', { page, page_size: pageSize });
        const payments = response?.results || response?.data?.results || [];
        
        if (!payments || payments.length === 0) {
          hasMore = false;
          break;
        }
        
        allPayments = allPayments.concat(payments);
        console.log(`📊 Fetched page ${page}: ${payments.length} payments (total: ${allPayments.length})`);
        
        if (!response?.next && !response?.data?.next) {
          hasMore = false;
        }
        page += 1;
      }
      
      console.log(`📊 Retrieved total ${allPayments.length} payments for counting`);
      
      const counts = {
        total: allPayments.length,
        totalValue: 0, // legacy combined (multi-currency) amount
        successful: 0, // legacy combined
        failed: 0,     // legacy combined
        pending: 0,    // legacy combined
        voided: 0,     // legacy combined
        summary_by_currency: {},
      };
      
      allPayments.forEach(payment => {
        const amount = parseFloat(payment.amount) || 0;
        const currency = (payment.currency || 'USD').toUpperCase();
        const status = (payment.status || 'pending').toLowerCase();
        
        // Legacy totals (not currency-aware)
        counts.totalValue += amount;
        
        if (!counts.summary_by_currency[currency]) {
          counts.summary_by_currency[currency] = {
            count: 0,
            total: 0,
            successful: 0,
            failed: 0,
            voided: 0,
            pending: 0,
          };
        }
        const byC = counts.summary_by_currency[currency];
        byC.count += 1;
        byC.total += amount;
        
        if (status === 'success' || status === 'successful' || status === 'completed') {
          counts.successful += amount;
          byC.successful += amount;
        } else if (status === 'failed') {
          counts.failed += amount;
          byC.failed += amount;
        } else if (status === 'voided' || status === 'void' || status === 'cancelled') {
          counts.voided += amount;
          byC.voided += amount;
        } else {
          counts.pending += amount;
          byC.pending += amount;
        }
      });
      
      console.log('📊 Payment counts calculated (by currency):', counts.summary_by_currency);
      
      return counts;
    } catch (error) {
      console.error('❌ Error fetching payment counts:', error);
      throw error;
    }
  },
};
