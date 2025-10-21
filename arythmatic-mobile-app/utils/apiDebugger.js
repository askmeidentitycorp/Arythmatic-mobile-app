// utils/apiDebugger.js

import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { invoiceService } from '../services/invoiceService';
import { dashboardService } from '../services/dashboardService';

/**
 * API Debugging and Testing Utility
 * 
 * Use this utility to debug data fetching issues and compare 
 * nested vs regular endpoints
 */
export const apiDebugger = {
  
  /**
   * Compare nested vs regular endpoint responses
   */
  async compareEndpoints(service, serviceName, params = {}) {
    console.log(`🔍 Comparing ${serviceName} endpoints...`);
    
    try {
      const [regularData, nestedData] = await Promise.all([
        service.getAll ? service.getAll(params) : null,
        service.getAllNested ? service.getAllNested(params) : null
      ]);
      
      console.log(`📊 ${serviceName} Endpoint Comparison:`, {
        regular: {
          available: !!regularData,
          count: regularData?.results?.length || regularData?.length || 0,
          structure: regularData ? Object.keys(regularData) : null,
          firstItem: regularData?.results?.[0] || regularData?.[0] || null
        },
        nested: {
          available: !!nestedData,
          count: nestedData?.results?.length || nestedData?.length || 0,
          structure: nestedData ? Object.keys(nestedData) : null,
          firstItem: nestedData?.results?.[0] || nestedData?.[0] || null
        }
      });
      
      return { regularData, nestedData };
    } catch (error) {
      console.error(`❌ Error comparing ${serviceName} endpoints:`, error);
      return { error };
    }
  },

  /**
   * Test all main data endpoints
   */
  async testAllEndpoints(params = { page: 1, page_size: 5 }) {
    console.log('🧪 Testing all API endpoints...');
    
    const results = {};
    
    // Test customers
    results.customers = await this.compareEndpoints(
      customerService, 
      'Customers', 
      params
    );
    
    // Test products  
    results.products = await this.compareEndpoints(
      productService,
      'Products',
      params
    );
    
    // Test invoices
    results.invoices = await this.compareEndpoints(
      invoiceService,
      'Invoices', 
      params
    );
    
    console.log('✅ All endpoint tests completed:', results);
    return results;
  },

  /**
   * Validate data structure consistency
   */
  validateDataStructure(data, expectedFields = []) {
    if (!data) {
      return { valid: false, reason: 'No data provided' };
    }

    // Check if it's a paginated response
    const isPaginated = data.results && Array.isArray(data.results);
    const items = isPaginated ? data.results : (Array.isArray(data) ? data : [data]);
    
    if (items.length === 0) {
      return { valid: true, reason: 'Empty data set', isPaginated };
    }

    const firstItem = items[0];
    const missingFields = expectedFields.filter(field => !(field in firstItem));
    
    return {
      valid: missingFields.length === 0,
      isPaginated,
      itemCount: items.length,
      missingFields,
      availableFields: Object.keys(firstItem),
      sampleItem: firstItem
    };
  },

  /**
   * Test dashboard data quality
   */
  async testDashboardData(params = { period: 'month' }) {
    console.log('📊 Testing dashboard data quality...');
    
    try {
      const dashboardData = await dashboardService.getAllDashboardData(params);
      
      const analysis = {
        overview: this.validateDataStructure(dashboardData.overview, ['metrics']),
        revenue: this.validateDataStructure(dashboardData.revenue, ['summary_by_currency']),
        products: this.validateDataStructure(dashboardData.products, ['top_products_by_currency']),
        salesPerformance: this.validateDataStructure(dashboardData.salesPerformance, ['by_sales_rep']),
        realtime: this.validateDataStructure(dashboardData.realtime, ['recent_activities'])
      };
      
      console.log('📈 Dashboard data analysis:', analysis);
      return analysis;
    } catch (error) {
      console.error('❌ Dashboard data test failed:', error);
      return { error };
    }
  },

  /**
   * Debug hook behavior by testing both nested and regular data
   */
  async debugHookBehavior(hookName, service, params = {}) {
    console.log(`🐛 Debugging ${hookName} hook behavior...`);
    
    const testParams = { page: 1, page_size: 10, ...params };
    
    try {
      // Test both nested and regular calls
      const results = await this.compareEndpoints(service, hookName, testParams);
      
      // Analyze differences
      const analysis = {
        dataMatch: JSON.stringify(results.regularData) === JSON.stringify(results.nestedData),
        regularValid: this.validateDataStructure(results.regularData),
        nestedValid: this.validateDataStructure(results.nestedData),
        recommendation: null
      };
      
      // Provide recommendation
      if (analysis.dataMatch) {
        analysis.recommendation = 'Both endpoints return identical data. Either can be used.';
      } else if (analysis.nestedValid.valid && !analysis.regularValid.valid) {
        analysis.recommendation = 'Use nested endpoint - regular endpoint has issues.';
      } else if (analysis.regularValid.valid && !analysis.nestedValid.valid) {
        analysis.recommendation = 'Use regular endpoint - nested endpoint has issues.';
      } else {
        analysis.recommendation = 'Both endpoints have issues. Investigation needed.';
      }
      
      console.log(`🔍 ${hookName} analysis:`, analysis);
      return { ...results, analysis };
      
    } catch (error) {
      console.error(`❌ Error debugging ${hookName}:`, error);
      return { error };
    }
  },

  /**
   * Quick test to see if wrong data is being returned
   */
  async quickDataCheck() {
    console.log('⚡ Quick data consistency check...');
    
    const checks = {
      customers: await this.debugHookBehavior('Customers', customerService),
      products: await this.debugHookBehavior('Products', productService)
    };
    
    // Summary
    const summary = Object.entries(checks).map(([name, result]) => ({
      entity: name,
      hasError: !!result.error,
      recommendation: result.analysis?.recommendation || 'Error occurred',
      dataIssues: result.analysis ? !result.analysis.dataMatch : true
    }));
    
    console.log('📋 Quick check summary:', summary);
    return summary;
  }
};

// Export for global access during development
if (__DEV__) {
  global.apiDebugger = apiDebugger;
}

export default apiDebugger;