// components/Invoice/InvoiceSearchAndFilters.js
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';
import DarkPicker from '../Customer/DarkPicker';

const InvoiceSearchAndFilters = ({ 
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
          <TextInput
            placeholder="Search by number, customer, sales rep..."
            placeholderTextColor="#9aa6bf"
            value={searchQuery}
            onChangeText={onSearchChange}
            style={styles.input}
            autoCorrect={false}
            autoCapitalize="none"
          />

          <View style={styles.filtersRow}>
            <View style={styles.filterItem}>
              <Text style={styles.inputLabel}>Status</Text>
              <DarkPicker
                selectedValue={filters.status}
                onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
                items={[
                  { label: "All Status", value: "" },
                  { label: "Draft", value: "draft" },
                  { label: "Open", value: "open" },
                  { label: "Sent", value: "sent" },
                  { label: "Paid", value: "paid" },
                  { label: "Void", value: "void" },
                ]}
                placeholder="All Status"
              />
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.inputLabel}>Currency</Text>
              <DarkPicker
                selectedValue={filters.currency}
                onValueChange={(v) => onFiltersChange({ ...filters, currency: v })}
                items={[
                  { label: "All Currencies", value: "" },
                  { label: "USD ($)", value: "USD" },
                  { label: "EUR (€)", value: "EUR" },
                  { label: "INR (₹)", value: "INR" },
                  { label: "GBP (£)", value: "GBP" },
                ]}
                placeholder="All Currencies"
              />
            </View>
          </View>

          {/* Period filter (align with Dashboard) */}
          <View style={styles.filtersRow}>
            <View style={styles.filterItem}>
              <Text style={styles.inputLabel}>Date Range</Text>
              <DarkPicker
                selectedValue={filters.dateRange || ''}
                onValueChange={(v) => onFiltersChange({ ...filters, dateRange: v })}
                items={[
                  { label: 'All Time', value: '' },
                  { label: 'This Week', value: 'This Week' },
                  { label: 'This Month', value: 'This Month' },
                  { label: 'This Quarter', value: 'This Quarter' },
                  { label: 'This Year', value: 'This Year' },
                ]}
                placeholder="All Time"
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
  filterItem: {
    flex: 1,
    marginRight: 8,
  },
  input: {
    backgroundColor: colors.panel,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    marginBottom: 12,
  },
  inputLabel: { 
    color: colors.subtext, 
    marginBottom: 4, 
    fontSize: 13, 
    fontWeight: "600" 
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
    textAlign: "center" 
  },
});

export default InvoiceSearchAndFilters;
