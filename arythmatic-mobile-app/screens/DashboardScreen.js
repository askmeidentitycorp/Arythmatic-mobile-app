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
  // Currency dropdown
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [currencyItems] = useState([
    { label: "INR (₹)", value: "INR" },
    { label: "USD ($)", value: "USD" },
    { label: "EUR (€)", value: "EUR" },
  ]);

  // Date Range dropdown
  const [dateOpen, setDateOpen] = useState(false);
  const [dateRange, setDateRange] = useState("This Month");
  const [dateItems] = useState([
    { label: "This Week", value: "This Week" },
    { label: "This Month", value: "This Month" },
    { label: "This Quarter", value: "This Quarter" },
    { label: "This Year", value: "This Year" },
  ]);

  // Expand states for "View All"
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showAllReps, setShowAllReps] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

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

  // Toggle functions with useCallback
  const toggleProducts = useCallback(() =>
    setShowAllProducts(prev => !prev), []);
  const toggleReps = useCallback(() =>
    setShowAllReps(prev => !prev), []);
  const toggleActivities = useCallback(() =>
    setShowAllActivities(prev => !prev), []);

  // Update data when currency or date range changes
  useEffect(() => {
    console.log('📅 Analytics filters changed:', { currency, dateRange });
  }, [currency, dateRange]);

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error loading analytics dashboard: {error}
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
          currencyOpen={currencyOpen}
          setCurrencyOpen={setCurrencyOpen}
          currencyItems={currencyItems}
          dateRange={dateRange}
          setDateRange={setDateRange}
          dateOpen={dateOpen}
          setDateOpen={setDateOpen}
          dateItems={dateItems}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* Content */}
        {/* KPIs */}
        <DashboardKPIs kpis={kpis} loading={loading} />

        {/* Revenue Performance Chart */}
       <DashboardChart 
  chartData={chartData} 
  loading={loading} 
/>

        {/* Top Products */}
       <DashboardPanel
  title="Recent Activity"
  showAll={showAllActivities}
  onToggle={toggleActivities}
>
  {recentActivities.length === 0 && !loading ? (
    <Text style={styles.noDataText}>No recent activity</Text>
  ) : (
    <FlatList
      data={showAllActivities ? recentActivities : recentActivities.slice(0, 8)}
      renderItem={({ item }) => <ActivityItem activity={item} />} 
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
    />
  )}
</DashboardPanel>

        {/* Top Sales Reps */}
        <DashboardPanel
          title="Top Sales Reps"
          showAll={showAllReps}
          onToggle={toggleReps}
        >
          {salesRepPerformance.length === 0 && !loading ? (
            <Text style={styles.noDataText}>No sales rep data available</Text>
          ) : (
            <FlatList
              data={showAllReps ? salesRepPerformance : salesRepPerformance.slice(0, 5)}
              renderItem={({ item }) => <RepCard rep={item} />}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.cardList}
            />
          )}
        </DashboardPanel>

        {/* Recent Activity */}
        <DashboardPanel
          title="Recent Activity"
          showAll={showAllActivities}
          onToggle={toggleActivities}
        >
          {recentActivities.length === 0 && !loading ? (
            <Text style={styles.noDataText}>No recent activity</Text>
          ) : (
            <FlatList
              data={showAllActivities ? recentActivities : recentActivities.slice(0, 8)}
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
  errorText: {
    fontSize: 16,
    color: colors.error || '#F16364',
    textAlign: 'center',
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
});
