// components/Product/ProductHeader.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';

const ProductHeader = ({ onAddPress, totalCount }) => {
  return (
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.title}>Products</Text>
        <Text style={styles.subtitle}>{totalCount} total products</Text>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
        <Text style={styles.addBtnText}>＋ Add</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: { 
    color: "#fff", 
    fontWeight: "700" 
  },
});

export default ProductHeader;
