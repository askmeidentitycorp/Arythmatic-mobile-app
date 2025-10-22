// components/Dashboard/DashboardPanel.js
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/config';

const DashboardPanel = ({ title, children }) => (
  <View style={styles.panel}>
    <View style={styles.panelHeader}>
      <Text style={styles.panelTitle}>{title}</Text>
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
});

export default DashboardPanel;
