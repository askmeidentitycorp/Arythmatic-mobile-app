// components/Product/ProductKPIs.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/config';

const KPI = ({ label, value, color = "#9695D7" }) => (
  <View style={styles.kpiBox}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={[styles.kpiValue, { color }]}>{value}</Text>
  </View>
);

const ProductKPIs = ({ products, totalCount }) => {
  const metrics = React.useMemo(() => {
    console.log('Calculating Product KPIs from:', products.length, 'products');
    console.log('Sample product data:', products[0]);

    // FIXED: Count by productType (matching web app logic)
    const digital = products.filter((p) => p.productType === 'digital').length;
    const physical = products.filter((p) => p.productType === 'physical').length;
    const service = products.filter((p) => p.productType === 'service').length;

    // FIXED: Count active by isActive field (NOT status field)
    const active = products.filter((p) => p.isActive === true).length;
    const inactive = products.filter((p) => p.isActive === false).length;

    console.log('Calculated Product Metrics:', {
      total: totalCount,
      digital,
      physical,
      service,
      active,
      inactive,
      pageSize: products.length 
    });

    return {
      total: totalCount,
      digital,
      physical,
      service,
      active
    };
  }, [products, totalCount]);

  return (
    <View style={styles.kpis}>
      <KPI label="Total" value={metrics.total} color="#1890ff" />
      <KPI label="Active" value={metrics.active} color="#52c41a" />
      <KPI label="Digital" value={metrics.digital} color="#52c41a" />
      <KPI label="Physical" value={metrics.physical} color="#faad14" />
      <KPI label="Service" value={metrics.service} color="#722ed1" />
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
