import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';

// Fixed formatCurrency with type checking and conversion
const formatCurrency = (amount, currency) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
    return `${currency || 'USD'} 0.00`;
  }
  return `${currency || 'USD'} ${numAmount.toFixed(2)}`;
};

const getStatusColor = (status) => {
  switch(status) {
    case 'Completed': return colors.good;
    case 'Pending': return colors.warn;
    case 'Refunded': return colors.primary;
    case 'Voided': return colors.bad;
    default: return colors.text;
  }
};

export default function PaymentCard({ payment, onAction }) {
  // Add safety checks for payment object
  if (!payment) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.main}>
        <Text style={styles.amount}>
          {formatCurrency(payment.amount, payment.currency)}
        </Text>
        <Text style={styles.method}>{payment.paymentmethod || 'N/A'}</Text>
        <Text style={[styles.status, { color: getStatusColor(payment.status) }]}>
          {payment.status || 'Unknown'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onAction(payment, 'view')}>
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onAction(payment, 'edit')}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onAction(payment, 'refund')}>
          <Text style={[styles.actionText, { color: colors.warn }]}>Refund</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onAction(payment, 'void')}>
          <Text style={[styles.actionText, { color: colors.bad }]}>Void</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  main: {
    marginBottom: 12,
  },
  amount: {
    fontWeight: '700',
    fontSize: 18,
    color: colors.text,
  },
  method: {
    fontSize: 14,
    color: colors.subtext,
    marginTop: 4,
  },
  status: {
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionText: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.primary,
  },
});
