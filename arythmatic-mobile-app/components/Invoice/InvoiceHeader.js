// components/Invoice/InvoiceHeader.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';

const InvoiceHeader = ({ onAddPress, totalCount, onBackPress, backToScreen }) => {
  return (
    <>
      {/* Back Button Row - Show when navigated from another screen */}
      {onBackPress && (
        <View style={styles.backButtonRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          {backToScreen && (
            <Text style={styles.backToText}>Back to {backToScreen}</Text>
          )}
        </View>
      )}
      
      {/* Main Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Invoices</Text>
          <Text style={styles.subtitle}>
            {totalCount} total
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
          <Text style={styles.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backButtonRow: {
    marginTop: 6,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    backgroundColor: colors.panel,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 24,
  },
  backToText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  headerRow: {
    marginTop: 6,
    marginBottom: 12,
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
    fontSize: 18 
  },
  subtitle: {
    color: colors.subtext,
    fontSize: 12,
    marginTop: 4,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 50,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 24,
    lineHeight: 24,
  },
});

export default InvoiceHeader;
