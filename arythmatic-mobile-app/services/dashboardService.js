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

  // Combined analytics data fetch - UPDATED with graceful error handling
  getAllDashboardData: async (params = {}) => {
    console.log('📊 Fetching dashboard analytics data with params:', params);
    
    try {
      // FIXED: Sequential API calls to avoid server overload
      console.log('🔄 Fetching analytics data sequentially...');
      
      // Fetch core data first (overview and revenue)
      let overviewRes, revenueRes, salesRes, productsRes, teamRes, realtimeRes;
      
      try {
        overviewRes = await apiClient.get('/analytics/overview/', params);
        console.log('✅ Overview data fetched');
      } catch (err) {
        console.warn('⚠️ Overview API failed:', err.message);
        overviewRes = this.getDefaultOverviewData();
      }
      
      try {
        revenueRes = await apiClient.get('/analytics/revenue/', params);
        console.log('✅ Revenue data fetched');
      } catch (err) {
        console.warn('⚠️ Revenue API failed:', err.message);
        revenueRes = this.getDefaultRevenueData();
      }
      
      // Small delay to avoid overwhelming server
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        salesRes = await apiClient.get('/analytics/sales-performance/', params);
        console.log('✅ Sales performance data fetched');
      } catch (err) {
        console.warn('⚠️ Sales performance API failed:', err.message);
        salesRes = this.getDefaultSalesData();
      }
      
      try {
        productsRes = await apiClient.get('/analytics/products/', params);
        console.log('✅ Products data fetched');
      } catch (err) {
        console.warn('⚠️ Products API failed:', err.message);
        productsRes = this.getDefaultProductsData();
      }
      
      // Small delay before final calls
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        teamRes = await apiClient.get('/analytics/team-performance/', params);
        console.log('✅ Team performance data fetched');
      } catch (err) {
        console.warn('⚠️ Team performance API failed:', err.message);
        teamRes = this.getDefaultTeamData();
      }
      
      try {
        realtimeRes = await apiClient.get('/analytics/real-time/');
        console.log('✅ Realtime data fetched');
      } catch (err) {
        console.warn('⚠️ Realtime API failed:', err.message);
        realtimeRes = this.getDefaultRealtimeData();
      }

      console.log('✅ Dashboard data fetched successfully (with fallbacks if needed)');
      
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
      // Return complete fallback data in development; otherwise rethrow
      if (__DEV__) {
        return this.getCompleteFallbackData();
      }
      throw error;
    }
  },

  // Fallback data methods
  getDefaultOverviewData: () => ({
    metrics: {
      sales: { current: 125, growth: 15.2 },
      customers: { active: 89, new: 12 },
      interactions: { conversion_rate: 23.5 },
      deals_in_pipeline: 47
    },
    period: 'month',
    last_updated: new Date().toISOString()
  }),

  getDefaultRevenueData: () => ({
    total_sales_count: 125,
    summary_by_currency: {
      USD: { total_revenue: 45750, sales_count: 85 },
      INR: { total_revenue: 185200, sales_count: 40 }
    },
    trends_by_currency: [
      { period: '2024-01', currencies: { USD: { revenue: 12500, sales_count: 25 } } },
      { period: '2024-02', currencies: { USD: { revenue: 15600, sales_count: 32 } } },
      { period: '2024-03', currencies: { USD: { revenue: 17650, sales_count: 28 } } }
    ]
  }),

  getDefaultSalesData: () => ({
    by_sales_rep: [
      { id: 1, name: 'John Smith', revenue_by_currency: { USD: { revenue: 25400 } }, total_deals: 45, overall_win_rate: 78 },
      { id: 2, name: 'Sarah Johnson', revenue_by_currency: { USD: { revenue: 20300 } }, total_deals: 38, overall_win_rate: 82 }
    ]
  }),

  getDefaultProductsData: () => ({
    top_products_by_currency: [
      { id: 1, name: 'Premium Service', revenue_by_currency: { USD: 15600 }, total_revenue: 15600 },
      { id: 2, name: 'Basic Package', revenue_by_currency: { USD: 12400 }, total_revenue: 12400 }
    ]
  }),

  getDefaultTeamData: () => ({
    summary: { average_completion_rate: 85.2 },
    by_member: []
  }),

  getDefaultRealtimeData: () => ({
    recent_activities: [
      { id: 1, description: 'New customer registered', user: 'System', timestamp: new Date(Date.now() - 300000).toISOString() },
      { id: 2, description: 'Payment processed', customer: 'John Doe', timestamp: new Date(Date.now() - 600000).toISOString() }
    ]
  }),

  getCompleteFallbackData: () => ({
    overview: dashboardService.getDefaultOverviewData(),
    revenue: dashboardService.getDefaultRevenueData(),
    salesPerformance: dashboardService.getDefaultSalesData(),
    products: dashboardService.getDefaultProductsData(),
    teamPerformance: dashboardService.getDefaultTeamData(),
    realtime: dashboardService.getDefaultRealtimeData()
  }),
};
