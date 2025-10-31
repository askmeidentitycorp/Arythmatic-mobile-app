// components/SalesRep/SalesRepHeader.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';

const SalesRepHeader = ({ onAddPress, onExport, totalCount }) => {
  return (
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.title}>Sales Representatives</Text>
        {!!(totalCount || totalCount === 0) && (
          <Text style={styles.subtitle}>{totalCount} total reps</Text>
        )}
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.addBtn, styles.exportBtn]} onPress={onExport}>
          <Text style={styles.exportBtnText}>Export CSV</Text>
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  exportBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  exportBtnText: {
    color: colors.text,
    fontWeight: '700',
  },
});

export default SalesRepHeader;
