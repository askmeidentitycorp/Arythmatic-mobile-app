// services/invoiceService.js

import apiClient from './apiClient';

export const invoiceService = {
  // Regular CRUD operations - FIXED: Pass params directly
  getAll: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /invoices/ with params:', params);
      const response = await apiClient.get('/invoices/', params); // FIXED: Direct params
      console.log('📥 Raw Response:', response);
      const data = response.data || response;
      console.log('✅ Extracted data:', data);
      return data;
    } catch (error) {
      console.error('❌ API Error in getAll:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/invoices/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getById:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await apiClient.post('/invoices/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in create:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/invoices/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in update:', error);
      throw error;
    }
  },

  updatePartial: async (id, data) => {
    try {
      const response = await apiClient.patch(`/invoices/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in updatePartial:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/invoices/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in delete:', error);
      throw error;
    }
  },

  // FIXED: Nested operations - Pass params directly
  getAllNested: async (params = {}) => {
    try {
      console.log('📞 API Call: GET /invoices-nested/ with params:', params);
      
      // FIXED: Pass params directly, not wrapped in { params }
      const response = await apiClient.get('/invoices-nested/', params);
      
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getAllNested:', error);
      throw error;
    }
  },

  getByIdNested: async (id) => {
    try {
      const response = await apiClient.get(`/invoices-nested/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in getByIdNested:', error);
      throw error;
    }
  },

  createNested: async (data) => {
    try {
      const response = await apiClient.post('/invoices-nested/', data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in createNested:', error);
      throw error;
    }
  },

  updateNested: async (id, data) => {
    try {
      const response = await apiClient.put(`/invoices-nested/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in updateNested:', error);
      throw error;
    }
  },

  updateNestedPartial: async (id, data) => {
    try {
      const response = await apiClient.patch(`/invoices-nested/${id}/`, data);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in updateNestedPartial:', error);
      throw error;
    }
  },

  deleteNested: async (id) => {
    try {
      const response = await apiClient.delete(`/invoices-nested/${id}/`);
      return response.data || response;
    } catch (error) {
      console.error('❌ API Error in deleteNested:', error);
      throw error;
    }
  },

  // Invoice actions (these are fine as-is)
  sendInvoice: async (id) => {
    try {
      const response = await apiClient.post(`/invoices/${id}/send/`);
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  markAsPaid: async (id) => {
    try {
      const response = await apiClient.post(`/invoices/${id}/mark-paid/`);
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  generatePDF: async (id) => {
    try {
      const response = await apiClient.get(`/invoices/${id}/pdf/`, {
        responseType: 'blob'
      });
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },
  // Aggregated invoice counts and values (currency-aware)
  getCounts: async () => {
    try {
      console.log('📊 Fetching invoice counts from API...');
      let allInvoices = [];
      let page = 1;
      let hasMore = true;
      const pageSize = 100;

      while (hasMore) {
        const response = await apiClient.get('/invoices-nested/', { page, page_size: pageSize });
        const invoices = response?.results || response?.data?.results || [];
        if (!invoices || invoices.length === 0) { hasMore = false; break; }
        allInvoices = allInvoices.concat(invoices);
        console.log(`📊 Fetched page ${page}: ${invoices.length} invoices (total: ${allInvoices.length})`);
        if (!response?.next && !response?.data?.next) { hasMore = false; }
        page += 1;
      }

      const counts = {
        total: allInvoices.length,
        status_counts: {
          draft: 0, open: 0, sent: 0, partial_paid: 0, full_paid: 0, overdue: 0, cancelled: 0,
        },
        summary_by_currency: {},
      };

      const addCurrency = (ccy) => {
        const C = (ccy || 'USD').toUpperCase();
        if (!counts.summary_by_currency[C]) {
          counts.summary_by_currency[C] = {
            total_value: 0,
            paid_value: 0,
            pending_value: 0,
          };
        }
        return counts.summary_by_currency[C];
      };

      allInvoices.forEach(inv => {
        const status = (inv.status || '').toLowerCase();
        const currency = (inv.currency || 'USD').toUpperCase();
        const gross = parseFloat(inv.grossAmount || inv.gross_amount || inv.totalAmount || inv.total_amount || 0) || 0;
        const balance = parseFloat(inv.balanceAmount || inv.balance_amount || 0) || 0;

        if (counts.status_counts[status] != null) counts.status_counts[status] += 1;

        const byC = addCurrency(currency);
        byC.total_value += gross;
        if (status === 'full_paid') {
          byC.paid_value += gross;
        } else if (status === 'partial_paid') {
          byC.paid_value += Math.max(gross - balance, 0);
          byC.pending_value += balance;
        } else if (status === 'open' || status === 'sent' || status === 'draft' || status === 'overdue') {
          byC.pending_value += gross;
        }
      });

      console.log('📊 Invoice counts calculated (by currency):', counts.summary_by_currency);
      return counts;
    } catch (error) {
      console.error('❌ Error fetching invoice counts:', error);
      throw error;
    }
  },
};
