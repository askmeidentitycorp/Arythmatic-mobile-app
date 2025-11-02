// screens/CustomerScreen.js

import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomerCard from '../components/Customer/CustomerCard';
import CustomerHeader from '../components/Customer/CustomerHeader';
import CustomerKPIs from '../components/Customer/CustomerKPIs';
import CustomerPagination from '../components/Customer/CustomerPagination';
import CustomerSearchAndFilters from '../components/Customer/CustomerSearchAndFilters';
import CrudModal from '../components/CrudModal';
import { colors } from '../constants/config';
import { useCustomerMutations, useCustomers, useCustomerMetrics } from '../hooks/useCustomers';
import { customerService } from '../services/customerService';
import * as FileSystem from 'expo-file-system';

export default function CustomerScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    countryCode: '',
  });
  const [searchParams, setSearchParams] = useState({});
  
  // CRUD Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = {};
      if (searchQuery) params.search = searchQuery;

      // Map filters to API params
      if (filters.type) params.type = filters.type; // e.g., 'Individual' | 'Business'
      if (filters.countryCode) params.country_code = filters.countryCode;
      if (filters.status) {
        // Backend uses is_deleted to represent inactive
        params.is_deleted = filters.status === 'Inactive';
      }

      setSearchParams(params);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // Simple pagination
  const {
    customers,
    loading,
    error,
    pagination,
    refresh,
    goToPage,
    hasMore
  } = useCustomers(searchParams, 10, true);

  // Global metrics aligned with web
  const { totalCount: totals, individualCount, businessCount, activeCount, loading: metricsLoading } = useCustomerMetrics();

  const {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    loading: mutationLoading
  } = useCustomerMutations();
  
  // Customer form field configuration
  const customerFields = [
    {
      key: 'displayName',
      label: 'Customer Name',
      type: 'text',
      required: true,
      placeholder: 'Enter customer name',
      minLength: 2,
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'customer@company.com',
    },
    {
      key: 'phone',
      label: 'Phone Number',
      type: 'text',
      placeholder: '+1 234 567 8900',
      help: 'Include country code',
    },
    {
      key: 'type',
      label: 'Customer Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Individual', value: 'individual' },
        { label: 'Business', value: 'business' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
      defaultValue: 'individual',
    },
    {
      key: 'countryCode',
      label: 'Country',
      type: 'text',
      required: true,
      placeholder: 'US, IN, UK, etc.',
      help: 'Two-letter country code',
      validate: (value) => {
        if (value.length !== 2) {
          return 'Country code must be 2 letters';
        }
        return true;
      },
    },
    {
      key: 'address',
      label: 'Address',
      type: 'multiline',
      placeholder: 'Enter full address...',
    },
    {
      key: 'notes',
      label: 'Notes',
      type: 'multiline',
      placeholder: 'Additional notes about this customer...',
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
      type: '',
      countryCode: '',
    });
  };

  const handleCustomerAction = async (customer, action) => {
    console.log('Customer Action:', { action, customer: customer.displayName });

    switch (action) {
      case "View Details":
        Alert.alert(
          "Customer Details",
          `Name: ${customer.displayName}\nType: ${customer.type}\nCountry: ${customer.countryCode}`
        );
        break;
      case "Edit Customer":
        setSelectedCustomer(customer);
        setModalMode('edit');
        setModalVisible(true);
        break;
      case "View Invoices":
        if (navigation?.navigate) {
          navigation.navigate('Invoices', { customerId: customer.id, customerName: customer.displayName, from: 'Customers' });
        }
        break;
      case "View Interactions":
        if (navigation?.navigate) {
          navigation.navigate('Interactions', { customerId: customer.id, customerName: customer.displayName, from: 'Customers' });
        }
        break;
      case "Activate":
      case "Deactivate":
        const newStatus = action === "Activate";
        Alert.alert(
          `Confirm ${action}`,
          `Are you sure you want to ${action.toLowerCase()} ${customer.displayName}?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: action,
              onPress: async () => {
                try {
                  await updateCustomer(
                    customer.id,
                    { is_deleted: !newStatus },
                    false,
                    true
                  );
                  refresh();
                  Alert.alert("Success", `Customer ${action.toLowerCase()}d successfully`);
                } catch (error) {
                  Alert.alert("Error", `Failed to ${action.toLowerCase()} customer`);
                }
              },
            },
          ]
        );
        break;
      case "Delete":
        Alert.alert(
          "Confirm Delete",
          `Delete ${customer.displayName}? This cannot be undone.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                try {
                  await deleteCustomer(customer.id, true);
                  refresh();
                  Alert.alert("Success", "Customer deleted successfully");
                } catch (error) {
                  Alert.alert("Error", "Failed to delete customer");
                }
              },
            },
          ]
        );
        break;
      default:
        Alert.alert("Action", `${action} clicked for ${customer.displayName}`);
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const pageSize = 200;
      let page = 1;
      let rows = [];
      while (true) {
        const res = await customerService.getAll({ ...searchParams, page, page_size: pageSize });
        const list = res?.results || res || [];
        rows = rows.concat(list);
        if (!res?.next || list.length === 0) break;
        page += 1;
      }
      const headers = ['id','display_name','type','email','phone','country_code','is_deleted'];
      const csv = [headers.join(',')].concat(
        rows.map(r => headers.map(h => JSON.stringify((r[h] ?? '').toString())).join(','))
      ).join('\n');

      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'customers.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (Platform.OS === 'android') {
        const filename = `customers_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) throw new Error('Storage permission not granted. Export cancelled.');
        const uri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          filename,
          'text/csv'
        );
        await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
        Alert.alert('Export complete', `Saved as ${filename}`);
      } else {
        const Sharing = await import('expo-sharing');
        const fileUri = FileSystem.cacheDirectory + `customers_${Date.now()}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export CSV' });
        } else {
          Alert.alert('Export complete', `Saved to temporary file: ${fileUri}`);
        }
      }
    } catch (e) {
      Alert.alert('Export Failed', e.message || 'Could not export CSV');
    }
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setModalMode('create');
    setModalVisible(true);
  };
  
  // Handle form submission (Create/Update)
  const handleFormSubmit = async (formData) => {
    try {
      // Map to API expected keys (snake_case)
      const payload = {
        display_name: formData.displayName,
        email: formData.email,
        phone: formData.phone,
        type: formData.type,
        country_code: formData.countryCode,
        address: formData.address,
        notes: formData.notes,
      };

      if (modalMode === 'create') {
        console.log('Creating customer:', payload);
        await createCustomer(payload, true); // useNested = true
        Alert.alert('Success', 'Customer created successfully!');
      } else {
        console.log('Updating customer:', selectedCustomer.id, payload);
        await updateCustomer(selectedCustomer.id, payload, true, false); // useNested = true, partial = false
        Alert.alert('Success', 'Customer updated successfully!');
      }
      refresh();
    } catch (error) {
      console.error('Form submission error:', error);
      throw error; // Re-throw to let CrudModal handle the error display
    }
  };

  if (loading && customers.length === 0) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading customers...</Text>
        <Text style={styles.loadingSubtext}>Simple API pagination</Text>
      </View>
    );
  }

  if (error && customers.length === 0) {
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header with Back Button */}
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
        </View>
        <CustomerHeader onAddPress={handleAddCustomer} onExport={handleExportCSV} totalCount={totals} />
        
        {/* SIMPLE PAGINATION INFO */}
        {pagination.totalCount > 0 && (
          <View style={styles.paginationInfo}>
            <Text style={styles.paginationInfoText}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </Text>
            <Text style={styles.paginationInfoSubtext}>
              Showing {customers.length} customers • Total: {pagination.totalCount}
            </Text>
            <Text style={styles.paginationInfoDetail}>
              Simple API pagination (whatever API returns)
            </Text>
          </View>
        )}
        
        <CustomerKPIs 
          customers={customers} 
          totalCount={totals}
          individualCount={individualCount}
          businessCount={businessCount}
          activeCount={activeCount}
        />
        
        <CustomerSearchAndFilters
          searchQuery={searchQuery}
          filters={filters}
          onSearchChange={handleSearchChange}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
        
        {loading && customers.length > 0 && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingOverlayText}>Loading page {pagination.currentPage}...</Text>
          </View>
        )}
        
        {/* CUSTOMERS FROM API (whatever it returns) */}
        {customers.map((customer, index) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onAction={handleCustomerAction}
          />
        ))}
        
        {customers.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No customers found</Text>
          </View>
        )}
        
        {/* SIMPLE PAGINATION */}
        <CustomerPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          pageSize={10}
          hasNext={pagination.hasNext}
          hasPrevious={pagination.hasPrevious}
          onPageChange={goToPage}
          loading={loading}
        />
        
        {/* CUSTOMERS SHOWN */}
        {customers.length > 0 && (
          <View style={styles.customersSummary}>
            <Text style={styles.customersSummaryText}>
              {customers.length} customers on this page
            </Text>
            <Text style={styles.customersSummaryDetail}>
              First: {customers[0]?.displayName}
            </Text>
            <Text style={styles.customersSummaryDetail}>
              Last: {customers[customers.length - 1]?.displayName}
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* CRUD Modal */}
      <CrudModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleFormSubmit}
        title={modalMode === 'create' ? 'Add Customer' : 'Edit Customer'}
        fields={customerFields}
        initialData={selectedCustomer || {}}
        loading={mutationLoading}
        mode={modalMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 5,
  },
  backButton: {
    backgroundColor: colors.panel,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  scrollContainer: {
    padding: 16,
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
  loadingSubtext: {
    color: colors.subtext,
    marginTop: 5,
    fontSize: 12,
  },
  paginationInfo: {
    backgroundColor: colors.primary + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  paginationInfoText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  paginationInfoSubtext: {
    color: colors.text,
    fontSize: 14,
    marginTop: 2,
  },
  paginationInfoDetail: {
    color: colors.subtext,
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  loadingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: colors.panel,
    borderRadius: 8,
    marginBottom: 10,
  },
  loadingOverlayText: {
    color: colors.text,
    marginLeft: 8,
    fontSize: 14,
  },
  customersSummary: {
    backgroundColor: colors.panel,
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  customersSummaryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  customersSummaryDetail: {
    color: colors.subtext,
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
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
