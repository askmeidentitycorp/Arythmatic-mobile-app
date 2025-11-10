// screens/InvoiceScreen.js
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { colors } from '../constants/config';

// Import hooks and components
import CustomerPagination from '../components/Customer/CustomerPagination';
import DarkPicker from '../components/Customer/DarkPicker';
import InvoiceCard from '../components/Invoice/InvoiceCard';
import InvoiceHeader from '../components/Invoice/InvoiceHeader';
import InvoiceKPIs from '../components/Invoice/InvoiceKPIs';
import InvoiceSearchAndFilters from '../components/Invoice/InvoiceSearchAndFilters';
import { useInvoiceMutations, useInvoices } from '../hooks/useInvoices';
import { customerService } from '../services/customerService';
import { invoiceService } from '../services/invoiceService';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/authConfig';
import { BASE_URL } from '../services/apiClient';

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LabeledInput = ({ label, value, onChangeText, placeholder, keyboardType, multiline, ...rest }) => {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { height: 80, textAlignVertical: "top" }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.subtext}
        keyboardType={keyboardType}
        multiline={multiline}
        {...rest}
      />
    </View>
  );
};

const TwoCol = ({ children }) => {
  const kids = React.Children.toArray(children);
  return <View style={styles.twoCol}>{kids}</View>;
};

