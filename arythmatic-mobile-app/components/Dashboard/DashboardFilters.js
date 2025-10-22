// components/Dashboard/DashboardFilters.js
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { colors } from '../../constants/config';

const SimplePicker = ({ label, value, items, onValueChange, selectedKey }) => {
  const [showModal, setShowModal] = useState(false);
  const displayValue = items.find(item => item.value === value)?.label || label;

  return (
    <>
      <TouchableOpacity 
        style={styles.pickerButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.pickerText}>{displayValue}</Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>
      
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {items.map((item, index) => (
                <TouchableOpacity
                  key={item.key || item.value || index}
                  style={[
                    styles.modalItem,
                    item.value === value && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setShowModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    item.value === value && styles.modalItemTextSelected
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
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
  },
  filterBox: { 
    flex: 1, 
    marginRight: 10,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalClose: {
    fontSize: 18,
    color: colors.subtext,
    padding: 4,
  },
  modalList: {
    maxHeight: 200,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemSelected: {
    backgroundColor: colors.primary + '20',
  },
  modalItemText: {
    fontSize: 14,
    color: colors.text,
  },
  modalItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
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
