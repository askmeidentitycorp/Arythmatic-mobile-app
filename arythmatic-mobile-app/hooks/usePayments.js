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
