// hooks/usePayments.js
import { useCallback, useEffect, useState, useMemo } from 'react';
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

  // Stabilize params to prevent infinite loops
  const stableParams = useMemo(() => params, [JSON.stringify(params)]);

  const fetchPayments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams = {
        page,
        page_size: pageSize,
        ...stableParams,
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
        // Debug: Log payment structure to see where customer name is
        if (__DEV__ && results.indexOf(payment) === 0) {
          console.log('🔍 Payment structure sample:', {
            id: payment.id,
            displayName: payment.displayName,
            customer_details: {
              displayName: payment.customer_details?.displayName,
              firstName: payment.customer_details?.firstName,
              lastname: payment.customer_details?.lastname,
              contact_details: {
                emails: payment.customer_details?.contact_details?.emails,
                phones: payment.customer_details?.contact_details?.phones,
              },
            },
          });
        }
        
        // Extract customer name from response
        // Based on API structure: customer_details contains nested displayName
        const customerName = payment.customer_details?.displayName ||
                           payment.customer_details?.display_name ||
                           payment.displayName ||
                           payment.display_name ||
                           (payment.customer_details?.firstname && payment.customer_details?.lastname ? `${payment.customer_details.firstname} ${payment.customer_details.lastname}` : '') ||
                           (payment.firstname && payment.lastname ? `${payment.firstname} ${payment.lastname}` : '') ||
                           payment.firstname ||
                           payment.customer_details?.name ||
                           payment.customer?.displayName ||
                           payment.customer?.display_name ||
                           payment.customer?.name || 
                           payment.customer_name || 
                           'Unknown Customer';
        
        return {
          ...payment,
          customerName,
          // Extract customer contact details from deeply nested customer_details.contact_details
          customer_email: payment.customer_details?.contact_details?.emails?.[0]?.email || 
                         payment.customer_details?.email || 
                         payment.email || 
                         payment.customer_email || 
                         payment.customer?.email || '',
          customer_phone: payment.customer_details?.contact_details?.phones?.[0]?.phone || 
                         payment.customer_details?.phone || 
                         payment.phone || 
                         payment.customer_phone || 
                         payment.customer?.phone || '',
          // Extract invoice number from invoice_details if available
          invoice_number: payment.invoice_details?.invoice_number || payment.invoice_details?.invoiceNumber || payment.invoice_number || payment.invoice,
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
  }, [stableParams, pageSize, useNested]);

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
