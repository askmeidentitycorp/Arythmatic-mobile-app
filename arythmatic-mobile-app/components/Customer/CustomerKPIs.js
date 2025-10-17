// components/Customer/CustomerKPIs.js

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/config';

const KPI = ({ label, value, color = "#9695D7" }) => (
  <View style={styles.kpiBox}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={[styles.kpiValue, { color }]}>{value}</Text>
  </View>
);

const CustomerKPIs = ({ customers = [], totalCount = 0 }) => {
  const metrics = React.useMemo(() => {
    // FIXED: Add safety check for undefined customers
    if (!customers || !Array.isArray(customers)) {
      console.log('⚠️ CustomerKPIs: customers is not an array:', customers);
      return {
        total: totalCount,
        individual: 0,
        business: 0,
        active: 0
      };
    }

    console.log('🔢 Calculating KPIs from customers:', customers.length);
    console.log('📋 Sample customer data:', customers[0]);

    // Count by type (Individual/Business)
    const individual = customers.filter((c) => c?.type === "Individual").length;
    const business = customers.filter((c) => c?.type === "Business").length;

    // FIXED: Count active based on is_deleted field (NOT status field)
    // Web app: customer.is_deleted ? 'deleted' : 'active'
    const active = customers.filter((c) => c?.is_deleted === false || !c?.is_deleted).length;
    const deleted = customers.filter((c) => c?.is_deleted === true).length;

    console.log('✅ Calculated metrics:', {
      total: totalCount,
      individual,
      business,
      active,
      deleted,
      pageSize: customers.length
    });

    return {
      total: totalCount,
      individual,
      business,
      active
    };
  }, [customers, totalCount]);

  return (
    <View style={styles.kpis}>
      <KPI label="Total Customers" value={metrics.total} color="#4CAF50" />
      <KPI label="Individual" value={metrics.individual} color="#2196F3" />
      <KPI label="Business" value={metrics.business} color="#FF9800" />
      <KPI label="Active" value={metrics.active} color="#9C27B0" />
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
