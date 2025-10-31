// components/Dashboard/DashboardFilters.js
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { colors } from '../../constants/config';

const SimplePicker = ({ label, value, items, onValueChange, selectedKey }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const displayValue = items.find(item => item.value === value)?.label || label;

  return (
    <View style={styles.pickerContainer}>
      <TouchableOpacity 
        style={styles.pickerButton}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text style={styles.pickerText}>{displayValue}</Text>
        <Text style={[styles.pickerArrow, showDropdown && styles.pickerArrowUp]}>▼</Text>
      </TouchableOpacity>
      
      {showDropdown && (
        <View style={styles.dropdown}>
          <ScrollView style={styles.dropdownList} nestedScrollEnabled>
            {items.map((item, index) => (
              <TouchableOpacity
                key={item.key || item.value || index}
                style={[
                  styles.dropdownItem,
                  item.value === value && styles.dropdownItemSelected
                ]}
                onPress={() => {
                  onValueChange(item.value);
                  setShowDropdown(false);
                }}
              >
                <Text style={[
                  styles.dropdownItemText,
                  item.value === value && styles.dropdownItemTextSelected
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {showDropdown && (
        <TouchableOpacity 
          style={styles.dropdownOverlay} 
          activeOpacity={1} 
          onPress={() => setShowDropdown(false)}
        />
      )}
    </View>
  );
};

const DashboardFilters = ({
  currency,
  setCurrency,
  currencyItems,
  dateRange,
  setDateRange,
  dateItems,
  onRefresh,
  loading
}) => {
  return (
    <View style={styles.filterRow}>
      {/* Currency Selector */}
      <View style={styles.filterBox}>
        <SimplePicker
          label="Currency"
          value={currency}
          items={currencyItems}
          onValueChange={setCurrency}
        />
      </View>

      {/* Date Range Selector */}
      <View style={styles.filterBox}>
        <SimplePicker
          label="Date Range"
          value={dateRange}
          items={dateItems}
          onValueChange={setDateRange}
        />
      </View>

      {/* Refresh Button */}
      <TouchableOpacity 
        style={[styles.refreshBtn, loading && styles.refreshBtnDisabled]} 
        onPress={onRefresh}
        disabled={loading}
      >
        <Text style={styles.refreshText}>
          {loading ? '...' : 'Refresh'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    flexWrap: 'wrap',
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  filterBox: { 
    flexGrow: 1,
    flexBasis: '48%',
    marginRight: 10,
    marginBottom: 8,
    zIndex: 1000,
  },
  pickerContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  pickerButton: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  pickerText: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
  },
  pickerArrow: {
    color: colors.subtext,
    fontSize: 12,
    transform: [{ rotate: '0deg' }],
  },
  pickerArrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    zIndex: 1001,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primary + '20',
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.text,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  refreshBtn: { 
    backgroundColor: colors.primary, 
    paddingVertical: 10, 
    paddingHorizontal: 12, 
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
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
