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
import CrudModal from '../components/CrudModal';
import SalesRepCard from '../components/SalesRep/SalesRepCard';
import SalesRepHeader from '../components/SalesRep/SalesRepHeader';
import SalesRepKPIs from '../components/SalesRep/SalesRepKPIs';
import SalesRepSearchAndFilters from '../components/SalesRep/SalesRepSearchAndFilters';

import {
  useSalesRepMetrics,
  useSalesRepMutations,
  useSalesReps
} from '../hooks/useSalesReps';

export default function SalesRepsScreen({ navigation, onNavigateToInteractions }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    sort: 'name_asc',
  });

  const [searchParams, setSearchParams] = useState({});
  
  // CRUD Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedSalesRep, setSelectedSalesRep] = useState(null);

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

      // Sort mapping to API ordering
      const sortMap = {
        name_asc: 'name',
        name_desc: '-name',
        created_desc: '-created_at',
        created_asc: 'created_at',
      };
      if (filters.sort && sortMap[filters.sort]) {
        params.ordering = sortMap[filters.sort];
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
  } = useSalesReps(searchParams, 10, false); // useAnalytics = false

  // Get metrics - uses regular endpoint
  const {
    totalCount,
    activeCount,
    inactiveCount,
    loading: metricsLoading
  } = useSalesRepMetrics();

  const {
    createSalesRep,
    updateSalesRep,
    deleteSalesRep,
    loading: mutationLoading
  } = useSalesRepMutations();
  
  // Sales Rep form field configuration
  const salesRepFields = [
    {
      key: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter full name',
      minLength: 2,
    },
    {
      key: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'sales.rep@company.com',
    },
    {
      key: 'phone',
      label: 'Phone Number',
      type: 'text',
      placeholder: '+1 234 567 8900',
      help: 'Include country code',
    },
    {
      key: 'employee_id',
      label: 'Employee ID',
      type: 'text',
      placeholder: 'EMP001',
      help: 'Unique employee identifier',
    },
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { label: 'Sales Agent', value: 'sales_agent' },
        { label: 'Sales Manager', value: 'sales_manager' },
        { label: 'Senior Sales Rep', value: 'senior_sales_rep' },
        { label: 'Account Manager', value: 'account_manager' },
      ],
      defaultValue: 'sales_agent',
    },
    {
      key: 'territories',
      label: 'Territories',
      type: 'text',
      placeholder: 'e.g., North America, Europe',
      help: 'Comma-separated list of territories',
    },
    {
      key: 'is_active',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { label: 'Active', value: true },
        { label: 'Inactive', value: false },
      ],
      defaultValue: true,
    },
  ];

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
      sort: 'name_asc',
    });
  };

  const handleSalesRepAction = async (salesRep, action) => {
    console.log('Sales Rep Action:', { action, salesRep: salesRep.name });

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

      case "Edit Sales Rep":
        setSelectedSalesRep(salesRep);
        setModalMode('edit');
        setModalVisible(true);
        break;
        
      case "Show Interactions":
        console.log('Navigate to Interactions for:', salesRep.name);
        if (navigation?.navigateToInteractions) {
          navigation.navigateToInteractions(salesRep.id, salesRep.name);
        } else if (onNavigateToInteractions) {
          // Fallback to old method
          onNavigateToInteractions(salesRep.id, salesRep.name);
        }
        break;
        
      case "Show Invoices":
        console.log('Navigate to Invoices for:', salesRep.name);
        if (navigation?.navigateToInvoices) {
          navigation.navigateToInvoices(salesRep.id, salesRep.name);
        } else {
          Alert.alert("Navigation", `Invoices for ${salesRep.name} - Feature coming soon`);
        }
        break;
        
      case "View Performance":
        Alert.alert("Performance", `Performance metrics for ${salesRep.name} - Feature coming soon`);
        break;
        
      case "View Details":
        Alert.alert(
          "Sales Rep Details",
          `Name: ${salesRep.name}\nEmail: ${salesRep.email}\nRole: ${salesRep.role}\nStatus: ${salesRep.status || 'active'}`
        );
        break;
        
      default:
        Alert.alert("Action", `${action} clicked for ${salesRep.name}`);
    }
  };
  
  // Export CSV
  const handleExportCSV = async () => {
    try {
      // Fetch all pages using current searchParams
      const pageSize = 200;
      let page = 1;
      let rows = [];
      while (true) {
        const res = await salesRepService.getAll({ ...searchParams, page, page_size: pageSize });
        const list = res?.results || res || [];
        rows = rows.concat(list);
        if (!res?.next || list.length === 0) break;
        page += 1;
      }
      const headers = ['id','name','email','phone','employee_id','role','status','is_active'];
      const csv = [headers.join(',')].concat(
        rows.map(r => headers.map(h => JSON.stringify((r[h] ?? '').toString())).join(','))
      ).join('\n');

      // Download on web; share as text on native
      const { Platform, Share } = await import('react-native');
      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'sales_reps.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        await Share.share({ title: 'Sales Reps CSV', message: csv });
      }
    } catch (e) {
      Alert.alert('Export Failed', e.message || 'Could not export CSV');
    }
  };

  // Handle Add Sales Rep
  const handleAddSalesRep = () => {
    setSelectedSalesRep(null);
    setModalMode('create');
    setModalVisible(true);
  };
  
  // Handle form submission (Create/Update)
  const handleFormSubmit = async (formData) => {
    try {
      // Convert string boolean to actual boolean for is_active
      if (formData.is_active !== undefined) {
        formData.is_active = formData.is_active === 'true' || formData.is_active === true;
      }
      
      // Handle territories as array
      if (formData.territories && typeof formData.territories === 'string') {
        formData.territories = formData.territories.split(',').map(t => t.trim()).filter(t => t);
      }
      
      if (modalMode === 'create') {
        console.log('Creating sales rep:', formData);
        await createSalesRep(formData);
        Alert.alert('Success', 'Sales rep created successfully!');
      } else {
        console.log('Updating sales rep:', selectedSalesRep.id, formData);
        await updateSalesRep(selectedSalesRep.id, formData, false, true); // useNested = false, partial = true
        Alert.alert('Success', 'Sales rep updated successfully!');
      }
      refresh();
    } catch (error) {
      console.error('Sales rep form submission error:', error);
      throw error; // Re-throw to let CrudModal handle the error display
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
        <SalesRepHeader onAddPress={handleAddSalesRep} onExport={handleExportCSV} totalCount={totalCount} />

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
      
      {/* CRUD Modal */}
      <CrudModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleFormSubmit}
        title={modalMode === 'create' ? 'Add Sales Rep' : 'Edit Sales Rep'}
        fields={salesRepFields}
        initialData={selectedSalesRep || {}}
        loading={mutationLoading}
        mode={modalMode}
      />
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
