// components/Dashboard/ActivityItem.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/config';

const ActivityItem = React.memo(({ activity }) => {
  // Safety checks
  if (!activity) {
    return (
      <View style={styles.activityItem}>
        <Text style={styles.activityAction}>No activity data</Text>
      </View>
    );
  }

  return (
    <View style={styles.activityItem}>
      <View style={styles.activityContent}>
        <Text style={styles.activityAction} numberOfLines={2}>
          {activity.action || 'Unknown activity'}
        </Text>
        <Text style={styles.activityCustomer}>
          {activity.customer || 'Unknown user'}
        </Text>
      </View>
      <Text style={styles.activityTime}>
        {activity.time || 'Unknown time'}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || '#e0e0e0',
  },
  activityContent: {
    flex: 1,
    marginRight: 8,
  },
  activityAction: {
    color: colors.text || '#000000',
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  activityCustomer: {
    color: colors.subtext || '#666666',
    fontSize: 12,
    marginTop: 2,
  },
  activityTime: {
    color: colors.subtext || '#666666',
    fontSize: 11,
    minWidth: 50,
    textAlign: 'right',
  },
});

export default ActivityItem;
