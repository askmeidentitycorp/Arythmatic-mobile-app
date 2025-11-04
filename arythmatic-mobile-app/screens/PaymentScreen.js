// screens/PaymentScreen.js
import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Platform,
  UIManager,
  Alert,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Share,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from "../constants/config";
import { usePayments, usePaymentMetrics, usePaymentMutations } from '../hooks/usePayments';
import { paymentService } from '../services/paymentService';
import * as FileSystem from 'expo-file-system';
import DarkPicker from '../components/Customer/DarkPicker';
import CustomerPagination from '../components/Customer/CustomerPagination';

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ---------- Helper Components ---------- */
const KPI = React.memo(({ label, value, color = "#6B9AFF" }) => {
  return (
    <View style={styles.kpiBox}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
    </View>
  );
});

const StatusBadge = React.memo(({ status }) => {
  const config = {
    "Success": { bg: "rgba(49,199,106,0.12)", border: "#31C76A", text: "#31C76A" },
    "Pending": { bg: "rgba(244,183,64,0.15)", border: "#6b5221", text: "#F4B740" },
    "Failed": { bg: "rgba(234,67,53,0.12)", border: "#7a2e2a", text: "#EA4335" },
    "Voided": { bg: "rgba(167,174,192,0.1)", border: "#2a3450", text: "#A7AEC0" },
  };
  
  const style = config[status] || config["Pending"];
  
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: style.bg,
          borderColor: style.border,
        },
      ]}
    >
      <Text style={[styles.pillText, { color: style.text }]}>{status}</Text>
    </View>
  );
});

const PaymentCard = React.memo(({ payment, onNext }) => {
  // Format date properly
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentHeaderLeft}>
          <View style={styles.paymentCircle}>
            <Text style={styles.paymentCircleIcon}>$</Text>
          </View>
          <View style={styles.paymentMainInfo}>
            <Text style={styles.paymentAmount}>{payment.amountFormatted}</Text>
            <Text style={styles.paymentInvoice}>INV-{payment.invoice_number || payment.id}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={(e) => {
            e.stopPropagation();
            onNext && onNext(payment);
          }}
        >
          <Text style={styles.moreButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.paymentInfo}>
        <View style={styles.paymentMetaRow}>
          <View style={styles.paymentMetaItem}>
            <Text style={styles.paymentMetaLabel}>PAYMENT:</Text>
            <Text style={styles.paymentMetaValue}>{formatDate(payment.payment_date || payment.created_at)}</Text>
          </View>
          <View style={styles.paymentMetaItem}>
            <Text style={styles.paymentMetaLabel}>CREATED:</Text>
            <Text style={styles.paymentMetaValue}>{formatDate(payment.created_at)}</Text>
          </View>
        </View>
        
        <View style={styles.paymentMetaRow}>
          <View style={styles.paymentMetaItem}>
            <Text style={styles.paymentMetaLabel}>UPDATED:</Text>
            <Text style={styles.paymentMetaValue}>{formatDate(payment.updated_at)}</Text>
          </View>
        </View>

        <View style={styles.paymentFooter}>
          <View style={styles.paymentCustomerInfo}>
            <View style={styles.paymentAvatar}>
              <Text style={styles.paymentAvatarText}>
                {(payment.customerName || 'AB').substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.paymentCustomerDetails}>
              <Text style={styles.paymentCustomerName}>{payment.customerName || 'Unknown Customer'}</Text>
              <View style={styles.paymentCustomerMeta}>
                <Text style={styles.paymentCustomerMetaText}>Email: {payment.customer_email || 'N/A'}</Text>
                <Text style={styles.paymentCustomerMetaText}>Phone: {payment.customer_phone || 'N/A'}</Text>
              </View>
            </View>
          </View>
          <View style={styles.paymentTags}>
            <View style={[styles.paymentTag, { backgroundColor: 'rgba(107, 154, 255, 0.15)', borderColor: '#6B9AFF' }]}>
              <Text style={[styles.paymentTagText, { color: '#6B9AFF' }]}>Online</Text>
            </View>
            <View style={[styles.paymentTag, { backgroundColor: 'rgba(107, 154, 255, 0.15)', borderColor: '#6B9AFF' }]}>
              <Text style={[styles.paymentTagText, { color: '#6B9AFF' }]}>{(payment.currency || 'USD').toUpperCase()}</Text>
            </View>
            <StatusBadge status={payment.status} />
          </View>
        </View>
        
        {payment.notes && (
          <View style={styles.paymentNotes}>
            <Text style={styles.paymentNotesText}>No references</Text>
          </View>
        )}
      </View>
    </View>
  );
});


