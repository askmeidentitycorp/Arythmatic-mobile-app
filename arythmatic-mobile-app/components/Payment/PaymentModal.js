import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';

export default function PaymentModal({ visible, onClose, payment, mode, onSuccess }) {
  const isEditMode = mode === 'edit';
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (visible && payment && isEditMode) {
      setAmount(payment.amount.toString());
      setCurrency(payment.currency);
      setPaymentMethod(payment.paymentmethod);
      setStatus(payment.status);
    } else {
      setAmount('');
      setCurrency('USD');
      setPaymentMethod('');
      setStatus('');
    }
  }, [visible]);

  const handleSave = () => {
    if (!amount || !paymentMethod) {
      Alert.alert('Validation', 'Please enter all required fields.');
      return;
    }
    onSuccess && onSuccess({ amount: parseFloat(amount), currency, paymentmethod: paymentMethod, status });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.header}>{isEditMode ? 'Edit Payment' : 'New Payment'}</Text>
          <ScrollView>
            <Text style={styles.label}>Amount</Text>
            <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" />
            <Text style={styles.label}>Currency</Text>
            <TextInput style={styles.input} value={currency} onChangeText={setCurrency} />
            <Text style={styles.label}>Payment Method</Text>
            <TextInput style={styles.input} value={paymentMethod} onChangeText={setPaymentMethod} />
            <Text style={styles.label}>Status</Text>
            <TextInput style={styles.input} value={status} onChangeText={setStatus} />
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 16,
  },
  header: {
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 16,
    color: colors.text,
  },
  label: {
    color: colors.text,
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    color: colors.text,
    backgroundColor: colors.panelAlt,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButton: {
    backgroundColor: colors.bad,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
