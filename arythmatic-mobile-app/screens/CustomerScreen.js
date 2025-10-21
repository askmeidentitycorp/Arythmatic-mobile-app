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
} from 'react-native';
import CustomerCard from '../components/Customer/CustomerCard';
import CustomerHeader from '../components/Customer/CustomerHeader';
import CustomerKPIs from '../components/Customer/CustomerKPIs';
import CustomerPagination from '../components/Customer/CustomerPagination';
import CustomerSearchAndFilters from '../components/Customer/CustomerSearchAndFilters';
import CrudModal from '../components/CrudModal';
import { colors } from '../constants/config';
import { useCustomerMutations, useCustomers } from '../hooks/useCustomers';

export default function CustomerScreen() {
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
      setSearchParams({
        search: searchQuery,
        ...filters,
      });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // SIMPLE: Regular API pagination (20 per page from API)
  const {
    customers,
    loading,
    error,
    pagination,
    refresh,
    goToPage,
    hasMore
  } = useCustomers(searchParams, 20, true);

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
    console.log('🎯 Customer Action:', { action, customer: customer.displayName });

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
      case "View Orders":
        Alert.alert("View Orders", `Orders for ${customer.displayName} - Feature coming soon`);
        break;
      case "View Interactions":
        Alert.alert("View Interactions", `Interactions for ${customer.displayName} - Feature coming soon`);
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

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setModalMode('create');
    setModalVisible(true);
  };
  
  // Handle form submission (Create/Update)
  const handleFormSubmit = async (formData) => {
    try {
      if (modalMode === 'create') {
        console.log('🆕 Creating customer:', formData);
        await createCustomer(formData, true); // useNested = true
        Alert.alert('Success', 'Customer created successfully!');
      } else {
        console.log('📝 Updating customer:', selectedCustomer.id, formData);
        await updateCustomer(selectedCustomer.id, formData, true, false); // useNested = true, partial = false
        Alert.alert('Success', 'Customer updated successfully!');
      }
      refresh();
    } catch (error) {
      console.error('❌ Form submission error:', error);
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
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <CustomerHeader onAddCustomer={handleAddCustomer} />
        
        {/* SIMPLE PAGINATION INFO */}
        {pagination.totalCount > 0 && (
          <View style={styles.paginationInfo}>
            <Text style={styles.paginationInfoText}>
              📄 Page {pagination.currentPage} of {pagination.totalPages}
            </Text>
            <Text style={styles.paginationInfoSubtext}>
              Showing {customers.length} customers • Total: {pagination.totalCount}
            </Text>
            <Text style={styles.paginationInfoDetail}>
              🔧 Simple API pagination (whatever API returns)
            </Text>
          </View>
        )}
        
        <CustomerKPIs 
          customers={customers} 
          totalCount={pagination.totalCount} 
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
          pageSize={20}
          hasNext={pagination.hasNext}
          hasPrevious={pagination.hasPrevious}
          onPageChange={goToPage}
          loading={loading}
        />
        
        {/* CUSTOMERS SHOWN */}
        {customers.length > 0 && (
          <View style={styles.customersSummary}>
            <Text style={styles.customersSummaryText}>
              ✅ {customers.length} customers on this page
            </Text>
            <Text style={styles.customersSummaryDetail}>
              First: {customers[0]?.displayName}
            </Text>
            <Text style={styles.customersSummaryDetail}>
              Last: {customers[customers.length - 1]?.displayName}
            </Text>
          </View>
        )}
      
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
    </View>
  );
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
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
