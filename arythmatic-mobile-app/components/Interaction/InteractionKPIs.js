// components/Interaction/InteractionKPIs.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/config';

const KPI = ({ label, value, color = "#9695D7" }) => (
  <View style={styles.kpiBox}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={[styles.kpiValue, { color }]}>{value}</Text>
  </View>
);

const InteractionKPIs = ({ interactions, totalCount, newCount, inProgressCount, completedCount, cancelledCount }) => {
  const metrics = React.useMemo(() => {
    console.log('🔢 Calculating Interaction KPIs from:', interactions.length, 'interactions');
    console.log('📋 Sample interaction:', interactions[0]);

    // FIXED: Count by status (matching web app exact logic)
    const newCountLocal = newCount ?? interactions.filter((i) => i.status === 'new').length;
    const inProgress = inProgressCount ?? interactions.filter((i) => i.status === 'in_progress').length;
    const completed = completedCount ?? interactions.filter((i) => i.status === 'completed').length;
    const cancelled = cancelledCount ?? interactions.filter((i) => i.status === 'cancelled').length;

    console.log('✅ Calculated Interaction Metrics:', { 
      total: totalCount,
      new: newCount,
      inProgress,
      completed,
      cancelled,
      pageSize: interactions.length 
    });

    return {
      total: totalCount,
      new: newCountLocal,
      inProgress,
      completed,
      cancelled
    };
  }, [interactions, totalCount]);

  return (
    <View style={styles.kpis}>
      <KPI label="Total" value={metrics.total} color="#1890ff" />
      <KPI label="New" value={metrics.new} color="#52c41a" />
      <KPI label="In Progress" value={metrics.inProgress} color="#faad14" />
      <KPI label="Completed" value={metrics.completed} color="#52c41a" />
      <KPI label="Cancelled" value={metrics.cancelled} color="#ff4d4f" />
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

export default InteractionKPIs;
