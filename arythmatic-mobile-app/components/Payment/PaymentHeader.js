import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';

export default function PaymentHeader({ title, onAddPress }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title || 'Payments'}</Text>
      <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
        <Text style={styles.addButtonText}>Record Payment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: colors.bg,
  },
  title: {
    fontWeight: '700',
    fontSize: 24,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
