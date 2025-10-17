// components/CustomerHeader.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';


const CustomerHeader = ({ onAddPress, totalCount }) => {
  return (
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.title}>Customers</Text>
        <Text style={styles.subtitle}>
          {totalCount} total customers
        </Text>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
        <Text style={styles.addBtnText}>＋ Add</Text>
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
  },
  title: { 
    color: colors.text, 
    fontWeight: "700", 
    fontSize: 20 
  },
  subtitle: {
    color: colors.subtext,
    fontSize: 14,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addBtnText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 16,
  },
});

export default CustomerHeader;
