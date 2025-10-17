import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text
} from 'react-native';

import ExportButton from '../components/Payment/ExportButton';
import PaymentCard from '../components/Payment/PaymentCard';
import PaymentHeader from '../components/Payment/PaymentHeader';
import PaymentKPIs from '../components/Payment/PaymentKPIs';
import PaymentModal from '../components/Payment/PaymentModal';
import PaymentSearchAndFilters from '../components/Payment/PaymentSearchAndFilters';

import { usePayments } from '../hooks/usePayments';

export default function PaymentScreen() {
  const {
    payments,
    loading,
    error,
    filters,
    setFilters,
    pagination,
    changePage,
    refetch,
  } = usePayments();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalMode, setModalMode] = useState('add');

  const handleAddPayment = () => {
    setModalMode('add');
    setSelectedPayment(null);
    setModalVisible(true);
  };

  const handlePaymentAction = (payment, action) => {
    if (action === 'view') {
      setSelectedPayment(payment);
      setModalMode('view');
      setModalVisible(true);
    } else if (action === 'edit') {
      setSelectedPayment(payment);
      setModalMode('edit');
      setModalVisible(true);
    } else if (action === 'refund') {
      Alert.alert('Confirm', 'Confirm refund?', [
        { text: 'Cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            // call refund API
            Alert.alert('Refunded');
            refetch();
          },
        },
      ]);
    } else if (action === 'void') {
      Alert.alert('Confirm', 'Confirm void?', [
        { text: 'Cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            // call void API
            Alert.alert('Voided');
            refetch();
          },
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <PaymentHeader title="Payments" onAddPress={handleAddPayment} />

      <PaymentSearchAndFilters
        searchQuery={filters.search || ''}
        onSearchChange={(text) => setFilters((f) => ({ ...f, search: text }))}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters({})}
      />

      <ExportButton
        loading={false}
        onExport={() => Alert.alert('Export called')}
      />

      <PaymentKPIs payments={payments} totalCount={pagination.totalCount} />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text style={styles.errorText}>Error loading payments</Text>
      ) : (
        <FlatList
          style={styles.list}
          data={payments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PaymentCard payment={item} onAction={handlePaymentAction} />
          )}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      )}

      <PaymentModal
        visible={modalVisible}
        payment={selectedPayment}
        mode={modalMode}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          refetch();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
  },
  list: {
    marginTop: 12,
  },
  errorText: {
    color: 'red',
    margin: 16,
    textAlign: 'center',
  },
});
