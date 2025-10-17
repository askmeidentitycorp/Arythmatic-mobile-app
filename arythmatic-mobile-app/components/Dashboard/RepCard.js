// components/Dashboard/RepCard.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/config';

const RepCard = React.memo(({ rep }) => {
  // Safety checks
  if (!rep) {
    return (
      <View style={styles.repCard}>
        <Text style={styles.repName}>No rep data</Text>
      </View>
    );
  }

  return (
    <View style={styles.repCard}>
      <View style={styles.repHeader}>
        <Text style={styles.repName} numberOfLines={1}>
          {rep.name || 'Unknown Rep'}
        </Text>
      </View>
      <View style={styles.repStats}>
        <View style={styles.repStat}>
          <Text style={styles.repStatLabel}>Revenue</Text>
          <Text style={styles.repStatValue}>
            {rep.revenue || '$0'}
          </Text>
        </View>
        <View style={styles.repStat}>
          <Text style={styles.repStatLabel}>Deals</Text>
          <Text style={styles.repStatValue}>
            {rep.deals || 0}
          </Text>
        </View>
        <View style={styles.repStat}>
          <Text style={styles.repStatLabel}>Win Rate</Text>
          <Text style={styles.repStatValue}>
            {rep.winRate || '0%'}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  repCard: {
    backgroundColor: colors.panel || colors.bg || '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border || '#e0e0e0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  repHeader: {
    marginBottom: 8,
  },
  repName: {
    color: colors.text || '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  repStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  repStat: {
    alignItems: 'center',
    flex: 1,
  },
  repStatLabel: {
    color: colors.subtext || '#666666',
    fontSize: 10,
    marginBottom: 2,
  },
  repStatValue: {
    color: colors.text || '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default RepCard;
