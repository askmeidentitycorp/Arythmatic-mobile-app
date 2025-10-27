// components/CustomerHeader.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';


const CustomerHeader = ({ onAddPress, totalCount }) => {
  return (
    <View style={styles.headerRow}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Customers</Text>
        <Text style={styles.subtitle}>
          {totalCount} total
        </Text>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
        <Text style={styles.addBtnText}>＋</Text>
      </TouchableOpacity>
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

export default CustomerHeader;
