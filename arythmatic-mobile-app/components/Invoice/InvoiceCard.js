// components/Invoice/InvoiceCard.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase();
    
    if (statusLower === "paid" || statusLower === "full_paid") {
      return { bg: "rgba(49,199,106,0.12)", br: "#31C76A", fg: "#31C76A" };
    } else if (statusLower === "open" || statusLower === "sent") {
      return { bg: "rgba(244,183,64,0.15)", br: "#6b5221", fg: "#F4B740" };
    } else if (statusLower === "void" || statusLower === "cancelled") {
      return { bg: "rgba(241,99,100,0.15)", br: "#70373a", fg: "#F16364" };
    } else {
      return { bg: "rgba(167,174,192,0.1)", br: "#2a3450", fg: "#A7AEC0" }; // Draft
    }
  };
  
  const config = getStatusConfig(status);
  
  return (
    <View style={[styles.pill, { 
      backgroundColor: config.bg, 
      borderColor: config.br 
    }]}>
      <Text style={[styles.pillText, { color: config.fg }]}>
        {status || 'Draft'}
      </Text>
    </View>
  );
};

const Tag = ({ label }) => {
  return (
    <View style={[styles.pill, { 
      backgroundColor: "rgba(107,92,231,0.15)", 
      borderColor: "#3f387e" 
    }]}>
      <Text style={[styles.pillText, { color: "#A6A4FF" }]}>{label}</Text>
    </View>
  );
};

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    if (String(d) === "Invalid Date" || !iso) return "—";
    return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } catch {
    return "—";
  }
};

const formatMoney = (amount, currency) => {
  if (!amount && amount !== 0) return "—";
  
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'INR': '₹',
    'GBP': '£'
  };
  
  const symbol = currencySymbols[currency] || currency || '';
  const numAmount = parseFloat(amount) || 0;
  
  return `${symbol} ${numAmount.toFixed(2)}`;
};

