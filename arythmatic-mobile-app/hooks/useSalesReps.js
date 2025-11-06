// hooks/useSalesReps.js
import { useCallback, useEffect, useState, useMemo } from 'react';
import { salesRepService } from '../services/salesRepService';
import { roleService } from '../services/roleService';

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

  const stableParams = useMemo(() => params, [JSON.stringify(params)]);

  const fetchSalesReps = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const requestParams = {
        page,
        page_size: pageSize,
        ...stableParams,
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
  }, [stableParams, pageSize]);

  useEffect(() => {
    fetchSalesReps(1);
  }, [fetchSalesReps]);

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
  const [salesAgentCount, setSalesAgentCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1) Total and active/inactive counts from sales-reps list endpoint (server-provided count)
      const [totalRes, activeRes, inactiveRes] = await Promise.all([
        salesRepService.getAll({ page: 1, page_size: 1 }),
        salesRepService.getAll({ page: 1, page_size: 1, is_active: true }),
        salesRepService.getAll({ page: 1, page_size: 1, is_active: false }),
      ]);
      const total = (totalRes?.count != null) ? totalRes.count : (totalRes?.results?.length || 0);
      const active = activeRes?.count != null ? activeRes.count : 0;
      const inactive = inactiveRes?.count != null ? inactiveRes.count : Math.max(total - active, 0);

      // 2) Role-based counts via roles endpoints to avoid relying on unknown query param names
      // Fetch roles and find IDs for 'Sales Agent' and 'Admin' (case-insensitive)
      const rolesResp = await roleService.getAll({ page: 1, page_size: 100 });
      const roles = rolesResp?.results || rolesResp || [];
      const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, '_');
      const salesAgentRole = roles.find(r => norm(r.name) === 'sales_agent');
      const adminRole = roles.find(r => norm(r.name) === 'admin');

      let agents = 0;
      let admins = 0;

      // Prefer fast count via /roles/{id}/users/ if available, else fallback to /sales-rep-roles/ or zero
      const fetchUsersCountByRole = async (roleId) => {
        if (!roleId) return 0;
        try {
          // First attempt: one request and use 'count' if available
          const first = await roleService.getUsersByRole(roleId, { page: 1, page_size: 200 });
          const body = first?.data || first;
          if (body?.count != null) {
            return body.count;
          }

          // Fallback: paginate and sum results length
          let total = 0;
          let page = 1;
          while (true) {
            const resp = page === 1 ? body : (await roleService.getUsersByRole(roleId, { page, page_size: 200 }));
            const data = resp?.data || resp;
            const chunk = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
            total += chunk.length;
            const next = data?.next;
            if (!next || chunk.length === 0) break;
            page += 1;
          }
          return total;
        } catch (e) {
          return 0;
        }
      };

      [agents, admins] = await Promise.all([
        fetchUsersCountByRole(salesAgentRole?.id),
        fetchUsersCountByRole(adminRole?.id),
      ]);

      setTotalCount(total);
      setActiveCount(active);
      setInactiveCount(inactive);
      setSalesAgentCount(agents);
      setAdminCount(admins);

    } catch (err) {
      setError(err.message || 'Failed to fetch metrics');
      setTotalCount(0);
      setActiveCount(0);
      setInactiveCount(0);
      setSalesAgentCount(0);
      setAdminCount(0);
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
    salesAgentCount,
    adminCount,
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
