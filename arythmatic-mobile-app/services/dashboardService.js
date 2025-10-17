// services/dashboardService.js
import apiClient from './apiClient';

export const dashboardService = {
  // Analytics endpoints (matching web app)
  getOverview: (params = {}) => apiClient.get('/analytics/overview/', params),
  getRevenue: (params = {}) => apiClient.get('/analytics/revenue/', params), 
  getSalesPerformance: (params = {}) => apiClient.get('/analytics/sales-performance/', params),
  getCustomers: (params = {}) => apiClient.get('/analytics/customers/', params),
  getProducts: (params = {}) => apiClient.get('/analytics/products/', params),
  getInteractions: (params = {}) => apiClient.get('/analytics/interactions/', params),
  getTeamPerformance: (params = {}) => apiClient.get('/analytics/team-performance/', params),
  getTrends: (params = {}) => apiClient.get('/analytics/trends/', params),
  getRealtime: () => apiClient.get('/analytics/real-time/'),

  // Combined analytics data fetch - UPDATED to include team performance
  getAllDashboardData: async (params = {}) => {
    try {
      const [
        overviewRes,
        revenueRes,
        salesRes,
        productsRes,
        teamRes,
        realtimeRes
      ] = await Promise.all([
        apiClient.get('/analytics/overview/', params),
        apiClient.get('/analytics/revenue/', params),
        apiClient.get('/analytics/sales-performance/', params),
        apiClient.get('/analytics/products/', params),
        apiClient.get('/analytics/team-performance/', params),
        apiClient.get('/analytics/real-time/')
      ]);

      return {
        overview: overviewRes,
        revenue: revenueRes,
        salesPerformance: salesRes,
        products: productsRes,
        teamPerformance: teamRes,
        realtime: realtimeRes,
      };
    } catch (error) {
      console.error('Error fetching analytics dashboard data:', error);
      throw error;
    }
  },
};
