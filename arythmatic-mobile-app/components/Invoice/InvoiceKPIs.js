// components/Invoice/InvoiceKPIs.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/config';
import { useInvoiceMetrics } from '../../hooks/useInvoices';
import { symbol } from '../../utils/currency';

const KPI = ({ label, value, color = "#9695D7", isAmount = false }) => (
  <View style={styles.kpiBox}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={[styles.kpiValue, { color }]}>
      {isAmount ? `$${value.toLocaleString()}` : value}
    </Text>
  </View>
);

const InvoiceKPIs = () => {
  const { metrics, loading } = useInvoiceMetrics();

  const joinCurrencies = (obj, key) => {
    if (!obj) return '$0';
    const order = Object.keys(obj).sort((a,b) => (a==='USD'? -1 : b==='USD'? 1 : a.localeCompare(b)));
    return order.map(ccy => `${symbol(ccy)}${Number(obj[ccy][key] || 0).toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:0})}`).join(' + ');
  };

  const safe = metrics || { status_counts: {}, summary_by_currency: {} };
  const sc = safe.status_counts || {};

  const k = {
    total: safe.total || 0,
    totalValue: joinCurrencies(safe.summary_by_currency, 'total_value'),
    paidValue: joinCurrencies(safe.summary_by_currency, 'paid_value'),
    pendingValue: joinCurrencies(safe.summary_by_currency, 'pending_value'),
    draft: sc.draft || 0,
    open: sc.open || 0,
    sent: sc.sent || 0,
    partialPaid: sc.partial_paid || 0,
    fullPaid: sc.full_paid || 0,
    overdue: sc.overdue || 0,
    cancelled: sc.cancelled || 0,
  };

  return (
    <View style={styles.kpis}>
      <KPI label="Total" value={k.total} color="#1890ff" />
      <KPI label="Total Value" value={k.totalValue} color="#1890ff" />
      <KPI label="Paid" value={k.paidValue} color="#52c41a" />
      <KPI label="Pending" value={k.pendingValue} color="#faad14" />
      <KPI label="Overdue" value={k.overdue} color="#ff4d4f" />
      <KPI label="Draft" value={k.draft} color="#8c8c8c" />
    </View>
  );
};

const styles = StyleSheet.create({
  kpis: {
    marginBottom: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  kpiBox: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 10,
    width: "31%",
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  kpiLabel: {
    color: colors.subtext,
    fontSize: 11
  },
  kpiValue: {
    fontWeight: "700",
    fontSize: 16,
    marginTop: 2
  },
});

export default InvoiceKPIs;
