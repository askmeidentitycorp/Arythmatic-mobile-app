// hooks/useInteractions.js
import { useCallback, useEffect, useState } from 'react';
import { interactionService } from '../services/interactionService';

export const useInteractions = (params = {}, pageSize = 10, useNested = true) => {
  const [interactions, setInteractions] = useState([]);
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

  const fetchInteractions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const requestParams = {
        page,
        page_size: pageSize,
        ...params,
      };

      console.log('🔍 Fetching interactions with params:', requestParams);

      const response = useNested
        ? await interactionService.getAllNested(requestParams)
        : await interactionService.getAll(requestParams);

      console.log('📥 Interaction API Response:', response);

      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        data = response.data;
      }

      console.log('📦 Processed interaction data:', data);

      const results = data?.results || data || [];
      const count = data?.count || 0;
      const totalPages = data?.total_pages || Math.ceil(count / pageSize) || 0;

      console.log('📊 Interactions extracted:', {
        resultsLength: results.length,
        count,
        totalPages,
        hasNext: !!data?.next
      });

      setInteractions(results);

      setPagination({
        currentPage: data?.current_page || page,
        pageSize: pageSize,
        totalCount: count,
        totalPages: totalPages,
        hasNext: !!data?.next,
        hasPrevious: !!data?.previous,
      });

      console.log('✅ Successfully loaded', results.length, 'interactions');

    } catch (err) {
      console.error('❌ Error fetching interactions:', err);
      setError(err.message || 'Failed to load interactions');
      setInteractions([]);
    } finally {
      setLoading(false);
    }
  }, [params, pageSize, useNested]);

  useEffect(() => {
    fetchInteractions(1);
  }, [JSON.stringify(params), pageSize, useNested]);

  const refresh = useCallback(() => {
    fetchInteractions(pagination.currentPage);
  }, [fetchInteractions, pagination.currentPage]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages && !loading) {
      fetchInteractions(page);
    }
  }, [pagination.totalPages, loading, fetchInteractions]);

  return {
    interactions,
    loading,
    error,
    pagination,
    refresh,
    goToPage,
    hasMore: pagination.hasNext,
  };
};

export const useInteractionMetrics = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [totalRes, nRes, ipRes, cRes, xRes] = await Promise.all([
        interactionService.getAll({ page: 1, page_size: 1 }),
        interactionService.getAll({ page: 1, page_size: 1, status: 'new' }),
        interactionService.getAll({ page: 1, page_size: 1, status: 'in_progress' }),
        interactionService.getAll({ page: 1, page_size: 1, status: 'completed' }),
        interactionService.getAll({ page: 1, page_size: 1, status: 'cancelled' }),
      ]);
      setTotalCount(totalRes?.count || 0);
      setNewCount(nRes?.count || 0);
      setInProgressCount(ipRes?.count || 0);
      setCompletedCount(cRes?.count || 0);
      setCancelledCount(xRes?.count || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch interaction metrics');
      setTotalCount(0); setNewCount(0); setInProgressCount(0); setCompletedCount(0); setCancelledCount(0);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);
  const refresh = useCallback(() => fetchMetrics(), [fetchMetrics]);

  return { totalCount, newCount, inProgressCount, completedCount, cancelledCount, loading, error, refresh };
};

export const useInteraction = (id, useNested = true) => {
  const [interaction, setInteraction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInteraction = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const data = useNested
        ? await interactionService.getByIdNested(id)
        : await interactionService.getById(id);
      
      setInteraction(data);
      console.log('✅ Loaded interaction:', data?.id);

    } catch (err) {
      console.error('❌ Error fetching interaction:', err);
      setError(err.message || 'Failed to load interaction');
    } finally {
      setLoading(false);
    }
  }, [id, useNested]);

  useEffect(() => {
    fetchInteraction();
  }, [fetchInteraction]);

  const refresh = useCallback(() => {
    fetchInteraction();
  }, [fetchInteraction]);

  return { interaction, loading, error, refresh };
};

export const useInteractionMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createInteraction = async (data, useNested = true) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📤 Creating interaction:', data);

      const response = useNested
        ? await interactionService.createNested(data)
        : await interactionService.create(data);
      
      console.log('✅ Interaction created:', response);
      return response;
    } catch (err) {
      console.error('❌ Error creating interaction:', err);
      setError(err.message || 'Failed to create interaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateInteraction = async (id, data, useNested = true, partial = false) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📤 Updating interaction:', id, data);

      let response;
      if (useNested) {
        response = partial
          ? await interactionService.updateNestedPartial(id, data)
          : await interactionService.updateNested(id, data);
      } else {
        response = partial
          ? await interactionService.updatePartial(id, data)
          : await interactionService.update(id, data);
      }

      console.log('✅ Interaction updated:', response);
      return response;
    } catch (err) {
      console.error('❌ Error updating interaction:', err);
      setError(err.message || 'Failed to update interaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteInteraction = async (id, useNested = true) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Deleting interaction:', id);

      useNested
        ? await interactionService.deleteNested(id)
        : await interactionService.delete(id);
      
      console.log('✅ Interaction deleted');
    } catch (err) {
      console.error('❌ Error deleting interaction:', err);
      setError(err.message || 'Failed to delete interaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createInteraction,
    updateInteraction,
    deleteInteraction,
    loading,
    error,
  };
};
