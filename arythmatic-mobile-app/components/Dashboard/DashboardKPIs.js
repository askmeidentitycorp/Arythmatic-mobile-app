// components/Dashboard/DashboardKPIs.js
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/config';

const { width: screenWidth } = Dimensions.get("window");

const KPICard = React.memo(({ label, value, color, icon, isLoading }) => (
  <View style={styles.kpiCard}>
    <View style={styles.kpiHeader}>
      <Text style={styles.kpiLabel}>{label}</Text>
      {icon && <Text style={styles.kpiIcon}>{icon}</Text>}
    </View>
    <Text style={[styles.kpiValue, { color }]}>
      {isLoading ? '...' : value}
    </Text>
  </View>
));

const DashboardKPIs = ({ kpis, loading }) => {
  return (
    <View style={styles.kpiRow}>
      {kpis.map((item, index) => (
        <KPICard
          key={index}
          label={item.label}
          value={item.value}
          color={item.color}
          icon={item.icon}
          isLoading={loading}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  kpiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 16
  },
  kpiCard: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 16,
    width: screenWidth > 600 ? "23%" : "48%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    color: colors.subtext,
    fontSize: 12,
    fontWeight: "600"
  },
  kpiIcon: {
    fontSize: 16,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: "700"
  },
});

export default DashboardKPIs;
