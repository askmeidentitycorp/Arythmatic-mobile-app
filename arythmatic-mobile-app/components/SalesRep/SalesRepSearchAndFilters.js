// components/SalesRep/SalesRepSearchAndFilters.js
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';
import DarkPicker from '../Customer/DarkPicker';

const SalesRepSearchAndFilters = ({ 
  searchQuery, 
  onSearchChange, 
  filters, 
  onFiltersChange,
  onClearFilters 
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <View style={styles.container}>
      {/* Quick Search */}
      <TextInput
        placeholder="Search by name, email, ID"
        placeholderTextColor="#9aa6bf"
        value={searchQuery}
        onChangeText={onSearchChange}
        style={styles.searchInput}
      />

      {/* Filters Toggle */}
      <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
        <Text style={styles.filterToggle}>
          {showFilters ? "Hide Filters" : "Advanced Filters"}
        </Text>
      </TouchableOpacity>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          {/* Status filter */}
          <DarkPicker
            selectedValue={filters.status}
            onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
            items={[
              { label: "All Status", value: "" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            placeholder="All Status"
          />

          {/* Role filter */}
          <DarkPicker
            selectedValue={filters.role}
            onValueChange={(v) => onFiltersChange({ ...filters, role: v })}
            items={[
              { label: "All Roles", value: "" },
              { label: "Sales Agent", value: "sales_agent" },
              { label: "Admin", value: "admin" },
              { label: "Sales Manager", value: "sales_manager" },
            ]}
            placeholder="All Roles"
          />

          {/* Sort */}
          <DarkPicker
            selectedValue={filters.sort}
            onValueChange={(v) => onFiltersChange({ ...filters, sort: v })}
            items={[
              { label: "Sort: Name (A-Z)", value: "name_asc" },
              { label: "Sort: Name (Z-A)", value: "name_desc" },
              { label: "Sort: Created (Newest)", value: "created_desc" },
              { label: "Sort: Created (Oldest)", value: "created_asc" },
            ]}
            placeholder="Sort"
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
    marginBottom: 12,
  },
  filterToggle: {
    color: colors.primary,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 4,
  },
  filtersPanel: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.panel,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    marginBottom: 8,
  },
  clearButton: {
    backgroundColor: "#162136",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 6,
  },
  clearButtonText: { 
    color: colors.text, 
    fontWeight: "700", 
    textAlign: "center" 
  },
});

export default SalesRepSearchAndFilters;
