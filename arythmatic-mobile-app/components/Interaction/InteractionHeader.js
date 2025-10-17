// components/Interaction/InteractionHeader.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';

const InteractionHeader = ({ onAddPress, totalCount, repFilter, onClearRepFilter, onBack }) => {
  return (
    <View>
      {/* Back Button */}
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back to Sales Reps</Text>
        </TouchableOpacity>
      )}

      {/* Active Rep Filter */}
      {repFilter && (
        <View style={styles.activeFilterContainer}>
          <Text style={styles.activeFilterText}>
            Showing interactions for: {repFilter.name}
          </Text>
          <TouchableOpacity onPress={onClearRepFilter}>
            <Text style={styles.clearFilterText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header Row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Interactions</Text>
          <Text style={styles.subtitle}>{totalCount} total interactions</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
          <Text style={styles.addBtnText}>＋ Create</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  activeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(150, 149, 215, 0.15)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  activeFilterText: {
    color: colors.text,
    fontWeight: '600',
  },
  clearFilterText: {
    color: colors.primary,
    fontWeight: '700',
  },
  headerRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 18,
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
    fontWeight: "700",
  },
});

export default InteractionHeader;
