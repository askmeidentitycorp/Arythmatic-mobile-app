// components/Dashboard/DashboardChart.js
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/config';

const { width: screenWidth } = Dimensions.get("window");

const BarChart = React.memo(({ data, width, height, loading }) => {
  
  if (loading) {
    return (
      <View style={[styles.chartContainer, { height }]}>
        <Text style={styles.loadingText}>Loading chart...</Text>
      </View>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <View style={[styles.chartContainer, { height }]}>
        <Text style={styles.noDataText}>No chart data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(item => Number(item.value) || 0));
  
  if (maxValue === 0) {
    return (
      <View style={[styles.chartContainer, { height }]}>
        <Text style={styles.noDataText}>No revenue data to display</Text>
      </View>
    );
  }

  return (
    <View style={[styles.chartContainer, { width, height }]}>
      <View style={styles.chartBars}>
        {data.map((item, index) => {
          const itemValue = Number(item.value) || 0;
          const barHeight = maxValue > 0 ? (itemValue / maxValue) * (height - 80) : 0;
          
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, 4), // Minimum height of 4
                      backgroundColor: item.color || colors.primary || '#6B5CE7',
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>
                {item.label || 'N/A'}
              </Text>
              <Text style={styles.barValue}>
                {itemValue > 1000
                  ? `${Math.round(itemValue / 1000)}K`
                  : itemValue
                }
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

const DashboardChart = ({ chartData, loading }) => {
  const chartHeight = 220;
  const chartWidth = screenWidth - 32;
  
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Revenue Performance</Text>
      <BarChart 
        data={chartData} 
        width={chartWidth} 
        height={chartHeight} 
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.panel || colors.bg || '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border || '#e0e0e0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text || '#000000',
    marginBottom: 16,
  },
  chartContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '80%',
    width: '100%',
    paddingHorizontal: 10,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 50,
    minWidth: 30,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.text || '#000000',
    textAlign: 'center',
    marginBottom: 2,
  },
  barValue: {
    fontSize: 8,
    color: colors.subtext || '#666666',
    textAlign: 'center',
  },
  loadingText: {
    color: colors.subtext || '#666666',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    color: colors.subtext || '#666666',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 40,
  },
});

export default DashboardChart;
