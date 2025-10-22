// screens/PaymentScreen.js
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
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
  LayoutAnimation,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { colors } from "../constants/config";
import { usePayments, usePaymentMutations } from '../hooks/usePayments';
import { usePaymentAnalytics } from '../hooks/usePaymentAnalytics';

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ---------- Mock Payment Data ---------- */
const INITIAL_PAYMENTS = [
  {
    id: "P-001",
    customerId: "c-1001",
    customerName: "Lanry R Gala",
    amount: 1000.00, // Store as number
    amountFormatted: "₹1,000.00", // Formatted for display
    date: "2025-09-26",
    status: "Completed",
    method: "Credit Card",
    invoice: "INV-952731-628",
    description: "Premium Subscription for our cloud services package including 24/7 support and advanced analytics.",
    isOverdue: false,
  },
  {
    id: "P-002",
    customerId: "c-1002",
    customerName: "Acme Corp",
    amount: 2500.00,
    amountFormatted: "₹2,500.00",
    date: "2025-09-25",
    status: "Completed",
    method: "Bank Transfer",
    invoice: "INV-952731-629",
    description: "Enterprise Plan annual subscription with priority support and custom integrations.",
    isOverdue: false,
  },
  {
    id: "P-003",
    customerId: "c-1003",
    customerName: "John Doe",
    amount: 750.00,
    amountFormatted: "₹750.00",
    date: "2025-09-24",
    status: "Pending",
    method: "PayPal",
    invoice: "INV-952731-630",
    description: "Standard Plan quarterly subscription with basic features and email support.",
    isOverdue: true,
  },
  {
    id: "P-004",
    customerId: "c-1004",
    customerName: "Global Tech",
    amount: 3200.00,
    amountFormatted: "₹3,200.00",
    date: "2025-09-23",
    status: "Completed",
    method: "Credit Card",
    invoice: "INV-952731-631",
    description: "Enterprise Plan annual subscription with premium features and dedicated account manager.",
    isOverdue: false,
  },
  {
    id: "P-005",
    customerId: "c-1005",
    customerName: "Sarah Johnson",
    amount: 110.00,
    amountFormatted: "¥110.00",
    date: "2025-09-20",
    status: "Pending",
    method: "Bank Transfer",
    invoice: "INV-952731-632",
    description: "Personal loan repayment for the month of September 2025.",
    isOverdue: true,
  },
  {
    id: "P-006",
    customerId: "c-1006",
    customerName: "Mike Wilson",
    amount: 110.00,
    amountFormatted: "¥110.00",
    date: "2025-09-18",
    status: "Pending",
    method: "Credit Card",
    invoice: "INV-952731-633",
    description: "Personal loan repayment for the month of September 2025.",
    isOverdue: true,
  },
  {
    id: "P-007",
    customerId: "c-1007",
    customerName: "Emma Davis",
    amount: 110.00,
    amountFormatted: "¥110.00",
    date: "2025-09-15",
    status: "Pending",
    method: "PayPal",
    invoice: "INV-952731-634",
    description: "Personal loan repayment for the month of September 2025.",
    isOverdue: true,
  },
  {
    id: "P-008",
    customerId: "c-1008",
    customerName: "Robert Brown",
    amount: 110.00,
    amountFormatted: "¥110.00",
    date: "2025-09-10",
    status: "Pending",
    method: "Bank Transfer",
    invoice: "INV-952731-635",
    description: "Personal loan repayment for the month of September 2025.",
    isOverdue: true,
  },
];

/* ---------- Helper Components ---------- */
const KPI = React.memo(({ label, value, color = "#9695D7" }) => {
  return (
    <View style={styles.kpiBox}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
    </View>
  );
});

