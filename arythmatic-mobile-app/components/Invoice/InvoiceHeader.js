// components/Invoice/InvoiceHeader.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';

const InvoiceHeader = ({ onAddPress, onExportPress, totalCount }) => {
  return (
    <>
      {/* Main Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Invoice Management</Text>
          <Text style={styles.subtitle}>
            Total Invoices: {totalCount}
          </Text>
        </View>
        <View style={styles.actionsContainer}>
          {onExportPress && (
            <TouchableOpacity style={styles.exportBtn} onPress={onExportPress}>
              <Text style={styles.exportBtnText}>Export</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
            <Text style={styles.addBtnText}>＋ Create Invoice</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    marginTop: 6,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: 'wrap',
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: { 
    color: colors.text, 
    fontWeight: "700", 
    fontSize: 18 
  },
  subtitle: {
    color: colors.subtext,
    fontSize: 12,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  exportBtn: {
    backgroundColor: colors.panel,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  exportBtnText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
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
    fontSize: 14,
  },
});

export default InvoiceHeader;