export default function InvoiceScreen({ initialCustomerId, initialCustomerName }) {
  const [nameCache, setNameCache] = useState({});
  const fetchingIdsRef = React.useRef(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    currency: '',
  });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    invoiceNumber: "",
    customer: "",
    status: "draft",
    currency: "USD",
    dueDate: "",
    paymentTerms: "Net 30",
    discountAmount: 0,
    soldBy: "",
    notes: "",
    taxRate: 18,
    taxes: [],
    items: [{ id: Date.now().toString(), name: "", qty: 1, price: 0 }],
  });
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("Details");
  const [openActionsId, setOpenActionsId] = useState(null);
  const [modalActiveTab, setModalActiveTab] = useState(0);
  const [searchParams, setSearchParams] = useState({});
  const [customerFilter, setCustomerFilter] = useState(null);

  // Animation for actions menu
  const actionsMenuAnim = React.useRef(new Animated.Value(0)).current;

  // Apply initial customer filter
  useEffect(() => {
    if (initialCustomerId && initialCustomerName) {
      setCustomerFilter({ id: initialCustomerId, name: initialCustomerName });
    }
  }, [initialCustomerId, initialCustomerName]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = { search: searchQuery };

      // Map status values to API-expected ones
      if (filters.status) {
        const statusMap = { paid: 'full_paid', void: 'cancelled' };
        params.status = statusMap[filters.status] || filters.status;
      }
      if (filters.currency) params.currency = filters.currency;

      if (customerFilter) params.customer = customerFilter.id;
      setSearchParams(params);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, customerFilter]);

  // API hooks - FIXED: Added hasMore to destructuring
  const { 
    invoices, 
    loading, 
    error, 
    pagination, 
    refresh, 
    goToPage,
    hasMore  // ADDED THIS
  } = useInvoices(searchParams, 10, true);

  const {
    createInvoice,
    updateInvoice,
    deleteInvoice,
  } = useInvoiceMutations();

  // Animation effect for actions menu
  useEffect(() => {
    if (openActionsId) {
      Animated.timing(actionsMenuAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(actionsMenuAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [openActionsId]);

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
      currency: '',
    });
  };

  const getEmptyForm = () => ({
    invoiceNumber: "",
    customer: "",
    status: "draft",
    currency: "USD",
    dueDate: "",
    paymentTerms: "Net 30",
    discountAmount: 0,
    soldBy: "",
    notes: "",
    taxRate: 18,
    taxes: [],
    items: [{ id: Date.now().toString(), name: "", qty: 1, price: 0 }],
  });

  const openAddModal = () => {
    setEditingId(null);
    setForm(getEmptyForm());
    setShowAdd(true);
    setModalActiveTab(0);
    setOpenActionsId(null);
  };

  const openEditModal = (invoice) => {
    setEditingId(invoice.id);
    setForm({
      invoiceNumber: invoice.invoiceNumber || invoice.invoice_number || "",
      customer: invoice.customer_details?.displayName || 
                invoice.customer_details?.firstName + ' ' + (invoice.customer_details?.lastname || '') ||
                invoice.customer_details?.name || 
                invoice.customer || "",
      status: invoice.status || "draft",
      currency: invoice.currency || "USD",
      dueDate: invoice.dueDate || invoice.due_date || "",
      paymentTerms: invoice.paymentTerms || invoice.payment_terms || "Net 30",
      discountAmount: invoice.discountAmount || invoice.discount_amount || 0,
      soldBy: invoice.soldBy || invoice.sold_by || "",
      notes: invoice.notes || "",
      taxRate: invoice.taxRate || invoice.tax_rate || 18,
      taxes: invoice.taxes || [],
      items: invoice.line_items?.map(item => ({
        id: item.id?.toString() || Date.now().toString(),
        name: item.name || item.product_name || "",
        qty: item.qty || item.quantity || 1,
        price: item.price || item.amount || 0,
      })) || [{ id: Date.now().toString(), name: "", qty: 1, price: 0 }],
    });
    setShowAdd(true);
    setModalActiveTab(0);
    setOpenActionsId(null);
  };

  // Export CSV handler - downloads file per platform
  const handleExportCSV = async () => {
    try {
      const pageSize = 200;
      let page = 1;
      let rows = [];
      while (true) {
        const res = await invoiceService.getAll({ ...searchParams, page, page_size: pageSize });
        const list = res?.results || res || [];
        rows = rows.concat(list);
        if (!res?.next || list.length === 0) break;
        page += 1;
      }

      const headers = ['invoice_number','customer','status','currency','due_date','payment_terms','sub_total','tax_amount','total_amount','created_at','updated_at'];
      const csv = [headers.join(',')].concat(
        rows.map(inv => {
          const row = {
            invoice_number: inv.invoiceNumber || inv.invoice_number || '',
            customer: inv.customer_details?.displayName || inv.customer || '',
            status: inv.status || '',
            currency: inv.currency || '',
            due_date: inv.dueDate || inv.due_date || '',
            payment_terms: inv.paymentTerms || inv.payment_terms || '',
            sub_total: inv.subtotal || inv.sub_total || 0,
            tax_amount: inv.taxAmount || inv.tax_amount || 0,
            total_amount: inv.totalAmount || inv.total_amount || inv.grossAmount || inv.gross_amount || 0,
            created_at: inv.created_at || '',
            updated_at: inv.updated_at || '',
          };
          return headers.map(h => JSON.stringify(String(row[h] ?? ''))).join(',');
        })
      ).join('\n');

      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'invoices.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (Platform.OS === 'android') {
        const filename = `invoices_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
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
        const fileUri = FileSystem.cacheDirectory + `invoices_${Date.now()}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export CSV' });
        } else {
          Alert.alert('Export complete', `Saved to temporary file: ${fileUri}`);
        }
      }
    } catch (error) {
      Alert.alert('Export Failed', error.message || 'Could not export CSV');
    }
  };

  const handleAction = async (invoice, action) => {
    switch (action) {
      case "View Invoice":
        const lineItems = invoice.line_items || [];
        const itemsText = lineItems.length > 0 
          ? lineItems.map(item => `• ${item.name || item.product_name}: ${item.quantity || item.qty} x $${item.price || item.amount || 0}`).join('\n')
          : 'No line items';
        
        const totalAmount = lineItems.reduce((sum, item) => sum + ((item.quantity || item.qty || 1) * (item.price || item.amount || 0)), 0);
        
        Alert.alert(
          `Invoice #${invoice.invoiceNumber || invoice.invoice_number}`,
          `Customer: ${invoice.customer_details?.displayName || invoice.customer_details?.firstName + ' ' + (invoice.customer_details?.lastname || '') || invoice.customer_details?.name || invoice.customer || 'N/A'}\n` +
          `Status: ${invoice.status || 'Unknown'}\n` +
          `Currency: ${invoice.currency || 'USD'}\n` +
          `Due Date: ${invoice.dueDate || invoice.due_date || 'N/A'}\n` +
          `Payment Terms: ${invoice.paymentTerms || invoice.payment_terms || 'N/A'}\n` +
          `Total Amount: $${totalAmount.toFixed(2)}\n\n` +
          `Line Items:\n${itemsText}\n\n` +
          `Notes: ${invoice.notes || 'No notes'}`,
          [
            { text: "OK", style: "default" },
            { 
              text: "View Payments", 
              onPress: () => {
                console.log(`Navigate to payments for invoice: ${invoice.invoiceNumber || invoice.invoice_number}`);
                // Could navigate to payments screen with invoice filter
              } 
            }
          ]
        );
        break;

      case "Edit Invoice":
        openEditModal(invoice);
        break;

      case "Duplicate":
        const duplicateData = {
          ...form,
          invoiceNumber: `${invoice.invoiceNumber || invoice.invoice_number}-COPY`,
          customer: invoice.customer_details?.displayName || invoice.customer,
          status: "draft",
          currency: invoice.currency || "USD",
          dueDate: invoice.dueDate || invoice.due_date || "",
          paymentTerms: invoice.paymentTerms || invoice.payment_terms || "Net 30",
          soldBy: invoice.soldBy || invoice.sold_by || "",
          notes: invoice.notes || "",
          taxRate: invoice.taxRate || invoice.tax_rate || 18,
          taxes: (invoice.taxes || []).map(t => ({ name: t.name || t.label || '', rate: t.rate || t.percent || 0 })),
          items: (invoice.line_items || []).map(item => ({
            id: Date.now().toString() + Math.random(),
            name: item.name || item.product_name || "",
            qty: item.qty || item.quantity || 1,
            price: item.price || item.amount || 0,
          })),
        };
        setForm(duplicateData);
        setEditingId(null);
        setShowAdd(true);
        setModalActiveTab(0);
        break;

      // Hidden: Send Invoice (no endpoint available)

      case "Mark as Draft":
      case "Mark as Open":
      // Hidden: Mark as Paid (no endpoint available)
      case "Mark as Void":
        const statusMap = {
          "Mark as Draft": "draft",
          "Mark as Open": "open",
          "Mark as Paid": "full_paid",
          "Mark as Void": "cancelled",
        };
        try {
          if (action === 'Mark as Paid') {
            await invoiceService.markAsPaid(invoice.id);
          } else {
            await updateInvoice(invoice.id, { status: statusMap[action] }, false, true);
          }
          refresh();
          Alert.alert("Success", `Invoice status updated to ${statusMap[action]}`);
        } catch (error) {
          Alert.alert("Error", error.message || "Failed to update invoice status");
        }
        break;

      case "Record Payment":
        Alert.alert(
          "Record Payment",
          `Record a payment for invoice ${invoice.invoiceNumber || invoice.invoice_number}?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Record",
              onPress: () => {
                console.log(`Navigate to record payment for invoice: ${invoice.id}`);
                // Could navigate to payments screen or show payment modal
                Alert.alert("Info", "Payment recording feature - navigate to Payments screen");
              },
            },
          ]
        );
        break;

      case "Download PDF":
        Alert.alert(
          "Download PDF",
          `Generate PDF for invoice ${invoice.invoiceNumber || invoice.invoice_number}?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Generate",
              onPress: async () => {
                try {
                  const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
                  const url = `${BASE_URL}/invoices/${invoice.id}/pdf/`;
                  const fileUri = `${FileSystem.cacheDirectory}invoice_${invoice.id}.pdf`;
                  const result = await FileSystem.downloadAsync(url, fileUri, {
                    headers: token ? { Authorization: `Token ${token}` } : {},
                  });
                  if (result?.status === 200) {
                    Alert.alert('Download complete', `Saved to: ${fileUri}`);
                  } else {
                    throw new Error(`Download failed with status ${result?.status}`);
                  }
                } catch (error) {
                  Alert.alert("Error", error.message || "Failed to generate/download PDF");
                }
              },
            },
          ]
        );
        break;

      case "Audit History":
        Alert.alert(
          "Audit History",
          `Invoice: ${invoice.invoiceNumber || invoice.invoice_number}\n\n` +
          `Created: ${invoice.created_at || 'N/A'}\n` +
          `Updated: ${invoice.updated_at || 'N/A'}\n` +
          `Status: ${invoice.status || 'Unknown'}\n\n` +
          `Full audit trail would show all changes, who made them, and when.`,
          [{ text: "OK" }]
        );
        break;

      case "Delete":
        Alert.alert(
          "Confirm Delete",
          `Delete invoice ${invoice.invoiceNumber || invoice.invoice_number}? This cannot be undone.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                try {
                  await deleteInvoice(invoice.id, true);
                  refresh();
                  Alert.alert("Success", "Invoice deleted successfully");
                } catch (error) {
                  Alert.alert("Error", "Failed to delete invoice");
                }
              },
            },
          ]
        );
        break;

      default:
        Alert.alert("Action", `${action} clicked for ${invoice.invoiceNumber || invoice.invoice_number}`);
    }
    setOpenActionsId(null);
  };

  const onSubmitAddOrEdit = async () => {
    const required = ["customer", "status", "dueDate", "currency"];
    const missing = required.filter((k) => !String(form[k] || "").trim());

    if (missing.length) {
      Alert.alert("Missing fields", `Please fill: ${missing.join(", ")}`);
      return;
    }

    // Auto-generate invoice number if empty
    const invoiceNumber = form.invoiceNumber?.trim() || `INV-${Date.now()}`;

    const invoiceData = {
      invoiceNumber,
      customer: form.customer.trim(),
      status: form.status,
      currency: form.currency,
      dueDate: form.dueDate,
      paymentTerms: form.paymentTerms,
      discountAmount: parseFloat(form.discountAmount) || 0,
      soldBy: form.soldBy.trim(),
      notes: form.notes.trim(),
      taxRate: parseFloat(form.taxRate) || 0,
      taxes: (form.taxes || []).map(t => ({ name: t.name || '', rate: parseFloat(t.rate) || 0 })),
      line_items: form.items.map(item => ({
        name: item.name,
        quantity: parseInt(item.qty) || 1,
        price: parseFloat(item.price) || 0,
      })),
    };

    try {
      if (editingId) {
        await updateInvoice(editingId, invoiceData, true, false);
        Alert.alert("Success", "Invoice updated successfully");
      } else {
        await createInvoice(invoiceData, true);
        Alert.alert("Success", "Invoice created successfully");
      }

      setShowAdd(false);
      setForm(getEmptyForm());
      setModalActiveTab(0);
      setEditingId(null);
      refresh();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to save invoice");
    }
  };

  const updateItem = (idx, patch) => {
    setForm((f) => {
      const items = [...f.items];
      items[idx] = { ...items[idx], ...patch };
      return { ...f, items };
    });
  };

  const addItem = () => {
    setForm((f) => ({
      ...f,
      items: [...f.items, { id: Date.now().toString(), name: "", qty: 1, price: 0 }],
    }));
  };

  const removeItem = (idx) => {
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== idx),
    }));
  };

  // Calculate totals
  const calc = React.useMemo(() => {
    const items = form.items || [];
    const sub = items.reduce((sum, it) => sum + (parseInt(it.qty) || 0) * (parseFloat(it.price) || 0), 0);
    const discount = parseFloat(form.discountAmount) || 0;
    const subAfterDiscount = Math.max(0, sub - discount);

    // If taxes array present, sum rates; else fallback to single taxRate
    let tax = 0;
    if (Array.isArray(form.taxes) && form.taxes.length > 0) {
      const combinedRate = form.taxes.reduce((sum, t) => sum + (parseFloat(t.rate) || 0), 0);
      tax = (combinedRate / 100) * subAfterDiscount;
    } else {
      tax = ((parseFloat(form.taxRate) || 0) / 100) * subAfterDiscount;
    }

    const total = subAfterDiscount + tax;

    return { sub, discount, tax, total };
  }, [form]);

  const formatMoney = (n, currency = form.currency) => {
    const currencySymbols = {
      'USD': '$',
      'EUR': '€',
      'INR': '₹',
      'GBP': '£'
    };

    const symbol = currencySymbols[currency] || currency || '';
    const val = isFinite(n) ? n : 0;
    return `${symbol} ${val.toFixed(2)}`;
  };

  // Loading state
  if (loading && invoices.length === 0) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading invoices...</Text>
      </View>
    );
  }

  // Error state
  if (error && invoices.length === 0) {
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
        <InvoiceHeader 
          onAddPress={openAddModal}
          onExportPress={handleExportCSV}
          totalCount={pagination.totalCount}
        />

        {/* KPIs */}
        <InvoiceKPIs />

        {/* Search and Filters */}
        <InvoiceSearchAndFilters
          searchQuery={searchQuery}
          filters={filters}
          onSearchChange={handleSearchChange}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Invoice Cards */}
        {(invoices || []).map((invoice) => {
          const expanded = expandedId === invoice.id;
          const actionsVisible = openActionsId === invoice.id;

          // Resolve customer name by id when needed
          const cid = invoice?.customer_details?.id 
            || invoice?.customer_id 
            || (typeof invoice?.customer === 'string' ? invoice.customer : null);
          const displayName = cid && nameCache[cid] ? nameCache[cid] : undefined;
          if (cid && !displayName && !fetchingIdsRef.current.has(cid)) {
            fetchingIdsRef.current.add(cid);
            customerService.getById(cid)
              .then((resp) => {
                const c = resp?.data || resp;
                const dn = c?.displayName || c?.name || c?.full_name || c?.email;
                if (dn) setNameCache(prev => ({ ...prev, [cid]: dn }));
              })
              .finally(() => fetchingIdsRef.current.delete(cid));
          }

          const invoiceForRender = displayName 
            ? { ...invoice, customer_details: { ...(invoice.customer_details || {}), displayName } } 
            : invoice;

          return (
            <View key={invoice.id}>
              <InvoiceCard
                invoice={invoiceForRender}
                expanded={expanded}
                activeTab={activeTab}
                actionsVisible={actionsVisible}
                onToggleExpand={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setExpandedId(expanded ? null : invoice.id);
                  setActiveTab("Details");
                }}
                onAction={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setOpenActionsId(actionsVisible ? null : invoice.id);
                }}
                onTabChange={setActiveTab}
              />

              {/* Actions Menu */}
              {actionsVisible && (
                <View style={styles.actionsMenu}>
                  {[
                    "View Invoice",
                    "Edit Invoice",
                    "Duplicate",
                    // hidden: Send Invoice (endpoint not present in API)
                    // hidden: Mark as Paid (endpoint not present in API)
                    "Record Payment",
                    "Download PDF",
                    "Audit History",
                    "Delete",
                  ].map((action, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.actionRow}
                      onPress={() => handleAction(invoice, action)}
                    >
                      <Text style={styles.actionText}>{action}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Empty State */}
        {invoices.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No invoices found</Text>
            <Text style={styles.emptySubText}>Create your first invoice to get started</Text>
          </View>
        )}

        {/* Pagination */}
        {(invoices.length > 0 || pagination.totalCount > 0) && (
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

      {/* Create/Edit Invoice Modal */}
      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? "Edit Invoice" : "Create Invoice"}</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsRow}>
              {["Invoice Details", "Line Items", "Taxes"].map((t, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.tabBtn, modalActiveTab === i && styles.tabBtnActive]}
                  onPress={() => setModalActiveTab(i)}
                >
                  <Text style={[styles.tabText, modalActiveTab === i && styles.tabTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Body */}
            <ScrollView style={{ padding: 14, maxHeight: 500 }}>
              {modalActiveTab === 0 && (
                <>
                  <LabeledInput
                    label="Invoice Number"
                    value={form.invoiceNumber}
                    onChangeText={(v) => setForm((f) => ({ ...f, invoiceNumber: v }))}
                    placeholder="Auto-generated if empty"
                  />
                  <LabeledInput
                    label="Customer *"
                    value={form.customer}
                    onChangeText={(v) => setForm((f) => ({ ...f, customer: v }))}
                    placeholder="Customer name"
                  />

                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.inputLabel}>Status *</Text>
                    <DarkPicker
                      selectedValue={form.status}
                      onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                      items={[
                        { label: "Draft", value: "draft" },
                        { label: "Open", value: "open" },
                        { label: "Sent", value: "sent" },
                        { label: "Partial Paid", value: "partial_paid" },
                        { label: "Full Paid", value: "full_paid" },
                        { label: "Overdue", value: "overdue" },
                        { label: "Cancelled", value: "cancelled" },
                      ]}
                      placeholder="Select Status"
                    />
                  </View>

                  <LabeledInput
                    label="Due Date *"
                    value={form.dueDate}
                    onChangeText={(v) => setForm((f) => ({ ...f, dueDate: v }))}
                    placeholder="YYYY-MM-DD"
                  />

                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.inputLabel}>Payment Terms</Text>
                    <DarkPicker
                      selectedValue={form.paymentTerms}
                      onValueChange={(v) => setForm((f) => ({ ...f, paymentTerms: v }))}
                      items={[
                        { label: "Net 15", value: "Net 15" },
                        { label: "Net 30", value: "Net 30" },
                        { label: "Due on receipt", value: "Due on receipt" },
                      ]}
                      placeholder="Select Terms"
                    />
                  </View>

                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.inputLabel}>Currency *</Text>
                    <DarkPicker
                      selectedValue={form.currency}
                      onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}
                      items={[
                        { label: "USD ($)", value: "USD" },
                        { label: "EUR (€)", value: "EUR" },
                        { label: "INR (₹)", value: "INR" },
                        { label: "GBP (£)", value: "GBP" },
                      ]}
                      placeholder="Select Currency"
                    />
                  </View>

                  <LabeledInput
                    label="Discount Amount"
                    value={String(form.discountAmount)}
                    onChangeText={(v) => setForm((f) => ({ ...f, discountAmount: v }))}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />

                  <LabeledInput
                    label="Sold By"
                    value={form.soldBy}
                    onChangeText={(v) => setForm((f) => ({ ...f, soldBy: v }))}
                    placeholder="Sales rep name"
                  />

                  <LabeledInput
                    label="Notes"
                    value={form.notes}
                    onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
                    placeholder="Additional notes..."
                    multiline
                  />

                  {/* Preview Totals */}
                  <View style={styles.previewBox}>
                    <View style={styles.rowJustify}>
                      <Text style={styles.subtle}>Subtotal</Text>
                      <Text style={styles.subtle}>{formatMoney(calc.sub)}</Text>
                    </View>
                    <View style={styles.rowJustify}>
                      <Text style={styles.subtle}>Discount</Text>
                      <Text style={styles.subtle}>– {formatMoney(calc.discount)}</Text>
                    </View>
                    <View style={styles.rowJustify}>
                      <Text style={styles.subtle}>Tax ({form.taxRate || 0}%)</Text>
                      <Text style={styles.subtle}>{formatMoney(calc.tax)}</Text>
                    </View>
                    <View style={styles.rowJustify}>
                      <Text style={[styles.subtle, { fontWeight: "700" }]}>Total</Text>
                      <Text style={[styles.subtle, { fontWeight: "700" }]}>{formatMoney(calc.total)}</Text>
                    </View>
                  </View>
                </>
              )}

              {modalActiveTab === 2 && (
                <>
                  {(form.taxes || []).map((tx, idx) => (
                    <View key={tx.id || `tax_${idx}`} style={styles.itemRow}>
                      <TextInput
                        placeholder="Tax name (e.g., VAT)"
                        placeholderTextColor={colors.subtext}
                        value={tx.name || ''}
                        onChangeText={(v) => setForm(f => { const taxes = [...(f.taxes||[])]; taxes[idx] = { ...taxes[idx], name: v }; return { ...f, taxes }; })}
                        style={[styles.input, { flex: 1 }]}
                      />
                      <TextInput
                        placeholder="Rate %"
                        placeholderTextColor={colors.subtext}
                        value={String(tx.rate ?? '')}
                        onChangeText={(v) => setForm(f => { const taxes = [...(f.taxes||[])]; taxes[idx] = { ...taxes[idx], rate: v }; return { ...f, taxes }; })}
                        keyboardType="decimal-pad"
                        style={[styles.input, styles.itemQty]}
                      />
                      <TouchableOpacity onPress={() => setForm(f => ({ ...f, taxes: (f.taxes||[]).filter((_, i) => i !== idx) }))}>
                        <Text style={{ color: "#ff6b6b", fontSize: 18 }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity onPress={() => setForm(f => ({ ...f, taxes: [...(f.taxes||[]), { id: Date.now().toString(), name: '', rate: '' }] }))}>
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>＋ Add Tax</Text>
                  </TouchableOpacity>
                </>
              )}

              {modalActiveTab === 1 && (
                <>
                  {form.items.map((it, idx) => (
                    <View key={it.id} style={styles.itemRow}>
                      <TextInput
                        placeholder="Item name"
                        placeholderTextColor={colors.subtext}
                        value={it.name}
                        onChangeText={(v) => updateItem(idx, { name: v })}
                        style={[styles.input, styles.itemName]}
                      />
                      <TextInput
                        placeholder="Qty"
                        placeholderTextColor={colors.subtext}
                        value={String(it.qty)}
                        onChangeText={(v) => updateItem(idx, { qty: v })}
                        keyboardType="numeric"
                        style={[styles.input, styles.itemQty]}
                      />
                      <TextInput
                        placeholder="Price"
                        placeholderTextColor={colors.subtext}
                        value={String(it.price)}
                        onChangeText={(v) => updateItem(idx, { price: v })}
                        keyboardType="decimal-pad"
                        style={[styles.input, styles.itemPrice]}
                      />
                      <TouchableOpacity onPress={() => removeItem(idx)}>
                        <Text style={{ color: "#ff6b6b", fontSize: 18 }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity style={styles.btnGhost} onPress={addItem}>
                    <Text style={styles.btnGhostText}>＋ Add Line Item</Text>
                  </TouchableOpacity>

                  <View style={styles.previewBox}>
                    <View style={styles.rowJustify}>
                      <Text style={styles.subtle}>Subtotal</Text>
                      <Text style={styles.subtle}>{formatMoney(calc.sub)}</Text>
                    </View>
                    <View style={styles.rowJustify}>
                      <Text style={styles.subtle}>Total (pre-tax)</Text>
                      <Text style={styles.subtle}>{formatMoney(Math.max(0, calc.sub - calc.discount))}</Text>
                    </View>
                  </View>
                </>
              )}

              {modalActiveTab === 2 && (
                <>
                  <LabeledInput
                    label="Tax Rate (%)"
                    value={String(form.taxRate)}
                    onChangeText={(v) => setForm((f) => ({ ...f, taxRate: v }))}
                    placeholder="e.g., 18"
                    keyboardType="decimal-pad"
                  />

                  <View style={styles.previewBox}>
                    <View style={styles.rowJustify}>
                      <Text style={styles.subtle}>Tax Amount</Text>
                      <Text style={styles.subtle}>{formatMoney(calc.tax)}</Text>
                    </View>
                    <View style={styles.rowJustify}>
                      <Text style={[styles.subtle, { fontWeight: "700" }]}>Grand Total</Text>
                      <Text style={[styles.subtle, { fontWeight: "700" }]}>{formatMoney(calc.total)}</Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnGhost} onPress={() => setShowAdd(false)}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={onSubmitAddOrEdit}>
                <Text style={styles.btnPrimaryText}>{editingId ? "Save Changes" : "Create Invoice"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

/* ---------- Styles ---------- */
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
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubText: {
    color: colors.subtext,
    fontSize: 14,
    textAlign: "center",
  },
  actionsMenu: {
    position: "absolute",
    right: 10,
    top: 40,
    backgroundColor: colors.panel,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    zIndex: 999,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    minWidth: 160,
  },
  actionRow: {
    paddingVertical: 6
  },
  actionText: {
    color: colors.text,
    fontSize: 14
  },
  rowJustify: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  },
  subtle: {
    color: colors.subtext,
    fontSize: 12
  },
  input: {
    backgroundColor: colors.panel,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  inputLabel: {
    color: colors.subtext,
    marginBottom: 4,
    fontSize: 13,
    fontWeight: "600"
  },
  btnGhost: {
    backgroundColor: "#162136",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 6,
  },
  btnGhostText: {
    color: colors.text,
    fontWeight: "700",
    textAlign: "center"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: "90%",
  },
  modalHeader: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 16,
    flex: 1
  },
  closeX: {
    color: colors.subtext,
    fontSize: 18,
    paddingHorizontal: 6
  },
  tabsRow: {
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    gap: 6,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  tabBtnActive: {
    backgroundColor: "#162136"
  },
  tabText: {
    color: colors.subtext,
    fontWeight: "700",
    fontSize: 12
  },
  tabTextActive: {
    color: colors.text
  },
  modalFooter: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "800"
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8
  },
  itemName: {
    flex: 1
  },
  itemQty: {
    width: 70,
    textAlign: "right"
  },
  itemPrice: {
    width: 110,
    textAlign: "right"
  },
  previewBox: {
    backgroundColor: "#0e1728",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  twoCol: {
    flexDirection: "row",
    gap: 12,
  },
});
