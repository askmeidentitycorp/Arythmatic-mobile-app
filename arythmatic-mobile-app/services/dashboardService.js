// services/dashboardService.js
import apiClient from './apiClient';

export const dashboardService = {
  // New consolidated analytics endpoints
  getSummary: (params = {}) => apiClient.get('/analytics/summary/', params),
  getPerformance: (params = {}) => apiClient.get('/analytics/performance/', params),

  // Legacy endpoints (kept for fallback)
  getOverview: (params = {}) => apiClient.get('/analytics/overview/', params),
  getRevenue: (params = {}) => apiClient.get('/analytics/revenue/', params), 
  getSalesPerformance: (params = {}) => apiClient.get('/analytics/sales-performance/', params),
  getCustomers: (params = {}) => apiClient.get('/analytics/customers/', params),
  getProducts: (params = {}) => apiClient.get('/analytics/products/', params),
  getInteractions: (params = {}) => apiClient.get('/analytics/interactions/', params),
  getTeamPerformance: (params = {}) => apiClient.get('/analytics/team-performance/', params),
  getRealtime: () => apiClient.get('/analytics/real-time/'),

  // Combined analytics data fetch - UPDATED with graceful error handling
  getAllDashboardData: async (params = {}) => {
    console.log('📊 Fetching dashboard analytics data with params:', params);
    
    try {
      // First try consolidated endpoints
      try {
        console.log('📊 Fetching analytics summary/performance...');
        const [summaryRes, perfRes] = await Promise.all([
          dashboardService.getSummary(params),
          dashboardService.getPerformance(params),
        ]);

        // Shape into existing structure expected by consumers
        const shaped = {
          overview: summaryRes?.overview || summaryRes?.metrics || summaryRes || {},
          revenue: summaryRes?.revenue || {},
          products: summaryRes?.products || {},
          interactions: summaryRes?.interactions || {},
          salesPerformance: perfRes?.sales_performance || perfRes?.salesPerformance || {},
          teamPerformance: perfRes?.team_performance || perfRes?.teamPerformance || {},
          realtime: summaryRes?.realtime || {},
        };

        console.log('✅ Analytics summary/performance fetched');
        return shaped;
      } catch (e) {
        console.warn('⚠️ Summary/Performance endpoints failed, falling back to legacy endpoints:', e.message);
      }

      // Legacy sequential calls as fallback to avoid server overload
      console.log('🔄 Fetching analytics data sequentially (legacy)...');
      
      let overviewRes, revenueRes, salesRes, productsRes, teamRes, realtimeRes;
      
      try {
        overviewRes = await apiClient.get('/analytics/overview/', params);
        console.log('✅ Overview data fetched');
      } catch (err) {
        console.warn('⚠️ Overview API failed:', err.message);
        overviewRes = {};
      }
      
      try {
        revenueRes = await apiClient.get('/analytics/revenue/', params);
        console.log('✅ Revenue data fetched');
      } catch (err) {
        console.warn('⚠️ Revenue API failed:', err.message);
        revenueRes = {};
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        salesRes = await apiClient.get('/analytics/sales-performance/', params);
        console.log('✅ Sales performance data fetched');
      } catch (err) {
        console.warn('⚠️ Sales performance API failed:', err.message);
        salesRes = {};
      }
      
      try {
        productsRes = await apiClient.get('/analytics/products/', params);
        console.log('✅ Products data fetched');
      } catch (err) {
        console.warn('⚠️ Products API failed:', err.message);
        productsRes = {};
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        teamRes = await apiClient.get('/analytics/team-performance/', params);
        console.log('✅ Team performance data fetched');
      } catch (err) {
        console.warn('⚠️ Team performance API failed:', err.message);
        teamRes = {};
      }
      
      try {
        realtimeRes = await apiClient.get('/analytics/real-time/');
        console.log('✅ Realtime data fetched');
      } catch (err) {
        console.warn('⚠️ Realtime API failed:', err.message);
        realtimeRes = {};
      }

      console.log('✅ Dashboard data fetched successfully (with fallbacks if needed)');
      
      // Check if data is actually present, log warnings if empty
      if (!overviewRes || Object.keys(overviewRes).length === 0) {
        console.warn('⚠️ Overview data is empty');
      }
      if (!revenueRes || Object.keys(revenueRes).length === 0) {
        console.warn('⚠️ Revenue data is empty');
      }
      if (!salesRes || Object.keys(salesRes).length === 0) {
        console.warn('⚠️ Sales performance data is empty');
      }
      if (!productsRes || Object.keys(productsRes).length === 0) {
        console.warn('⚠️ Products data is empty');
      }
      if (!realtimeRes || Object.keys(realtimeRes).length === 0) {
        console.warn('⚠️ Realtime data is empty');
      }
      
      return {
        overview: overviewRes,
        revenue: revenueRes,
        salesPerformance: salesRes,
        products: productsRes,
        teamPerformance: teamRes,
        realtime: realtimeRes,
      };
    } catch (error) {
      console.error('❌ Critical error in dashboard data fetch:', error);
      // Do not return mock data; propagate error
      throw error;
    }
  },
};
