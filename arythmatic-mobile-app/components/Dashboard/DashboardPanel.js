// components/Dashboard/DashboardPanel.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';

const DashboardPanel = ({ title, children, onViewAll, showAll, loading }) => (
  <View style={styles.panel}>
    <View style={styles.panelHeader}>
      <Text style={styles.panelTitle}>{title}</Text>
      <TouchableOpacity 
        onPress={onViewAll} 
        style={styles.panelButton}
        disabled={loading}
        accessibilityLabel={showAll ? `Show less ${title.toLowerCase()}` : `View all ${title.toLowerCase()}`}
        accessibilityRole="button"
      >
        <Text style={styles.panelButtonText}>
          {loading ? '...' : showAll ? "Show Less" : "View All"}
        </Text>
      </TouchableOpacity>
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  panel: { 
    backgroundColor: colors.panel, 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  panelHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 12 
  },
  panelTitle: { 
    color: colors.text, 
    fontWeight: "700", 
    fontSize: 16 
  },
  panelButton: { 
    backgroundColor: colors.primary + "20", 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 6 
  },
  panelButtonText: { 
    color: colors.primary, 
    fontSize: 12, 
    fontWeight: "600" 
  },
});

export default DashboardPanel;
