// screens/SalesRepsScreen.js
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { colors } from '../constants/config';

// Import hooks and components
import CustomerPagination from '../components/Customer/CustomerPagination';
import SalesRepCard from '../components/SalesRep/SalesRepCard';
import SalesRepHeader from '../components/SalesRep/SalesRepHeader';
import SalesRepKPIs from '../components/SalesRep/SalesRepKPIs';
import SalesRepSearchAndFilters from '../components/SalesRep/SalesRepSearchAndFilters';

import {
  useSalesRepMetrics,
  useSalesRepMutations,
  useSalesReps
} from '../hooks/useSalesReps';

export default function SalesRepsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    role: '',
  });

  const [searchParams, setSearchParams] = useState({});

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = {};
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      if (filters.status) {
        params.is_active = filters.status === 'active';
      }
      
      if (filters.role) {
        params.role = filters.role;
      }

      setSearchParams(params);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // API hooks - DON'T use analytics, use regular endpoint
  const {
    salesReps,
    loading,
    error,
    pagination,
    refresh,
    goToPage,
    hasMore
  } = useSalesReps(searchParams, 20, false); // useAnalytics = false

  // Get metrics - uses regular endpoint
  const {
    totalCount,
    activeCount,
    inactiveCount,
    loading: metricsLoading
  } = useSalesRepMetrics();

  const {
    updateSalesRep,
    deleteSalesRep
  } = useSalesRepMutations();

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      status: '',
      role: '',
    });
  };

  const handleSalesRepAction = async (salesRep, action) => {
    console.log('🎯 Sales Rep Action:', { action, salesRep: salesRep.name });

    switch (action) {
      case "Deactivate":
      case "Activate":
        const newStatus = action === "Activate";
        Alert.alert(
          `Confirm ${action}`,
          `Are you sure you want to ${action.toLowerCase()} ${salesRep.name}?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: action,
              style: action === "Deactivate" ? "destructive" : "default",
              onPress: async () => {
                try {
                  await updateSalesRep(
                    salesRep.id,
                    { 
                      status: newStatus ? "active" : "inactive", 
                      is_active: newStatus 
                    },
                    false,
                    true
                  );
                  refresh();
                  Alert.alert("Success", `Sales rep ${action.toLowerCase()}d successfully`);
                } catch (error) {
                  Alert.alert("Error", `Failed to ${action.toLowerCase()} sales rep`);
                }
              },
            },
          ]
        );
        break;

      case "Delete":
        Alert.alert(
          "Confirm Delete",
          `Delete ${salesRep.name}? This cannot be undone.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                try {
                  await deleteSalesRep(salesRep.id);
                  refresh();
                  Alert.alert("Success", "Sales rep deleted successfully");
                } catch (error) {
                  Alert.alert("Error", "Failed to delete sales rep");
                }
              },
            },
          ]
        );
        break;

      default:
        Alert.alert("Action", `${action} clicked for ${salesRep.name}`);
    }
  };

  // Loading state
  if (loading && salesReps.length === 0) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading sales representatives...</Text>
      </View>
    );
  }

  // Error state
  if (error && salesReps.length === 0) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <SalesRepHeader onAddPress={() => Alert.alert("Add Sales Rep")} />

        {/* KPIs */}
        <SalesRepKPIs
          totalCount={totalCount}
          activeCount={activeCount}
          inactiveCount={inactiveCount}
          loading={metricsLoading}
        />

        {/* Search and Filters */}
        <SalesRepSearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Sales Rep Cards */}
        {salesReps.map((salesRep) => (
          <SalesRepCard
            key={salesRep.id}
            salesRep={salesRep}
            onAction={handleSalesRepAction}
          />
        ))}

        {/* Empty State */}
        {salesReps.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No sales representatives found
            </Text>
          </View>
        )}

        {/* Pagination */}
        {(salesReps.length > 0 || pagination.totalCount > 0) && (
          <CustomerPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            onPageChange={goToPage}
            hasNext={pagination.hasNext}
            hasPrevious={pagination.hasPrevious}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 12
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: colors.subtext,
    fontSize: 16,
  },
});
