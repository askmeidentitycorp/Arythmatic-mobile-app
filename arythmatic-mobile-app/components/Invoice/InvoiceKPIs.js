// components/Invoice/InvoiceKPIs.js
import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/config';
import { useInvoiceMetrics } from '../../hooks/useInvoices';
import { symbol } from '../../utils/currency';

const InvoiceKPIs = ({ params }) => {
  const { metrics, loading } = useInvoiceMetrics(params);

  // Helper to format currency values from API response
  const joinCurrencies = (obj, key) => {
    if (!obj || Object.keys(obj).length === 0) return '$0';
    const order = Object.keys(obj).sort((a,b) => (a==='USD'? -1 : b==='USD'? 1 : a.localeCompare(b)));
    return order.map(ccy => {
      const val = Number(obj[ccy][key] || 0);
      return `${symbol(ccy)}${val.toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:0})}`;
    }).join(' + ');
  };

  if (loading && !metrics) {
    return (
      <View style={[styles.kpisContainer, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  const safe = metrics || { status_counts: {}, summary_by_currency: {} };
  const sc = safe.status_counts || {};

  const totalValue = joinCurrencies(safe.summary_by_currency, 'total_value');
  const paidValue = joinCurrencies(safe.summary_by_currency, 'paid_value');
  const pendingValue = joinCurrencies(safe.summary_by_currency, 'pending_value');

  return (
    <View style={styles.kpisContainer}>
      {/* Top Row - Main KPIs */}
      <View style={styles.mainKPIRow}>
        <View style={styles.mainKPI}>
          <Text style={styles.mainKPILabel}>Total</Text>
          <Text style={[styles.mainKPIValue, { color: '#1890ff' }]}>{safe.total || 0}</Text>
        </View>
        <View style={styles.mainKPI}>
          <Text style={styles.mainKPILabel}>Total Value</Text>
          <Text style={[styles.mainKPIValue, { color: '#1890ff' }]}>{totalValue}</Text>
        </View>
        <View style={styles.mainKPI}>
          <Text style={styles.mainKPILabel}>Paid</Text>
          <Text style={[styles.mainKPIValue, { color: '#52c41a' }]}>{paidValue}</Text>
        </View>
      </View>
      
      {/* Bottom Row - Status KPIs */}
      <View style={styles.statusKPIRow}>
        <View style={styles.statusKPI}>
          <Text style={styles.statusKPILabel}>Pending</Text>
          <Text style={[styles.statusKPIValue, { color: '#faad14' }]}>{pendingValue}</Text>
        </View>
        <View style={styles.statusKPI}>
          <Text style={styles.statusKPILabel}>Overdue</Text>
          <Text style={[styles.statusKPIValue, { color: '#ff4d4f' }]}>{sc.overdue || 0}</Text>
        </View>
        <View style={styles.statusKPI}>
          <Text style={styles.statusKPILabel}>Draft</Text>
          <Text style={[styles.statusKPIValue, { color: '#8c8c8c' }]}>{sc.draft || 1}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  kpisContainer: {
    marginBottom: 20,
  },
  mainKPIRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  mainKPI: {
    flex: 1,
    alignItems: 'center',
  },
  mainKPILabel: {
    color: colors.subtext,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  mainKPIValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusKPIRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusKPI: {
    flex: 1,
    alignItems: 'center',
  },
  statusKPILabel: {
    color: colors.subtext,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  statusKPIValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default InvoiceKPIs;
