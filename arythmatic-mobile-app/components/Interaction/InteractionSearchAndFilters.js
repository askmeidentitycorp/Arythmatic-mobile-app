// components/Interaction/InteractionSearchAndFilters.js
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';
import DarkPicker from '../Customer/DarkPicker';

const InteractionSearchAndFilters = ({ 
  searchQuery, 
  onSearchChange, 
  filters, 
  onFiltersChange,
  onClearFilters 
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <View style={styles.container}>
      {/* Filters Toggle */}
      <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
        <Text style={styles.filterToggle}>
          {showFilters ? "Hide Filters ▴" : "Advanced Filters ▾"}
        </Text>
      </TouchableOpacity>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          {/* Search */}
          <TextInput
            style={styles.input}
            placeholder="Search customer, rep, type..."
            placeholderTextColor={colors.subtext}
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCorrect={false}
            autoCapitalize="none"
          />

          <View style={styles.filtersRow}>
            <View style={styles.dropdownContainer}>
              <DarkPicker
                selectedValue={filters.status}
                onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
                items={[
                  { label: "All Status", value: "" },
                  { label: "New", value: "new" },
                  { label: "In Progress", value: "in_progress" },
                  { label: "Completed", value: "completed" },
                ]}
                placeholder="All Status"
              />
            </View>
            <View style={styles.dropdownContainer}>
              <DarkPicker
                selectedValue={filters.priority}
                onValueChange={(v) => onFiltersChange({ ...filters, priority: v })}
                items={[
                  { label: "All Priority", value: "" },
                  { label: "Low", value: "low" },
                  { label: "Medium", value: "medium" },
                  { label: "High", value: "high" },
                ]}
                placeholder="All Priority"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.clearButton} onPress={onClearFilters}>
            <Text style={styles.clearButtonText}>Clear All</Text>
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
  filtersRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  dropdownContainer: {
    flex: 1,
    minWidth: 120,
  },
  input: {
    backgroundColor: colors.panel,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    color: colors.text,
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: colors.panel,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearButtonText: {
    color: colors.text,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default InteractionSearchAndFilters;