const StatusBadge = React.memo(({ status }) => {
  const config = {
    "Completed": { bg: "rgba(49,199,106,0.12)", border: "#31C76A", text: "#31C76A" },
    "Pending": { bg: "rgba(244,183,64,0.15)", border: "#6b5221", text: "#F4B740" },
    "Failed": { bg: "rgba(234,67,53,0.12)", border: "#7a2e2a", text: "#EA4335" },
    "Voided": { bg: "rgba(167,174,192,0.1)", border: "#2a3450", text: "#A7AEC0" },
    "Overdue": { bg: "rgba(234,67,53,0.15)", border: "#7a2e2a", text: "#EA4335" },
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

const PaymentCard = React.memo(({ payment, onNext, onRepay }) => {
  return (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentHeaderLeft}>
          <Text style={styles.paymentId}>{payment.id}</Text>
          <Text style={styles.paymentAmount}>{payment.amountFormatted}</Text>
        </View>
        <View style={styles.paymentHeaderRight}>
          <StatusBadge status={payment.isOverdue ? "Overdue" : payment.status} />
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
          <Text style={styles.paymentValue}>{payment.method}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Date:</Text>
          <Text style={styles.paymentValue}>{payment.date}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Invoice:</Text>
          <Text style={styles.paymentValue}>{payment.invoice}</Text>
        </View>
      </View>
      
      {payment.isOverdue && (
        <View style={styles.paymentFooter}>
          <TouchableOpacity 
            style={styles.repayButton}
            onPress={(e) => {
              e.stopPropagation();
              onRepay && onRepay(payment);
            }}
          >
            <Text style={styles.repayButtonText}>Process Payment</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

/* ---------- Custom Dark Themed Picker Component ---------- */
const DarkPicker = React.memo(({ selectedValue, onValueChange, items, placeholder, style }) => {
  const [showPicker, setShowPicker] = useState(false);
  const displayValue = items.find(item => item.value === selectedValue)?.label || placeholder;

  return (
    <View style={[styles.pickerContainer, style]}>
      <TouchableOpacity
        style={styles.pickerTouchable}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.pickerText, !selectedValue && { color: colors.subtext }]}>
          {displayValue}
        </Text>
        <Text style={styles.pickerIcon}>▼</Text>
      </TouchableOpacity>
      
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.pickerModalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerModalTitle}>Select Option</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.pickerModalDone}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerOptionsContainer}>
              <ScrollView>
                {items.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pickerOption,
                      selectedValue === item.value && styles.pickerOptionSelected
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setShowPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      selectedValue === item.value && { color: colors.primary }
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

/* ---------- Helper Components ---------- */
const DetailRow = React.memo(({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
));

const LabeledInput = React.memo(({ label, value, onChangeText, placeholder, editable = true, multiline, ...rest }) => {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9aa6bf"
          editable={editable}
          style={[styles.input, multiline && styles.inputMultiline]}
          multiline={!!multiline}
          {...rest}
        />
      </View>
    </View>
  );
});

/* ---------- Main Component ---------- */
export default function PaymentScreen({ onNavigateToDetails, navigation }) {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [apiFilters, setApiFilters] = useState({});
  const [localFilters, setLocalFilters] = useState({ 
    searchText: "", 
    status: "", 
    method: "",
    isOverdue: false,
    dateRange: "",
    minAmount: "",
    maxAmount: ""
  });

  // API hooks
  const { payments, loading: paymentsLoading, error: paymentsError, refetch } = usePayments(apiFilters, 50);
  const { analytics, loading: analyticsLoading, error: analyticsError, refresh: refreshAnalytics } = usePaymentAnalytics(apiFilters);
  const { processPayment, refundPayment, voidPayment, loading: mutationLoading } = usePaymentMutations();

  // Refresh handler for analytics
  const handleRefresh = useCallback(() => {
    refetch();
    refreshAnalytics();
  }, [refetch, refreshAnalytics]);

  // Combined loading state
  const loading = paymentsLoading || analyticsLoading;
  const error = paymentsError || analyticsError;

  /* ---------- KPI Metrics from Analytics API ---------- */
  const metrics = useMemo(() => {
    return {
      total: analytics.totalPayments,
      totalValue: analytics.totalValue,
      successful: analytics.successful,
      failed: analytics.failed,
      pending: analytics.pending,
      overdue: analytics.overdue,
    };
  }, [analytics]);

  /* ---------- Filters ---------- */
  // Apply local filtering on API results
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Text search
      const matchSearch = !localFilters.searchText || (
        p.id?.toLowerCase().includes(localFilters.searchText.toLowerCase()) ||
        p.customerName?.toLowerCase().includes(localFilters.searchText.toLowerCase()) ||
        p.invoice?.toLowerCase().includes(localFilters.searchText.toLowerCase()) ||
        p.description?.toLowerCase().includes(localFilters.searchText.toLowerCase())
      );
      
      // Amount range filtering (local only for instant feedback)
      const amount = typeof p.amount === 'number' ? p.amount : parseFloat(p.amount) || 0;
      const matchMinAmount = !localFilters.minAmount || amount >= parseFloat(localFilters.minAmount);
      const matchMaxAmount = !localFilters.maxAmount || amount <= parseFloat(localFilters.maxAmount);
      
      return matchSearch && matchMinAmount && matchMaxAmount;
    });
  }, [payments, localFilters.searchText, localFilters.minAmount, localFilters.maxAmount]);

  // Update API filters when local filters change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const newApiFilters = {
        status: localFilters.status || undefined,
        method: localFilters.method || undefined,
        isOverdue: localFilters.isOverdue || undefined,
        dateRange: localFilters.dateRange || undefined,
        minAmount: localFilters.minAmount ? parseFloat(localFilters.minAmount) : undefined,
        maxAmount: localFilters.maxAmount ? parseFloat(localFilters.maxAmount) : undefined,
      };
      setApiFilters(newApiFilters);
    }, 500);
    return () => clearTimeout(timer);
  }, [localFilters.status, localFilters.method, localFilters.isOverdue, localFilters.dateRange, localFilters.minAmount, localFilters.maxAmount]);

  const clearFilters = useCallback(() => {
    setLocalFilters({ 
      searchText: "", 
      status: "", 
      method: "",
      isOverdue: false,
      dateRange: "",
      minAmount: "",
      maxAmount: ""
    });
    setApiFilters({});
  }, []);

  /* ---------- Payment Actions ---------- */
  const handleNextPayment = useCallback((payment) => {
    console.log("Next button clicked for payment:", payment);
    // Navigate to payment details when the Next button is clicked
    if (onNavigateToDetails) {
      onNavigateToDetails(payment.id);
    }
  }, [onNavigateToDetails]);

  const handleRepayPayment = useCallback(async (payment) => {
    try {
      await processPayment(payment.id);
      Alert.alert(
        "Payment Processed",
        `Payment of ${payment.amountFormatted} for ${payment.customerName} has been processed.`,
        [{ text: "OK" }]
      );
      // Refresh data after successful processing
      refetch();
      refreshAnalytics();
    } catch (error) {
      Alert.alert("Error", `Failed to process payment: ${error.message}`);
    }
  }, [processPayment, refetch, refreshAnalytics]);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const renderPaymentCard = useCallback(({ item: payment }) => {
    return (
      <View key={payment.id} style={styles.card}>
        <PaymentCard 
          payment={payment} 
          onNext={handleNextPayment}
          onRepay={handleRepayPayment}
        />
      </View>
    );
  }, [handleNextPayment, handleRepayPayment]);

  // Use overdue count from analytics
  const overdueCount = metrics.overdue;

  const handleBackPress = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 160, paddingTop: 10 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Header with Back Button */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Text style={styles.backButtonText}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Payments</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.exportButton} 
              onPress={() => console.log('Export payments')}
            >
              <Text style={styles.exportButtonText}>📤 Export</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.recordButton} 
              onPress={() => console.log('Record new payment')}
            >
              <Text style={styles.recordButtonText}>+ Record Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.filterButton} 
              onPress={toggleFilters}
            >
              <Text style={styles.filterButtonText}>Filters</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Overdue Warning Banner */}
        {overdueCount > 0 && (
          <View style={styles.overdueBanner}>
            <Text style={styles.overdueBannerText}>
              当前有{overdueCount}笔逾期借款 请归还
            </Text>
          </View>
        )}

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading payment data...</Text>
          </View>
        )}

        {/* Payment Management KPIs - Match Screenshot */}
        {!loading && (
          <>
            <Text style={styles.sectionTitle}>Payment Management</Text>
            <View style={styles.kpis}>
              <KPI label="Total Payments" value={metrics.total} color="#6B9AFF" />
              <KPI label="Total Value" value={metrics.totalValue} color="#6B9AFF" />
              <KPI label="Successful" value={metrics.successful} color="#31C76A" />
              <KPI label="Failed/Voided" value={metrics.failed} color="#EA4335" />
            </View>

            {/* Currency Breakdown */}
            <Text style={styles.currencyBreakdownTitle}>Currency Breakdown</Text>
            <View style={styles.currencyBreakdown}>
              <View style={styles.currencyCard}>
                <Text style={styles.currencyLabel}>INR</Text>
                <View style={styles.currencyAmounts}>
                  <Text style={styles.currencyAmount}>₹12,500.00</Text>
                  <Text style={styles.currencySubtext}>Pending: ₹1,200.00</Text>
                  <Text style={styles.currencySubtext}>Failed: ₹300.00</Text>
                </View>
              </View>
              <View style={styles.currencyCard}>
                <Text style={styles.currencyLabel}>USD</Text>
                <View style={styles.currencyAmounts}>
                  <Text style={styles.currencyAmount}>$429.00</Text>
                  <Text style={styles.currencySubtext}>Pending: $50.00</Text>
                  <Text style={styles.currencySubtext}>Failed: $9.00</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            <TextInput
              placeholder="Search by ID, customer, invoice, description"
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
                { label: "Completed", value: "Completed" },
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
                { label: "Credit Card", value: "Credit Card" },
                { label: "Bank Transfer", value: "Bank Transfer" },
                { label: "PayPal", value: "PayPal" },
              ]}
              placeholder="All Methods"
            />

            {/* Overdue filter */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setLocalFilters(f => ({ ...f, isOverdue: !f.isOverdue }))}
              >
                <View style={[styles.checkboxBox, localFilters.isOverdue && styles.checkboxBoxChecked]}>
                  {localFilters.isOverdue && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Show Overdue Only</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.btnGhost} onPress={clearFilters}>
              <Text style={styles.btnGhostText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Cards */}
        <FlatList
          data={filteredPayments}
          renderItem={renderPaymentCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
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
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: colors.panel,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportButton: {
    backgroundColor: colors.panel,
    paddingHorizontal: Platform.OS === 'web' ? 12 : 10,
    paddingVertical: Platform.OS === 'web' ? 8 : 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 36,
    justifyContent: 'center',
    marginRight: 6,
  },
  exportButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: Platform.OS === 'web' ? 12 : 11,
  },
  recordButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: Platform.OS === 'web' ? 12 : 10,
    paddingVertical: Platform.OS === 'web' ? 8 : 6,
    borderRadius: 6,
    minHeight: 36,
    justifyContent: 'center',
    marginRight: 6,
  },
  recordButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: Platform.OS === 'web' ? 12 : 11,
  },
  title: { 
    color: colors.text, 
    fontWeight: "700", 
    fontSize: Platform.OS === 'web' ? 18 : 16,
  },
  filterButton: {
    backgroundColor: colors.panel,
    paddingHorizontal: Platform.OS === 'web' ? 12 : 10,
    paddingVertical: Platform.OS === 'web' ? 8 : 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  filterButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: Platform.OS === 'web' ? 14 : 12,
  },

  // Overdue Banner
  overdueBanner: {
    backgroundColor: 'rgba(234, 67, 53, 0.15)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(234, 67, 53, 0.3)',
  },
  overdueBannerText: {
    color: '#EA4335',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
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
  
  // Checkbox for filters
  checkboxContainer: {
    marginBottom: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: colors.text,
    fontSize: 14,
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
    marginBottom: 12,
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
  paymentFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    alignItems: "center",
  },
  paymentDate: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 4,
  },
  paymentMethod: {
    color: colors.subtext,
    fontSize: 14,
    marginBottom: 4,
  },
  paymentCustomer: {
    color: colors.subtext,
    fontSize: 14,
    marginBottom: 4,
  },
  paymentInvoice: {
    color: colors.subtext,
    fontSize: 14,
    marginBottom: 8,
  },
  paymentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  repayButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    minWidth: 140,
  },
  repayButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
  inputLabel: {
    color: colors.text,
    marginBottom: 6,
    fontWeight: "600",
    fontSize: Platform.OS === 'web' ? 13 : 12,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.panel,
    overflow: 'hidden',
  },
  input: {
    fontSize: 15,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
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
  btnPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  btnPrimaryText: {
    fontWeight: "700",
    color: "#fff",
  },

  // Detail Row
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    color: colors.subtext,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  detailValue: {
    color: colors.text,
    fontSize: 14,
    flex: 2,
    textAlign: "right",
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
  },
  pickerModalContent: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: height * 0.7,
    borderWidth: 1,
    borderColor: colors.border,
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

  // Section Title
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
    gap: 12,
  },
  currencyCard: {
    flex: 1,
    backgroundColor: colors.panel,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
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

  // Loading Container
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
});
