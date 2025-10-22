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

      console.log('🔍 Fetching sales reps with params:', requestParams);

      const response = await salesRepService.getAll(requestParams);
      
      console.log('📥 Sales Reps API Response:', response);

      let data = response;
      
      if (response && typeof response === 'object' && 'data' in response) {
        data = response.data;
      }

      console.log('📦 Processed data:', data);

      const results = data?.results || data || [];
      const count = data?.count || results.length;
      const next = data?.next || null;
      const previous = data?.previous || null;
      
      console.log('📊 Extracted:', { results: results.length, count, hasNext: !!next });

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

      console.log('✅ Successfully loaded', transformedReps.length, 'sales reps');

    } catch (err) {
      console.error('❌ Error fetching sales reps:', err);
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

      console.log('🔍 Fetching sales rep metrics...');

      // Get first page with same page size as web (10)
      const response = await salesRepService.getAll({
        page: 1,
        page_size: 10,
      });

      console.log('📊 Metrics API Response:', response);

      let data = response;
      
      if (response && typeof response === 'object' && 'data' in response) {
        data = response.data;
      }

      console.log('📦 Metrics processed data:', data);

      const reps = data?.results || [];
      const total = data?.count || 0;
      
      console.log('📋 First page reps:', reps.length);
      console.log('🔍 Detailed rep data:', reps.map(r => ({
        name: r.name,
        is_active: r.is_active,
        status: r.status
      })));

      // Count based on ACTUAL is_active value from API
      const active = reps.filter(rep => rep.is_active === true).length;
      const inactive = reps.filter(rep => rep.is_active === false).length;

      setTotalCount(total);
      setActiveCount(active);
      setInactiveCount(inactive);

      console.log('✅ Calculated Metrics:', { 
        total, 
        activeOnPage: active, 
        inactiveOnPage: inactive,
        pageSize: reps.length
      });

      console.log('⚠️ NOTE: If this shows 10 active but web shows different,');
      console.log('⚠️ the web may be filtering or the data changed.');

    } catch (err) {
      console.error('❌ Error fetching sales rep metrics:', err);
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

      console.log('🔍 Fetching sales rep with ID:', id);

      const response = await salesRepService.getById(id);
      
      const data = response?.data || response;
      setSalesRep(data);

      console.log('✅ Loaded sales rep:', data?.name);

    } catch (err) {
      console.error('❌ Error fetching sales rep:', err);
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
      console.log('📤 Creating sales rep:', data);

      const response = await salesRepService.create(data);
      console.log('✅ Sales rep created:', response);
      return response;
    } catch (err) {
      console.error('❌ Error creating sales rep:', err);
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
      console.log('📤 Updating sales rep:', id, data);

      const response = partial
        ? await salesRepService.updatePartial(id, data)
        : await salesRepService.update(id, data);
      
      console.log('✅ Sales rep updated:', response);
      return response;
    } catch (err) {
      console.error('❌ Error updating sales rep:', err);
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
