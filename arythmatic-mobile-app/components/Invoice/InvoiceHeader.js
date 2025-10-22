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
            <Text style={styles.backButtonText}>‹ Back to {backToScreen || 'Previous'}</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Main Header Row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Invoices</Text>
          <Text style={styles.subtitle}>
            {totalCount} total invoices
            {backToScreen && ` • From ${backToScreen}`}
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
          <Text style={styles.addBtnText}>＋ Create</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backButtonRow: {
    marginTop: 6,
    marginBottom: 8,
  },
  backButton: {
    backgroundColor: colors.panel,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  headerRow: {
    marginTop: 6,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { 
    color: colors.text, 
    fontWeight: "700", 
    fontSize: 18 
  },
  subtitle: {
    color: colors.subtext,
    fontSize: 14,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { 
    color: "#fff", 
    fontWeight: "700" 
  },
});

export default InvoiceHeader;
