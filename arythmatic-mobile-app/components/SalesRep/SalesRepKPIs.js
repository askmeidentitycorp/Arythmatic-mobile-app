// components/SalesRep/SalesRepKPIs.js
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/config';
import { useSalesRepMetrics } from '../../hooks/useSalesReps';

const KPI = ({ label, value, color = colors.primary }) => (
  <View style={styles.kpiBox}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={[styles.kpiValue, { color }]}>{value}</Text>
  </View>
);

const SalesRepKPIs = ({ loading: parentLoading }) => {
  const { 
    totalCount, 
    activeCount, 
    inactiveCount, 
    loading: metricsLoading 
  } = useSalesRepMetrics();

  const isLoading = parentLoading || metricsLoading;

  return (
    <View style={styles.kpis}>
      <KPI 
        label="Total Reps" 
        value={isLoading ? "..." : totalCount.toString()} 
        color={colors.primary} 
      />
      <KPI 
        label="Active Reps" 
        value={isLoading ? "..." : activeCount.toString()} 
        color="#31C76A" 
      />
      <KPI 
        label="Inactive Reps" 
        value={isLoading ? "..." : inactiveCount.toString()} 
        color="#F16364" 
      />
      <KPI 
        label="Performance" 
        value={isLoading ? "..." : activeCount > 0 ? `${Math.round((activeCount/totalCount)*100)}%` : "0%"} 
        color="#F4B740" 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  kpis: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 16
  },
  kpiBox: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 14,
    width: "48%",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kpiLabel: { 
    color: colors.subtext, 
    fontSize: 12, 
    fontWeight: "600",
    marginBottom: 4,
  },
  kpiValue: { 
    fontWeight: "700", 
    fontSize: 18 
  },
});

export default SalesRepKPIs;
