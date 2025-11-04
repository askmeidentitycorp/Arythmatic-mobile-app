// utils/dashboardDebug.js
import apiClient from '../services/apiClient';
import { dashboardService } from '../services/dashboardService';

/**
 * Debug utility to diagnose dashboard API issues
 */
export const dashboardDebug = {
  /**
   * Check authentication status
   */
  async checkAuth() {
    console.log('\n🔍 === DASHBOARD DEBUG: Checking Auth ===');
    
    try {
      const token = await apiClient.getToken();
      console.log('🔑 Token present:', token ? 'Yes' : 'No');
      
      if (token) {
        console.log('🔑 Token preview:', token.substring(0, 30) + '...');
        
        // Try a simple auth test
        try {
          const testResult = await apiClient.testAuth();
          console.log('✅ Auth test result:', testResult);
        } catch (err) {
          console.error('❌ Auth test failed:', err.message);
        }
      } else {
        console.warn('⚠️ No auth token found - user may not be logged in');
      }
    } catch (error) {
      console.error('❌ Error checking auth:', error);
    }
    
    console.log('=== END AUTH CHECK ===\n');
  },

  /**
   * Test dashboard API endpoints
   */
  async testDashboardAPI() {
    console.log('\n🔍 === DASHBOARD DEBUG: Testing API ===');
    
    try {
      // Check if token exists
      const token = await apiClient.getToken();
      if (!token) {
        console.error('❌ No auth token - cannot test API');
        return;
      }

      console.log('📊 Testing dashboard API endpoints...');
      
      // Test overview endpoint
      try {
        console.log('📊 Testing /analytics/overview/...');
        const overview = await dashboardService.getOverview({ period: 'month' });
        console.log('✅ Overview API works:', Object.keys(overview || {}).length > 0);
        console.log('📊 Overview keys:', Object.keys(overview || {}));
      } catch (err) {
        console.error('❌ Overview API failed:', err.message);
      }

      // Test revenue endpoint
      try {
        console.log('📊 Testing /analytics/revenue/...');
        const revenue = await dashboardService.getRevenue({ period: 'month' });
        console.log('✅ Revenue API works:', Object.keys(revenue || {}).length > 0);
        console.log('📊 Revenue keys:', Object.keys(revenue || {}));
      } catch (err) {
        console.error('❌ Revenue API failed:', err.message);
      }

      // Test full dashboard data
      try {
        console.log('📊 Testing getAllDashboardData...');
        const data = await dashboardService.getAllDashboardData({ period: 'month' });
        console.log('✅ Dashboard data received');
        console.log('📊 Data structure:', {
          hasOverview: !!data?.overview,
          hasRevenue: !!data?.revenue,
          hasSalesPerformance: !!data?.salesPerformance,
          hasProducts: !!data?.products,
          hasRealtime: !!data?.realtime,
        });
        
        // Check if data is empty
        const isEmpty = !data || Object.keys(data).every(key => {
          const val = data[key];
          return !val || (typeof val === 'object' && Object.keys(val).length === 0);
        });
        
        if (isEmpty) {
          console.warn('⚠️ Dashboard data is empty - API returned no data');
        }
      } catch (err) {
        console.error('❌ getAllDashboardData failed:', err.message);
      }
      
    } catch (error) {
      console.error('❌ Error testing dashboard API:', error);
    }
    
    console.log('=== END API TEST ===\n');
  },

  /**
   * Run all checks
   */
  async runAll() {
    await this.checkAuth();
    await this.testDashboardAPI();
  },
};

// Make it available globally in dev mode for easy testing
if (__DEV__) {
  global.dashboardDebug = dashboardDebug;
  console.log('💡 Dashboard debug tools available: global.dashboardDebug.runAll()');
}
