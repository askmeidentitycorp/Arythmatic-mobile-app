// components/Customer/CustomerKPIs.js

import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/config';
import { useCustomerMetrics } from '../../hooks/useCustomers';

const KPI = ({ label, value, color = "#9695D7" }) => (
  <View style={styles.kpiBox}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={[styles.kpiValue, { color }]}>{value}</Text>
  </View>
);

const CustomerKPIs = () => {
  const { totalCount, individualCount, businessCount, activeCount, loading } = useCustomerMetrics();

  if (loading && totalCount === 0) {
    return (
      <View style={[styles.kpis, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.kpis}>
      <KPI label="Total Customers" value={totalCount || 0} color="#4CAF50" />
      <KPI label="Individual" value={individualCount || 0} color="#2196F3" />
      <KPI label="Business" value={businessCount || 0} color="#FF9800" />
      <KPI label="Active" value={activeCount || 0} color="#9C27B0" />
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
    padding: 12,
    width: "48%",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kpiLabel: {
    color: colors.subtext,
    fontSize: 13
  },
  kpiValue: {
    fontWeight: "700",
    fontSize: 20,
    marginTop: 4,
  },
});

export default CustomerKPIs;
