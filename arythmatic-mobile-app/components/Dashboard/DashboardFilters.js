// components/Dashboard/DashboardFilters.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { colors } from '../../constants/config';

const DashboardFilters = ({
  currency,
  setCurrency,
  currencyOpen,
  setCurrencyOpen,
  currencyItems,
  dateRange,
  setDateRange,
  dateOpen,
  setDateOpen,
  dateItems,
  onRefresh,
  loading
}) => {
  return (
    <View style={[
      styles.filterRow,
      (currencyOpen || dateOpen) && styles.filterRowElevated
    ]}>
      {/* Currency Selector */}
      <View style={styles.filterBox}>
        <DropDownPicker
          open={currencyOpen}
          value={currency}
          items={currencyItems}
          setOpen={setCurrencyOpen}
          setValue={setCurrency}
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          dropDownContainerStyle={styles.dropdownContainer}
          listMode="SCROLLVIEW"
          zIndex={currencyOpen ? 2000 : 1}
          zIndexInverse={dateOpen ? 3000 : 2000}
          accessibilityLabel="Select currency"
        />
      </View>

      {/* Date Range Selector */}
      <View style={styles.filterBox}>
        <DropDownPicker
          open={dateOpen}
          value={dateRange}
          items={dateItems}
          setOpen={setDateOpen}
          setValue={setDateRange}
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          dropDownContainerStyle={styles.dropdownContainer}
          listMode="SCROLLVIEW"
          zIndex={dateOpen ? 2000 : 1}
          zIndexInverse={currencyOpen ? 3000 : 2000}
          accessibilityLabel="Select date range"
        />
      </View>

      {/* Refresh Button */}
      <TouchableOpacity 
        style={[styles.refreshBtn, loading && styles.refreshBtnDisabled]} 
        onPress={onRefresh}
        disabled={loading}
        accessibilityLabel="Refresh dashboard data"
        accessibilityRole="button"
      >
        <Text style={styles.refreshText}>
          {loading ? '...' : '⟳ Refresh'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderColor: colors.border,
    zIndex: 1,
    position: 'relative',
  },
  filterRowElevated: {
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterBox: { 
    flex: 1, 
    marginRight: 10,
    position: 'relative',
    overflow: 'visible',
  },
  dropdown: { 
    backgroundColor: colors.panel, 
    borderColor: colors.border, 
    minHeight: 44,
  },
  dropdownText: { 
    color: colors.text, 
    fontSize: 14 
  },
  dropdownContainer: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 2000,
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
  },
  refreshBtn: { 
    backgroundColor: colors.primary, 
    paddingVertical: 10, 
    paddingHorizontal: 12, 
    borderRadius: 6,
  },
  refreshBtnDisabled: {
    backgroundColor: colors.subtext,
    opacity: 0.6,
  },
  refreshText: { 
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "700" 
  },
});

export default DashboardFilters;
