// components/CrudModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../constants/config';

/**
 * Universal CRUD Modal Component
 * Supports Create, Update operations with dynamic field configuration
 */
const CrudModal = ({
  visible,
  onClose,
  onSubmit,
  title,
  fields = [],
  initialData = {},
  loading = false,
  mode = 'create', // 'create' or 'edit'
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (visible) {
      const initData = {};
      fields.forEach(field => {
        initData[field.key] = initialData[field.key] || field.defaultValue || '';
      });
      setFormData(initData);
      setErrors({});
    }
  }, [visible, fields, initialData]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    fields.forEach(field => {
      const value = formData[field.key];
      
      // Required field validation
      if (field.required && (!value || value.toString().trim() === '')) {
        newErrors[field.key] = `${field.label} is required`;
        return;
      }
      
      // Custom validation
      if (field.validate && value) {
        const validationResult = field.validate(value);
        if (validationResult !== true) {
          newErrors[field.key] = validationResult;
        }
      }
      
      // Type-specific validation
      if (value && field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.key] = 'Invalid email format';
        }
      }
      
      if (value && field.type === 'number') {
        if (isNaN(Number(value))) {
          newErrors[field.key] = 'Must be a valid number';
        }
      }
      
      if (value && field.minLength && value.length < field.minLength) {
        newErrors[field.key] = `Must be at least ${field.minLength} characters`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || `Failed to ${mode === 'create' ? 'create' : 'update'} record`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle input change
  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  // Render field based on type
  const renderField = (field) => {
    const value = formData[field.key] || '';
    const error = errors[field.key];

    const baseInputProps = {
      style: [styles.input, error && styles.inputError],
      value: value.toString(),
      onChangeText: (text) => handleInputChange(field.key, text),
      placeholder: field.placeholder || field.label,
      placeholderTextColor: colors.subtext,
      editable: !field.readonly,
    };

    switch (field.type) {
      case 'email':
        return (
          <TextInput
            {...baseInputProps}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
          />
        );
      
      case 'number':
        return (
          <TextInput
            {...baseInputProps}
            keyboardType="numeric"
            onChangeText={(text) => {
              // Only allow numbers and one decimal point
              const cleaned = text.replace(/[^0-9.]/g, '');
              const parts = cleaned.split('.');
              const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
              handleInputChange(field.key, formatted);
            }}
          />
        );
      
      case 'multiline':
        return (
          <TextInput
            {...baseInputProps}
            multiline
            numberOfLines={4}
            style={[baseInputProps.style, styles.multilineInput]}
            textAlignVertical="top"
          />
        );
      
      case 'select':
        return (
          <View style={styles.selectContainer}>
            <Text style={styles.selectValue}>
              {field.options?.find(opt => opt.value === value)?.label || 'Select...'}
            </Text>
            <Text style={styles.selectArrow}>▼</Text>
          </View>
        );
      
      default:
        return <TextInput {...baseInputProps} />;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>{title}</Text>
          
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[styles.saveButton, (submitting || loading) && styles.saveButtonDisabled]}
            disabled={submitting || loading}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {mode === 'create' ? 'Create' : 'Update'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Form */}
        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
          {fields.map((field) => (
            <View key={field.key} style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {field.label}
                {field.required && <Text style={styles.required}> *</Text>}
              </Text>
              
              {renderField(field)}
              
              {errors[field.key] && (
                <Text style={styles.errorText}>{errors[field.key]}</Text>
              )}
              
              {field.help && (
                <Text style={styles.helpText}>{field.help}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: colors.subtext,
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    flex: 1,
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  required: {
    color: '#ff4444',
  },
  input: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  multilineInput: {
    height: 80,
  },
  selectContainer: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectValue: {
    fontSize: 16,
    color: colors.text,
  },
  selectArrow: {
    fontSize: 12,
    color: colors.subtext,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  helpText: {
    color: colors.subtext,
    fontSize: 12,
    marginTop: 4,
  },
});

export default CrudModal;