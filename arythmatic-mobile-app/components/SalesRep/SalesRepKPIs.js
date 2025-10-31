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

const SalesRepKPIs = ({ loading: parentLoading, totalCount: tcProp, activeCount: acProp, inactiveCount: icProp }) => {
  // If counts are provided, use them; otherwise fetch via hook
  const useHook = tcProp === undefined || acProp === undefined || icProp === undefined;
  const hook = useHook ? useSalesRepMetrics() : {};

  const totalCount = useHook ? hook.totalCount : tcProp;
  const activeCount = useHook ? hook.activeCount : acProp;
  const inactiveCount = useHook ? hook.inactiveCount : icProp;
  const metricsLoading = useHook ? hook.loading : false;

  const isLoading = parentLoading || metricsLoading;

  const perf = !isLoading && totalCount > 0 ? `${Math.round((activeCount/totalCount)*100)}%` : (isLoading ? '...' : '0%');

  return (
    <View style={styles.kpis}>
      <KPI 
        label="Total Reps" 
        value={isLoading ? "..." : String(totalCount || 0)} 
        color={colors.primary} 
      />
      <KPI 
        label="Active Reps" 
        value={isLoading ? "..." : String(activeCount || 0)} 
        color="#31C76A" 
      />
      <KPI 
        label="Inactive Reps" 
        value={isLoading ? "..." : String(inactiveCount || 0)} 
        color="#F16364" 
      />
      <KPI 
        label="Performance" 
        value={perf} 
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