const InvoiceCard = ({ 
  invoice, 
  expanded, 
  activeTab, 
  onToggle, 
  onAction,
  onTabChange 
}) => {
  // Extract data with API field mapping
  const invoiceNumber = invoice.invoiceNumber || invoice.invoice_number || invoice.number || "—";
  const customerName = invoice.customer_details?.displayName || 
                      invoice.customer_details?.name || 
                      invoice.customer || 
                      "Unknown Customer";
  
  const status = invoice.status || "draft";
  const currency = invoice.currency || "USD";
  const dueDate = invoice.dueDate || invoice.due_date || "—";
  const paymentTerms = invoice.paymentTerms || invoice.payment_terms || "—";
  const soldBy = invoice.soldBy || invoice.sold_by || invoice.sales_rep_name || "—";
  const notes = invoice.notes || "—";
  
  // Calculate totals from line items or use provided amounts
  const lineItems = invoice.line_items || invoice.items || [];
  const subtotal = invoice.subtotal || invoice.sub_total || 0;
  const taxAmount = invoice.taxAmount || invoice.tax_amount || 0;
  const totalAmount = invoice.totalAmount || invoice.total_amount || invoice.grossAmount || invoice.gross_amount || 0;
  const discountAmount = invoice.discountAmount || invoice.discount_amount || 0;

  return (
    <View style={styles.card}>
      {/* Top row */}
      <TouchableOpacity
        style={styles.rowBetween}
        activeOpacity={0.9}
        onPress={onToggle}
      >
        <View>
          <Text style={styles.name}>{invoiceNumber}</Text>
          <Text style={styles.subtle}>Customer: {customerName}</Text>
          <Text style={styles.muted}>ID: {invoice.id}</Text>
        </View>
        <StatusBadge status={status} />
      </TouchableOpacity>

      {/* Tags */}
      <View style={styles.rowWrap}>
        <Tag label={`Due: ${dueDate}`} />
        <Tag label={currency} />
        <Tag label={`Items: ${lineItems.length}`} />
      </View>

      {/* Amount Summary */}
      <View style={{ marginTop: 8 }}>
        <Text style={styles.muted}>
          Subtotal: {formatMoney(subtotal, currency)} • Tax: {formatMoney(taxAmount, currency)} • Total: {formatMoney(totalAmount, currency)}
        </Text>
      </View>

      {/* Meta */}
      <View style={{ marginTop: 6 }}>
        <Text style={styles.subtle}>CREATED: {formatDate(invoice.created_at)}</Text>
        <Text style={styles.subtle}>UPDATED: {formatDate(invoice.updated_at)}</Text>
      </View>

      {/* Expanded View */}
      {expanded && (
        <View style={styles.expandedBox}>
          <View style={styles.tabRow}>
            <TouchableOpacity
              onPress={() => onTabChange("Details")}
              style={[styles.tabBtn, activeTab === "Details" && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, activeTab === "Details" && styles.tabTextActive]}>
                Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onTabChange("Items")}
              style={[styles.tabBtn, activeTab === "Items" && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, activeTab === "Items" && styles.tabTextActive]}>
                Items
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onTabChange("Payment")}
              style={[styles.tabBtn, activeTab === "Payment" && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, activeTab === "Payment" && styles.tabTextActive]}>
                Payment
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "Details" && (
            <View style={styles.tabContent}>
              <Text style={styles.detailText}>Number: {invoiceNumber}</Text>
              <Text style={styles.detailText}>Customer: {customerName}</Text>
              <Text style={styles.detailText}>Status: {status}</Text>
              <Text style={styles.detailText}>Currency: {currency}</Text>
              <Text style={styles.detailText}>Due Date: {dueDate}</Text>
              <Text style={styles.detailText}>Payment Terms: {paymentTerms}</Text>
              <Text style={styles.detailText}>Sold By: {soldBy}</Text>
              <Text style={styles.detailText}>Notes: {notes}</Text>
            </View>
          )}

          {activeTab === "Items" && (
            <View style={styles.tabContent}>
              {lineItems.map((item, index) => (
                <View key={item.id || index} style={styles.itemRow}>
                  <Text style={[styles.detailText, { flex: 1 }]}>
                    {item.name || item.product_name || item.description}
                  </Text>
                  <Text style={styles.detailText}>Qty: {item.qty || item.quantity || 0}</Text>
                  <Text style={styles.detailText}>
                    {formatMoney(item.price || item.amount || 0, currency)}
                  </Text>
                </View>
              ))}
              <View style={[styles.rowJustify, { marginTop: 8 }]}>
                <Text style={styles.detailText}>Subtotal:</Text>
                <Text style={styles.detailText}>{formatMoney(subtotal, currency)}</Text>
              </View>
              <View style={styles.rowJustify}>
                <Text style={styles.detailText}>Discount:</Text>
                <Text style={styles.detailText}>{formatMoney(discountAmount, currency)}</Text>
              </View>
              <View style={styles.rowJustify}>
                <Text style={styles.detailText}>Tax:</Text>
                <Text style={styles.detailText}>{formatMoney(taxAmount, currency)}</Text>
              </View>
              <View style={[styles.rowJustify, { marginTop: 4 }]}>
                <Text style={[styles.detailText, { fontWeight: "bold" }]}>Total:</Text>
                <Text style={[styles.detailText, { fontWeight: "bold" }]}>
                  {formatMoney(totalAmount, currency)}
                </Text>
              </View>
            </View>
          )}

          {activeTab === "Payment" && (
            <View style={styles.tabContent}>
              <Text style={styles.detailText}>Status: {status}</Text>
              <Text style={styles.detailText}>Due Date: {dueDate}</Text>
              <Text style={styles.detailText}>Payment Terms: {paymentTerms}</Text>
              <Text style={styles.detailText}>Total Amount: {formatMoney(totalAmount, currency)}</Text>
              <Text style={styles.detailText}>Created: {formatDate(invoice.created_at)}</Text>
              <Text style={styles.detailText}>Last Updated: {formatDate(invoice.updated_at)}</Text>
            </View>
          )}
        </View>
      )}

      {/* Actions toggle */}
      <TouchableOpacity
        onPress={onAction}
        style={styles.dotsButton}
      >
        <Text style={styles.dotsText}>⋮</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "visible",
  },
  name: { 
    color: colors.text, 
    fontWeight: "700", 
    fontSize: 15 
  },
  subtle: { 
    color: colors.subtext, 
    fontSize: 12 
  },
  muted: { 
    color: "#7e88a6", 
    fontSize: 11 
  },
  rowWrap: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 6, 
    marginBottom: 6 
  },
  rowBetween: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start" 
  },
  rowJustify: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 6 
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginRight: 6,
    marginBottom: 6,
  },
  pillText: { 
    fontSize: 12, 
    fontWeight: "600" 
  },
  expandedBox: { 
    marginTop: 8, 
    borderTopWidth: 1, 
    borderTopColor: colors.border, 
    paddingTop: 8 
  },
  tabRow: { 
    flexDirection: "row", 
    marginBottom: 10 
  },
  tabBtn: { 
    marginRight: 10, 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 6 
  },
  tabBtnActive: { 
    backgroundColor: colors.primary 
  },
  tabText: { 
    color: colors.subtext, 
    fontSize: 13 
  },
  tabTextActive: { 
    color: "#fff", 
    fontWeight: "700" 
  },
  tabContent: { 
    marginBottom: 10 
  },
  detailText: { 
    color: colors.text, 
    fontSize: 13, 
    marginBottom: 4 
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  dotsButton: { 
    position: "absolute", 
    right: 10, 
    top: 10, 
    paddingHorizontal: 8, 
    paddingVertical: 4 
  },
  dotsText: { 
    fontSize: 20, 
    color: colors.subtext 
  },
});

export default InvoiceCard;
