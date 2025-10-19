// hooks/useDashboard.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from "../constants/config";
import { dashboardService } from '../services/dashboardService';

export const useDashboard = (currency = 'USD', dateRange = 'This Month') => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Updated currency conversion rates to match web dashboard ($3,008 = ₹264,612)
  const exchangeRates = {
    USD: { INR: 87.94, EUR: 0.85, USD: 1 },
    INR: { USD: 0.01137, EUR: 0.00967, INR: 1 },
    EUR: { USD: 1.18, INR: 103.46, EUR: 1 }
  };

  // Convert date range to period parameter
  const getPeriodParam = useCallback((range) => {
    switch(range) {
      case 'This Week': return 'week';
      case 'This Month': return 'month';
      case 'This Quarter': return 'quarter';
      case 'This Year': return 'year';
      default: return 'month';
    }
  }, []);

  // Format currency - improved to handle proper currency display
  const formatCurrency = useCallback((amount, curr = currency) => {
    const symbols = { USD: '$', INR: '₹', EUR: '€' };
    if (typeof amount !== 'number' || isNaN(amount)) return `${symbols[curr] || curr} 0`;
    
    // Format large numbers with K, M suffixes for better display
    const absAmount = Math.abs(amount);
    let displayAmount;
    
    if (absAmount >= 1000000) {
      displayAmount = (amount / 1000000).toFixed(1) + 'M';
    } else if (absAmount >= 1000) {
      displayAmount = (amount / 1000).toFixed(1) + 'K';
    } else {
      displayAmount = Math.round(amount).toString();
    }
    
    return `${symbols[curr] || curr}${displayAmount}`;
  }, [currency]);

  // Helper function for relative time - MOVED BEFORE useMemo
  const getRelativeTime = useCallback((timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const now = new Date();
      const date = new Date(timestamp);
      const diff = now - date;
      
      if (isNaN(diff)) return 'Unknown';
      
      const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diff / (1000 * 60 * 60));
      const diffMin = Math.floor(diff / (1000 * 60));

      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHours > 0) return `${diffHours}h ago`;
      return `${Math.max(diffMin, 1)}m ago`;
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return 'Unknown';
    }
  }, []);

  // KPIs from analytics data - UPDATED with all web dashboard metrics
  const kpis = useMemo(() => {
    if (!analyticsData) {
      return [
        { label: 'Total Revenue', value: formatCurrency(0), color: '#31C76A', icon: '💰' },
        { label: 'Total Sales', value: '0', color: '#6B5CE7', icon: '💵' },
        { label: 'Active Customers', value: '0', color: '#F4B740', icon: '👥' },
        { label: 'Conversion Rate', value: '0%', color: '#6B5CE7', icon: '📈' },
        { label: 'Deals in Pipeline', value: '0', color: '#22C55E', icon: '📋' },
        { label: 'Team Performance', value: '0%', color: '#8B5CF6', icon: '🎆' },
      ];
    }

    // Extract data from the correct API structure
    const overview = analyticsData.overview || {};
    const revenue = analyticsData.revenue || {};
    const interactions = overview.metrics?.interactions || {};

    // ENHANCED: Get revenue with currency conversion like web dashboard
    let totalRevenue = 0;
    let totalSales = 0;
    let isConverted = false;
    
    if (revenue.summary_by_currency) {
      // Try to get data for selected currency first
      const currencyData = revenue.summary_by_currency[currency.toUpperCase()];
      if (currencyData) {
        totalRevenue = currencyData.total_revenue || 0;
        totalSales = currencyData.sales_count || 0;
      } else {
        // If selected currency not available, convert from available currencies
        const availableCurrencies = Object.keys(revenue.summary_by_currency);
        if (availableCurrencies.length > 0) {
          let convertedRevenue = 0;
          let totalSalesFromAll = 0;
          
          availableCurrencies.forEach(fromCurrency => {
            const currData = revenue.summary_by_currency[fromCurrency];
            const amount = currData.total_revenue || 0;
            const sales = currData.sales_count || 0;
            
            // Convert to selected currency
            const rate = exchangeRates[fromCurrency]?.[currency.toUpperCase()] || 1;
            convertedRevenue += amount * rate;
            totalSalesFromAll += sales;
          });
          
          totalRevenue = convertedRevenue;
          totalSales = totalSalesFromAll;
          isConverted = true;
        }
      }
    } else {
      // Fallback to old structure
      totalRevenue = revenue.by_currency?.[0]?.amount || 0;
      totalSales = overview.metrics?.sales?.current || 0;
    }

    // FIXED: Use total_sales_count from revenue API
    if (revenue.total_sales_count) {
      totalSales = revenue.total_sales_count;
    }

    // Active customers from overview
    const activeCustomers = overview.metrics?.customers?.active || 0;

    // Conversion Rate from interactions
    const conversionRate = overview.metrics?.interactions?.conversion_rate || 0;
    
    // NEW: Deals in Pipeline from overview
    const dealsInPipeline = overview.metrics?.deals_in_pipeline || 0;
    
    // NEW: Team Performance from team performance data
    const teamPerformance = analyticsData.teamPerformance?.summary?.average_completion_rate || 0;

    console.log('📊 FIXED KPI Data:', {
      selectedCurrency: currency.toUpperCase(),
      totalRevenue,
      totalSales,
      activeCustomers,
      conversionRate,
      dealsInPipeline,
      teamPerformance,
      revenueByCurrency: revenue.summary_by_currency,
      totalSalesFromAPI: revenue.total_sales_count
    });

    return [
      {
        label: isConverted ? 'Total Revenue (Converted)' : 'Total Revenue',
        value: formatCurrency(totalRevenue, currency.toUpperCase()),
        color: '#31C76A',
        icon: '💰'
      },
      {
        label: 'Total Sales',  // CHANGED from 'Orders' to 'Total Sales'
        value: totalSales.toString(),
        color: '#6B5CE7',
        icon: '💵'  // CHANGED icon to represent sales
      },
      {
        label: 'Active Customers',
        value: activeCustomers.toString(),
        color: '#F4B740',
        icon: '👥'
      },
      {
        label: 'Conversion Rate',
        value: `${conversionRate.toFixed(1)}%`,
        color: '#6B5CE7',
        icon: '📈'
      },
      {
        label: 'Deals in Pipeline',
        value: dealsInPipeline.toString(),
        color: '#22C55E',
        icon: '📋'
      },
      {
        label: 'Team Performance',
        value: `${teamPerformance.toFixed(1)}%`,
        color: '#8B5CF6',
        icon: '🎆'
      },
    ];
  }, [analyticsData, formatCurrency, currency]);

  // Helper function to create default chart data
  const createDefaultChartData = useCallback(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      label: month,
      value: Math.floor(Math.random() * 50) + 10,
      color: colors.primary || '#6B5CE7'
    }));
  }, []);

  // Helper function to format period labels
  const formatPeriodLabel = useCallback((period) => {
    if (!period) return 'Period';
    try {
      const date = new Date(period);
      return date.toLocaleDateString('en-US', { month: 'short' });
    } catch {
      return period;
    }
  }, []);

  // FIXED: Chart data from analytics with proper currency handling
  const chartData = useMemo(() => {
    console.log('🔍 FIXED: Checking chart data sources...');
    console.log('📊 Analytics data:', analyticsData);
    
    if (!analyticsData?.revenue) {
      console.log('📈 No revenue data, creating default chart');
      return createDefaultChartData();
    }

    const revenue = analyticsData.revenue;
    let trends = [];
    
    // FIXED: Handle trends_by_currency properly
    if (revenue.trends_by_currency && Array.isArray(revenue.trends_by_currency)) {
      console.log('📈 FIXED: Using trends_by_currency:', revenue.trends_by_currency);
      
      trends = revenue.trends_by_currency.map(trend => {
        // Get revenue for selected currency from the trend
        let trendRevenue = 0;
        let trendSales = 0;
        
        if (trend.currencies && trend.currencies[currency.toUpperCase()]) {
          const currData = trend.currencies[currency.toUpperCase()];
          trendRevenue = currData.revenue || 0;
          trendSales = currData.sales_count || 0;
        } else {
          // If selected currency not available, use the highest revenue currency
          const currencies = Object.values(trend.currencies || {});
          if (currencies.length > 0) {
            const topCurrency = currencies.reduce((max, curr) => 
              (curr.revenue || 0) > (max.revenue || 0) ? curr : max
            );
            trendRevenue = topCurrency.revenue || 0;
            trendSales = topCurrency.sales_count || 0;
          }
        }
        
        return {
          period: trend.period,
          revenue: trendRevenue,
          sales: trendSales,
          label: formatPeriodLabel(trend.period),
          value: trendRevenue,
          color: colors.primary || '#6B5CE7'
        };
      });
    } else if (revenue.summary_by_currency) {
      // FIXED: Create trend from summary data if trends not available
      const currencyData = revenue.summary_by_currency[currency.toUpperCase()];
      if (currencyData) {
        trends = [{
          label: 'Current Period',
          value: currencyData.total_revenue || 0,
          color: colors.primary || '#6B5CE7'
        }];
      }
    }

    console.log('📈 FIXED: Processed trends:', trends);

    if (!trends.length || trends.every(t => t.value === 0)) {
      console.log('📈 No valid trend data, using default');
      return createDefaultChartData();
    }

    return trends;
  }, [analyticsData, currency, createDefaultChartData, formatPeriodLabel]);

  // FIXED: Product performance from analytics with proper currency handling
  const productPerformance = useMemo(() => {
    if (!analyticsData?.products) {
      return [];
    }
    
    const products = analyticsData.products.top_products_by_currency || [];
    
    if (!Array.isArray(products)) {
      return [];
    }
    
    console.log('🛍️ FIXED: Products Data:', products);
    console.log('💰 Selected currency for products:', currency.toUpperCase());

    return products.slice(0, 10).map(product => {
      // FIXED: Handle currency-specific revenue for products
      let productRevenue = 0;
      
      if (product.revenue_by_currency && product.revenue_by_currency[currency.toUpperCase()]) {
        productRevenue = product.revenue_by_currency[currency.toUpperCase()];
      } else {
        // Fallback to total revenue or any available revenue
        productRevenue = product.total_revenue || product.revenue || 0;
      }
      
      return {
        id: product.id || Math.random().toString(),
        name: product.name || 'Unknown Product',
        type: product.type || 'Service', 
        revenue: formatCurrency(productRevenue, currency.toUpperCase()),
      };
    });
  }, [analyticsData, formatCurrency, currency]);

  // FIXED: Sales rep performance from analytics with proper currency handling
  const salesRepPerformance = useMemo(() => {
    const salesReps = analyticsData?.salesPerformance?.by_sales_rep || [];
    
    if (!Array.isArray(salesReps)) {
      return [];
    }
    
    console.log('👥 FIXED: Sales Reps Data:', salesReps);
    console.log('💰 Selected currency for reps:', currency.toUpperCase());

    return salesReps.slice(0, 10).map(rep => {
      // FIXED: Extract revenue for selected currency specifically
      let repRevenue = 0;
      
      if (rep.revenue_by_currency && typeof rep.revenue_by_currency === 'object') {
        // Get revenue for selected currency
        const currencyData = rep.revenue_by_currency[currency.toUpperCase()];
        if (currencyData) {
          repRevenue = currencyData.revenue || currencyData || 0;
        } else {
          // If selected currency not available, use the highest revenue currency
          const currencies = Object.entries(rep.revenue_by_currency);
          if (currencies.length > 0) {
            const topCurrency = currencies.reduce((max, [curr, data]) => {
              const currRevenue = data.revenue || data || 0;
              const maxRevenue = max[1].revenue || max[1] || 0;
              return currRevenue > maxRevenue ? [curr, data] : max;
            });
            repRevenue = topCurrency[1].revenue || topCurrency[1] || 0;
          }
        }
      } else {
        repRevenue = rep.total_revenue || rep.revenue || 0;
      }

      return {
        id: rep.id || rep.sales_rep_id || Math.random().toString(),
        name: rep.name || 'Unknown Rep',
        revenue: formatCurrency(repRevenue, currency.toUpperCase()),
        deals: rep.total_deals || rep.deals_count || 0,
        winRate: `${Math.round(rep.overall_win_rate || rep.win_rate || 0)}%`,
      };
    });
  }, [analyticsData, formatCurrency, currency]);

  // Recent activities from realtime data
  const recentActivities = useMemo(() => {
    const activities = analyticsData?.realtime?.recent_activities || 
                      analyticsData?.realtime?.live_activity || [];
    
    if (!Array.isArray(activities)) {
      return [];
    }
    
    console.log('🔔 Activities Data:', activities);
    
    return activities.slice(0, 15).map((activity, index) => ({
      id: activity.id || `activity_${index}`,
      action: activity.description || activity.action || 'Unknown activity',
      customer: activity.user || activity.customer || 'System',
      time: getRelativeTime(activity.timestamp || activity.time),
    }));
  }, [analyticsData, getRelativeTime]);

  // FIXED: Fetch analytics data with proper currency parameter handling
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const period = getPeriodParam(dateRange);
      
      // FIXED: Don't send currency parameter as the API handles multi-currency properly
      // The API keeps currencies separate and we'll filter on the frontend
      const params = { 
        period
        // Removed currency parameter - let API return all currencies
      };
      
      console.log('📡 FIXED API params:', params);
      const data = await dashboardService.getAllDashboardData(params);
      
      console.log('🔥 FIXED Raw Analytics Data:', data);
      console.log('💰 Revenue data structure:', data.revenue);
      setAnalyticsData(data);
    } catch(err) {
      console.error('❌ Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [dateRange, currency, getPeriodParam]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refresh = useCallback(() => fetchDashboardData(), [fetchDashboardData]);

  return {
    // Raw analytics data
    analyticsData,
    
    // Loading/error states
    loading, 
    error,
    
    // Computed data for UI
    kpis, 
    chartData, 
    productPerformance, 
    salesRepPerformance, 
    recentActivities,
    
    // Actions
    refresh,
  };
};
