// components/CustomerSearchAndFilters.js
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';
import DarkPicker from './DarkPicker'; // Move DarkPicker to separate file

const CustomerSearchAndFilters = ({ 
  searchQuery, 
  onSearchChange, 
  filters, 
  onFiltersChange,
  onClearFilters 
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <TextInput
        placeholder="Search customers..."
        placeholderTextColor="#9aa6bf"
        value={searchQuery}
        onChangeText={onSearchChange}
        style={styles.searchInput}
      />

      {/* Filters Toggle */}
      <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
        <Text style={styles.filterToggle}>
          {showFilters ? "Hide Filters ▴" : "Advanced Filters ▾"}
        </Text>
      </TouchableOpacity>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <DarkPicker
            selectedValue={filters.status}
            onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
            items={[
              { label: "All Status", value: "" },
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ]}
            placeholder="All Status"
          />

          <DarkPicker
            selectedValue={filters.type}
            onValueChange={(v) => onFiltersChange({ ...filters, type: v })}
            items={[
              { label: "All Types", value: "" },
              { label: "Individual", value: "Individual" },
              { label: "Business", value: "Business" },
            ]}
            placeholder="All Types"
          />

          <DarkPicker
            selectedValue={filters.countryCode}
            onValueChange={(v) => onFiltersChange({ ...filters, countryCode: v })}
            items={[
              { label: "All Countries", value: "" },
              { label: "India", value: "IN" },
              { label: "United States", value: "US" },
              { label: "Canada", value: "CA" },
              { label: "United Kingdom", value: "GB" },
            ]}
            placeholder="All Countries"
          />

          <TouchableOpacity style={styles.clearButton} onPress={onClearFilters}>
            <Text style={styles.clearButtonText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchInput: {
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.panel,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  filterToggle: {
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 15,
  },
  filtersPanel: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  clearButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default CustomerSearchAndFilters;
