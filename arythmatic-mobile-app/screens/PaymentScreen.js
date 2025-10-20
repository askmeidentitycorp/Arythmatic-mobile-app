import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { colors } from '../constants/config';

// Import components
import CrudModal from '../components/CrudModal';
import CustomerPagination from '../components/Customer/CustomerPagination';
import PaymentCard from '../components/Payment/PaymentCard';
import PaymentHeader from '../components/Payment/PaymentHeader';
import PaymentKPIs from '../components/Payment/PaymentKPIs';
import PaymentSearchAndFilters from '../components/Payment/PaymentSearchAndFilters';

// Import hooks
import { usePaymentMutations, usePayments } from '../hooks/usePayments';

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PaymentScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    currency: '',
  });
  
  const [showCrudModal, setShowCrudModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [openActionsId, setOpenActionsId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchParams, setSearchParams] = useState({});

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchParams({
        search: searchQuery,
        ...filters,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // API hooks
  const { 
    payments, 
    loading, 
    error, 
    pagination,
    refetch: refresh,
    changePage: goToPage,
  } = usePayments(searchParams, 20);

  const { 
    createPayment,
    updatePayment,
    deletePayment,
    processPayment,
    refundPayment,
    voidPayment,
  } = usePaymentMutations();

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
      paymentMethod: '',
      currency: '',
    });
  };

  // Payment form configuration for CrudModal
  const paymentFormConfig = [
    {
      name: 'customer',
      label: 'Customer',
      type: 'text',
      required: true,
      placeholder: 'Enter customer name',
    },
    {
      name: 'invoice',
      label: 'Invoice Number',
      type: 'text',
      required: true,
      placeholder: 'Enter invoice number',
    },
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      required: true,
      placeholder: 'Enter payment amount',
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select',
      required: true,
      options: [
        { label: 'USD ($)', value: 'USD' },
        { label: 'EUR (€)', value: 'EUR' },
        { label: 'INR (₹)', value: 'INR' },
        { label: 'GBP (£)', value: 'GBP' },
      ],
      placeholder: 'Select currency',
    },
    {
      name: 'paymentMethod',
      label: 'Payment Method',
      type: 'select',
      required: true,
      options: [
        { label: 'Credit Card', value: 'credit_card' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'Cash', value: 'cash' },
        { label: 'Check', value: 'check' },
        { label: 'PayPal', value: 'paypal' },
        { label: 'Stripe', value: 'stripe' },
      ],
      placeholder: 'Select payment method',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      placeholder: 'Select status',
    },
    {
      name: 'transactionId',
      label: 'Transaction ID',
      type: 'text',
      required: false,
      placeholder: 'Enter transaction ID',
    },
    {
      name: 'reference',
      label: 'Reference',
      type: 'text',
      required: false,
      placeholder: 'Enter reference number',
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'multiline',
      required: false,
      placeholder: 'Enter payment notes...',
    },
  ];

  const handleAddPayment = () => {
    setEditingPayment(null);
    setShowCrudModal(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment({
      id: payment.id,
      customer: payment.customer || payment.customer_name || '',
      invoice: payment.invoice || payment.invoice_number || '',
      amount: payment.amount?.toString() || '0',
      currency: payment.currency || 'USD',
      paymentMethod: payment.paymentMethod || payment.payment_method || '',
      status: payment.status || 'pending',
      transactionId: payment.transactionId || payment.transaction_id || '',
      reference: payment.reference || payment.reference_number || '',
      notes: payment.notes || '',
    });
    setShowCrudModal(true);
  };

  const handleSubmitPayment = async (formData) => {
    try {
      const paymentData = {
        customer: formData.customer,
        invoice: formData.invoice,
        amount: parseFloat(formData.amount) || 0,
        currency: formData.currency,
        payment_method: formData.paymentMethod,
        status: formData.status,
        transaction_id: formData.transactionId,
        reference_number: formData.reference,
        notes: formData.notes,
      };

      if (editingPayment) {
        await updatePayment(editingPayment.id, paymentData, false, true);
        Alert.alert('Success', 'Payment updated successfully');
      } else {
        await createPayment(paymentData, true);
        Alert.alert('Success', 'Payment created successfully');
      }

      setShowCrudModal(false);
      setEditingPayment(null);
      refresh();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save payment');
    }
  };

  const handlePaymentAction = async (payment, action) => {
    switch (action) {
      case 'Edit':
        handleEditPayment(payment);
        break;

      case 'Process Payment':
        Alert.alert(
          'Confirm Process',
          `Process payment for ${payment.customer || 'this customer'}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Process',
              onPress: async () => {
                try {
                  await processPayment(payment.id);
                  refresh();
                  Alert.alert('Success', 'Payment processed successfully');
                } catch (error) {
                  Alert.alert('Error', 'Failed to process payment');
                }
              },
            },
          ]
        );
        break;

      case 'Mark as Completed':
      case 'Mark as Failed':
      case 'Mark as Pending':
        const statusMap = {
          'Mark as Completed': 'completed',
          'Mark as Failed': 'failed',
          'Mark as Pending': 'pending',
        };
        try {
          await updatePayment(payment.id, { status: statusMap[action] }, true, true);
          refresh();
          Alert.alert('Success', `Payment status updated to ${statusMap[action]}`);
        } catch (error) {
          Alert.alert('Error', 'Failed to update payment status');
        }
        break;

      case 'Refund':
        Alert.alert(
          'Confirm Refund',
          `Refund payment for ${payment.customer || 'this customer'}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Refund',
              style: 'destructive',
              onPress: async () => {
                try {
                  await refundPayment(payment.id);
                  refresh();
                  Alert.alert('Success', 'Payment refunded successfully');
                } catch (error) {
                  Alert.alert('Error', 'Failed to refund payment');
                }
              },
            },
          ]
        );
        break;

      case 'Void':
        Alert.alert(
          'Confirm Void',
          `Void payment for ${payment.customer || 'this customer'}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Void',
              style: 'destructive',
              onPress: async () => {
                try {
                  await voidPayment(payment.id);
                  refresh();
                  Alert.alert('Success', 'Payment voided successfully');
                } catch (error) {
                  Alert.alert('Error', 'Failed to void payment');
                }
              },
            },
          ]
        );
        break;

      case 'Delete':
        Alert.alert(
          'Confirm Delete',
          `Delete payment for ${payment.customer || 'this customer'}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  await deletePayment(payment.id, true);
                  refresh();
                  Alert.alert('Success', 'Payment deleted successfully');
                } catch (error) {
                  Alert.alert('Error', 'Failed to delete payment');
                }
              },
            },
          ]
        );
        break;

      default:
        Alert.alert('Action', `${action} clicked for payment`);
    }
    setOpenActionsId(null);
  };

  // Loading state
  if (loading && payments.length === 0) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading payments...</Text>
      </View>
    );
  }

  // Error state
  if (error && payments.length === 0) {
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
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <PaymentHeader 
          onAddPress={handleAddPayment}
          totalCount={pagination.totalCount}
        />
        
        <PaymentKPIs 
          payments={payments}
          totalCount={pagination.totalCount}
        />

        <PaymentSearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Payment Cards */}
        {payments.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payments found</Text>
            <Text style={styles.emptySubText}>Try adjusting your filters or create a new payment</Text>
          </View>
        ) : (
          payments.map((item) => {
            const expanded = expandedId === item.id;
            
            return (
              <View key={item.id}>
                <PaymentCard
                  payment={item}
                  expanded={expanded}
                  onToggle={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setExpandedId(expanded ? null : item.id);
                  }}
                  onAction={(payment, action) => {
                    handlePaymentAction(payment, action);
                  }}
                  onNavigateToDetails={onNavigateToDetails}
                />
                
                {/* Actions Menu */}
                {openActionsId === item.id && (
                  <View style={styles.actionsMenu}>
                    {[
                      'Edit',
                      'Process Payment',
                      'Mark as Completed',
                      'Mark as Failed',
                      'Mark as Pending',
                      'Refund',
                      'Void',
                      'Delete',
                    ].map((action, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.actionBtn}
                        onPress={() => handlePaymentAction(item, action)}
                      >
                        <Text style={[
                          styles.actionText, 
                          (action === 'Delete' || action === 'Refund' || action === 'Void') && { color: '#ff6b6b' }
                        ]}>
                          {action}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}

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
      </ScrollView>

      {/* CRUD Modal */}
      <CrudModal
        visible={showCrudModal}
        title={editingPayment ? 'Edit Payment' : 'Add Payment'}
        fields={paymentFormConfig}
        initialData={editingPayment}
        onSubmit={handleSubmitPayment}
        onCancel={() => {
          setShowCrudModal(false);
          setEditingPayment(null);
        }}
        submitText={editingPayment ? 'Update Payment' : 'Create Payment'}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    color: colors.subtext,
    fontSize: 14,
    textAlign: 'center',
  },
  actionsMenu: {
    backgroundColor: colors.panel,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: -8,
    marginBottom: 12,
    marginHorizontal: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  actionText: {
    fontSize: 14,
    color: colors.text,
  },
});
