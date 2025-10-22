// screens/DashboardScreen.js
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "../constants/config";

// Import hooks and components
import ActivityItem from '../components/Dashboard/ActivityItem';
import DashboardChart from '../components/Dashboard/DashboardChart';
import DashboardFilters from '../components/Dashboard/DashboardFilters';
import DashboardKPIs from '../components/Dashboard/DashboardKPIs';
import DashboardPanel from '../components/Dashboard/DashboardPanel';
import RepCard from '../components/Dashboard/RepCard';
import { useDashboard } from '../hooks/useDashboard';

export default function DashboardScreen() {
  // Filter states
  const [currency, setCurrency] = useState("USD");
  const [currencyItems] = useState([
    { label: "INR (₹)", value: "INR", key: "currency_inr" },
    { label: "USD ($)", value: "USD", key: "currency_usd" },
    { label: "EUR (€)", value: "EUR", key: "currency_eur" },
  ]);

  const [dateRange, setDateRange] = useState("This Month");
  const [dateItems] = useState([
    { label: "This Week", value: "This Week", key: "date_week" },
    { label: "This Month", value: "This Month", key: "date_month" },
    { label: "This Quarter", value: "This Quarter", key: "date_quarter" },
    { label: "This Year", value: "This Year", key: "date_year" },
  ]);

  // Remove view all states - keep simple mobile interface

  // Analytics hooks - matching web app
  const {
    analyticsData,
    loading,
    error,
    kpis,
    chartData,
    productPerformance,
    salesRepPerformance,
    recentActivities,
    refresh,
  } = useDashboard(currency, dateRange);

  // Handle refresh with loading state
  const handleRefresh = useCallback(() => {
    refresh();
    Alert.alert("Dashboard Refreshed", "Your analytics data has been updated!");
  }, [refresh]);

  // Removed toggle functions for cleaner mobile interface

  // Removed dropdown conflict handlers - using simple modals now

  // Update data when currency or date range changes
  useEffect(() => {
    console.log('Analytics filters changed:', { currency, dateRange });
  }, [currency, dateRange]);

  // Error state - Show error but continue with available data
  const showError = error && (!analyticsData || !kpis || kpis.length === 0);
  
  if (showError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          Dashboard Error
        </Text>
        <Text style={styles.errorText}>
          {error}
        </Text>
        <Text style={styles.errorSubtext}>
          {error.includes('HTTP 500') 
            ? 'The server is experiencing issues. Sample data is shown below.' 
            : 'Please check your connection and try again.'}
        </Text>
      </View>
    );
  }

  // Main loading state (only show on initial load)
  if (loading && (!analyticsData || !kpis || kpis.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading analytics dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container}>
        {/* Filters Row */}
        <DashboardFilters
          currency={currency}
          setCurrency={setCurrency}
          currencyItems={currencyItems}
          dateRange={dateRange}
          setDateRange={setDateRange}
          dateItems={dateItems}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* Content */}
        {/* Error Banner - Show if there's an error but we have data */}
        {error && analyticsData && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerIcon}>!</Text>
            <View style={styles.errorBannerContent}>
              <Text style={styles.errorBannerTitle}>Data Loading Issue</Text>
              <Text style={styles.errorBannerText}>
                {error.includes('HTTP 500') 
                  ? 'Using sample data due to server issues'
                  : 'Some data may be outdated'}
              </Text>
            </View>
          </View>
        )}
        
        {/* KPIs */}
        <DashboardKPIs kpis={kpis} loading={loading} />

        {/* Revenue Performance Chart */}
       <DashboardChart 
  chartData={chartData} 
  loading={loading} 
/>

        {/* Top Products */}
        <DashboardPanel title="Top Products">
          {productPerformance.length === 0 && !loading ? (
            <Text style={styles.noDataText}>No product data available</Text>
          ) : (
            <FlatList
              data={productPerformance.slice(0, 5)}
              renderItem={({ item }) => (
                <View style={styles.productCard}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productRevenue}>{item.revenue}</Text>
                </View>
              )}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.cardList}
            />
          )}
        </DashboardPanel>

        {/* Top Sales Reps */}
        <DashboardPanel title="Top Sales Reps">
          {salesRepPerformance.length === 0 && !loading ? (
            <Text style={styles.noDataText}>No sales rep data available</Text>
          ) : (
            <FlatList
              data={salesRepPerformance.slice(0, 5)}
              renderItem={({ item }) => <RepCard rep={item} />}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.cardList}
            />
          )}
        </DashboardPanel>

        {/* Recent Activity */}
        <DashboardPanel title="Recent Activity">
          {recentActivities.length === 0 && !loading ? (
            <Text style={styles.noDataText}>No recent activity</Text>
          ) : (
            <FlatList
              data={recentActivities.slice(0, 6)}
              renderItem={({ item }) => <ActivityItem activity={item} />}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </DashboardPanel>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    zIndex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.error || '#F16364',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: colors.error || '#F16364',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.subtext,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorBanner: {
    backgroundColor: colors.warn + '20' || '#F0B42920',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.warn || '#F0B429',
  },
  errorBannerIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  errorBannerContent: {
    flex: 1,
  },
  errorBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  errorBannerText: {
    fontSize: 12,
    color: colors.subtext,
  },
  cardList: {
    paddingBottom: 8,
  },
  noDataText: {
    color: colors.subtext,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  productCard: {
    backgroundColor: colors.panel,
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  productRevenue: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 4,
  },
});
