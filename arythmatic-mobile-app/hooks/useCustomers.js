// hooks/useCustomers.js

import { useCallback, useEffect, useState, useMemo } from 'react';
import { customerService } from '../services/customerService';
import { normalizeCustomer } from '../utils/normalizers';

export const useCustomers = (params = {}, pageSize = 10, useNested = true) => {
  const [customers, setCustomers] = useState([]);
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

  const stableParams = useMemo(() => params, [JSON.stringify(params)]);

  const fetchCustomers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams = {
        page,
        page_size: pageSize,
        ...stableParams,
      };

      const response = useNested
        ? await customerService.getAllNested(requestParams)
        : await customerService.getAll(requestParams);

      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        data = response.data;
      }

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

      // Normalize to ensure displayName etc.
      setCustomers(results.map(normalizeCustomer));
      setPagination(newPagination);


    } catch (err) {
      setError(err.message || 'Failed to load customers');
      setCustomers([]);
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
    fetchCustomers(1);
  }, [fetchCustomers]);

  const refresh = useCallback(() => {
    fetchCustomers(pagination.currentPage);
  }, [fetchCustomers, pagination.currentPage]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages && !loading && page !== pagination.currentPage) {
      fetchCustomers(page);
    }
  }, [fetchCustomers, pagination.totalPages, pagination.currentPage, loading]);

  return {
    customers,
    loading,
    error,
    pagination,
    refresh,
    goToPage,
    hasMore: pagination.hasNext,
  };
};

export const useCustomer = (id, useNested = true) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomer = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = useNested
        ? await customerService.getByIdNested(id)
        : await customerService.getById(id);
      
      setCustomer(data);
    } catch (err) {
      console.error('❌ Error fetching customer:', err);
      setError(err.message || 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  }, [id, useNested]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const refresh = useCallback(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return { customer, loading, error, refresh };
};

export const useCustomerMetrics = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [individualCount, setIndividualCount] = useState(0);
  const [businessCount, setBusinessCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Use minimal page_size to get counts from API (server returns count)
      const [totalRes, indivRes, bizRes, deletedRes] = await Promise.all([
        customerService.getAll({ page: 1, page_size: 1 }),
        customerService.getAll({ page: 1, page_size: 1, type: 'Individual' }),
        customerService.getAll({ page: 1, page_size: 1, type: 'Business' }),
        customerService.getAll({ page: 1, page_size: 1, is_deleted: true }),
      ]);

      const total = totalRes?.count || 0;
      const individual = indivRes?.count || 0;
      const business = bizRes?.count || 0;
      const deleted = deletedRes?.count || 0;
      const active = Math.max(total - deleted, 0);

      setTotalCount(total);
      setIndividualCount(individual);
      setBusinessCount(business);
      setActiveCount(active);
    } catch (err) {
      setError(err.message || 'Failed to fetch customer metrics');
      setTotalCount(0);
      setIndividualCount(0);
      setBusinessCount(0);
      setActiveCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  const refresh = useCallback(() => fetchMetrics(), [fetchMetrics]);

  return { totalCount, individualCount, businessCount, activeCount, loading, error, refresh };
};

export const useCustomerMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCustomer = async (data, useNested = true) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = useNested
        ? await customerService.createNested(data)
        : await customerService.create(data);
      
      return response;
    } catch (err) {
      console.error('❌ Error creating customer:', err);
      setError(err.message || 'Failed to create customer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (id, data, useNested = true, partial = false) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (useNested) {
        response = partial
          ? await customerService.updateNestedPartial(id, data)
          : await customerService.updateNested(id, data);
      } else {
        response = partial
          ? await customerService.updatePartial(id, data)
          : await customerService.update(id, data);
      }
      
      return response;
    } catch (err) {
      console.error('❌ Error updating customer:', err);
      setError(err.message || 'Failed to update customer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id, useNested = true) => {
    try {
      setLoading(true);
      setError(null);
      
      useNested
        ? await customerService.deleteNested(id)
        : await customerService.delete(id);
        
    } catch (err) {
      console.error('❌ Error deleting customer:', err);
      setError(err.message || 'Failed to delete customer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    loading,
    error,
  };
};
