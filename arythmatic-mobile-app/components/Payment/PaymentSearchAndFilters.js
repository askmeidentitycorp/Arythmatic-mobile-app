import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';

export default function PaymentSearchAndFilters({ searchQuery, onSearchChange, filters, onFiltersChange, onClearFilters }) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search payments..."
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholderTextColor={colors.subtext}
      />
      <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
        <Text style={styles.filterToggle}>{showFilters ? 'Hide Filters' : 'Advanced Filters'}</Text>
      </TouchableOpacity>
      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.label}>Status</Text>
          <Picker
            selectedValue={filters.status}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
            style={styles.picker}
          >
            <Picker.Item label="Any" value="" />
            <Picker.Item label="Completed" value="Completed" />
            <Picker.Item label="Pending" value="Pending" />
            <Picker.Item label="Refunded" value="Refunded" />
            <Picker.Item label="Voided" value="Voided" />
          </Picker>

          <Text style={styles.label}>Payment Method</Text>
          <Picker
            selectedValue={filters.paymentMethod}
            onValueChange={(value) => onFiltersChange({ ...filters, paymentMethod: value })}
            style={styles.picker}
          >
            <Picker.Item label="Any" value="" />
            <Picker.Item label="Credit Card" value="Credit Card" />
            <Picker.Item label="Paypal" value="Paypal" />
            <Picker.Item label="Bank Transfer" value="Bank Transfer" />
          </Picker>

          <TouchableOpacity onPress={onClearFilters} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchInput: {
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.panel,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterToggle: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  filtersPanel: {
    backgroundColor: colors.panelAlt,
    padding: 10,
    borderRadius: 8,
  },
  label: {
    color: colors.text,
    marginBottom: 4,
  },
  picker: {
    marginBottom: 10,
    color: colors.text,
  },
  clearButton: {
    marginTop: 10,
  },
  clearButtonText: {
    color: colors.bad,
    fontWeight: '600',
  },
});
