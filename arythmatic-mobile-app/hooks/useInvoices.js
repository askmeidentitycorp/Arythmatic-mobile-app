// hooks/useInvoices.js
import { useCallback, useEffect, useState, useMemo } from 'react';
import { invoiceService } from '../services/invoiceService';

export const useInvoices = (params = {}, pageSize = 10, useNested = true) => {
  const [invoices, setInvoices] = useState([]);
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

  const fetchInvoices = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const requestParams = {
        page,
        page_size: pageSize,
        ...stableParams,
      };

      console.log('🔍 Fetching invoices with params:', requestParams);

      const response = useNested
        ? await invoiceService.getAllNested(requestParams)
        : await invoiceService.getAll(requestParams);

      console.log('📥 Invoice API Response:', response);

      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        data = response.data;
      }

      console.log('📦 Processed invoice data:', data);

      const results = data?.results || data || [];
      const count = data?.count || 0;
      const totalPages = data?.total_pages || Math.ceil(count / pageSize) || 0;

      console.log('📊 Invoices extracted:', {
        resultsLength: results.length,
        count,
        totalPages,
        hasNext: !!data?.next
      });

      setInvoices(results);

      setPagination({
        currentPage: data?.current_page || page,
        pageSize: pageSize,
        totalCount: count,
        totalPages: totalPages,
        hasNext: !!data?.next,
        hasPrevious: !!data?.previous,
      });

      console.log('✅ Successfully loaded', results.length, 'invoices');

    } catch (err) {
      console.error('❌ Error fetching invoices:', err);
      setError(err.message || 'Failed to load invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [stableParams, pageSize, useNested]);

  useEffect(() => {
    fetchInvoices(1);
  }, [fetchInvoices]);

  const refresh = useCallback(() => {
    fetchInvoices(pagination.currentPage);
  }, [fetchInvoices, pagination.currentPage]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages && !loading) {
      fetchInvoices(page);
    }
  }, [pagination.totalPages, loading, fetchInvoices]);

  return {
    invoices,
    loading,
    error,
    pagination,
    refresh,
    goToPage,
    hasMore: pagination.hasNext,
  };
};

export const useInvoice = (id, useNested = true) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInvoice = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const data = useNested
        ? await invoiceService.getByIdNested(id)
        : await invoiceService.getById(id);
      
      setInvoice(data);
      console.log('✅ Loaded invoice:', data?.invoiceNumber);

    } catch (err) {
      console.error('❌ Error fetching invoice:', err);
      setError(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }, [id, useNested]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const refresh = useCallback(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  return { invoice, loading, error, refresh };
};

export const useInvoiceMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const counts = await invoiceService.getCounts();
      setMetrics(counts);
    } catch (err) {
      setError(err.message || 'Failed to fetch invoice metrics');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);
  const refresh = useCallback(() => fetchMetrics(), [fetchMetrics]);

  return { metrics, loading, error, refresh };
};

export const useInvoiceMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createInvoice = async (data, useNested = true) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📤 Creating invoice:', data);

      const response = useNested
        ? await invoiceService.createNested(data)
        : await invoiceService.create(data);
      
      console.log('✅ Invoice created:', response);
      return response;
    } catch (err) {
      console.error('❌ Error creating invoice:', err);
      setError(err.message || 'Failed to create invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async (id, data, useNested = true, partial = false) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📤 Updating invoice:', id, data);

      let response;
      if (useNested) {
        response = partial
          ? await invoiceService.updateNestedPartial(id, data)
          : await invoiceService.updateNested(id, data);
      } else {
        response = partial
          ? await invoiceService.updatePartial(id, data)
          : await invoiceService.update(id, data);
      }

      console.log('✅ Invoice updated:', response);
      return response;
    } catch (err) {
      console.error('❌ Error updating invoice:', err);
      setError(err.message || 'Failed to update invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id, useNested = true) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Deleting invoice:', id);

      useNested
        ? await invoiceService.deleteNested(id)
        : await invoiceService.delete(id);
      
      console.log('✅ Invoice deleted');
    } catch (err) {
      console.error('❌ Error deleting invoice:', err);
      setError(err.message || 'Failed to delete invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createInvoice,
    updateInvoice,
    deleteInvoice,
    loading,
    error,
  };
};
