// components/Product/ProductKPIs.js
import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/config';
import { useProductMetrics } from '../../hooks/useProducts';

const KPI = ({ label, value, color = "#9695D7" }) => (
  <View style={styles.kpiBox}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={[styles.kpiValue, { color }]}>{value}</Text>
  </View>
);

const ProductKPIs = () => {
  const { totalCount, activeCount, digitalCount, physicalCount, serviceCount, loading } = useProductMetrics();

  if (loading && totalCount === 0) {
    return (
      <View style={[styles.kpis, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.kpis}>
      <KPI label="Total Products" value={totalCount || 0} color="#1890ff" />
      <KPI label="Active" value={activeCount || 0} color="#52c41a" />
      <KPI label="Digital" value={digitalCount || 0} color="#52c41a" />
      <KPI label="Physical" value={physicalCount || 0} color="#faad14" />
      <KPI label="Service" value={serviceCount || 0} color="#722ed1" />
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

export default ProductKPIs;
