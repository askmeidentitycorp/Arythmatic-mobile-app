// hooks/useSalesReps.js
import { useCallback, useEffect, useState } from 'react';
import { salesRepService } from '../services/salesRepService';

export const useSalesReps = (params = {}, pageSize = 10, useAnalytics = false) => {
  const [salesReps, setSalesReps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: pageSize,
    totalCount: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });

  const fetchSalesReps = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const requestParams = {
        page,
        page_size: pageSize,
        ...params,
      };

      const response = await salesRepService.getAll(requestParams);

      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        data = response.data;
      }

      const results = data?.results || data || [];
      const count = data?.count || results.length;
      const next = data?.next || null;
      const previous = data?.previous || null;

      const transformedReps = results.map((rep) => ({
        id: rep.id,
        name: rep.name || 'Unknown Rep',
        email: rep.email || '',
        phone: rep.phone || '',
        employee_id: rep.employee_id || '',
        
        // FIXED: Match web app logic
        status: rep.status || (rep.is_active ? 'active' : 'inactive'),
        is_active: rep.is_active !== undefined ? rep.is_active : true,
        
        role: rep.role || 'sales_agent',
        roles: rep.roles || [],
        territories: rep.territories || [],
        
        total_revenue: rep.total_revenue || 0,
        total_deals: rep.total_deals || 0,
        deals_count: rep.deals_count || 0,
        avg_deal_size: rep.avg_deal_size || 0,
        win_rate: rep.win_rate || 0,
        
        created_at: rep.created_at || new Date().toISOString(),
        updated_at: rep.updated_at || new Date().toISOString(),
      }));

      setSalesReps(transformedReps);

      setPagination({
        currentPage: page,
        pageSize: pageSize,
        totalCount: count,
        totalPages: Math.max(Math.ceil(count / pageSize), 1),
        hasNext: !!next,
        hasPrevious: !!previous,
      });


    } catch (err) {
      setError(err.message || 'Failed to load sales reps');
      setSalesReps([]);
      
      setPagination(prev => ({
        ...prev,
        totalCount: 0,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      }));
    } finally {
      setLoading(false);
    }
  }, [params, pageSize]);

  useEffect(() => {
    fetchSalesReps(1);
  }, [JSON.stringify(params), pageSize]);

  const refresh = useCallback(() => {
    fetchSalesReps(pagination.currentPage);
  }, [fetchSalesReps, pagination.currentPage]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages && !loading) {
      fetchSalesReps(page);
    }
  }, [pagination.totalPages, loading, fetchSalesReps]);

  return {
    salesReps,
    loading,
    error,
    pagination,
    refresh,
    goToPage,
    hasMore: pagination.hasNext,
  };
};

// CORRECTED: This should match what the web shows exactly
export const useSalesRepMetrics = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get total count quickly (no filters needed)
      const totalRes = await salesRepService.getAll({ page: 1, page_size: 1 });
      const total = (totalRes?.count != null) ? totalRes.count : (totalRes?.results?.length || 0);

      // Get active/inactive counts using filtered queries (page_size=1 to read count only)
      const [activeRes, inactiveRes] = await Promise.all([
        salesRepService.getAll({ page: 1, page_size: 1, is_active: true }),
        salesRepService.getAll({ page: 1, page_size: 1, is_active: false }),
      ]);

      const active = activeRes?.count != null ? activeRes.count : 0;
      const inactive = inactiveRes?.count != null ? inactiveRes.count : 0;

      setTotalCount(total);
      setActiveCount(active);
      setInactiveCount(inactive);

    } catch (err) {
      setError(err.message || 'Failed to fetch metrics');
      setTotalCount(0);
      setActiveCount(0);
      setInactiveCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const refresh = useCallback(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    totalCount,
    activeCount,
    inactiveCount,
    loading,
    error,
    refresh,
  };
};

// Single sales rep hook
export const useSalesRep = (id) => {
  const [salesRep, setSalesRep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSalesRep = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);


      const response = await salesRepService.getById(id);
      
      const data = response?.data || response;
      setSalesRep(data);

    } catch (err) {
      setError(err.message || 'Failed to load sales rep');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSalesRep();
  }, [fetchSalesRep]);

  const refresh = useCallback(() => {
    fetchSalesRep();
  }, [fetchSalesRep]);

  return { salesRep, loading, error, refresh };
};

// Mutations hook
export const useSalesRepMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createSalesRep = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await salesRepService.create(data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSalesRep = async (id, data, useNested = false, partial = true) => {
    try {
      setLoading(true);
      setError(null);

      const response = partial
        ? await salesRepService.updatePartial(id, data)
        : await salesRepService.update(id, data);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSalesRep = async (id) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Deleting sales rep:', id);

      await salesRepService.delete(id);
      console.log('✅ Sales rep deleted');
    } catch (err) {
      console.error('❌ Error deleting sales rep:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignTerritory = async (salesRepId, territoryData) => {
    try {
      setLoading(true);
      setError(null);
      await salesRepService.assignTerritory(salesRepId, territoryData);
      console.log('✅ Territory assigned');
    } catch (err) {
      console.error('❌ Error assigning territory:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeTerritory = async (salesRepId, territoryId) => {
    try {
      setLoading(true);
      setError(null);
      await salesRepService.removeTerritory(salesRepId, territoryId);
      console.log('✅ Territory removed');
    } catch (err) {
      console.error('❌ Error removing territory:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createSalesRep,
    updateSalesRep,
    deleteSalesRep,
    assignTerritory,
    removeTerritory,
    loading,
    error,
  };
};
