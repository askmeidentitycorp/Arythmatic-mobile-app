import { useCallback, useEffect, useState } from 'react';
import { paymentService } from '../services/paymentService';

export function usePayments(initialFilters = {}, initialPageSize = 10) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: initialPageSize,
    totalCount: 0,
    totalPages: 0,
  });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...filters,
      };
      const response = await paymentService.getAll(params);
      setPayments(response.results);
      setPagination(p => ({
        ...p,
        totalCount: response.count,
        totalPages: response.totalPages,
      }));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const changePage = (page) => {
    setPagination(p => ({ ...p, currentPage: page }));
  };

  const changePageSize = (size) => {
    setPagination(p => ({ ...p, pageSize: size, currentPage: 1 }));
  };

  return {
    payments,
    loading,
    error,
    filters,
    setFilters,
    pagination,
    changePage,
    changePageSize,
    refetch: fetchPayments,
  };
}

// Payment mutations hook
export function usePaymentMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPayment = useCallback(async (data, showAlert = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.create(data);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to create payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePayment = useCallback(async (id, data, isPartialUpdate = false, showAlert = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.update(id, data);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to update payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePayment = useCallback(async (id, showAlert = false) => {
    setLoading(true);
    setError(null);
    try {
      await paymentService.delete(id);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const processPayment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.processPayment(id);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to process payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refundPayment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.refundPayment(id);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to refund payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const voidPayment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.voidPayment(id);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to void payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createPayment,
    updatePayment,
    deletePayment,
    processPayment,
    refundPayment,
    voidPayment,
    loading,
    error,
  };
}
