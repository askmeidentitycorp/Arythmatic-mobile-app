// screens/PaymentScreen.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
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
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from "../constants/config";
import { paymentService } from '../services/paymentService';
import { customerService } from '../services/customerService';
import DarkPicker from '../components/Customer/DarkPicker';

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
  return (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentHeaderLeft}>
          <Text style={styles.paymentId}>{payment.transaction_id || payment.id}</Text>
          <Text style={styles.paymentAmount}>{payment.amountFormatted}</Text>
        </View>
        <View style={styles.paymentHeaderRight}>
          <StatusBadge status={payment.status} />
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
      </View>
      
      <View style={styles.paymentInfo}>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Customer:</Text>
          <Text style={styles.paymentValue}>{payment.customerName}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Method:</Text>
          <Text style={styles.paymentValue}>{payment.payment_method || 'N/A'}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Date:</Text>
          <Text style={styles.paymentValue}>{payment.payment_date || payment.created}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Invoice:</Text>
          <Text style={styles.paymentValue}>{payment.invoice_number || 'N/A'}</Text>
        </View>
      </View>
    </View>
  );
});


/* ---------- Main Component ---------- */
export default function PaymentScreen({ onNavigateToDetails, navigation }) {
  const [payments, setPayments] = useState([]);
  const [nameCache, setNameCache] = useState({});
  const fetchingIdsRef = React.useRef(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({ 
    searchText: "", 
    status: "", 
    method: "",
    dateRange: "",
    minAmount: "",
    maxAmount: ""
  });

  // Fetch payments from API
  const fetchPayments = useCallback(async () => {
    console.log('\n🔵 ========== PAYMENT SCREEN: FETCHING DATA ==========');
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: 1,
        page_size: 1000, // Get all payments for proper calculation
      };
      
      console.log('🔵 Calling paymentService.getAll with params:', params);
      const response = await paymentService.getAll(params);
      console.log('🔵 Raw API Response:', JSON.stringify(response, null, 2));
      
      // Transform API response - Map actual API field names
      const transformedPayments = (response.results || []).map(payment => {
        // FIXED: API doesn't return customer details in payment endpoint
        // We only have created_by (UUID), so we show "Customer" as placeholder
        // To get actual customer names, we'd need to:
        // 1. Fetch invoice details using payment.invoice UUID
        // 2. Get customer info from the invoice
        // 3. Or fetch from /users endpoint using payment.created_by
        
        const customerId = payment.customer?.id || payment.customer_id || payment.created_by || null;
        const customerName = payment.customer_name || 
                           payment.customer?.name || 
                           payment.customer?.display_name || 
                           (customerId ? '' : 'Customer'); // leave empty to resolve asynchronously when id exists
        
        return {
          ...payment,
          transaction_id: payment.transaction_id || payment.id,
          customerId,
          customerName,
          // Normalize status to Title Case
          status: payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1).toLowerCase() : 'Pending',
          // Map payment_method or paymentMethod
          payment_method: payment.payment_method || payment.paymentMethod || 'N/A',
          // Map invoice_number - use last 8 chars of UUID for display
          invoice_number: payment.invoice_number || 
                         (payment.invoice ? payment.invoice.slice(-8) : 'N/A'),
          // Format amount with currency symbol
          amountFormatted: `${payment.currency === 'INR' ? '₹' : payment.currency === 'USD' ? '$' : payment.currency === 'EUR' ? '€' : payment.currency === 'GBP' ? '£' : ''}${parseFloat(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        };
      });
      
      console.log('🔵 Transformed Payments Count:', transformedPayments.length);
      if (transformedPayments.length > 0) {
        console.log('🔵 First Payment Sample:', JSON.stringify(transformedPayments[0], null, 2));
      }
      console.log('🔵 ========== END PAYMENT FETCH ==========\n');
      
      setPayments(transformedPayments);

      // Resolve customer names for items missing names
      const idsToFetch = Array.from(new Set(
        transformedPayments
          .filter(p => (!p.customerName || p.customerName === '') && p.customerId)
          .map(p => p.customerId)
      ));

      idsToFetch.forEach(async (cid) => {
        if (!cid || nameCache[cid] || fetchingIdsRef.current.has(cid)) return;
        fetchingIdsRef.current.add(cid);
        try {
          const data = await customerService.getById(cid);
          const cust = data?.data || data;
          const displayName = cust?.displayName || cust?.name || cust?.full_name || cust?.email || 'Customer';
          setNameCache(prev => ({ ...prev, [cid]: displayName }));
          setPayments(prev => prev.map(p => (p.customerId === cid && (!p.customerName || p.customerName === '')) ? { ...p, customerName: displayName } : p));
        } catch (e) {
          // leave placeholder
        } finally {
          fetchingIdsRef.current.delete(cid);
        }
      });
    } catch (err) {
      console.error('❌ PAYMENT FETCH ERROR:', err);
      console.error('❌ Error Message:', err.message);
      console.error('❌ Error Stack:', err.stack);
      setError(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  /* ---------- KPI Metrics - Matching Dashboard Logic EXACTLY ---------- */
  const metrics = useMemo(() => {
    const totalPayments = payments.length;
    
    // FIXED: Calculate totals for ALL currencies (like Dashboard)
    // Count by currency and calculate totals
    const currencyBreakdown = {};
    let totalValueAllCurrencies = 0;
    let successfulAllCurrencies = 0;
    let failedAllCurrencies = 0;
    
    payments.forEach(payment => {
      const curr = payment.currency || 'USD';
      const amt = parseFloat(payment.amount) || 0;
      
      // Initialize currency if not exists
      if (!currencyBreakdown[curr]) {
        currencyBreakdown[curr] = {
          count: 0,
          total: 0,
          successful: 0,
          failed: 0,
        };
      }
      
      // Add to currency breakdown
      currencyBreakdown[curr].count++;
      currencyBreakdown[curr].total += amt;
      
      // Add to overall totals (without conversion - show multi-currency)
      totalValueAllCurrencies += amt;
      
      if (payment.status === 'Success') {
        currencyBreakdown[curr].successful += amt;
        successfulAllCurrencies += amt;
      } else if (payment.status === 'Failed' || payment.status === 'Voided') {
        currencyBreakdown[curr].failed += amt;
        failedAllCurrencies += amt;
      }
    });
    
    // Format display values - show primary currency (USD) if exists, otherwise show "Mixed"
    const primaryCurrency = currencyBreakdown['USD'] ? 'USD' : Object.keys(currencyBreakdown)[0] || 'USD';
    const symbol = primaryCurrency === 'INR' ? '₹' : primaryCurrency === 'USD' ? '$' : primaryCurrency === 'EUR' ? '€' : primaryCurrency === 'GBP' ? '£' : '';
    
    // Use USD values if available, otherwise show mixed
    const displayValue = currencyBreakdown['USD'] ? currencyBreakdown['USD'].total : totalValueAllCurrencies;
    const displaySuccess = currencyBreakdown['USD'] ? currencyBreakdown['USD'].successful : successfulAllCurrencies;
    const displayFailed = currencyBreakdown['USD'] ? currencyBreakdown['USD'].failed : failedAllCurrencies;
    
    return {
      total: totalPayments,
      totalValue: `${symbol}${displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${Object.keys(currencyBreakdown).length > 1 ? ' +' : ''}`,
      successful: `${symbol}${displaySuccess.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      failed: `${symbol}${displayFailed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      currencyBreakdown,
    };
  }, [payments]);

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
    console.log("💳 Payment action menu clicked:", payment.id);
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
    handleCloseActionSheet();
    // TODO: Navigate to edit form when implemented
    Alert.alert('Edit Payment', 'Edit payment form will be implemented in future update.');
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
              setLoading(true);
              await paymentService.processPayment(paymentToProcess?.id);
              Alert.alert('Success', 'Payment processed successfully!');
              await fetchPayments(); // Refresh the list
            } catch (error) {
              console.error('Process payment error:', error);
              Alert.alert('Error', error.message || 'Failed to process payment. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }, [selectedPayment, handleCloseActionSheet, fetchPayments]);

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
              setLoading(true);
              await paymentService.voidPayment(paymentToVoid?.id);
              Alert.alert('Success', 'Payment voided successfully!');
              await fetchPayments(); // Refresh the list
            } catch (error) {
              console.error('Void payment error:', error);
              Alert.alert('Error', error.message || 'Failed to void payment. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }, [selectedPayment, handleCloseActionSheet, fetchPayments]);

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
              setLoading(true);
              await paymentService.refundPayment(paymentToRefund?.id);
              Alert.alert('Success', 'Refund initiated successfully!');
              await fetchPayments(); // Refresh the list
            } catch (error) {
              console.error('Refund payment error:', error);
              Alert.alert('Error', error.message || 'Failed to initiate refund. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }, [selectedPayment, handleCloseActionSheet, fetchPayments]);

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
              setLoading(true);
              await paymentService.delete(paymentToDelete?.id);
              Alert.alert('Success', 'Payment deleted successfully!');
              await fetchPayments(); // Refresh the list
            } catch (error) {
              console.error('Delete payment error:', error);
              Alert.alert('Error', error.message || 'Failed to delete payment. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }, [selectedPayment, handleCloseActionSheet, fetchPayments]);

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
      // Create CSV header
      const header = 'Transaction ID,Customer Name,Amount,Currency,Status,Payment Method,Invoice,Payment Date\n';
      
      // Create CSV rows from filtered payments
      const rows = filteredPayments.map(payment => {
        const transactionId = payment.transaction_id || payment.id || 'N/A';
        const customerName = (payment.customerName || 'Unknown').replace(/,/g, ' '); // Remove commas
        const amount = parseFloat(payment.amount || 0).toFixed(2);
        const currency = payment.currency || 'USD';
        const status = payment.status || 'Pending';
        const method = (payment.payment_method || 'N/A').replace(/,/g, ' ');
        const invoice = (payment.invoice_number || 'N/A').replace(/,/g, ' ');
        const date = payment.payment_date || payment.created || 'N/A';
        
        return `${transactionId},${customerName},${amount},${currency},${status},${method},${invoice},${date}`;
      }).join('\n');
      
      // Combine header and rows
      const csvContent = header + rows;
      
      // Add summary at the end
      const summary = `\n\nSummary\nTotal Payments,${metrics.total}\nTotal Value,${metrics.totalValue}\nSuccessful,${metrics.successful}\nFailed/Voided,${metrics.failed}`;
      const fullContent = csvContent + summary;
      
      // Share the CSV content
      await Share.share({
        message: fullContent,
        title: 'Payment Export',
      });
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Unable to export payments. Please try again.');
    }
  }, [filteredPayments, metrics]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 160, paddingTop: 10 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Payments</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.exportButton} 
              onPress={handleExport}
            >
              <Text style={styles.exportButtonText}>📤</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.filterButton} 
              onPress={toggleFilters}
            >
              <Text style={styles.filterButtonText}>🔍</Text>
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
            <TouchableOpacity style={styles.retryButton} onPress={fetchPayments}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Management KPIs - Match Screenshot */}
        {!loading && !error && (
          <>
            <Text style={styles.sectionTitle}>Payment Management</Text>
            <View style={styles.kpis}>
              <KPI label="Total Payments" value={metrics.total} color="#6B9AFF" />
              <KPI label="Total Value" value={metrics.totalValue} color="#6B9AFF" />
              <KPI label="Successful" value={metrics.successful} color="#31C76A" />
              <KPI label="Failed/Voided" value={metrics.failed} color="#EA4335" />
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
        )}

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
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
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
    gap: 8,
  },
  title: { 
    flex: 1,
    color: colors.text, 
    fontWeight: "700", 
    fontSize: Platform.OS === 'web' ? 18 : 16,
    marginLeft: 8,
  },
  exportButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 18,
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
    fontSize: Platform.OS === 'web' ? 12 : 11,
  },
  kpiValue: { 
    fontWeight: "700", 
    fontSize: Platform.OS === 'web' ? 18 : 16,
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
    padding: Platform.OS === 'web' ? 14 : 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  paymentHeaderLeft: {
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
    color: colors.primary,
    fontSize: 20,
    fontWeight: "700",
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  moreButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  paymentInfo: {
    gap: 8,
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
});
