// components/CustomerHeader.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';


const CustomerHeader = ({ onAddPress, onExport, totalCount }) => {
  return (
    <View style={styles.headerRow}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Customers</Text>
        {!!(totalCount || totalCount === 0) && (
          <Text style={styles.subtitle}>{totalCount} total</Text>
        )}
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.addBtn, styles.exportBtn]} onPress={onExport}>
          <Text style={styles.exportText}>Export CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    marginTop: 6,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: { 
    color: colors.text, 
    fontWeight: "700", 
    fontSize: 20 
  },
  subtitle: {
    color: colors.subtext,
    fontSize: 12,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 16,
  },
  exportBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  exportText: {
    color: colors.text,
    fontWeight: '700',
  },
});

export default CustomerHeader;
