// hooks/usePayments.js
import { useCallback, useEffect, useState } from 'react';
import { paymentService } from '../services/paymentService';

export const usePayments = (params = {}, pageSize = 10, useNested = true) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: pageSize,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });

  const fetchPayments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams = {
        page,
        page_size: pageSize,
        ...params,
      };

      console.log('🔍 Fetching payments with params:', requestParams);

      const response = useNested
        ? await paymentService.getAllNested(requestParams)
        : await paymentService.getAll(requestParams);

      console.log('📥 Payment API Response:', response);

      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        data = response.data;
      }

      console.log('📦 Processed payment data:', data);

      const results = data?.results || data || [];
      const count = data?.count || 0;
      
      // Calculate total pages based on API count
      const totalPages = Math.ceil(count / pageSize) || 0;

      const newPagination = {
        currentPage: page,
        pageSize: pageSize,
        totalCount: count,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      };

      // Transform payments for display
      const transformedPayments = results.map(payment => {
        // Extract customer name from tags.displayName (camelCase) or other sources
        const customerName = payment.tags?.displayName || 
                           payment.tags?.display_name ||
                           payment.customer_details?.tags?.displayName ||
                           payment.customer_details?.tags?.display_name ||
                           payment.customer_details?.displayName ||
                           payment.customer_details?.display_name || 
                           payment.customer_details?.name ||
                           payment.customer?.displayName ||
                           payment.customer?.display_name ||
                           payment.customer?.name || 
                           payment.customer_name || 
                           'Unknown Customer';
        
        return {
          ...payment,
          customerName,
          // Normalize status to Title Case
          status: payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1).toLowerCase() : 'Pending',
          // Format amount with currency symbol
          amountFormatted: `${payment.currency === 'INR' ? '₹' : payment.currency === 'USD' ? '$' : payment.currency === 'EUR' ? '€' : payment.currency === 'GBP' ? '£' : ''}${parseFloat(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        };
      });

      setPayments(transformedPayments);
      setPagination(newPagination);

      console.log('✅ Successfully loaded', transformedPayments.length, 'payments');

    } catch (err) {
      console.error('❌ Error fetching payments:', err);
      setError(err.message || 'Failed to load payments');
      setPayments([]);
      setPagination(prev => ({ 
        ...prev, 
        hasNext: false, 
        hasPrevious: false 
      }));
    } finally {
      setLoading(false);
    }
  }, [params, pageSize, useNested]);

  // Initial load
  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  const refresh = useCallback(() => {
    fetchPayments(pagination.currentPage);
  }, [fetchPayments, pagination.currentPage]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages && !loading && page !== pagination.currentPage) {
      fetchPayments(page);
    }
  }, [fetchPayments, pagination.totalPages, pagination.currentPage, loading]);

  return {
    payments,
    loading,
    error,
    pagination,
    refresh,
    goToPage,
    hasMore: pagination.hasNext,
  };
};

export const usePayment = (id, useNested = true) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPayment = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = useNested
        ? await paymentService.getByIdNested(id)
        : await paymentService.getById(id);
      
      setPayment(data);
      console.log('✅ Loaded payment:', data?.id);
    } catch (err) {
      console.error('❌ Error fetching payment:', err);
      setError(err.message || 'Failed to load payment');
    } finally {
      setLoading(false);
    }
  }, [id, useNested]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  const refresh = useCallback(() => {
    fetchPayment();
  }, [fetchPayment]);

  return { payment, loading, error, refresh };
};

export const usePaymentMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔵 Fetching payment KPI counts...');
      
      const counts = await paymentService.getCounts();
      console.log('🔵 KPI Counts received:', counts);
      
      setMetrics(counts);
    } catch (err) {
      console.error('❌ Error fetching payment metrics:', err);
      setError(err.message || 'Failed to fetch payment metrics');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchMetrics(); 
  }, [fetchMetrics]);

  const refresh = useCallback(() => fetchMetrics(), [fetchMetrics]);

  return { 
    metrics, 
    loading, 
    error, 
    refresh 
  };
};

export const usePaymentMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processPayment = async (id) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📤 Processing payment:', id);
      
      const response = await paymentService.processPayment(id);
      
      console.log('✅ Payment processed:', response);
      return response;
    } catch (err) {
      console.error('❌ Error processing payment:', err);
      setError(err.message || 'Failed to process payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const voidPayment = async (id) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Voiding payment:', id);
      
      const response = await paymentService.voidPayment(id);
      
      console.log('✅ Payment voided:', response);
      return response;
    } catch (err) {
      console.error('❌ Error voiding payment:', err);
      setError(err.message || 'Failed to void payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refundPayment = async (id, amount) => {
    try {
      setLoading(true);
      setError(null);
      console.log('💰 Refunding payment:', id, amount);
      
      const response = await paymentService.refundPayment(id, amount);
      
      console.log('✅ Payment refunded:', response);
      return response;
    } catch (err) {
      console.error('❌ Error refunding payment:', err);
      setError(err.message || 'Failed to refund payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePayment = async (id) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Deleting payment:', id);
      
      await paymentService.delete(id);
      
      console.log('✅ Payment deleted');
    } catch (err) {
      console.error('❌ Error deleting payment:', err);
      setError(err.message || 'Failed to delete payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    processPayment,
    voidPayment,
    refundPayment,
    deletePayment,
    loading,
    error,
  };
};
