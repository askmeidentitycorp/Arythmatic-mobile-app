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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../constants/config";

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
        <Text style={styles.paymentId}>{payment.id}</Text>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={(e) => {
            e.stopPropagation();
            onNext && onNext(payment);
          }}
        >
          <Text style={styles.nextButtonText}>Next ›</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.paymentDetails}>
        <Text style={styles.paymentAmount}>{payment.amountFormatted}</Text>
        <Text style={styles.paymentDate}>{payment.date}</Text>
        <Text style={styles.paymentMethod}>{payment.method}</Text>
        <Text style={styles.paymentCustomer}>{payment.customerName}</Text>
        <Text style={styles.paymentInvoice}>{payment.invoice}</Text>
        
        <View style={styles.paymentActions}>
          {payment.isOverdue && (
            <TouchableOpacity 
              style={styles.repayButton}
              onPress={(e) => {
                e.stopPropagation();
                onRepay && onRepay(payment);
              }}
            >
              <Text style={styles.repayButtonText}>去还款</Text>
            </TouchableOpacity>
          )}
          
          <StatusBadge status={payment.isOverdue ? "Overdue" : payment.status} />
        </View>
      </View>
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
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ 
    searchText: "", 
    status: "", 
    method: "",
    isOverdue: false 
  });

  /* ---------- Persistence ---------- */
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("payments");
        if (saved) setPayments(JSON.parse(saved));
      } catch (e) {
        console.warn("Failed to load payments:", e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem("payments", JSON.stringify(payments));
      } catch (e) {
        console.warn("Failed to save payments:", e);
      }
    })();
  }, [payments]);

  /* ---------- KPIs ---------- */
  const metrics = useMemo(() => {
    const total = payments.length;
    const completed = payments.filter((p) => p.status === "Completed").length;
    const pending = payments.filter((p) => p.status === "Pending").length;
    const overdue = payments.filter((p) => p.isOverdue).length;
    
    // Calculate total amount - now using the numeric amount field
    const totalAmount = payments.reduce((sum, p) => {
      return sum + (typeof p.amount === 'number' ? p.amount : 0);
    }, 0);
    
    return { 
      total, 
      completed, 
      pending, 
      overdue,
      totalAmount: `₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
    };
  }, [payments]);

  /* ---------- Filters ---------- */
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        !filters.searchText ||
        p.id.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        p.customerName.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        p.invoice.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.searchText.toLowerCase());
      const matchStatus = !filters.status || p.status === filters.status;
      const matchMethod = !filters.method || p.method === filters.method;
      const matchOverdue = !filters.isOverdue || p.isOverdue === filters.isOverdue;
      return matchSearch && matchStatus && matchMethod && matchOverdue;
    });
  }, [payments, filters]);

  const clearFilters = useCallback(() => {
    setFilters({ 
      searchText: "", 
      status: "", 
      method: "",
      isOverdue: false 
    });
  }, []);

  /* ---------- Payment Actions ---------- */
  const handleNextPayment = useCallback((payment) => {
    console.log("Next button clicked for payment:", payment);
    // Navigate to payment details when the Next button is clicked
    if (onNavigateToDetails) {
      onNavigateToDetails(payment.id);
    }
  }, [onNavigateToDetails]);

  const handleRepayPayment = useCallback((payment) => {
    Alert.alert(
      "Payment Processed",
      `Payment of ${payment.amountFormatted} for ${payment.customerName} has been processed.`,
      [{ text: "OK" }]
    );
    
    // Update payment status from pending to completed
    setPayments(prev => 
      prev.map(p => 
        p.id === payment.id ? { ...p, status: "Completed", isOverdue: false } : p
      )
    );
  }, []);

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

  // Count overdue payments for the warning banner
  const overdueCount = useMemo(() => {
    return payments.filter(p => p.isOverdue).length;
  }, [payments]);

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

        {/* KPIs */}
        <View style={styles.kpis}>
          <KPI label="Total Payments" value={metrics.total} />
          <KPI label="Completed" value={metrics.completed} />
          <KPI label="Pending" value={metrics.pending} />
          <KPI label="Overdue" value={metrics.overdue} color="#EA4335" />
        </View>

        {/* Filters Panel */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            <TextInput
              placeholder="Search by ID, customer, invoice, description"
              placeholderTextColor="#9aa6bf"
              value={filters.searchText}
              onChangeText={(v) => setFilters((f) => ({ ...f, searchText: v }))}
              style={styles.input}
            />

            {/* Status filter */}
            <DarkPicker
              selectedValue={filters.status}
              onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
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
              selectedValue={filters.method}
              onValueChange={(v) => setFilters((f) => ({ ...f, method: v }))}
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
                onPress={() => setFilters(f => ({ ...f, isOverdue: !f.isOverdue }))}
              >
                <View style={[styles.checkboxBox, filters.isOverdue && styles.checkboxBoxChecked]}>
                  {filters.isOverdue && <Text style={styles.checkmark}>✓</Text>}
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
    alignItems: "center",
    marginBottom: 10,
  },
  paymentId: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  paymentDetails: {
    marginTop: 5,
  },
  paymentAmount: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
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
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  repayButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
});