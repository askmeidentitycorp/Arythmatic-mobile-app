// hooks/useCustomers.js

import { useCallback, useEffect, useState } from 'react';
import { customerService } from '../services/customerService';

export const useCustomers = (params = {}, pageSize = 20, useNested = true) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });

  const fetchCustomers = useCallback(async (page = 1) => {
    console.log('🚀 SIMPLE fetchCustomers called with page:', page);

    try {
      setLoading(true);
      setError(null);
      
      const requestParams = {
        page,
        page_size: 20,
        limit: 20,
        ...params,
      };

      console.log('🔍 Fetching customers with params:', requestParams);

      const response = useNested
        ? await customerService.getAllNested(requestParams)
        : await customerService.getAll(requestParams);

      console.log('📥 Customer API Response:', response);

      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        data = response.data;
      }

      const results = data?.results || data || [];
      const count = data?.count || 0;
      
      // Calculate total pages based on API count
      const totalPages = Math.ceil(count / 20) || 0;

      console.log('📊 SIMPLE Processing response:', {
        resultsLength: results.length,
        count,
        requestedPage: page,
        totalPages,
        firstCustomerId: results[0]?.id,
        lastCustomerId: results[results.length - 1]?.id,
        customerNames: results.slice(0, 3).map(c => c.displayName)
      });

      const newPagination = {
        currentPage: page,
        pageSize: 20,
        totalCount: count,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      };

      setCustomers(results);
      setPagination(newPagination);

      console.log('✅ SIMPLE State updated successfully:', {
        customersCount: results.length,
        pagination: newPagination
      });

    } catch (err) {
      console.error('❌ SIMPLE Error fetching customers:', err);
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
  }, [params, useNested]);

  // Initial load
  useEffect(() => {
    console.log('🔄 SIMPLE Initial useEffect triggered');
    fetchCustomers(1);
  }, [fetchCustomers]);

  const refresh = useCallback(() => {
    console.log('🔄 SIMPLE Refresh triggered - current page:', pagination.currentPage);
    fetchCustomers(pagination.currentPage);
  }, [fetchCustomers, pagination.currentPage]);

  const goToPage = useCallback((page) => {
    console.log('🎯 SIMPLE goToPage called:', {
      requestedPage: page,
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      loading
    });

    if (page >= 1 && page <= pagination.totalPages && !loading && page !== pagination.currentPage) {
      console.log('✅ SIMPLE Page navigation approved, fetching page:', page);
      fetchCustomers(page);
    } else {
      console.log('⚠️ SIMPLE Page navigation blocked');
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