/* ---------- Main Component ---------- */
export default function PaymentScreen({ onNavigateToDetails, navigation }) {
  console.log('\n🟢 PaymentScreen mounted');
  
  // Use custom hooks for data fetching
  const { payments, loading, error, refresh: refreshPayments, pagination, goToPage } = usePayments({ }, 10, true);
  const { metrics: kpiCounts } = usePaymentMetrics();
  const { processPayment, voidPayment, refundPayment, deletePayment } = usePaymentMutations();
  
  console.log('🟢 PaymentScreen state:', { 
    paymentsLength: payments.length, 
    loading, 
    error,
    kpiCounts 
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({ 
    searchText: "", 
    status: "", 
    method: "",
    dateRange: "",
    minAmount: "",
    maxAmount: ""
  });


  /* ---------- KPI Metrics - Use Server-Side Counts for Accuracy ---------- */
  // Implements payment aggregation from /payments-nested/ endpoint:
  // 1. Aggregate payments by currency (USD, INR, etc.)
  // 2. Compute totals: total_amount, successful_amount, failed_amount
  // 3. Display multi-currency totals (e.g., "$600.00 + ₹1,200.00")
  // 4. Use invoice_details for cross-referencing invoice/product data
  const metrics = useMemo(() => {
    // Helper: currency symbol
    const sym = (ccy) => ccy === 'INR' ? '₹' : ccy === 'USD' ? '$' : ccy === 'EUR' ? '€' : ccy === 'GBP' ? '£' : '';

    // Build per-currency totals from current page (also used to render strings when kpiCounts exists)
    const breakdown = {};
    payments.forEach(p => {
      const c = (p.currency || 'USD').toUpperCase();
      const amt = parseFloat(p.amount) || 0;
      breakdown[c] ||= { count: 0, total: 0, successful: 0, failed: 0 };
      breakdown[c].count += 1;
      breakdown[c].total += amt;
      if (p.status === 'Success') breakdown[c].successful += amt;
      if (p.status === 'Failed' || p.status === 'Voided') breakdown[c].failed += amt;
    });

    // Order currencies: USD first, then others alphabetically
    const order = Object.keys(breakdown).sort((a,b) => (a==='USD'? -1 : b==='USD'? 1 : a.localeCompare(b)));
    const fmtJoin = (key) => order.map(ccy => `${sym(ccy)}${(breakdown[ccy][key] || 0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`).join(' + ');

    // If server KPIs exist, use their counts, but display values per-currency from current page to avoid mixed-symbol errors
    if (kpiCounts) {
      return {
        total: kpiCounts.total || payments.length || 0,
        totalValue: fmtJoin('total'),
        successful: fmtJoin('successful'),
        failed: fmtJoin('failed'),
        currencyBreakdown: breakdown,
      };
    }

    return {
      total: payments.length,
      totalValue: fmtJoin('total'),
      successful: fmtJoin('successful'),
      failed: fmtJoin('failed'),
      currencyBreakdown: breakdown,
    };
  }, [payments, kpiCounts]);

  /* ---------- Filters ---------- */
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch = !localFilters.searchText || (
        (p.transaction_id || '').toLowerCase().includes(localFilters.searchText.toLowerCase()) ||
        (p.customerName || '').toLowerCase().includes(localFilters.searchText.toLowerCase()) ||
        (p.invoice_number || '').toLowerCase().includes(localFilters.searchText.toLowerCase())
      );
      
      const amount = parseFloat(p.amount) || 0;
      const matchMinAmount = !localFilters.minAmount || amount >= parseFloat(localFilters.minAmount);
      const matchMaxAmount = !localFilters.maxAmount || amount <= parseFloat(localFilters.maxAmount);
      const matchStatus = !localFilters.status || p.status === localFilters.status;
      const matchMethod = !localFilters.method || p.payment_method === localFilters.method;
      
      return matchSearch && matchMinAmount && matchMaxAmount && matchStatus && matchMethod;
    });
  }, [payments, localFilters]);

  const clearFilters = useCallback(() => {
    setLocalFilters({ 
      searchText: "", 
      status: "", 
      method: "",
      dateRange: "",
      minAmount: "",
      maxAmount: ""
    });
  }, []);

  /* ---------- Payment Actions ---------- */
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const handleNextPayment = useCallback((payment) => {
    console.log("Payment action menu clicked:", payment.id);
    setSelectedPayment(payment);
    setShowActionSheet(true);
  }, []);

  const handleCloseActionSheet = useCallback(() => {
    setShowActionSheet(false);
    setTimeout(() => setSelectedPayment(null), 300);
  }, []);

  const handleViewPayment = useCallback(() => {
    console.log('View payment:', selectedPayment?.id);
    handleCloseActionSheet();
    if (onNavigateToDetails) {
      onNavigateToDetails(selectedPayment?.id);
    } else if (navigation) {
      navigation.navigate('PaymentDetails', { paymentId: selectedPayment?.id });
    }
  }, [selectedPayment, onNavigateToDetails, navigation, handleCloseActionSheet]);

  const handleEditPayment = useCallback(() => {
    console.log('Edit payment:', selectedPayment?.id);
    const payment = selectedPayment;
    handleCloseActionSheet();
    if (payment) {
      setEditingPaymentId(payment.id);
      setPaymentForm({
        invoice: payment.invoice_id || payment.invoice || '',
        amount: String(payment.amount || ''),
        currency: (payment.currency || 'USD').toUpperCase(),
        paymentMethod: payment.payment_method || payment.paymentMethod || 'Credit Card',
        status: payment.status || 'success',
        transaction_id: payment.transaction_id || '',
        external_reference: payment.external_reference || '',
        payment_date: payment.payment_date || new Date().toISOString().split('T')[0],
      });
      setShowPaymentModal(true);
    }
  }, [selectedPayment, handleCloseActionSheet]);

  const handleProcessPayment = useCallback(() => {
    console.log('Process payment:', selectedPayment?.id);
    const paymentToProcess = selectedPayment;
    handleCloseActionSheet();
    Alert.alert(
      'Process Payment',
      `Process payment of ${paymentToProcess?.amountFormatted}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Process',
          onPress: async () => {
            try {
              await processPayment(paymentToProcess?.id);
              Alert.alert('Success', 'Payment processed successfully!');
              refreshPayments(); // Refresh the list
            } catch (error) {
              console.error('Process payment error:', error);
              Alert.alert('Error', error.message || 'Failed to process payment. Please try again.');
            }
          }
        }
      ]
    );
  }, [selectedPayment, handleCloseActionSheet, refreshPayments]);

  const handleVoidPayment = useCallback(() => {
    console.log('Void payment:', selectedPayment?.id);
    const paymentToVoid = selectedPayment;
    handleCloseActionSheet();
    Alert.alert(
      'Void Payment',
      `Are you sure you want to void this payment of ${paymentToVoid?.amountFormatted}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Void',
          style: 'destructive',
          onPress: async () => {
            try {
              await voidPayment(paymentToVoid?.id);
              Alert.alert('Success', 'Payment voided successfully!');
              refreshPayments(); // Refresh the list
            } catch (error) {
              console.error('Void payment error:', error);
              Alert.alert('Error', error.message || 'Failed to void payment. Please try again.');
            }
          }
        }
      ]
    );
  }, [selectedPayment, handleCloseActionSheet, refreshPayments]);

  const handleRefundPayment = useCallback(() => {
    console.log('Refund payment:', selectedPayment?.id);
    const paymentToRefund = selectedPayment;
    handleCloseActionSheet();
    Alert.alert(
      'Refund Payment',
      `Refund ${paymentToRefund?.amountFormatted} to customer?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refund',
          style: 'destructive',
          onPress: async () => {
            try {
              await refundPayment(paymentToRefund?.id);
              Alert.alert('Success', 'Refund initiated successfully!');
              refreshPayments(); // Refresh the list
            } catch (error) {
              console.error('Refund payment error:', error);
              Alert.alert('Error', error.message || 'Failed to initiate refund. Please try again.');
            }
          }
        }
      ]
    );
  }, [selectedPayment, handleCloseActionSheet, refreshPayments]);

  const handleAuditHistory = useCallback(() => {
    console.log('View audit history:', selectedPayment?.id);
    handleCloseActionSheet();
    Alert.alert('Audit History', 'Payment audit history will be displayed here.');
  }, [selectedPayment, handleCloseActionSheet]);

  const handleDeletePayment = useCallback(() => {
    console.log('Delete payment:', selectedPayment?.id);
    const paymentToDelete = selectedPayment;
    handleCloseActionSheet();
    Alert.alert(
      'Delete Payment',
      `Are you sure you want to delete this payment? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePayment(paymentToDelete?.id);
              Alert.alert('Success', 'Payment deleted successfully!');
              refreshPayments(); // Refresh the list
            } catch (error) {
              console.error('Delete payment error:', error);
              Alert.alert('Error', error.message || 'Failed to delete payment. Please try again.');
            }
          }
        }
      ]
    );
  }, [selectedPayment, handleCloseActionSheet, refreshPayments]);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const renderPaymentCard = useCallback(({ item: payment }) => {
    return (
      <View key={payment.id} style={styles.card}>
        <PaymentCard 
          payment={payment} 
          onNext={handleNextPayment}
        />
      </View>
    );
  }, [handleNextPayment]);

  const handleBackPress = useCallback(() => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  }, [navigation]);

  /* ---------- Export Payments to CSV ---------- */
  const handleExport = useCallback(async () => {
    try {
      const pageSize = 200;
      let page = 1;
      let rows = [];
      while (true) {
        const res = await paymentService.getAll({ page, page_size: pageSize });
        const list = res?.results || res || [];
        rows = rows.concat(list);
        if (!res?.next || list.length === 0) break;
        page += 1;
      }

      const headers = ['transaction_id','customer_name','amount','currency','status','payment_method','invoice_number','payment_date'];
      const csv = [headers.join(',')].concat(
        rows.map(p => {
          const row = {
            transaction_id: p.transaction_id || p.id || '',
            customer_name: p.customer_details?.displayName || p.customer_name || '',
            amount: parseFloat(p.amount || 0).toFixed(2),
            currency: (p.currency || 'USD').toUpperCase(),
            status: (p.status || '').toString(),
            payment_method: p.payment_method || p.paymentMethod || '',
            invoice_number: p.invoice_details?.invoiceNumber || p.invoice_number || '',
            payment_date: p.payment_date || p.created_at || p.created || '',
          };
          return headers.map(h => JSON.stringify(String(row[h] ?? ''))).join(',');
        })
      ).join('\n');

      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.setAttribute('download', 'payments.csv');
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (Platform.OS === 'android') {
        const filename = `payments_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
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
        const fileUri = FileSystem.cacheDirectory + `payments_${Date.now()}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export CSV' });
        } else {
          Alert.alert('Export complete', `Saved to temporary file: ${fileUri}`);
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', error.message || 'Unable to export payments. Please try again.');
    }
  }, [metrics]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 160, paddingTop: 10 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Payment Management</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.exportButton} 
              onPress={handleExport}
            >
              <Text style={styles.exportButtonText}>Export</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => Alert.alert('Record Payment', 'Payment form will be shown here')}
            >
              <Text style={styles.addButtonText}>+ Record Payment</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading payment data...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshPayments}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Management KPIs - Match Screenshot */}
        {!loading && !error && (
          <>
            <View style={styles.kpiRow}>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiLabel}>Total Payments</Text>
                <Text style={[styles.kpiValue, { color: "#6B9AFF" }]}>{metrics.total}</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiLabel}>Total Value</Text>
                <Text style={[styles.kpiValue, { color: "#6B9AFF" }]}>{metrics.totalValue}</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiLabel}>Successful</Text>
                <Text style={[styles.kpiValue, { color: "#31C76A" }]}>{metrics.successful}</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiLabel}>Failed/Voided</Text>
                <Text style={[styles.kpiValue, { color: "#EA4335" }]}>{metrics.failed}</Text>
              </View>
            </View>
          </>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            <TextInput
              placeholder="Search by ID, customer, invoice"
              placeholderTextColor="#9aa6bf"
              value={localFilters.searchText}
              onChangeText={(v) => setLocalFilters((f) => ({ ...f, searchText: v }))}
              style={styles.input}
            />

            {/* Date Range filter */}
            <DarkPicker
              selectedValue={localFilters.dateRange || ""}
              onValueChange={(v) => setLocalFilters((f) => ({ ...f, dateRange: v }))}
              items={[
                { label: "All Time", value: "" },
                { label: "This Week", value: "This Week" },
                { label: "This Month", value: "This Month" },
                { label: "This Quarter", value: "This Quarter" },
                { label: "This Year", value: "This Year" },
              ]}
              placeholder="All Time"
            />

            {/* Amount Range filter */}
            <View style={styles.amountRangeContainer}>
              <TextInput
                placeholder="Min Amount"
                placeholderTextColor="#9aa6bf"
                value={localFilters.minAmount || ""}
                onChangeText={(v) => setLocalFilters((f) => ({ ...f, minAmount: v }))}
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
              />
              <TextInput
                placeholder="Max Amount"
                placeholderTextColor="#9aa6bf"
                value={localFilters.maxAmount || ""}
                onChangeText={(v) => setLocalFilters((f) => ({ ...f, maxAmount: v }))}
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
              />
            </View>

            {/* Status filter */}
            <DarkPicker
              selectedValue={localFilters.status}
              onValueChange={(v) => setLocalFilters((f) => ({ ...f, status: v }))}
              items={[
                { label: "All Status", value: "" },
                { label: "Success", value: "Success" },
                { label: "Pending", value: "Pending" },
                { label: "Failed", value: "Failed" },
                { label: "Voided", value: "Voided" },
              ]}
              placeholder="All Status"
            />

            {/* Method filter */}
            <DarkPicker
              selectedValue={localFilters.method}
              onValueChange={(v) => setLocalFilters((f) => ({ ...f, method: v }))}
              items={[
                { label: "All Methods", value: "" },
                { label: "Online", value: "Online" },
                { label: "Offline", value: "Offline" },
                { label: "Credit Card", value: "Credit Card" },
                { label: "Bank Transfer", value: "Bank Transfer" },
              ]}
              placeholder="All Methods"
            />

            <TouchableOpacity style={styles.btnGhost} onPress={clearFilters}>
              <Text style={styles.btnGhostText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Cards */}
        {!loading && !error && (
          <>
            <FlatList
              data={filteredPayments}
              renderItem={renderPaymentCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No payments found</Text>
                </View>
              }
            />
            <CustomerPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              pageSize={pagination.pageSize}
              onPageChange={goToPage}
              hasNext={pagination.hasNext}
              hasPrevious={pagination.hasPrevious}
              loading={loading}
            />
          </>
        )}

        {/* Create/Edit Payment Modal */}
        <Modal
          visible={showPaymentModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPaymentModal(false)}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{editingPaymentId ? 'Edit Payment' : 'Record Payment'}</Text>
                  <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <Text style={styles.inputLabel}>Invoice ID *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="UUID of the linked invoice"
                    placeholderTextColor={colors.subtext}
                    value={paymentForm.invoice}
                    onChangeText={(v) => setPaymentForm(f => ({ ...f, invoice: v }))}
                  />

                  <Text style={styles.inputLabel}>Amount *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 600.00"
                    placeholderTextColor={colors.subtext}
                    value={paymentForm.amount}
                    onChangeText={(v) => setPaymentForm(f => ({ ...f, amount: v }))}
                    keyboardType="decimal-pad"
                  />

                  <Text style={styles.inputLabel}>Currency</Text>
                  <DarkPicker
                    selectedValue={paymentForm.currency}
                    onValueChange={(v) => setPaymentForm(f => ({ ...f, currency: v }))}
                    items={[
                      { label: 'USD', value: 'USD' },
                      { label: 'INR', value: 'INR' },
                      { label: 'EUR', value: 'EUR' },
                      { label: 'GBP', value: 'GBP' },
                    ]}
                  />

                  <Text style={styles.inputLabel}>Payment Method</Text>
                  <DarkPicker
                    selectedValue={paymentForm.paymentMethod}
                    onValueChange={(v) => setPaymentForm(f => ({ ...f, paymentMethod: v }))}
                    items={[
                      { label: 'Credit Card', value: 'Credit Card' },
                      { label: 'Bank Transfer', value: 'Bank Transfer' },
                      { label: 'Online', value: 'Online' },
                      { label: 'Offline', value: 'Offline' },
                    ]}
                  />

                  <Text style={styles.inputLabel}>Status</Text>
                  <DarkPicker
                    selectedValue={paymentForm.status}
                    onValueChange={(v) => setPaymentForm(f => ({ ...f, status: v }))}
                    items={[
                      { label: 'Success', value: 'success' },
                      { label: 'Pending', value: 'pending' },
                      { label: 'Failed', value: 'failed' },
                      { label: 'Voided', value: 'voided' },
                    ]}
                  />

                  <Text style={styles.inputLabel}>Transaction ID</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., pi_3SOJb1SEyfiTzn7m1MfIUOc4"
                    placeholderTextColor={colors.subtext}
                    value={paymentForm.transaction_id}
                    onChangeText={(v) => setPaymentForm(f => ({ ...f, transaction_id: v }))}
                  />

                  <Text style={styles.inputLabel}>Payment Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.subtext}
                    value={paymentForm.payment_date}
                    onChangeText={(v) => setPaymentForm(f => ({ ...f, payment_date: v }))}
                  />

                  <Text style={styles.inputLabel}>External Reference</Text>
                  <TextInput
                    style={[styles.input, { height: 60 }]}
                    placeholder="Additional notes"
                    placeholderTextColor={colors.subtext}
                    value={paymentForm.external_reference}
                    onChangeText={(v) => setPaymentForm(f => ({ ...f, external_reference: v }))}
                    multiline
                  />
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.btnGhost} onPress={() => setShowPaymentModal(false)}>
                    <Text style={styles.btnGhostText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.btnPrimary} 
                    onPress={async () => {
                      if (!paymentForm.invoice || !paymentForm.amount) {
                        Alert.alert('Missing Fields', 'Invoice ID and Amount are required');
                        return;
                      }

                      try {
                        const payload = {
                          invoice: paymentForm.invoice,
                          amount: paymentForm.amount,
                          currency: paymentForm.currency.toLowerCase(),
                          paymentMethod: paymentForm.paymentMethod,
                          status: paymentForm.status,
                          transaction_id: paymentForm.transaction_id,
                          external_reference: paymentForm.external_reference,
                          payment_date: paymentForm.payment_date,
                        };

                        if (editingPaymentId) {
                          await updatePayment(editingPaymentId, payload);
                          Alert.alert('Success', 'Payment updated successfully!');
                        } else {
                          await createPayment(payload);
                          Alert.alert('Success', 'Payment recorded successfully!');
                        }

                        setShowPaymentModal(false);
                        refreshPayments();
                      } catch (error) {
                        console.error('Payment save error:', error);
                        Alert.alert('Error', error.message || 'Failed to save payment');
                      }
                    }}
                  >
                    <Text style={styles.btnPrimaryText}>{editingPaymentId ? 'Update Payment' : 'Record Payment'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Payment Action Sheet Modal */}
        <Modal
          visible={showActionSheet}
          transparent
          animationType="fade"
          onRequestClose={handleCloseActionSheet}
          statusBarTranslucent
        >
          <Pressable style={styles.actionSheetOverlay} onPress={handleCloseActionSheet}>
            <View style={styles.actionSheetContainer} onStartShouldSetResponder={() => true}>
              {/* Payment Info Header */}
              {selectedPayment && (
                <View style={styles.actionSheetHeader}>
                  <View style={styles.actionSheetHeaderRow}>
                    <Text style={styles.actionSheetAmount}>{selectedPayment.amountFormatted}</Text>
                    <StatusBadge status={selectedPayment.status} />
                  </View>
                  <Text style={styles.actionSheetInvoice}>Invoice: {selectedPayment.invoice_number}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionSheetActions}>
                {/* View Payment */}
                <TouchableOpacity style={styles.actionButton} onPress={handleViewPayment}>
                  <View style={styles.actionIconContainer}>
                    <Text style={styles.actionIcon}>👁</Text>
                  </View>
                  <Text style={styles.actionButtonText}>View Payment</Text>
                </TouchableOpacity>

                {/* Edit Payment */}
                <TouchableOpacity style={styles.actionButton} onPress={handleEditPayment}>
                  <View style={styles.actionIconContainer}>
                    <Text style={styles.actionIcon}>✏️</Text>
                  </View>
                  <Text style={styles.actionButtonText}>Edit Payment</Text>
                </TouchableOpacity>

                {/* Process Payment */}
                <TouchableOpacity style={styles.actionButton} onPress={handleProcessPayment}>
                  <View style={styles.actionIconContainer}>
                    <Text style={styles.actionIcon}>✓</Text>
                  </View>
                  <Text style={styles.actionButtonText}>Process Payment</Text>
                </TouchableOpacity>

                {/* Void Payment */}
                <TouchableOpacity style={styles.actionButton} onPress={handleVoidPayment}>
                  <View style={styles.actionIconContainer}>
                    <Text style={styles.actionIcon}>⊘</Text>
                  </View>
                  <Text style={styles.actionButtonText}>Void Payment</Text>
                </TouchableOpacity>

                {/* Refund Payment */}
                <TouchableOpacity style={styles.actionButton} onPress={handleRefundPayment}>
                  <View style={styles.actionIconContainer}>
                    <Text style={styles.actionIcon}>↩</Text>
                  </View>
                  <Text style={styles.actionButtonText}>Refund Payment</Text>
                </TouchableOpacity>

                {/* Audit History */}
                <TouchableOpacity style={styles.actionButton} onPress={handleAuditHistory}>
                  <View style={styles.actionIconContainer}>
                    <Text style={styles.actionIcon}>📋</Text>
                  </View>
                  <Text style={styles.actionButtonText}>Audit History</Text>
                </TouchableOpacity>

                {/* Delete */}
                <TouchableOpacity 
                  style={[styles.actionButton, styles.actionButtonDanger]} 
                  onPress={handleDeletePayment}
                >
                  <View style={styles.actionIconContainer}>
                    <Text style={styles.actionIcon}>🗑</Text>
                  </View>
                  <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>Delete</Text>
                </TouchableOpacity>
              </View>

              {/* Cancel Button */}
              <TouchableOpacity 
                style={styles.actionSheetCancelButton} 
                onPress={handleCloseActionSheet}
              >
                <Text style={styles.actionSheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.bg, 
    paddingHorizontal: Platform.OS === 'web' ? 12 : 8,
    paddingTop: 10,
  },
  headerRow: {
    marginTop: 6,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: 'wrap',
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  backButton: {
    backgroundColor: colors.panel,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 24,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  title: { 
    color: colors.text, 
    fontWeight: "700", 
    fontSize: 18,
  },
  exportButton: {
    backgroundColor: colors.panel,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  exportButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  filterButton: {
    backgroundColor: colors.panel,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 18,
  },

  // Loading & Error
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#EA4335',
    fontSize: 14,
    marginBottom: 12,
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
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.subtext,
    fontSize: 14,
  },

  // KPIs
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  currencyBreakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  currencyBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: Platform.OS === 'web' ? 12 : 8,
    flexWrap: Platform.OS === 'web' ? 'nowrap' : 'wrap',
  },
  currencyCard: {
    flex: 1,
    backgroundColor: colors.panel,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: Platform.OS === 'web' ? 'auto' : '45%',
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  currencySubheader: {
    fontSize: 12,
    color: colors.subtext,
    marginBottom: 8,
  },
  currencyAmounts: {
    gap: 4,
  },
  currencyAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  currencySubtext: {
    fontSize: 12,
    color: colors.subtext,
  },
  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiItem: {
    alignItems: "flex-start",
    minWidth: "20%",
    flex: 1,
  },
  kpis: {
    marginTop: 6,
    marginBottom: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  kpiBox: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 10,
    width: Platform.OS === 'web' ? "48%" : "47%",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kpiLabel: { 
    color: colors.subtext, 
    fontSize: 11,
    marginBottom: 4,
  },
  kpiValue: { 
    fontWeight: "700", 
    fontSize: 20,
  },

  filtersPanel: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  halfInput: {
    flex: 1,
  },
  
  // Payment Card Styles
  card: {
    marginBottom: Platform.OS === 'web' ? 12 : 10,
  },
  paymentCard: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 2,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  paymentHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentCircleIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  paymentMainInfo: {
    flex: 1,
  },
  paymentHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  paymentId: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  paymentAmount: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  paymentInvoice: {
    color: colors.subtext,
    fontSize: 13,
    fontWeight: "500",
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  moreButtonText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 20,
  },
  paymentInfo: {
    gap: 12,
  },
  paymentMetaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 4,
  },
  paymentMetaItem: {
    flex: 1,
  },
  paymentMetaLabel: {
    color: colors.subtext,
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  paymentMetaValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "500",
  },
  paymentFooter: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paymentCustomerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  paymentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentAvatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  paymentCustomerDetails: {
    flex: 1,
  },
  paymentCustomerName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  paymentCustomerMeta: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  paymentCustomerMetaText: {
    color: colors.subtext,
    fontSize: 11,
  },
  paymentTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  paymentTag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  paymentTagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  paymentNotes: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paymentNotesText: {
    color: colors.subtext,
    fontSize: 12,
    fontStyle: "italic",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentLabel: {
    color: colors.subtext,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  paymentValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    flex: 2,
    textAlign: "right",
  },

  // Status Badge
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  pillText: { 
    fontSize: Platform.OS === 'web' ? 12 : 11,
    fontWeight: "600" 
  },

  // Input Styles
  input: {
    fontSize: 15,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
    backgroundColor: colors.bg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },

  // Button Styles
  btnGhost: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  btnGhostText: {
    color: colors.primary,
    fontWeight: "700",
  },

  // Dark Picker Styles
  pickerContainer: {
    backgroundColor: colors.panel,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    overflow: 'hidden',
  },
  pickerTouchable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.panel,
  },
  pickerText: {
    color: colors.text,
    fontSize: 16,
  },
  pickerIcon: {
    color: colors.text,
    fontSize: 14,
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  pickerModalContent: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: height * 0.7,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerModalCancel: {
    color: colors.subtext,
    fontSize: 16,
  },
  pickerModalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  pickerModalDone: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  pickerOptionsContainer: {
    maxHeight: height * 0.5,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(150, 149, 215, 0.1)',
  },
  pickerOptionText: {
    color: colors.text,
    fontSize: 16,
  },

  // Action Sheet Styles
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  actionSheetContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingHorizontal: 16,
    maxHeight: height * 0.85,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  actionSheetHeader: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  actionSheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionSheetAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  actionSheetInvoice: {
    fontSize: 14,
    color: colors.subtext,
  },
  actionSheetActions: {
    gap: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionButtonDanger: {
    backgroundColor: 'rgba(234, 67, 53, 0.05)',
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  actionButtonTextDanger: {
    color: '#EA4335',
  },
  actionSheetCancelButton: {
    marginTop: 16,
    paddingVertical: 16,
    backgroundColor: colors.panel,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionSheetCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },

  // Payment Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '90%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalClose: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
});
