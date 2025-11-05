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

const SalesRepKPIs = ({ loading: parentLoading, totalCount: tcProp, activeCount: acProp, salesAgentCount: sacProp, adminCount: admcProp }) => {
  // If counts are provided, use them; otherwise fetch via hook
  const useHook = tcProp === undefined || acProp === undefined || sacProp === undefined || admcProp === undefined;
  const hook = useHook ? useSalesRepMetrics() : {};

  const totalCount = useHook ? hook.totalCount : tcProp;
  const activeCount = useHook ? hook.activeCount : acProp;
  const salesAgentCount = useHook ? hook.salesAgentCount : sacProp;
  const adminCount = useHook ? hook.adminCount : admcProp;
  const metricsLoading = useHook ? hook.loading : false;

  const isLoading = parentLoading || metricsLoading;

  return (
    <View style={styles.kpis}>
      <KPI 
        label="Total Reps" 
        value={isLoading ? "..." : String(totalCount || 0)} 
        color={colors.primary} 
      />
      <KPI 
        label="Active" 
        value={isLoading ? "..." : String(activeCount || 0)} 
        color="#31C76A" 
      />
      <KPI 
        label="Sales Agents" 
        value={isLoading ? "..." : String(salesAgentCount || 0)} 
        color="#6B5CE7" 
      />
      <KPI 
        label="Admins" 
        value={isLoading ? "..." : String(adminCount || 0)} 
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
