// components/Invoice/InvoiceKPIs.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/config';

const KPI = ({ label, value, color = "#9695D7", isAmount = false }) => (
  <View style={styles.kpiBox}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={[styles.kpiValue, { color }]}>
      {isAmount ? `$${value.toLocaleString()}` : value}
    </Text>
  </View>
);

const InvoiceKPIs = ({ invoices, totalCount }) => {
  const metrics = React.useMemo(() => {
    console.log('🔢 Calculating Invoice KPIs from:', invoices.length, 'invoices');
    console.log('📋 Sample invoice:', invoices[0]);

    // FIXED: Count by status (matching web app exact logic)
    const draft = invoices.filter((i) => i.status === 'draft').length;
    const open = invoices.filter((i) => i.status === 'open').length;
    const sent = invoices.filter((i) => i.status === 'sent').length;
    const partialPaid = invoices.filter((i) => i.status === 'partial_paid').length;
    const fullPaid = invoices.filter((i) => i.status === 'full_paid').length;
    const overdue = invoices.filter((i) => i.status === 'overdue').length;
    const cancelled = invoices.filter((i) => i.status === 'cancelled').length;

    // FIXED: Calculate values from CURRENT PAGE only (matching web)
    const convertToUSD = (amount, currency) => {
      const exchangeRates = {
        USD: 1,
        EUR: 1.1,
        GBP: 1.25,
        INR: 0.012,
      };
      const rate = exchangeRates[currency] || 1;
      return parseFloat(amount || 0) * rate;
    };

    const totalValue = invoices.reduce((sum, invoice) => {
      return sum + convertToUSD(invoice.grossAmount, invoice.currency);
    }, 0);

    const paidValue = invoices.reduce((sum, invoice) => {
      if (invoice.status === 'full_paid') {
        return sum + convertToUSD(invoice.grossAmount, invoice.currency);
      } else if (invoice.status === 'partial_paid') {
        return sum + convertToUSD(
          parseFloat(invoice.grossAmount || 0) - parseFloat(invoice.balanceAmount || 0),
          invoice.currency
        );
      }
      return sum;
    }, 0);

    const pendingValue = invoices.reduce((sum, invoice) => {
      if (['open', 'sent', 'draft'].includes(invoice.status)) {
        return sum + convertToUSD(invoice.grossAmount, invoice.currency);
      } else if (invoice.status === 'partial_paid') {
        return sum + convertToUSD(invoice.balanceAmount, invoice.currency);
      }
      return sum;
    }, 0);

    console.log('✅ Calculated Invoice Metrics:', { 
      total: totalCount,
      draft,
      open,
      sent,
      partialPaid,
      fullPaid,
      overdue,
      cancelled,
      totalValue,
      paidValue,
      pendingValue,
      pageSize: invoices.length 
    });

    return {
      total: totalCount,
      draft,
      open,
      sent,
      partialPaid,
      fullPaid,
      overdue,
      cancelled,
      totalValue,
      paidValue,
      pendingValue
    };
  }, [invoices, totalCount]);

  return (
    <View style={styles.kpis}>
      <KPI label="Total" value={metrics.total} color="#1890ff" />
      <KPI label="Total Value" value={Math.round(metrics.totalValue)} color="#1890ff" isAmount />
      <KPI label="Paid" value={Math.round(metrics.paidValue)} color="#52c41a" isAmount />
      <KPI label="Pending" value={Math.round(metrics.pendingValue)} color="#faad14" isAmount />
      <KPI label="Overdue" value={metrics.overdue} color="#ff4d4f" />
      <KPI label="Draft" value={metrics.draft} color="#8c8c8c" />
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
