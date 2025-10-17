// components/common/DarkPicker.js
import { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../../constants/config';

const DarkPicker = ({ 
  selectedValue, 
  onValueChange, 
  items, 
  placeholder = "Select an option", 
  style 
}) => {
  const [showPicker, setShowPicker] = useState(false);
  
  const displayValue = items.find(item => item.value === selectedValue)?.label || placeholder;

  return (
    <View style={[styles.pickerContainer, style]}>
      <TouchableOpacity
        style={styles.pickerTouchable}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[
          styles.pickerText, 
          !selectedValue && { color: colors.subtext }
        ]}>
          {displayValue}
        </Text>
        <Text style={styles.pickerIcon}>▼</Text>
      </TouchableOpacity>
      
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.pickerModalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerModalTitle}>Select Option</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.pickerModalDone}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerOptionsContainer}>
              <ScrollView>
                {items.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pickerOption,
                      selectedValue === item.value && styles.pickerOptionSelected
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setShowPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      selectedValue === item.value && { color: colors.primary }
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    marginBottom: 12,
  },
  pickerTouchable: {
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.panel,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  pickerIcon: {
    fontSize: 14,
    color: colors.subtext,
    marginLeft: 8,
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: colors.panel,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerModalCancel: {
    fontSize: 16,
    color: colors.subtext,
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  pickerModalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  pickerOptionsContainer: {
    flex: 1,
  },
  pickerOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerOptionSelected: {
    backgroundColor: `${colors.primary}10`,
  },
  pickerOptionText: {
    fontSize: 16,
    color: colors.text,
  },
});

export default DarkPicker;
